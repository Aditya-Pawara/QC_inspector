import React from 'react';

const DefectBadge = ({ defect }) => {
    // Check if defect is an object or string
    const name = typeof defect === 'string' ? defect : defect.name || 'Unknown Defect';
    const severity = (typeof defect === 'object' && defect.severity) ? defect.severity.toLowerCase() : 'low';
    const description = (typeof defect === 'object' && defect.description) ? defect.description : '';
    const confidence = (typeof defect === 'object' && defect.confidence) ? Math.round(defect.confidence * 100) : null;

    const styles = {
        critical: {
            border: 'bg-red-500',
            icon: 'text-red-500',
            badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
        },
        high: {
            border: 'bg-orange-500',
            icon: 'text-orange-500',
            badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
        },
        medium: {
            border: 'bg-amber-400',
            icon: 'text-amber-400',
            badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        },
        low: {
            border: 'bg-green-500',
            icon: 'text-green-500',
            badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
        },
    };

    const style = styles[severity] || styles.low;

    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 group">
            {/* Left Accent Border */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.border}`}></div>

            <div className="p-4 pl-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-base">
                        {/* Status Icon */}
                        <svg className={`w-5 h-5 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {severity === 'critical' || severity === 'high' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            ) : severity === 'medium' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                        </svg>
                        {name}
                    </h3>

                    <div className="flex items-center gap-2">
                        {confidence && (
                            <span className="text-xs font-mono text-gray-400" title="Confidence Score">
                                {confidence}%
                            </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${style.badge}`}>
                            {severity}
                        </span>
                    </div>
                </div>

                {description ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {description}
                    </p>
                ) : (
                    <p className="text-sm text-gray-400 italic">No description available</p>
                )}
            </div>
        </div>
    );
};

export default DefectBadge;
