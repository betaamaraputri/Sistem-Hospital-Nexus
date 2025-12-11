import React from 'react';

interface QuickActionProps {
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ label, subLabel, icon, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left group w-full"
    >
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div>
        <div className="font-medium text-gray-800 text-sm">{label}</div>
        <div className="text-xs text-gray-500">{subLabel}</div>
      </div>
    </button>
  );
};

export default QuickAction;
