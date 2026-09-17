"use client";

import React from "react";
import Link from "next/link";

interface CmdLogoProps {
  size?: "sm" | "md" | "lg" | "hero";
  showSubtitle?: boolean;
  clickable?: boolean;
  className?: string;
}

export const CmdLogo: React.FC<CmdLogoProps> = ({
  size = "md",
  showSubtitle = true,
  clickable = true,
  className = "",
}) => {
  // Pixel block size configurations
  const sizeConfig = {
    sm: {
      text: "text-base",
      dot: "w-1.5 h-1.5",
      sub: "text-[8px] tracking-wider",
      iconSize: 14,
      gap: "gap-1.5",
    },
    md: {
      text: "text-xl",
      dot: "w-2 h-2",
      sub: "text-[9px] tracking-wider",
      iconSize: 18,
      gap: "gap-2",
    },
    lg: {
      text: "text-2xl",
      dot: "w-2.5 h-2.5",
      sub: "text-[10px] tracking-widest",
      iconSize: 22,
      gap: "gap-2.5",
    },
    hero: {
      text: "text-4xl sm:text-5xl",
      dot: "w-3.5 h-3.5 sm:w-4 sm:h-4",
      sub: "text-xs sm:text-sm tracking-widest",
      iconSize: 32,
      gap: "gap-3",
    },
  }[size];

  const logoBody = (
    <div className={`flex items-center ${sizeConfig.gap} ${className} select-none group`}>
      {/* Minecraft-inspired pixel cube glyph */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={sizeConfig.iconSize * 1.3}
          height={sizeConfig.iconSize * 1.3}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:scale-105"
        >
          {/* Pixelated 3D Command Block Isometric Graphic */}
          {/* Top Face */}
          <path d="M12 2L20 6.5L12 11L4 6.5L12 2Z" fill="#3d7eff" />
          <path d="M12 4L16 6.25L12 8.5L8 6.25L12 4Z" fill="#60a5fa" />
          {/* Left Face */}
          <path d="M4 6.5L12 11V20L4 15.5V6.5Z" fill="#1e40af" />
          <rect x="7" y="10" width="3" height="4" fill="#3b82f6" />
          {/* Right Face */}
          <path d="M12 11L20 6.5V15.5L12 20V11Z" fill="#1d4ed8" />
          <rect x="14" y="10" width="3" height="4" fill="#2563eb" />
          {/* Pixel Grid Lines */}
          <path d="M12 2V11M4 6.5L12 11L20 6.5M4 15.5L12 20L20 15.5" stroke="#ffffff" strokeWidth="0.75" strokeLinecap="square" />
        </svg>
      </div>

      {/* Minecraft Pixel Typography for "cmd." */}
      <div className="flex flex-col">
        <div className="flex items-baseline leading-none">
          <span
            className={`${sizeConfig.text} font-bold tracking-tight text-[#18191b]`}
            style={{ fontFamily: "'Silkscreen', 'Press Start 2P', monospace" }}
          >
            cmd
          </span>
          {/* Dedicated Square Pixel Dot */}
          <span
            className={`inline-block ${sizeConfig.dot} bg-[#3d7eff] ml-0.5 self-baseline mb-0.5 rounded-[1px] transition-colors group-hover:bg-[#2563eb]`}
            title="cmd."
          />
        </div>

        {showSubtitle && (
          <span className={`${sizeConfig.sub} font-mono font-bold text-[#8b9098] uppercase mt-0.5`}>
            Churn Modeling & Decision Engine
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="inline-block focus:outline-none">
        {logoBody}
      </Link>
    );
  }

  return logoBody;
};
