import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Create axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Movie Service - Available to all users (visitors + authenticated)
export const movieService = {
    // Search movies
    search: async (query) => {
        const response = await api.get(`/movies/search?query=${encodeURIComponent(query)}`);
        return response.data;
    },

    // Get movie by ID
    getMovieById: async (id) => {
        const response = await api.get(`/movies/${id}`);
        return response.data;
    },

    // Get home data (movies recommended based on history/trending)
    getHomeData: async () => {
        const response = await api.get('/movies/home');
        return response.data;
    },

    // Get recommendations for a movie
    getRecommendationsByMovieId: async (id) => {
        const response = await api.get(`/movies/${id}/recommendations`);
        return response.data;
    },
};

// Auth Service - For user authentication
export const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        // Now sending credentials directly as JSON
        const response = await api.post('/auth/login', credentials);

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            // Passing token as query parameter as required by backend
            const response = await api.get(`/auth/me?token=${token}`);
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            return null;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
    },
};

// Interaction Service - For user-specific interactions like favorites and ratings
export const interactionService = {
    // Get user favorites
    getFavorites: async () => {
        try {
            const response = await api.get('/favorites/'); // Trailing slash as requested
            return response.data.favorites || (Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    },

    // Add favorite - Query parameter as requested
    addFavorite: async (movieId) => {
        const response = await api.post(`/favorites?movie_id=${movieId}`, {});
        return response.data;
    },

    // Remove favorite - Path parameter as requested
    removeFavorite: async (movieId) => {
        const response = await api.delete(`/favorites/${movieId}`);
        return response.data;
    },

    // Add rating
    addRating: async (ratingData) => {
        const response = await api.post('/ratings', ratingData);
        return response.data;
    },

    // Get ratings for a movie
    getRatingsByMovie: async (movieId) => {
        const response = await api.get(`/ratings/movie/${movieId}`);
        return response.data;
    },

    // Get user ratings
    getRatingsByUser: async () => {
        const response = await api.get('/ratings/user');
        return response.data;
    },
};

// Admin Service - For admin users only
export const adminService = {
    // Get all users
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Promote user to admin
    promoteUser: async (id) => {
        const response = await api.post(`/admin/users/${id}/promote`, {});
        return response.data;
    },

    // Demote admin to user
    demoteUser: async (id) => {
        const response = await api.post(`/admin/users/${id}/demote`, {});
        return response.data;
    },
};
