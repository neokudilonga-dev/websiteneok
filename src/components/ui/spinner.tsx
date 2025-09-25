import React from "react";

export default function Spinner({ size = 48, color = "#2563eb", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      className={"animate-spin " + className}
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke={color}
        strokeWidth="5"
        opacity="0.2"
      />
      <path
        d="M45 25c0-11.046-8.954-20-20-20"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
