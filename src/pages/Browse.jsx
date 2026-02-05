import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { movieService } from '../services/api';
import './Browse.css';

export default function Browse() {
    const { user, favorites, toggleFavorite } = useAuth();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const movieDataRaw = await movieService.getHomeData();
                // Personalized home returns a single list of movies (unified search results + recommendations)
                const movieData = Array.isArray(movieDataRaw)
                    ? movieDataRaw
                    : (movieDataRaw.recommendations || movieDataRaw.results || []);
                setMovies(movieData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    const handleToggleFavorite = async (e, movie) => {
        e.stopPropagation();
        const success = await toggleFavorite(movie);
        if (!success && !user) {
            navigate('/login');
        }
    };

    return (
        <div className="browse-page">
            <Navbar />
            {loading ? (
                <div className="loading-screen">RECOFLIX</div>
            ) : (
                <div className="browse-content" style={{ paddingTop: '70px' }}>
                    <div className="movies-grid">
                        {movies.slice(0, 20).map((movie) => {
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
                                    {!user?.is_admin && (
                                        <button
                                            className={`card-heart ${isFav ? 'active' : ''}`}
                                            onClick={(e) => handleToggleFavorite(e, movie)}
                                        >
                                            <Heart size={20} fill={isFav ? "#e50914" : "none"} />
                                        </button>
                                    )}
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
    );
}
