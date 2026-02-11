import React from 'react';

const HeroPage = () => {
    return (
        <section className="relative isolate w-full min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 overflow-hidden pt-24 md:pt-32 transition-colors duration-300">

            {/* Premium Animated Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.2),rgba(0,0,0,0))]"></div>
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Ambient Globs */}
            <div className="absolute left-[10%] top-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/30 blur-[100px] animate-pulse-slow"></div>
            <div className="absolute right-[10%] bottom-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-indigo-500/30 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">

                {/* Announcement Pill - Enhanced */}
                <div className="mb-10 flex justify-center fade-in-up">
                    <div className="group relative rounded-full px-4 py-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300 ring-1 ring-gray-900/10 dark:ring-gray-100/10 hover:ring-indigo-500/50 dark:hover:ring-indigo-400/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-indigo-500/20">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">New v2.0</span> &middot; AI-Driven Analysis <a href="#" className="font-semibold text-indigo-600 dark:text-indigo-400 ml-1 group-hover:translate-x-1 inline-block transition-transform"><span className="absolute inset-0" aria-hidden="true" />Read more <span aria-hidden="true">&rarr;</span></a>
                    </div>
                </div>

                {/* Main Heading - Gradient Text */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-500 mb-8 sm:mb-12 max-w-5xl mx-auto leading-[1.1] drop-shadow-sm">
                    Automate Quality Control with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">Intelligent Vision</span>
                </h1>

                {/* Subheading - Refined */}
                <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                    Instantly detect defects, generate detailed inspection reports, and monitor production quality in real-time—all powered by state-of-the-art AI.
                </p>

                {/* CTA Buttons - Removed Demo, Enhanced Primary */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                    <a
                        href="/signup"
                        className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 w-full sm:w-auto"
                    >
                        Get Started For Free
                    </a>
                </div>

            </div>

            {/* Bottom Fade */}
            <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
        </section>
    );
};

export default HeroPage;
