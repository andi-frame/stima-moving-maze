import React from 'react';

const Legend: React.FC = () => {
  const items = [
    { color: 'bg-green-500', label: 'Start' },
    { color: 'bg-orange-400', label: 'Goal' },
    { color: 'bg-gray-800', label: 'Wall' },
    { color: 'bg-red-500', label: 'Moving Obstacle' },
    { color: 'bg-blue-500', label: 'Path' },
    { color: 'bg-purple-500', label: 'Agent' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 p-4 bg-white rounded-lg shadow">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded ${item.color} border-2 border-gray-800`} />
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;