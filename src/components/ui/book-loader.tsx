import React from "react";

export default function BookLoader({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Book base */}
      <rect x="8" y="16" width="48" height="32" rx="4" fill="#d2b48c" stroke="#8b4513" strokeWidth="2" />
      {/* Book spine */}
      <rect x="8" y="16" width="8" height="32" rx="2" fill="#a67c52" stroke="#8b4513" strokeWidth="1.5" />
      {/* Flipping page animation */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 32 32"
          to="-30 32 32"
          dur="0.7s"
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          values="0 32 32;-30 32 32;0 32 32"
        />
        <rect x="16" y="18" width="32" height="28" rx="2" fill="#d2b48c" stroke="#8b4513" strokeWidth="1.2" />
      </g>
      {/* Book shadow */}
      <ellipse cx="32" cy="50" rx="18" ry="4" fill="#a67c52" opacity="0.5" />
    </svg>
  );
}

