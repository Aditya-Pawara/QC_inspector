import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/auth';
import { deleteInspection } from '../services/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const InspectionCard = ({ inspection, onDelete, index = 0 }) => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // slight delay to ensure the initial render happens with opacity 0
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Mock data fallback
    const {
        id = 'mock-id',
        imageUrl = 'https://placehold.co/600x400/1e293b/cbd5e1?text=No+Image',
        defectCount = 0,
        severity = 'Low',
        date = new Date().toLocaleDateString(),
        location = null,
        status = 'completed',
        errorMessage = 'Unknown Error'
    } = inspection || {};

    const severityColor = {
        Low: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20',
        Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20',
        High: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20',
        Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-500/30 ring-1 ring-red-500/50',
    }[severity] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20';

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                await deleteInspection(id, token);
                if (onDelete) {
                    onDelete(id);
                }
            }
        } catch (error) {
            console.error("Failed to delete inspection:", error);
            alert("Failed to delete inspection. Please try again.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <div
                onClick={() => navigate(`/inspections/${id}`)}
                style={{ transitionDelay: `${index * 100}ms` }}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/40 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-500 ease-out transform overflow-hidden cursor-pointer border border-gray-100 dark:border-slate-700 hover:-translate-y-1 flex flex-col sm:flex-row ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
            >
                {/* Image Section - Horizontal Layout */}
                <div className="relative w-full sm:w-2/5 h-56 sm:h-auto bg-gray-100 dark:bg-slate-900 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={`Inspection ${id}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                    {/* Floating Status Badge (Top Left) */}
                    <div className="absolute top-3 left-3">
                        {status === 'failed' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-red-600 backdrop-blur-sm shadow-sm border border-white/20">
                                Failed
                            </span>
                        ) : (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm border border-white/20 ${status === 'completed'
                                ? 'bg-white/90 text-emerald-600'
                                : 'bg-white/90 text-blue-600'
                                }`}>
                                {status === 'completed' ? 'Completed' : status}
                            </span>
                        )}
                    </div>

                    {/* Floating Severity Badge (Top Right) */}
                    <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm border border-white/20 ${severity === 'Critical' || severity === 'High' ? 'bg-red-500/90 text-white' :
                            severity === 'Medium' ? 'bg-amber-400/90 text-white' :
                                'bg-emerald-500/90 text-white'
                            }`}>
                            {severity} Risk
                        </span>
                    </div>

                    {/* ID Badge (Bottom Left) */}
                    <div className="absolute bottom-3 left-3">
                        <p className="text-white/90 font-mono text-xs tracking-wider bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                            #{id.slice(0, 8)}
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                    Analysis Report
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {date}
                                </p>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2.5 flex flex-col items-center justify-center border border-gray-100 dark:border-slate-700">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Issues</span>
                                <span className={`text-xl font-extrabold ${defectCount > 0 ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {defectCount}
                                </span>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2.5 flex flex-col items-center justify-center border border-gray-100 dark:border-slate-700">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Confidence</span>
                                <span className="text-xl font-extrabold text-gray-900 dark:text-gray-200">
                                    98%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-700/50">
                        <button
                            onClick={handleDeleteClick}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-full transition-all group/btn"
                            title="Delete Inspection"
                        >
                            <svg className="w-4 h-4 transform group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
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
        </>
    );
};

export default InspectionCard;
