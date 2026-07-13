import { STAR_PATH } from "@/lib/theme";

interface FourPointStarProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// the 4-point sparkle motif used across the whole site
export function FourPointStar({ size = 26, color = "#ffffff", className, style }: FourPointStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-12 -12 24 24"
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
      aria-hidden
    >
      <path d={STAR_PATH} fill={color} style={{ transition: "fill .8s ease" }} />
    </svg>
  );
}
