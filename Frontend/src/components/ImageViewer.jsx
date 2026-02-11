import React from 'react';

const ImageViewer = ({ src, alt }) => {
    if (!src) return <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">No Image</div>;

    return (
        <div className="rounded-lg overflow-hidden shadow-lg mb-6">
            <img
                src={src}
                alt={alt || "Inspection Image"}
                className="w-full h-auto object-cover max-h-[500px]"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Error'; }}
            />
        </div>
    );
};

export default ImageViewer;
