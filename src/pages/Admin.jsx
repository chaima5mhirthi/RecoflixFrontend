import { useState } from 'react';
import Navbar from '../components/Navbar';
import AdminDashboard from './AdminDashboard';
import UsersAdmin from './UsersAdmin';
import './admin.css';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="admin-page">
            <Navbar />

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>

                <button
                    className={activeTab === 'users' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('users')}
                >
                    User Management
                </button>
            </div>

            {/* Content */}
            <div className="admin-content">
                {activeTab === 'dashboard' && <AdminDashboard />}
                {activeTab === 'users' && <UsersAdmin />}
            </div>
        </div>
    );
}
