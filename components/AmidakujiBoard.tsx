
import React, { useEffect, useState, useRef } from 'react';
import { Participant, Pair } from '../types';

interface AmidakujiBoardProps {
  topParticipants: (Participant | null)[];
  bottomParticipants: (Participant | null)[];
  isAnimating: boolean;
  onFinish: (pairs: Pair[]) => void;
}

const AmidakujiBoard: React.FC<AmidakujiBoardProps> = ({
  topParticipants,
  bottomParticipants,
  isAnimating,
  onFinish
}) => {
  const [progress, setProgress] = useState(0);
  const totalLines = topParticipants.length;
  const [bars, setBars] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (isAnimating) {
      // Create random bars
      const newBars: { x: number; y: number }[] = [];
      for (let i = 0; i < totalLines - 1; i++) {
        const numBarsPerGutter = 4 + Math.floor(Math.random() * 4);
        for (let j = 0; j < numBarsPerGutter; j++) {
          newBars.push({
            x: i,
            y: 0.15 + Math.random() * 0.7 // normalized y position
          });
        }
      }
      setBars(newBars);
      setProgress(0);

      const duration = 2000;
      const start = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - start;
        const nextProgress = Math.min(elapsed / duration, 1);
        setProgress(nextProgress);

        if (nextProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          onFinish([]);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isAnimating, totalLines, onFinish]);

  if (totalLines === 0) return null;

  const width = Math.min(window.innerWidth * 0.9, 800);
  const height = 350;
  const paddingX = 80;
  const paddingY = 60;
  const spacingX = totalLines > 1 ? (width - paddingX * 2) / (totalLines - 1) : 0;

  return (
    <div className="w-full overflow-x-auto py-4 scrollbar-hide">
      <div className="min-w-fit flex flex-col items-center">
        <svg 
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible select-none"
        >
          {/* Vertical Lines */}
          {Array.from({ length: totalLines }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={paddingX + i * spacingX}
              y1={paddingY}
              x2={paddingX + i * spacingX}
              y2={height - paddingY}
              stroke="#e5e7eb"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}

          {/* Horizontal Bars */}
          {bars.map((bar, i) => (
            <line
              key={`h-${i}`}
              x1={paddingX + bar.x * spacingX}
              y1={paddingY + bar.y * (height - paddingY * 2)}
              x2={paddingX + (bar.x + 1) * spacingX}
              y2={paddingY + bar.y * (height - paddingY * 2)}
              stroke="#d1d5db"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {/* Animated Glow Paths */}
          {isAnimating && Array.from({ length: totalLines }).map((_, i) => (
            <g key={`anim-group-${i}`}>
              <line
                x1={paddingX + i * spacingX}
                y1={paddingY}
                x2={paddingX + i * spacingX}
                y2={paddingY + progress * (height - paddingY * 2)}
                stroke={i % 2 === 0 ? '#6366f1' : '#f43f5e'}
                strokeWidth="6"
                strokeLinecap="round"
                className="opacity-40"
              />
              <circle
                cx={paddingX + i * spacingX}
                cy={paddingY + progress * (height - paddingY * 2)}
                r="4"
                className={i % 2 === 0 ? 'fill-indigo-500' : 'fill-rose-500'}
              />
            </g>
          ))}

          {/* Participant Labels */}
          {topParticipants.map((p, i) => (
            <g key={`top-${i}`}>
              <text
                x={paddingX + i * spacingX}
                y={paddingY - 20}
                textAnchor="middle"
                className="text-[11px] font-black fill-gray-900 tracking-tighter"
              >
                {p?.name || 'Waiting'}
              </text>
              <circle
                cx={paddingX + i * spacingX}
                cy={paddingY}
                r="7"
                className={`${p?.gender === 'female' ? 'fill-rose-500' : 'fill-sky-500'} stroke-white stroke-2 shadow-sm`}
              />
            </g>
          ))}

          {bottomParticipants.map((p, i) => (
            <g key={`bottom-${i}`}>
              <text
                x={paddingX + i * spacingX}
                y={height - paddingY + 35}
                textAnchor="middle"
                className="text-[11px] font-black fill-gray-900 tracking-tighter"
              >
                {p?.name || '???'}
              </text>
              <circle
                cx={paddingX + i * spacingX}
                cy={height - paddingY}
                r="7"
                className={`${p?.gender === 'female' ? 'fill-rose-500' : 'fill-sky-500'} stroke-white stroke-2 shadow-sm`}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default AmidakujiBoard;
