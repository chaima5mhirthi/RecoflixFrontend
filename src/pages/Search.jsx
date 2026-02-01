import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { movieService } from '../services/api';
import './Search.css';

export default function Search() {
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

    return (
        <div className="search-page">
            <Navbar />
            <div className="search-content">
                <h1 className="search-title">
                    {searchResults.length > 0
                        ? `Results for "${query}"`
                        : query
                            ? `No results found for "${query}"`
                            : 'Search for movies'}
                </h1>

                {loading ? (
                    <div className="loading">Searching...</div>
                ) : (
                    <>
                        <div className="results-grid">
                            {searchResults.map((movie) => (
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

                        {recommendations.length > 0 && (
                            <div className="recommendations-container">
                                <h2 className="recommendations-title">Recommended Movies</h2>
                                <div className="results-grid">
                                    {recommendations.map((movie) => (
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
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
