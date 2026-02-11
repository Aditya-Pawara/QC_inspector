import React from 'react';

const RecommendationCard = ({ recommendation }) => {
    // Extract text whether it's string or object
    const text = typeof recommendation === 'string' ? recommendation : recommendation.description || recommendation.action || JSON.stringify(recommendation);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm flex gap-4 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group">
            <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1 opacity-80">Recommendation</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    );
};

export default RecommendationCard;
