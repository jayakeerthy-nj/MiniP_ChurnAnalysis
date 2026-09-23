import React from "react";
import clsx from "clsx";

export const Loading = ({
  message = "Loading analytics...",
  className = "",
  fullPage = false
}) => {
  const content = (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3 p-8 text-muted font-mono text-xs",
        className
      )}
    >
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="tracking-wide">{message}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
