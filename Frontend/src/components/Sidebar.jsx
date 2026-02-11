import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/auth';

const Sidebar = ({ isOpen, toggleSidebar, inspections = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header with Logo */}
                <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={toggleSidebar}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            QC
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Inspector
                        </span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={toggleSidebar}
                        className="ml-auto lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col h-[calc(100%-5rem)]">

                    {/* Main Nav */}
                    <div className="p-4 space-y-1">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/dashboard'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/recent-inspections')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/recent-inspections'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Recent Inspections
                        </button>
                    </div>

                    {/* Past Records (History) */}
                    <div className="px-6 pt-4 pb-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Recent History
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
                        {inspections.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-500 italic">
                                No records yet
                            </div>
                        ) : (
                            inspections.map((inspection) => (
                                <button
                                    key={inspection.id}
                                    onClick={() => navigate(`/inspections/${inspection.id}`)}
                                    className={`w-full text-left group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${location.pathname === `/inspections/${inspection.id}`
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inspection.status === 'failed' || inspection.errorMessage
                                        ? 'bg-red-500'
                                        : inspection.defectCount > 0
                                            ? 'bg-amber-400'
                                            : 'bg-green-500'
                                        }`} />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium truncate">#{inspection.id.slice(0, 8)}</span>
                                        <span className="text-[10px] text-gray-400 truncate">{inspection.date}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer / User Profile */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <div
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 mb-3 px-2 cursor-pointer hover:bg-white dark:hover:bg-gray-800 rounded-lg p-2 -ml-2 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent group-hover:ring-indigo-500 transition-all">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.displayName || user?.email}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">View Profile</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
