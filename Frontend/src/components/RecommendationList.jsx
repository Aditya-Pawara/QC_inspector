import React, { useState } from 'react';
import RecommendationCard from './RecommendationCard';

const RecommendationList = ({ recommendations }) => {
    const [showAll, setShowAll] = useState(false);

    if (!recommendations || recommendations.length === 0) {
        return <p className="text-gray-500 italic">No recommendations available.</p>;
    }

    const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 3);

    return (
        <div className="space-y-4">
            {displayedRecommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
            ))}

            {recommendations.length > 3 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-2 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/30"
                >
                    {showAll ? (
                        <>
                            Show Less <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                        </>
                    ) : (
                        <>
                            Show {recommendations.length - 3} More <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default RecommendationList;
