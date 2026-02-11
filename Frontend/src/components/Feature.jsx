import React from 'react';

const features = [
    {
        title: "Smart Image Upload",
        description: "Seamlessly capture photos from the manufacturing line or upload high-res files for instant inspection.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        ),
    },
    {
        title: "AI-Powered Analysis",
        description: "Our Gemini Vision LLM identifies microscopic defects and anomalies that the human eye might miss.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        ),
    },
    {
        title: "Precision Defect Detection",
        description: "Receive detailed reports with severity classification (Critical, High, Medium) and actionable fixes.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        ),
    },
    {
        title: "Comprehensive Dashboard",
        description: "Track quality trends over time, view historical data, and manage team performance in one hub.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        ),
    },
];

const Features = () => {
    return (
        <section className="relative py-32 bg-gray-50 dark:bg-gray-950 transition-colors duration-300" id="features">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">
                        Advanced Capabilities
                    </h2>
                    <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        Everything you need for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500">flawless quality control</span>
                    </p>
                    <p className="text-xl leading-8 text-gray-600 dark:text-gray-400 font-light">
                        Replace manual checks with our automated AI pipeline. Reduce errors, save time, and ensure every product meets your standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {features.map((feature, index) => (
                        <div key={index} className="group relative flex flex-col p-8 md:p-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-sm border border-white/20 dark:border-gray-800/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1">
                            <div className="mb-8 overflow-hidden rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 p-4 w-16 h-16 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <dt className="text-2xl font-bold leading-7 text-gray-900 dark:text-white mb-4">
                                {feature.title}
                            </dt>
                            <dd className="text-base leading-7 text-gray-600 dark:text-gray-400 flex-auto mb-6">
                                {feature.description}
                            </dd>
                            <div className="">
                                <a href="#" className="inline-flex items-center text-sm font-semibold leading-6 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform duration-300">
                                    Learn more <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
