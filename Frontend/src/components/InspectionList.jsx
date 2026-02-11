import React from 'react';
import InspectionCard from './InspectionCard';

const InspectionList = ({ inspections, onDelete }) => {
    if (!inspections || inspections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/10 group hover:border-white/20 transition-all duration-300">
                <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:bg-white/10 transition-colors duration-300">
                    <svg className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
                <p className="text-xl font-bold text-white mb-2">No inspections found</p>
                <p className="text-gray-400 max-w-sm text-center">Get started by uploading a new image for detailed quality control analysis.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inspections.map((inspection, index) => (
                <InspectionCard key={inspection.id} inspection={inspection} onDelete={onDelete} index={index} />
            ))}
        </div>
    );
};

export default InspectionList;
