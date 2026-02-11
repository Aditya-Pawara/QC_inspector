import React, { useState, useEffect } from 'react';
import InspectionList from '../components/InspectionList';
import { getUserInspections } from '../services/api';
import { auth } from '../firebase/auth';

const RecentInspections = () => {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInspections = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = auth.currentUser;
            if (!user) {
                // Component might mount before auth is fully ready, but AuthGuard protects the route.
                // We can wait or just return if no user immediately (AuthGuard handles redirect)
                return;
            }

            const token = await user.getIdToken();
            const data = await getUserInspections(token);

            if (Array.isArray(data)) {
                const mappedData = data.map(item => ({
                    id: String(item.id),
                    imageUrl: item.image_url || 'https://placehold.co/600x400/1e293b/cbd5e1?text=No+Image',
                    defectCount: item.analysis_result?.defects?.length || 0,
                    severity: item.analysis_result?.overall_severity || 'Unknown',
                    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                    status: item.status,
                    errorMessage: item.analysis_result?.error || null,
                    created_at: item.created_at
                }));
                mappedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setInspections(mappedData);
            } else {
                setInspections([]);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load inspections. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Simple auth check listener to trigger fetch once user is available
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchInspections();
            }
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteInspection = (id) => {
        setInspections(prevInspections => prevInspections.filter(item => item.id !== id));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pt-4 lg:pt-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Recent Inspections
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
                            History of all quality control scans
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20 min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="text-red-500 mb-2">
                            <svg className="w-12 h-12 mx-auto mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-lg font-semibold">{error}</p>
                        </div>
                        <button onClick={fetchInspections} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Try Again</button>
                    </div>
                ) : (
                    <div className="pb-12">
                        <InspectionList inspections={inspections} onDelete={handleDeleteInspection} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentInspections;
