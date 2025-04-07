function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
        const response = await fetch('/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    } catch (error) {
        console.error('Error refreshing token:', error);
        window.location.href = '/login/';  // Redirige a login si hay error
        throw error;
    }
}

async function fetchWithAuth(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
    
    let response = await fetch(url, options);
    
    if (response.status === 401) {
        // Token expirado, intentamos refrescar
        const newToken = await refreshToken();
        options.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, options);
    }
    
    return response;
}