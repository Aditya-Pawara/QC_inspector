import React from 'react';

const SeverityBadge = ({ severity }) => {
    const normalizedSeverity = severity ? severity.toLowerCase() : 'low';

    const styles = {
        critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    };

    const colorClass = styles[normalizedSeverity] || styles.low;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${colorClass}`}>
            {severity ? severity : 'Unknown'}
        </span>
    );
};

export default SeverityBadge;
