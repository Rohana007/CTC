import React from 'react';

interface ExplanationCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-900'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    title: 'text-green-900'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-500',
    title: 'text-purple-900'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-500',
    title: 'text-orange-900'
  }
};

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  title,
  content,
  icon,
  color
}) => {
  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-lg p-6`}>
      <div className="flex items-center mb-3">
        <div className={`${classes.icon} mr-2`}>
          {icon}
        </div>
        <h3 className={`text-lg font-semibold ${classes.title}`}>
          {title}
        </h3>
      </div>
      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};