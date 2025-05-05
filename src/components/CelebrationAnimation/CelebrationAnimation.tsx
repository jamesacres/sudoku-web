'use client';
import React, { useEffect, useState } from 'react';

interface CelebrationAnimationProps {
  isVisible: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
}

interface Piece {
  x: number;
  y: number;
  content: string;
  color: string;
  id: number;
  directionX: number;
  directionY: number;
  rotation: number;
  delay: number;
  size: number;
  glow: string;
}

// Rainbow color palette for the explosion numbers
const RAINBOW_COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3', // Violet
  '#FF1493', // Deep Pink
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#FFFF00', // Yellow
  '#32CD32', // Lime Green
  '#FF4500', // Orange Red
  '#8A2BE2', // Blue Violet
  '#00BFFF', // Deep Sky Blue
  '#FF69B4', // Hot Pink
];

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isVisible,
  gridRef,
}) => {
  // For the explosion animation, we'll store the pieces based on cell content
  const [explosionPieces, setExplosionPieces] = useState<Array<Piece>>([]);

  const [isAnimating, setIsAnimating] = useState(false);

  // Generate the explosion pieces when the component mounts or when isVisible changes
  useEffect(() => {
    if (isVisible && gridRef?.current) {
      const grid = gridRef.current;

      // Hide the original grid
      grid.style.visibility = 'hidden';
      setIsAnimating(true);

      // Get all cells with numbers
      const cellElements = grid.querySelectorAll('[data-cell-id]');
      const pieces: Piece[] = [];
      let pieceId = 0;

      cellElements.forEach((cell) => {
        // Only include cells with content
        const content = cell.textContent?.trim();
        if (!content) return;

        // Get position relative to viewport
        const rect = cell.getBoundingClientRect();

        // Calculate angle for explosion direction (random within a semicircle away from center)
        const gridRect = grid.getBoundingClientRect();
        const centerX = gridRect.left + gridRect.width / 2;
        const centerY = gridRect.top + gridRect.height / 2;

        // Vector from center to cell
        const vectorX = rect.left + rect.width / 2 - centerX;
        const vectorY = rect.top + rect.height / 2 - centerY;

        // Normalize and add some randomness
        const length = Math.sqrt(vectorX * vectorX + vectorY * vectorY) || 1;
        const normalizedX = vectorX / length + (Math.random() * 0.4 - 0.2);
        const normalizedY = vectorY / length + (Math.random() * 0.4 - 0.2);

        // Rainbow color randomly selected
        const color =
          RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];

        // Different glow based on color
        const glow = `0 0 8px ${color}, 0 0 12px ${color}, 0 0 16px ${color}`;

        // Random size variation for more dynamic effect
        const size = 0.9 + Math.random() * 0.4; // 0.9 to 1.3 scale factor

        pieces.push({
          id: pieceId++,
          x: rect.left,
          y: rect.top,
          content,
          color,
          directionX: normalizedX,
          directionY: normalizedY,
          rotation: Math.random() * 720 - 360, // -360 to 360 degrees
          delay: Math.random() * 0.3, // 0 to 0.3 seconds
          size,
          glow,
        });
      });

      setExplosionPieces(pieces);

      // Show the grid again after animation
      const timer = setTimeout(() => {
        if (grid) {
          grid.style.visibility = 'visible';
        }
        setIsAnimating(false);
      }, 3500);

      return () => {
        clearTimeout(timer);
        if (grid) {
          grid.style.visibility = 'visible';
        }
      };
    }
  }, [isVisible, gridRef]);

  if (!isVisible || !isAnimating) return null;

  return (
    <>
      {/* Fireworks animation */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-4 w-4 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              backgroundColor:
                RAINBOW_COLORS[
                  Math.floor(Math.random() * RAINBOW_COLORS.length)
                ],
              animation: `firework-burst 1.5s ease-out ${Math.random() * 1.5}s forwards`,
              boxShadow: '0 0 20px 4px currentColor',
            }}
          />
        ))}

        <style jsx>{`
          @keyframes firework-burst {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.8;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      {/* Exploding numbers animation */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {explosionPieces.map((piece) => (
          <div
            key={piece.id}
            className="fixed flex items-center justify-center text-center text-xl font-bold sm:text-3xl"
            style={{
              left: `${piece.x}px`,
              top: `${piece.y}px`,
              color: piece.color,
              textShadow: piece.glow,
              width: '40px',
              height: '40px',
              animation: `number-explode-${piece.id} 2.5s ease-out ${piece.delay}s forwards`,
              transformOrigin: 'center',
              zIndex: 9999,
              transform: `scale(${piece.size})`,
            }}
          >
            {piece.content}
          </div>
        ))}

        <style jsx>{`
          ${explosionPieces
            .map(
              (piece) => `
            @keyframes number-explode-${piece.id} {
              0% {
                transform: scale(${piece.size}) translate(0, 0) rotate(0);
                opacity: 1;
              }
              70% {
                opacity: 0.8;
              }
              100% {
                transform: scale(${piece.size * 1.5}) translate(${piece.directionX * 600}px, ${piece.directionY * 600}px) rotate(${piece.rotation}deg);
                opacity: 0;
              }
            }
          `
            )
            .join('')}
        `}</style>
      </div>
    </>
  );
};

export { CelebrationAnimation };
