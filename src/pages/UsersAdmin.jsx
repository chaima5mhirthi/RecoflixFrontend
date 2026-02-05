import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trash2, ShieldAlert, ShieldCheck, Edit3, X, Check, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import Navbar from '../components/Navbar';
import './UsersAdmin.css';

export default function UsersAdmin() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', email: '', full_name: '' });
    const [actionLoading, setActionLoading] = useState(null); // id of user being processed

    useEffect(() => {
        if (!authLoading && (!user || !user.is_admin)) {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [user, authLoading, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please ensure you have admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (userId) => {
        setActionLoading(userId);
        try {
            await adminService.promoteUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: true } : u));
        } catch (err) {
            alert('Failed to promote user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDemote = async (userId) => {
        // Prevent demoting self
        if (userId === user.id) {
            alert('You cannot demote yourself!');
            return;
        }
        setActionLoading(userId);
        try {
            await adminService.demoteUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: false } : u));
        } catch (err) {
            alert('Failed to demote user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId) => {
        if (userId === user.id) {
            alert('You cannot delete yourself!');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setActionLoading(userId);
        try {
            await adminService.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const startEditing = (u) => {
        setEditingUser(u.id);
        setEditForm({
            username: u.username || '',
            email: u.email || '',
            full_name: u.full_name || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(editingUser);
        try {
            const updated = await adminService.updateUser(editingUser, editForm);
            setUsers(prev => prev.map(u => u.id === editingUser ? { ...u, ...updated } : u));
            setEditingUser(null);
        } catch (err) {
            alert('Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="admin-page"><Navbar /><div className="loading-screen">ACCESSING CENTRAL DATABASE...</div></div>
    );

    return (
            <div className="admin-content">
                <header className="admin-header">
                    <div className="title-area">
                        <h1><Users size={32} /> Users Management</h1>
                        <p>Manage users, permissions and system access</p>
                    </div>
                  
                </header>

                <div className="controls">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by username, email or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="refresh-btn" onClick={fetchUsers}>Refresh Data</button>
                </div>

                {error && <div className="admin-error">{error}</div>}

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th className="actions-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id} className={u.id === user.id ? 'current-user-row' : ''}>
                                    <td>#{u.id}</td>
                                    <td>
                                        {editingUser === u.id ? (
                                            <input
                                                className="edit-input"
                                                value={editForm.full_name}
                                                onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                            />
                                        ) : (
                                            u.full_name || '-'
                                        )}
                                    </td>
                                    <td>
                                        {editingUser === u.id ? (
                                            <input
                                                className="edit-input"
                                                value={editForm.username}
                                                onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                            />
                                        ) : (
                                            u.username
                                        )}
                                    </td>
                                    <td>
                                        {editingUser === u.id ? (
                                            <input
                                                className="edit-input"
                                                value={editForm.email}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        ) : (
                                            u.email
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${u.is_admin ? 'admin' : 'member'}`}>
                                            {u.is_admin ? 'ADMIN' : 'MEMBER'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {editingUser === u.id ? (
                                            <div className="action-btns">
                                                <button className="confirm-btn" onClick={handleUpdate} disabled={actionLoading === u.id}>
                                                    <Check size={18} />
                                                </button>
                                                <button className="cancel-btn" onClick={() => setEditingUser(null)}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="action-btns">
                                                <button className="edit-btn" title="Edit" onClick={() => startEditing(u)}>
                                                    <Edit3 size={18} />
                                                </button>
                                                {u.is_admin ? (
                                                    <button className="demote-btn" title="Demote" onClick={() => handleDemote(u.id)} disabled={actionLoading === u.id || u.id === user.id}>
                                                        <ShieldAlert size={18} />
                                                    </button>
                                                ) : (
                                                    <button className="promote-btn" title="Promote" onClick={() => handlePromote(u.id)} disabled={actionLoading === u.id}>
                                                        <ShieldCheck size={18} />
                                                    </button>
                                                )}
                                                <button className="delete-btn" title="Delete" onClick={() => handleDelete(u.id)} disabled={actionLoading === u.id || u.id === user.id}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && !loading && (
                        <div className="empty-state">No users found matching your search.</div>
                    )}
                </div>
            </div>
    );
}