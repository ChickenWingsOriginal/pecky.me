'use client';

interface HamburgerIconProps {
  isOpen: boolean;
  size?: number;
}

export default function HamburgerIcon({ isOpen, size = 20 }: HamburgerIconProps) {
  // Normalize coordinates to 0-32 range (32x32 viewBox for better spacing)
  // Line 1: (1,1) to (3,1) normally (horizontal), becomes (1,1) to (3,3) when open (diagonal)
  // Line 2: (1,2) to (3,2) normally (horizontal), fades out when open
  // Line 3: (1,3) to (3,3) normally (horizontal), becomes (1,3) to (3,1) when open (diagonal)

  // Scale coordinates based on size (original designed for 32x32 viewBox)
  const scale = size / 32;

  const line1StartX = 4 * scale;
  const line1StartY = 6 * scale;
  const line1EndXClosed = 28 * scale;
  const line1EndYClosed = 6 * scale;
  const line1EndXOpen = 28 * scale;
  const line1EndYOpen = 26 * scale;

  const line2StartX = 4 * scale;
  const line2StartY = 16 * scale;
  const line2EndX = 28 * scale;
  const line2EndY = 16 * scale;

  const line3StartX = 4 * scale;
  const line3StartY = 26 * scale;
  const line3EndXClosed = 28 * scale;
  const line3EndYClosed = 26 * scale;
  const line3EndXOpen = 28 * scale;
  const line3EndYOpen = 6 * scale;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      {/* Line 1: animates between (4,6)-(20,6) and (4,6)-(20,20) */}
      <line
        x1={line1StartX}
        y1={line1StartY}
        x2={isOpen ? line1EndXOpen : line1EndXClosed}
        y2={isOpen ? line1EndYOpen : line1EndYClosed}
        style={{
          transition: 'x2 0.3s ease-in-out, y2 0.3s ease-in-out'
        }}
      />

      {/* Line 2: fades in and out */}
      <line
        x1={line2StartX}
        y1={line2StartY}
        x2={line2EndX}
        y2={line2EndY}
        style={{
          transition: 'opacity 0.3s ease-in-out',
          opacity: isOpen ? 0 : 1
        }}
      />

      {/* Line 3: animates between (4,20)-(20,20) and (4,20)-(20,6) */}
      <line
        x1={line3StartX}
        y1={line3StartY}
        x2={isOpen ? line3EndXOpen : line3EndXClosed}
        y2={isOpen ? line3EndYOpen : line3EndYClosed}
        style={{
          transition: 'x2 0.3s ease-in-out, y2 0.3s ease-in-out'
        }}
      />
    </svg>
  );
}
