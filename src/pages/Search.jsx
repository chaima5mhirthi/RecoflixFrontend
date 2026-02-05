import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { movieService } from '../services/api';
import './Search.css';

export default function Search() {
    const { user, favorites, toggleFavorite } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q');
    const [searchResults, setSearchResults] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const data = await movieService.search(query);
                setSearchResults(data.search_results || []);
                setRecommendations(data.recommendations || []);
            } catch (error) {
                console.error('Error searching movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

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
        <div className="search-page">
            <Navbar />
            <div className="search-content" style={{ paddingTop: '70px' }}>
                {loading ? (
                    <div className="loading-screen">SEARCHING...</div>
                ) : (
                    <div className="movies-grid">
                        {[...searchResults, ...recommendations].map((movie) => {
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
                )}
            </div>
        </div>
    );
}
