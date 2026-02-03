import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { movieService, interactionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Browse.css'; // Reusing browse grid styles

export default function Favorites() {
    const { user, favorites, toggleFavorite, loading: authLoading } = useAuth();
    const [movies, setMovies] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
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

        const fetchFavoritesAndRecs = async () => {
            if (!user) return;
            try {
                const data = await interactionService.getFavorites();
                setMovies(data);

                // Fetch recommendations based on first favorite to fulfill "recommendation based on favorite list"
                if (data.length > 0) {
                    const firstId = data[0].movie_id || data[0].id;
                    const recs = await movieService.getRecommendationsByMovieId(firstId);
                    setRecommendations(recs || []);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoritesAndRecs();
    }, [user, authLoading, navigate]);

    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    const handleToggleFavorite = async (e, movie) => {
        e.stopPropagation();
        const success = await toggleFavorite(movie);
        if (success) {
            setMovies(prev => prev.filter(m => String(m.movie_id || m.id) !== String(movie.movie_id || movie.id)));
        }
    };

    return (
        <div className="browse-page">
            <Navbar />
            <div className="browse-content" style={{ paddingTop: '70px' }}>
                {loading ? (
                    <div className="loading-screen">LOADING...</div>
                ) : (
                    <>
                        {movies.length > 0 ? (
                            <div className="movies-grid">
                                {movies.map((movie) => {
                                    const id = movie.movie_id || movie.id;
                                    // These are already in favorites, so isFav is always true here
                                    return (
                                        <div
                                            key={id}
                                            className="movie-card"
                                            onClick={() => handleMovieClick(id)}
                                        >
                                            <img
                                                src={movie.poster || 'https://via.placeholder.com/300x375?text=No+Poster'}
                                                alt={movie.title}
                                            />
                                            <button
                                                className="card-heart active"
                                                onClick={(e) => handleToggleFavorite(e, movie)}
                                            >
                                                <Heart size={20} fill="#e50914" color="#e50914" />
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
                        ) : (
                            <div className="no-results" style={{ textAlign: 'center', padding: '50px' }}>
                                <h2>Your list is empty</h2>
                                <p>Add some movies to your list to see them here!</p>
                            </div>
                        )}

                        {recommendations.length > 0 && (
                            <div className="favorites-recs-section" style={{ marginTop: '30px' }}>
                                <h2 className="section-title">Recommended for You</h2>
                                <div className="movies-grid" style={{ padding: '0' }}>
                                    {recommendations.slice(0, 6).map((movie) => {
                                        const id = movie.movie_id || movie.id;
                                        const isFav = favorites.includes(String(id));
                                        return (
                                            <div
                                                key={id}
                                                className="movie-card"
                                                onClick={() => handleMovieClick(id)}
                                            >
                                                <img
                                                    src={movie.poster || 'https://via.placeholder.com/300x375?text=No+Poster'}
                                                    alt={movie.title}
                                                />
                                                <button
                                                    className={`card-heart ${isFav ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(movie);
                                                    }}
                                                >
                                                    <Heart
                                                        size={20}
                                                        fill={isFav ? "#e50914" : "none"}
                                                        color={isFav ? "#e50914" : "white"}
                                                    />
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
                    </>
                )}
            </div>
        </div>
    );
}
