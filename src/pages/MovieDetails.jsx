import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { movieService, interactionService } from '../services/api';
import './MovieDetails.css';

export default function MovieDetails() {
    const { user, favorites, toggleFavorite } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [ratingError, setRatingError] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoading(true);
            try {
                const data = await movieService.getMovieById(id);
                setMovie(data);

                // Fetch ratings
                const movieRatings = await interactionService.getRatingsByMovie(id);
                setRatings(movieRatings);

                // Fetch recommendations
                const recs = await movieService.getRecommendationsByMovieId(id);
                setRecommendations(recs || []);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    const handleToggleFavorite = async () => {
        const success = await toggleFavorite(movie || { id });
        if (!success && !user) {
            navigate('/login');
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (userRating === 0) {
            setRatingError("Please select a rating");
            return;
        }

        setSubmittingRating(true);
        setRatingError(null);

        try {
            await interactionService.addRating({
                movie_id: parseInt(id),
                rating: userRating,
                comment: userComment
            });

            // Refresh ratings
            const movieRatings = await interactionService.getRatingsByMovie(id);
            setRatings(movieRatings);
            setUserComment('');
            setUserRating(0);
        } catch (error) {
            setRatingError(error.response?.data?.detail || "You have already rated this movie.");
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) {
        return (
            <div className="movie-details-page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
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
                        <span className="rating">{movie.vote_average} ⭐</span>
                        <button
                            className={`favorite-btn-large ${favorites.includes(id) ? 'active' : ''}`}
                            onClick={handleToggleFavorite}
                            title={favorites.includes(id) ? "Remove from My List" : "Add to My List"}
                        >
                            <Heart
                                size={24}
                                fill={favorites.includes(id) ? "#e50914" : "none"}
                                color={favorites.includes(id) ? "#e50914" : "white"}
                            />
                            <span>{favorites.includes(id) ? "In My List" : "Add to My List"}</span>
                        </button>
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
                    <div className="ratings-section">
                        <h2>User Reviews ({ratings.length})</h2>

                        {user ? (
                            (() => {
                                const userReview = ratings.find(r => r.user_id === user.id);
                                return userReview ? (
                                    <div className="your-review-notice">
                                        <div className="notice-header">
                                            <h3>Your Review</h3>
                                            <span className="info-tag">You've already rated this movie</span>
                                        </div>
                                        <div className="rating-card highlighted">
                                            <div className="rating-header">
                                                <div className="user-info">
                                                    <span className="username">You</span>
                                                    <div className="stars">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star
                                                                key={s}
                                                                size={14}
                                                                fill={s <= userReview.rating ? "#ffc107" : "none"}
                                                                color={s <= userReview.rating ? "#ffc107" : "#666"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="date">{new Date(userReview.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {userReview.comment && <p className="comment">{userReview.comment}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <form className="rating-form" onSubmit={handleRatingSubmit}>
                                        <h3>Leave a review</h3>
                                        <div className="rating-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={24}
                                                    fill={star <= userRating ? "#ffc107" : "none"}
                                                    color={star <= userRating ? "#ffc107" : "#666"}
                                                    onClick={() => setUserRating(star)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="Tell us what you think..."
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                        />
                                        {ratingError && <p className="error-message">{ratingError}</p>}
                                        <button type="submit" disabled={submittingRating}>
                                            {submittingRating ? 'Posting...' : 'Post Review'}
                                        </button>
                                    </form>
                                );
                            })()
                        ) : (
                            <p className="login-prompt">Please <span onClick={() => navigate('/login')}>sign in</span> to leave a review.</p>
                        )}

                        <div className="ratings-list">
                            {ratings.length === 0 ? (
                                <p className="no-reviews">No reviews yet. Be the first to rate!</p>
                            ) : (
                                ratings.filter(r => r.user_id !== user?.id).map((r, idx) => (
                                    <div key={idx} className="rating-card">
                                        <div className="rating-header">
                                            <div className="user-info">
                                                <span className="username">User {r.user_id}</span>
                                                <div className="stars">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star
                                                            key={s}
                                                            size={14}
                                                            fill={s <= r.rating ? "#ffc107" : "none"}
                                                            color={s <= r.rating ? "#ffc107" : "#666"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="date">{new Date(r.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {r.comment && <p className="comment">{r.comment}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>


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

            {recommendations.length > 0 && (
                <div className="recommendations-container" style={{ padding: '0 50px 50px' }}>
                    <div className="movies-grid" style={{ padding: '0' }}>
                        {recommendations.slice(0, 6).map((movie) => {
                            const rid = movie.movie_id || movie.id;
                            const isFav = favorites.includes(String(rid));
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
                                            <span className="rating">⭐ {movie.vote_average}</span>
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
