import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInspectionDetail, deleteInspection } from '../services/api';
import { auth } from '../firebase/auth';
import ImageViewer from '../components/ImageViewer';
import DefectBadge from '../components/DefectBadge';
import SeverityBadge from '../components/SeverityBadge';
import RecommendationList from '../components/RecommendationList';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ExportButton from '../components/ExportButton';

const InspectionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAllDefects, setShowAllDefects] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error("User not authenticated");
                }
                const token = await user.getIdToken();
                const data = await getInspectionDetail(id, token);
                setInspection(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Use a small timeout to ensure auth is ready if page is refreshed directly
        const timeoutId = setTimeout(() => {
            if (auth.currentUser) {
                fetchDetail();
            } else {
                fetchDetail();
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [id]);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                await deleteInspection(id, token);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Failed to delete inspection:", error);
            alert("Failed to delete inspection. Please try again.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-red-500">
            <p className="text-xl font-semibold mb-4">Error loading inspection</p>
            <p>{error}</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-500 hover:underline">Return to Dashboard</button>
        </div>
    );

    if (!inspection) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
            <p className="text-xl text-gray-500">Inspection not found</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-500 hover:underline">Return to Dashboard</button>
        </div>
    );

    const { analysis_result, image_url, created_at } = inspection;
    const defects = analysis_result?.defects || [];
    const overallSeverity = analysis_result?.overall_severity;
    const recommendations = analysis_result?.recommendations || [];
    const qualityIssues = analysis_result?.quality_issues || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Dashboard
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-slate-800/50">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Inspection Details</h1>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span className="font-mono bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded text-sm">#{inspection.id}</span>
                                <span>•</span>
                                <span>{new Date(created_at).toLocaleString()}</span>
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            {/* Actions */}
                            <ExportButton inspectionId={id} />
                            <button
                                onClick={handleDeleteClick}
                                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {analysis_result?.error && (
                        <div className="mx-6 sm:mx-8 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-300 flex items-start">
                            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div>
                                <h3 className="font-semibold mb-1">Analysis Error</h3>
                                <p className="text-sm opacity-90">{analysis_result.error}</p>
                            </div>
                        </div>
                    )}

                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                        {/* Left Column: Image & Status */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-gray-100 dark:bg-slate-900 rounded-xl p-1 border border-gray-200 dark:border-slate-700 shadow-inner">
                                <ImageViewer src={image_url} />
                            </div>

                            {/* Defects Section Block - Moved to Left */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-fade-in-up hover:shadow-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Detected Defects
                                    </h2>
                                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                        {defects.length} Found
                                    </span>
                                </div>

                                {defects.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out">
                                        {(showAllDefects ? defects : defects.slice(0, 3)).map((defect, idx) => (
                                            <DefectBadge key={idx} defect={defect} />
                                        ))}

                                        {defects.length > 3 && (
                                            <button
                                                onClick={() => setShowAllDefects(!showAllDefects)}
                                                className="w-full py-2 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/30"
                                            >
                                                {showAllDefects ? (
                                                    <>
                                                        Show Less <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        Show {defects.length - 3} More <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-green-50/50 dark:bg-slate-900/50 rounded-xl border border-green-100 dark:border-slate-800 border-dashed">
                                        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium">No defects detected</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">First class quality achieved.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Detailed Analysis Blocks */}
                        <div className="space-y-6">
                            {/* Analysis Summary */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-300">
                                <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-slate-700 pb-2">Analysis Summary</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Assessment</span>
                                        <SeverityBadge severity={overallSeverity} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Total Defects</span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{defects.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quality Issues Section Block */}
                            {qualityIssues.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-fade-in-up delay-100 hover:shadow-orange-500/10 hover:border-orange-500/30 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all duration-300">
                                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Quality Observations
                                    </h2>
                                    <div className="space-y-3">
                                        {qualityIssues.map((issue, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20 hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-colors">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                    {typeof issue === 'string' ? issue : issue.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations Section Block */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-fade-in-up delay-200 hover:shadow-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-300">
                                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    AI Recommendations
                                </h2>
                                <RecommendationList recommendations={recommendations} />
                            </div>
                        </div>
                    </div>

                    {/* Raw JSON Data Toggle */}
                    <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 border-t border-gray-100 dark:border-slate-700">
                        <details>
                            <summary className="cursor-pointer text-xs text-gray-500 hover:text-indigo-500 font-medium select-none transition-colors uppercase tracking-wider">Debug: Raw Analysis Data</summary>
                            <pre className="mt-4 p-4 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-xs font-mono shadow-inner border border-slate-700">
                                {JSON.stringify(analysis_result, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Inspection"
                message="Are you sure you want to delete this inspection? This will permanently remove the analysis and the image."
            />
        </div>
    );
};

export default InspectionDetail;
