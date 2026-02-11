import React from 'react';

const InspectionDetailsModal = ({ isOpen, onClose, inspection }) => {
    if (!isOpen || !inspection) return null;

    const {
        imageUrl,
        severity,
        defectCount,
        defects = [], // Assuming these fields might be passed in differently or need default
        recommendations = [],
        quality_issues = [],
        analysis_result // Fallback if data is nested here
    } = inspection;

    // Handle data structure variations (direct props vs nested in analysis_result)
    const displayDefects = defects.length > 0 ? defects : (analysis_result?.defects || []);
    const displayRecommendations = recommendations.length > 0 ? recommendations : (analysis_result?.recommendations || []);
    const displayQualityIssues = quality_issues.length > 0 ? quality_issues : (analysis_result?.quality_issues || []);

    const severityColor = {
        Low: 'text-green-400 bg-green-400/10 border-green-400/20',
        Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        Critical: 'text-red-400 bg-red-400/10 border-red-400/20',
    }[severity] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Inspection Results</h2>
                        <p className="text-gray-400 text-sm mt-1">ID: {inspection.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-8">

                    {/* Top Section: Image and Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Image Column */}
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 relative group">
                            <img
                                src={imageUrl}
                                alt="Inspection"
                                className="w-full h-full object-contain max-h-[400px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:underline">
                                    View Full Size
                                </a>
                            </div>
                        </div>

                        {/* Summary Column */}
                        <div className="space-y-6">
                            {/* Severity Card */}
                            <div className={`p-6 rounded-xl border ${severityColor} flex flex-col gap-2`}>
                                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Overall Severity</span>
                                <span className="text-3xl font-bold">{severity}</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-gray-400 text-sm block mb-1">Defects Found</span>
                                    <span className="text-2xl font-bold text-white">{defectCount}</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-gray-400 text-sm block mb-1">Status</span>
                                    <span className="text-2xl font-bold text-white capitalize">{inspection.status || 'Completed'}</span>
                                </div>
                            </div>

                            {/* Quality Issues */}
                            {displayQualityIssues.length > 0 && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h3 className="text-white font-semibold mb-3">Quality Issues</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                                        {displayQualityIssues.map((issue, idx) => (
                                            <li key={idx}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Defects Detail Section */}
                    {displayDefects.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Identified Defects
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayDefects.map((defect, idx) => (
                                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-lg">{defect.name}</h4>
                                            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                                                {defect.location || 'Unknown Location'}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed">{defect.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations Section */}
                    {displayRecommendations.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                AI Recommendations
                            </h3>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
                                <ul className="space-y-3">
                                    {displayRecommendations.map((rec, idx) => (
                                        <li key={idx} className="flex gap-3 text-indigo-200">
                                            <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default InspectionDetailsModal;
