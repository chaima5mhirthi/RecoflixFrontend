import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { movieService, interactionService } from '../services/api';
import './Profile.css';

export default function Profile() {
    const { user, toggleFavorite, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [topRatedMovie, setTopRatedMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user?.is_admin) {
            navigate('/admin');
            return;
        }

        const fetchProfileData = async () => {
            if (!user) return;
            try {
                // Fetch favorites
                const favData = await interactionService.getFavorites();
                setFavorites(favData);

                // Fetch user ratings to get recommendations based on "Rating"
                const userRatings = await interactionService.getRatingsByUser();
                if (userRatings && userRatings.length > 0) {
                    // Find highest rated movie (e.g. 5 stars)
                    const best = userRatings.reduce((prev, current) => (prev.rating > current.rating) ? prev : current);
                    if (best && best.rating >= 4) {
                        try {
                            const movieDetails = await movieService.getMovieById(best.movie_id);
                            setTopRatedMovie(movieDetails);
                            const recs = await movieService.getRecommendationsByMovieId(best.movie_id);
                            setRecommendations(recs || []);
                        } catch (err) {
                            console.error('Error fetching rating-based recs:', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, authLoading, navigate]);

    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    const handleToggleFavorite = async (e, movie) => {
        e.stopPropagation();
        const success = await toggleFavorite(movie);
        if (success) {
            // Also update local list of full movie objects
            setFavorites(prev => prev.filter(m => String(m.movie_id || m.id) !== String(movie.movie_id || movie.id)));
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <Navbar />
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info-main">
                        <h1>{user?.full_name || user?.username}</h1>
                        <p className="profile-email"><Mail size={16} /> {user?.email}</p>
                    </div>
                </div>

                <div className="profile-details-grid">
                    <div className="detail-card">
                        <h3>Account Details</h3>
                        <div className="detail-item">
                            <span className="label">Username:</span>
                            <span className="value">{user?.username}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Full Name:</span>
                            <span className="value">{user?.full_name || 'Not provided'}</span>
                        </div>
                    </div>

                    <div className="detail-card stats-card">
                        <h3>Activity</h3>
                        <div className="stat-item">
                            <Heart size={20} className="stat-icon" fill="#e50914" color="#e50914" />
                            <div className="stat-info">
                                <span className="stat-value">{favorites.length}</span>
                                <span className="stat-label">Movies Liked</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-favorites-section">
                    <h2>My Favorite Movies</h2>
                    {favorites.length === 0 ? (
                        <div className="no-favorites">
                            <p>You haven't added any movies to your list yet.</p>
                            <button onClick={() => navigate('/')} className="browse-btn">Browse Movies</button>
                        </div>
                    ) : (
                        <div className="favorites-grid">
                            {favorites.map((movie) => {
                                const id = movie.movie_id || movie.id;
                                return (
                                    <div
                                        key={id}
                                        className="movie-card"
                                        onClick={() => handleMovieClick(id)}
                                    >
                                        <img
                                            src={movie.poster || 'https://via.placeholder.com/300x375?text=No+Poster'}
                                            alt={movie.title}
                                            className="movie-poster"
                                        />
                                        <button
                                            className="favorite-btn active"
                                            onClick={(e) => handleToggleFavorite(e, movie)}
                                        >
                                            <Heart
                                                size={20}
                                                fill="#e50914"
                                                color="#e50914"
                                            />
                                        </button>
                                        <div className="movie-info">
                                            <h3>{movie.title}</h3>
                                            <div className="movie-meta">
                                                <span className="rating">⭐ {movie.vote_average}/10</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {recommendations.length > 0 && topRatedMovie && (
                    <div className="profile-recommendations" style={{ marginTop: '40px' }}>
                        <div className="movies-grid" style={{ padding: '0' }}>
                            {recommendations.slice(0, 6).map(movie => {
                                const rid = movie.movie_id || movie.id;
                                const isFav = favorites.some(f => String(f.movie_id || f.id) === String(rid));
                                return (
                                    <div key={rid} className="movie-card" onClick={() => navigate(`/movie/${rid}`)}>
                                        <img src={movie.poster || 'https://via.placeholder.com/300x375?text=No+Poster'} alt={movie.title} />
                                        <button
                                            className={`card-heart ${isFav ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(movie);
                                            }}
                                        >
                                            <Heart size={20} fill={isFav ? "#e50914" : "none"} />
                                        </button>
                                        <div className="movie-overlay">
                                            <h3>{movie.title}</h3>
                                            <div className="meta">
                                                <span className="rating">⭐ {movie.vote_average}/10</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
