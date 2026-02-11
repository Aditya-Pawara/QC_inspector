import React from 'react';

const UploadButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>New Inspection</span>
        </button>
    );
};

export default UploadButton;
