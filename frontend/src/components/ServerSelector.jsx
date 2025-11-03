import { useState } from 'react';

const SERVER_TYPES = [
  { value: 'apache', label: 'Apache', icon: '🟢' },
  { value: 'nginx', label: 'Nginx', icon: '🔵' },
  { value: 'nodejs', label: 'Node.js / Express', icon: '🟡' },
  { value: 'nextjs', label: 'Next.js', icon: '⚫' },
];

export default function ServerSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Type de serveur *
      </label>
      <div className="grid grid-cols-2 gap-3">
        {SERVER_TYPES.map((server) => (
          <button
            key={server.value}
            type="button"
            onClick={() => onChange(server.value)}
            className={`
              p-4 border-2 rounded-lg transition-all
              ${value === server.value
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="text-2xl mb-1">{server.icon}</div>
            <div className="font-medium">{server.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

