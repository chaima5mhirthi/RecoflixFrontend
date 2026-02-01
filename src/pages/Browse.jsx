import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { movieService } from '../services/api';
import './Browse.css';

export default function Browse() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                // Use the new home endpoint which requires authentication
                const data = await movieService.getHomeData();
                // The backend returns { count: ..., recommendations: [...] }
                setMovies(data.recommendations || []);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    return (
        <div className="browse-page">
            <Navbar />
            <div className="browse-content">
                {loading ? (
                    <div className="loading">Loading movies...</div>
                ) : (
                    <div className="movies-grid">
                        {movies.map((movie) => (
                            <div
                                key={movie.movie_id}
                                className="movie-card"
                                onClick={() => handleMovieClick(movie.movie_id)}
                            >
                                <img
                                    src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                                    alt={movie.title}
                                    className="movie-poster"
                                />
                                <div className="movie-info">
                                    <h3>{movie.title}</h3>
                                    <span className="rating">⭐ {movie.vote_average}/10</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
