import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService, interactionService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserAndFavorites = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setFavorites([]);
            setLoading(false);
            return;
        }

        try {
            const userData = await authService.getCurrentUser();
            if (userData) {
                setUser(userData);
                const favData = await interactionService.getFavorites();
                // Robust normalization: handle both objects {movie_id: 1} and primitives 1
                const normalizedFavs = favData.map(item => {
                    if (item && typeof item === 'object') {
                        return String(item.movie_id || item.id);
                    }
                    return String(item);
                });
                setFavorites(normalizedFavs);
            } else {
                setUser(null);
                setFavorites([]);
            }
        } catch (error) {
            console.error('Error fetching auth data:', error);
            setUser(null);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserAndFavorites();
    }, [fetchUserAndFavorites]);

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        if (data.access_token) {
            await fetchUserAndFavorites();
        }
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setFavorites([]);
    };

    const toggleFavorite = async (movie) => {
        if (!user) return false;

        const id = movie.movie_id || movie.id;
        const movieIdStr = String(id);
        const isFavorite = favorites.includes(movieIdStr);

        console.log(`[Favorites] ${isFavorite ? 'Removing' : 'Adding'} movie:`, movieIdStr);

        // Optimistic update
        setFavorites(prev =>
            isFavorite
                ? prev.filter(fid => fid !== movieIdStr)
                : [...prev, movieIdStr]
        );

        try {
            let res;
            if (isFavorite) {
                res = await interactionService.removeFavorite(id);
                console.log('[Favorites] Remove success:', res.message || 'Removed from favorites');
            } else {
                res = await interactionService.addFavorite(id);
                console.log('[Favorites] Add success:', res.message || 'Added to favorites');
            }
            return true;
        } catch (error) {
            const errorMsg = error.response?.data?.detail || error.message;
            console.error('[Favorites] Sync failed:', errorMsg);
            alert(errorMsg); // Show error message to user as requested
            // Revert on error
            setFavorites(prev =>
                isFavorite
                    ? [...prev, movieIdStr]
                    : prev.filter(fid => fid !== movieIdStr)
            );
            return false;
        }
    };

    const value = {
        user,
        favorites,
        loading,
        login,
        logout,
        toggleFavorite,
        refreshFavorites: fetchUserAndFavorites
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
