import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  glow?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#00d4ff',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showPercentage = true,
  label,
  glow = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className={glow ? 'progress-ring-glow' : ''}
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-white neon-text">
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
};

interface StatCardWithRingProps {
  title: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export const StatCardWithRing: React.FC<StatCardWithRingProps> = ({
  title,
  value,
  total,
  icon,
  color = '#00d4ff',
  subtitle
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="bento-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-white">
            {value}
            <span className="text-lg text-gray-500">/{total}</span>
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <ProgressRing
            progress={percentage}
            size={80}
            strokeWidth={6}
            color={color}
            showPercentage={false}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-sm">
        <div 
          className="p-2 rounded-lg neon-icon"
          style={{ color }}
        >
          {icon}
        </div>
        <span className="text-gray-400">
          {Math.round(percentage)}% Complete
        </span>
      </div>
    </div>
  );
};

interface MiniProgressRingProps {
  progress: number;
  size?: number;
  color?: string;
}

export const MiniProgressRing: React.FC<MiniProgressRingProps> = ({
  progress,
  size = 40,
  color = '#00d4ff'
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          transition: 'stroke-dashoffset 0.5s ease'
        }}
      />
    </svg>
  );
};
