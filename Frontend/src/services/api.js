export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (token) => {
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const uploadImage = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = getHeaders(token);
    // Note: Do NOT set 'Content-Type': 'multipart/form-data' manually. fetch does it.

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                // If response is not JSON (e.g. 500 HTML), fallback to status text
                errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const getInspections = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/inspections`);
        if (!response.ok) {
            throw new Error(`Failed to fetch inspections: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching inspections:', error);
        throw error;
    }
}

export const getUserInspections = async (token) => {
    try {
        const headers = getHeaders(token);
        const response = await fetch(`${API_BASE_URL}/my-inspections`, {
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch user inspections: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user inspections:', error);
        throw error;
    }
}


export const getInspectionDetail = async (id, token) => {
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch inspection details: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching inspection details:', error);
        throw error;
    }
};

export const deleteInspection = async (id, token) => {
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to delete inspection: ${response.statusText}`);
        }
        return true;
    } catch (error) {
        console.error('Error deleting inspection:', error);
        throw error;
    }
};

export const exportInspection = async (id, token) => {
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/inspections/${id}/export`, {
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to export inspection: ${response.statusText}`);
        }
        return await response.blob();
    } catch (error) {
        console.error('Error exporting inspection:', error);
        throw error;
    }
};
