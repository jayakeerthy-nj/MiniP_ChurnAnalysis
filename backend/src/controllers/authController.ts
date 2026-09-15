import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ENV } from "../config/env.js";
import { logAudit } from "../middleware/audit.js";

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      await logAudit({
        userId: "UNKNOWN",
        userName: email,
        role: "GUEST",
        action: "FAILED_LOGIN",
        success: false,
        metadata: { reason: "User not found" }
      });
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await logAudit({
        userId: user.userId,
        userName: user.name,
        role: user.role,
        action: "FAILED_LOGIN",
        success: false,
        metadata: { reason: "Password mismatch" }
      });
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    const payload = { userId: user.userId, name: user.name, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any });
    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: "LOGIN",
      success: true
    });

    res.json({
      success: true,
      accessToken,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    const user = await User.findOne({ userId: req.user.userId }).select("-passwordHash");
    res.json({ success: true, user });
  },

  async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, error: "Refresh token missing" });
      return;
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as any;
      const user = await User.findOne({ userId: decoded.userId });
      if (!user) {
        res.status(401).json({ success: false, error: "User does not exist" });
        return;
      }

      const payload = { userId: user.userId, name: user.name, email: user.email, role: user.role };
      const newAccessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any });
      res.json({ success: true, accessToken: newAccessToken });
    } catch (e) {
      res.status(403).json({ success: false, error: "Invalid refresh token" });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: "LOGOUT",
        success: true
      });
    }
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out successfully" });
  }
};
