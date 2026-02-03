import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize search query from URL if on search page
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = location.pathname === '/search' ? queryParams.get('q') || '' : '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isSearchVisible, setIsSearchVisible] = useState(initialQuery.length > 0);

    // Sync state with URL changes (e.g., when navigating back)
    useEffect(() => {
        if (location.pathname === '/search') {
            const q = new URLSearchParams(location.search).get('q') || '';
            setSearchQuery(q);
            if (q) setIsSearchVisible(true);
        }
    }, [location]);

    // Debounce search query
    useEffect(() => {
        if (!searchQuery.trim()) return;

        const timer = setTimeout(() => {
            // Only navigate if the query is different from current URL
            const currentQuery = new URLSearchParams(location.search).get('q');
            if (searchQuery !== currentQuery) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: location.pathname === '/search' });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, navigate, location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="logo">RECOFLIX</Link>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    {user && <li><Link to="/favorites">My List</Link></li>}
                    {user && <li><Link to="/profile">Profile</Link></li>}
                    {user?.is_admin && <li><Link to="/admin">Admin</Link></li>}
                </ul>
            </div>
            <div className="navbar-right">
                <div className={`search-container ${isSearchVisible ? 'visible' : ''}`}>
                    <form onSubmit={handleSearchSubmit}>
                        <SearchIcon
                            className="search-icon"
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                        />
                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus={isSearchVisible}
                        />
                    </form>
                </div>
                {user ? (
                    <div className="user-menu">
                        <Link to="/profile" className="username" title={user.email}>
                            {user.username}
                        </Link>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="login-link">Sign In</Link>
                )}
            </div>
        </nav>
    );
}
