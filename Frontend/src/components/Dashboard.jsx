import React, { useState, useEffect } from 'react';
import InspectionCard from './InspectionCard';
import ImageUploadModal from './ImageUploadModal';
import { getInspections } from '../services/api';

const Dashboard = () => {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const fetchInspections = async () => {
        setLoading(true);
        try {
            // Check if mock data should be used or API call succeeds
            // Since API is just created, try real API call
            const data = await getInspections();
            if (Array.isArray(data)) {
                setInspections(data);
            } else {
                setInspections([]); // Fallback
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load inspections.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInspections();
    }, []);

    const handleUploadSuccess = (newInspection) => {
        // Add new inspection to top of list
        setInspections([newInspection, ...inspections]);
        // Also refetch to ensure consistent state if needed? but local update is faster
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inspection Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of recent quality control checks</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Inspection
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                    <p>{error}</p>
                    <button onClick={fetchInspections} className="mt-2 text-sm underline hover:text-red-900">Retry</button>
                </div>
            ) : inspections.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.414l5 5a1 1 0 01.414 1.414V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No inspections found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Get started by uploading a new image for analysis.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inspections.map((inspection) => (
                        <InspectionCard key={inspection.id} inspection={inspection} />
                    ))}
                </div>
            )}

            <ImageUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default Dashboard;
