import React from "react";

export const CmdLogo = ({ size = "md", showSubtitle = true, className = "" }) => {
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Badge */}
      <div
        className={`rounded bg-neutral-900 border border-border flex items-center justify-center font-mono font-black text-primary shadow-sm shrink-0 ${
          isSmall ? "w-6 h-6 text-xs" : isLarge ? "w-10 h-10 text-base" : "w-8 h-8 text-sm"
        }`}
      >
        <span className="tracking-tighter">cmd</span>
        <span className="text-emerald-400">.</span>
      </div>

      {/* Brand Text */}
      <div>
        <div
          className={`font-mono font-extrabold text-white tracking-tight flex items-baseline gap-1 ${
            isSmall ? "text-xs" : isLarge ? "text-lg" : "text-sm"
          }`}
        >
          <span>cmd</span>
          <span className="text-emerald-400 text-base">.</span>
          <span className="text-[10px] text-muted font-sans font-medium uppercase tracking-widest ml-1 hidden sm:inline">
            Risk & Churn
          </span>
        </div>
        {showSubtitle && !isSmall && (
          <div className="text-[9.5px] text-muted-dark font-mono uppercase tracking-wider">
            Decision Engine
          </div>
        )}
      </div>
    </div>
  );
};

export default CmdLogo;
