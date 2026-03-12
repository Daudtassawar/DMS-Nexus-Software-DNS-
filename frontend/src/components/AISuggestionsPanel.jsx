import React from 'react';

const AISuggestionsPanel = ({ suggestions, onSelect }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-400 mb-2 font-medium">Quick Help:</p>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(s)}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:border-blue-400 text-gray-600 dark:text-gray-300 transition-all"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AISuggestionsPanel;
