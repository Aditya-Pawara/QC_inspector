import React, { useState, useEffect } from 'react';
import UploadButton from '../components/UploadButton';
import ImageUploadModal from '../components/ImageUploadModal';
import { getUserInspections } from '../services/api';
import { auth } from '../firebase/auth';
import { useOutletContext } from 'react-router-dom';

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchInspections: refreshSidebar } = useOutletContext() || {};

    const fetchLocalInspections = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocalInspections();
    }, []);

    const handleUploadSuccess = (newInspection) => {
        fetchLocalInspections();
        if (refreshSidebar) refreshSidebar();
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const AnimatedCounter = ({ value, duration = 1500 }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let start = 0;
            // Extract numeric part and suffix
            const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
            const suffix = String(value).replace(/[0-9.-]/g, '');
            if (isNaN(numericValue)) return;

            const end = numericValue;
            const incrementTime = 20; // ms
            const steps = duration / incrementTime;
            const increment = end / steps;

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(start);
                }
            }, incrementTime);

            return () => clearInterval(timer);
        }, [value, duration]);

        const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
        const suffix = String(value).replace(/[0-9.-]/g, '');

        // Determine if integer or float based on input string
        const isFloat = String(value).includes('.');

        return (
            <span>
                {isFloat ? count.toFixed(1) : Math.round(count)}
                {suffix}
            </span>
        );
    };

    const FadeIn = ({ children, delay = 0, className = "" }) => (
        <div
            className={`transition-all duration-700 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );

    // Calculate stats
    const totalInspections = inspections.length;
    const totalWithDefects = inspections.filter(i => i.defectCount > 0).length;
    const defectRate = totalInspections > 0 ? ((totalWithDefects / totalInspections) * 100).toFixed(1) : '0.0';
    const pendingReview = inspections.filter(i => i.severity === 'High' || i.severity === 'Critical').length;
    const efficiencyScore = totalInspections > 0
        ? Math.max(0, 100 - (parseFloat(defectRate) * 1.5)).toFixed(1)
        : '100.0';

    const stats = [
        {
            label: 'Total Inspections',
            value: totalInspections.toString(),
            change: '+12%',
            trend: 'up',
            icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        {
            label: 'Defect Rate',
            value: `${defectRate}%`,
            change: parseFloat(defectRate) > 5 ? '+2.1%' : '-0.5%',
            trend: parseFloat(defectRate) > 5 ? 'up' : 'down',
            inverse: true,
            icon: (
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        {
            label: 'Pending Review',
            value: pendingReview.toString(),
            change: pendingReview > 5 ? '+4' : '-2',
            trend: pendingReview > 5 ? 'up' : 'down',
            inverse: true,
            icon: (
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Efficiency Score',
            value: efficiencyScore,
            change: '+1.2%',
            trend: 'up',
            icon: (
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        },
    ];

    // Calculate weekly volume based on real data
    const getWeeklyVolume = () => {
        const volumes = new Array(7).fill(0);
        const labels = new Array(7).fill('');
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        // Generate labels for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            labels[6 - i] = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // 'M', 'T', etc.
        }

        inspections.forEach(insp => {
            // Try to use created_at if available, otherwise fallback to date string if parsable, else skip
            let inspDate = null;
            if (insp.created_at) {
                inspDate = new Date(insp.created_at);
            } else if (insp.date) {
                inspDate = new Date(insp.date);
            }

            if (inspDate && !isNaN(inspDate)) {
                const diffTime = Math.abs(today - inspDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays < 7) {
                    volumes[6 - diffDays]++;
                }
            }
        });
        return { volumes, labels };
    };

    const { volumes: volumeData, labels: volumeLabels } = getWeeklyVolume();
    const maxVolume = Math.max(...volumeData, 5); // Default max to 5 to avoid flat charts

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pt-4 lg:pt-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Inspection Console
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
                            System Status: <span className="text-green-500 font-semibold animate-pulse">Online</span>
                        </p>
                    </div>
                </FadeIn>

                {/* Hero / Action Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Left: Main Scanner / Action Card */}
                    <FadeIn delay={100} className="lg:col-span-2">
                        <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-1 shadow-2xl relative overflow-hidden group hover:shadow-indigo-500/40 hover:scale-[1.01] transition-all duration-300">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>

                            <div className="relative h-full min-h-[400px] bg-white dark:bg-gray-900 rounded-[22px] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                                {/* Decorative Grid Background */}
                                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                                    style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                                </div>

                                <div className="z-10 w-full max-w-md flex flex-col items-center">
                                    <div className="mb-6 flex items-center justify-center">
                                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-bold uppercase tracking-wider border border-green-500/20 shadow-sm">
                                            ● AI Model Ready
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Start New Analysis
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                                        Upload an image to detect defects and analyze quality metrics using Gemini AI.
                                    </p>

                                    <div className="transform transition-transform duration-300 hover:scale-105 flex justify-center w-full">
                                        <UploadButton onClick={() => setIsModalOpen(true)} />
                                    </div>

                                    <p className="mt-6 text-xs text-gray-400 font-mono">
                                        Supported formats: JPG, PNG, WEBP
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Right: System Stats & Quick View */}
                    <FadeIn delay={200} className="h-full">
                        <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/40 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 group">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Weekly Volume
                            </h3>

                            {/* CSS Bar Chart */}
                            <div className="flex-1 flex items-end justify-between gap-2 min-h-[150px] mb-6 px-2">
                                {volumeData.map((val, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                                        <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-32 flex items-end">
                                            <div
                                                className={`w-full transition-all duration-1000 ease-out group-hover:opacity-80 ${i === 6 ? 'bg-indigo-500' : 'bg-indigo-200 dark:bg-indigo-900'
                                                    }`}
                                                style={{
                                                    height: mounted ? `${(val / maxVolume) * 100}%` : '0%',
                                                    transitionDelay: `${300 + (i * 100)}ms`
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            {volumeLabels[i]}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* System Health List */}
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Database</span>
                                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Connected
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Storage</span>
                                    <span className="text-gray-900 dark:text-white font-mono">45% Used</span>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* Stats Grid */}
                <FadeIn delay={300}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {stats.map((stat, index) => {
                            const isPositiveTrend = stat.trend === 'up';
                            const isGood = stat.inverse ? !isPositiveTrend : isPositiveTrend;

                            return (
                                <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/40 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-1">
                                    <div className="absolute right-0 top-0 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-150 transition-transform duration-700 ease-out">
                                        <div className="w-24 h-24 rounded-full bg-indigo-500 blur-xl"></div>
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors duration-300">
                                            {stat.icon}
                                        </div>
                                        <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${isGood
                                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                            }`}>
                                            {stat.change}
                                            <svg className={`w-3 h-3 ml-1 ${stat.trend === 'down' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{stat.label}</h3>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left duration-300">
                                        <AnimatedCounter value={stat.value} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </FadeIn>

                <ImageUploadModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUploadSuccess={handleUploadSuccess}
                />
            </div>
        </div>
    );
};

export default Dashboard;
