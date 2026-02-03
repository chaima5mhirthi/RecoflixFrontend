import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authService } from '../services/api';
import './Register.css';

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.register({
                full_name: formData.full_name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            // Registration success, redirect to login
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                // Handling Pydantic validation errors (array of objects)
                setError(detail[0]?.msg || 'Validation error. format email invalide.');
            } else if (typeof detail === 'string') {
                // Handling manual HTTPException (like "Email already registered")
                setError(detail);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <Navbar />
            <div className="register-container">
                <div className="register-box">
                    <h1>Create Account</h1>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Full Name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                name="confirm_password"
                                placeholder="Confirm Password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? 'Registering...' : 'Sign Up'}
                        </button>
                    </form>
                    <div className="login-prompt">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
