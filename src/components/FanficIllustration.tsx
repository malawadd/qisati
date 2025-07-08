import React from "react";

export function FanficDragonIllustration() {
  return (
    <div className="relative h-96 w-full flex items-center justify-center bg-primary rounded-xl shadow-neo overflow-hidden">
      {/* --- Floating Dragon --- */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dragon-float">
        <svg width={300} height={220} viewBox="0 0 300 220" fill="none">
          {/* Tail */}
          <path d="M240 170 Q265 190 240 210 Q220 205 230 180" fill="#7be36b" stroke="#49a04e" strokeWidth={4} />
          {/* Body */}
          <ellipse cx={160} cy={160} rx={60} ry={45} fill="#7be36b" stroke="#49a04e" strokeWidth={5} />
          {/* Belly */}
          <ellipse cx={160} cy={170} rx={36} ry={25} fill="#fde68a" opacity={0.85} />
          {/* Left leg */}
          <ellipse cx={125} cy={200} rx={13} ry={8} fill="#49a04e" />
          {/* Right leg */}
          <ellipse cx={192} cy={200} rx={13} ry={8} fill="#49a04e" />
          {/* Head */}
          <ellipse cx={85} cy={120} rx={38} ry={32} fill="#7be36b" stroke="#49a04e" strokeWidth={5} />
          {/* Cheek */}
          <ellipse cx={95} cy={140} rx={10} ry={6} fill="#fbbf24" opacity={0.7} />
          {/* Ear/horn */}
          <ellipse cx={70} cy={100} rx={8} ry={16} fill="#a78bfa" stroke="#49a04e" strokeWidth={2} />

          {/* Right Wing */}
          <g className="dragon-wing dragon-wing-right">
            <path
              d="M210 120 Q250 50 285 135 Q245 105 210 120 Z"
              fill="#a78bfa"
              stroke="#49a04e"
              strokeWidth={3}
            />
          </g>
          {/* Left Wing */}
          <g className="dragon-wing dragon-wing-left">
            <path
              d="M110 100 Q80 40 35 120 Q78 95 110 100 Z"
              fill="#a78bfa"
              stroke="#49a04e"
              strokeWidth={3}
            />
          </g>

          {/* Eyes */}
          <ellipse cx={80} cy={120} rx={5} ry={7} fill="#fff" />
          <ellipse cx={80} cy={120} rx={2.5} ry={3} fill="#222" />
          {/* Nostril */}
          <ellipse cx={70} cy={130} rx={2} ry={1.5} fill="#222" />
          {/* Smile */}
          <path d="M72 145 Q80 150 95 143" stroke="#222" strokeWidth={3} fill="none" />
          {/* Book (under arm) */}
          <rect x={135} y={185} width={40} height={18} rx={4} fill="#fff" stroke="#a78bfa" strokeWidth={3} />
          <rect x={150} y={192} width={20} height={3} rx={1} fill="#a78bfa" />
          {/* Book title */}
          <rect x={155} y={190} width={12} height={3} rx={1.5} fill="#fbbf24" />
        </svg>
      </div>

      {/* Sparkles */}
      <div className="absolute left-[57%] top-14 dragon-sparkle">
        <svg width={32} height={32}>
          <circle cx={16} cy={16} r={4} fill="#fef9c3" />
          <circle cx={24} cy={8} r={2} fill="#c084fc" />
          <circle cx={8} cy={24} r={1.5} fill="#fca5a5" />
        </svg>
      </div>

      {/* Caption */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 dragon-caption">
       
      </div>

      {/* --- Animations (scoped for this component) --- */}
      <style>{`
        .dragon-float {
          animation: dragon-float 3s ease-in-out infinite;
        }
        @keyframes dragon-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }
        .dragon-wing-right {
          transform-origin: 210px 120px;
          animation: dragon-wing-flap-r 1.8s ease-in-out infinite;
        }
        .dragon-wing-left {
          transform-origin: 110px 100px;
          animation: dragon-wing-flap-l 1.8s ease-in-out infinite;
        }
        @keyframes dragon-wing-flap-r {
          0%, 100% { transform: rotate(-7deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes dragon-wing-flap-l {
          0%, 100% { transform: rotate(7deg); }
          50% { transform: rotate(-10deg); }
        }
        .dragon-sparkle {
          animation: dragon-sparkle-bounce 1.6s ease-in-out infinite;
        }
        @keyframes dragon-sparkle-bounce {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.24); }
        }
        .dragon-caption {
          animation: dragon-caption-bounce 2.4s ease-in-out infinite;
        }
        @keyframes dragon-caption-bounce {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
