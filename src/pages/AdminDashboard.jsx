import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services/api';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Users, Film, Star, TrendingUp, Activity } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [kpi, setKpi] = useState({ users: 0, movies: 0, ratings: 0 });
    const [ratingsOverTime, setRatingsOverTime] = useState([]);
    const [genreStats, setGenreStats] = useState([]);
    const [topMovies, setTopMovies] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [userGrowth, setUserGrowth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    kpiData,
                    ratingsTimeData,
                    genreData,
                    topMoviesData,
                    activityData,
                    userGrowthData
                ] = await Promise.all([
                    adminService.getKPI(),
                    adminService.getRatingsOverTime(),
                    adminService.getRatingsByGenre(),
                    adminService.getTopMovies(),
                    adminService.getRecentActivity(),
                    adminService.getUserGrowth()
                ]);

                setKpi(kpiData);
                setRatingsOverTime(ratingsTimeData);
                setGenreStats(genreData);
                setTopMovies(topMoviesData);
                setRecentActivity(activityData);
                setUserGrowth(userGrowthData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

    if (loading) {
        return (
            <div className="admin-dashboard-page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Overview of platform performance</p>
                </div>

                {/* KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon users-bg">
                            <Users size={24} color="#fff" />
                        </div>
                        <div className="kpi-info">
                            <h3>Total Users</h3>
                            <p>{kpi.users}</p>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon movies-bg">
                            <Film size={24} color="#fff" />
                        </div>
                        <div className="kpi-info">
                            <h3>Total Movies</h3>
                            <p>{kpi.movies}</p>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon ratings-bg">
                            <Star size={24} color="#fff" />
                        </div>
                        <div className="kpi-info">
                            <h3>Total Ratings</h3>
                            <p>{kpi.ratings}</p>
                        </div>
                    </div>

                </div>

                {/* Charts Section 1 */}
                <div className="charts-grid">
                    <div className="chart-card large">
                        <h3>Ratings Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={ratingsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: 'none' }} />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#e50914" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Ratings by Genre</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={genreStats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="genre"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {genreStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lower Section: User Growth & Top Movies */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>User Growth</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: 'none' }} />
                                <Bar dataKey="new_users" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card list-card">
                        <h3>Top Rated Movies</h3>
                        <div className="top-list">
                            {topMovies.map((movie, index) => (
                                <div key={index} className="top-item">
                                    <span className="rank">#{index + 1}</span>
                                    <span className="title">{movie.title}</span>
                                    <span className="rating-badge">⭐ {movie.avg_rating}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="activity-section">
                    <h3>Recent User Activity</h3>
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Movie</th>
                                    <th>Rating</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-small">{item.user_name.charAt(0).toUpperCase()}</div>
                                                {item.user_name}
                                            </div>
                                        </td>
                                        <td><span className="badge badge-rating">Rated</span></td>
                                        <td>{item.movie_title}</td>
                                        <td>{item.rating} ⭐</td>
                                        <td className="text-muted">{new Date(item.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
