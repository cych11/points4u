import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function UserProfilePage() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    // Profile Info State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Initial load
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${BACKEND_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(prev => ({ ...prev, ...updatedUser }));
                alert("Profile updated successfully!");
            } else {
                const err = await response.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            alert(`Network error: ${error.message}`);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        setPasswordLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${BACKEND_URL}/users/me/password`, {
                method: 'PATCH', // Assuming PATCH is used for password update based on verification
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (response.ok) {
                alert("Password changed successfully!");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const err = await response.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            alert(`Network error: ${error.message}`);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto space-y-12">
            <div>
                <button
                    onClick={() => navigate('/user')}
                    className="mb-4 text-gray-600 hover:text-gray-900 underline"
                >
                    &larr; Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold">My Profile</h1>
            </div>

            {/* Profile Info Section */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Personal Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                    {/* UtorID (Read Only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">UtorID</label>
                        <input
                            type="text"
                            value={user?.utorid || ''}
                            disabled
                            className="w-full bg-gray-100 border p-2 rounded-md text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">UtorID cannot be changed.</p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border p-2 rounded-md"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border p-2 rounded-md"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
                    >
                        {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full border p-2 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border p-2 rounded-md"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border p-2 rounded-md"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
                    >
                        {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
