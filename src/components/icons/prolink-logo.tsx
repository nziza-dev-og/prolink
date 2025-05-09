
import type { SVGProps } from 'react';

export function ProLinkLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      className="text-primary"
      {...props}
    >
      <rect width="34" height="34" rx="2.5" fill="currentColor" />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fill="hsl(var(--primary-foreground))"
        fontSize="18"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
      >
        PL
      </text>
    </svg>
  );
}
