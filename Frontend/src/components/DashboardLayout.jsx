import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getUserInspections } from '../services/api';
import { auth } from '../firebase/auth';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInspections = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (user) {
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
                        created_at: item.created_at // Keep original for sorting
                    }));
                    mappedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setInspections(mappedData);
                }
            }
        } catch (error) {
            console.error("Failed to fetch inspections for sidebar", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchInspections();
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300 relative isolate overflow-hidden">
            {/* Professional Background Layer */}
            <div className="fixed inset-0 z-[-1]">
                {/* Main Gradient Field */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/40 dark:from-slate-900 dark:via-[#0f172a] dark:to-slate-950"></div>

                {/* Subtle Dot Pattern */}
                <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1]"
                    style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* Ambient Glows */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Sidebar Component */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                inspections={inspections}
            />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:pl-72' : ''}`}>

                {/* Mobile Toggle & Logo */}
                <div className={`fixed top-4 left-4 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}`}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="bg-white dark:bg-gray-900 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            QC
                        </div>
                    </button>
                </div>

                <main className="relative flex-1">
                    <div className="relative z-10 h-full">
                        <Outlet context={{ inspections, fetchInspections, loading }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
