import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { movieService } from '../services/api';
import './MovieDetails.css';

export default function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const data = await movieService.getMovieById(id);
                setMovie(data);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="movie-details-page">
                <Navbar />
                <div className="loading">Loading movie details...</div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-details-page">
                <Navbar />
                <div className="error">Movie not found</div>
            </div>
        );
    }

    return (
        <div className="movie-details-page">
            <Navbar />
            <div
                className="movie-banner"
                style={{
                    backgroundImage: `linear-gradient(to top, #141414, transparent), url(${movie.poster})`,
                }}
            >
                <div className="movie-details-content">
                    <h1 className="movie-title">{movie.title}</h1>
                    <div className="movie-meta">
                        <span className="rating">⭐ {movie.vote_average}/10</span>
                    </div>
                </div>
            </div>
            <div className="movie-info-section">
                <div className="info-left">
                    <h2>Overview</h2>
                    <p className="overview">{movie.overview || 'No overview available'}</p>

                    {movie.keywords && (
                        <div className="keywords-section">
                            <h3>Keywords</h3>
                            <div className="keywords">
                                {(Array.isArray(movie.keywords)
                                    ? movie.keywords
                                    : typeof movie.keywords === 'string'
                                        ? movie.keywords.split(',').map(k => k.trim())
                                        : []
                                ).slice(0, 15).map((keyword, index) => (
                                    <span key={index} className="keyword-tag">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="info-right">
                    {movie.genres && (
                        <div className="info-item">
                            <strong>Genres:</strong> {
                                Array.isArray(movie.genres)
                                    ? movie.genres.join(', ')
                                    : typeof movie.genres === 'string'
                                        ? movie.genres
                                        : ''
                            }
                        </div>
                    )}
                    {movie.cast && (
                        <div className="info-item">
                            <strong>Cast:</strong> {
                                Array.isArray(movie.cast)
                                    ? movie.cast.slice(0, 5).join(', ')
                                    : typeof movie.cast === 'string'
                                        ? movie.cast
                                        : ''
                            }
                        </div>
                    )}
                    {movie.crew && (
                        <div className="info-item">
                            <strong>Crew:</strong> {
                                Array.isArray(movie.crew)
                                    ? movie.crew.slice(0, 3).join(', ')
                                    : typeof movie.crew === 'string'
                                        ? movie.crew
                                        : 'N/A'
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
