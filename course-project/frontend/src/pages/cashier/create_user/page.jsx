import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function CreateUserPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // If manager/superuser, go back to User List. If cashier, go back to Cashier Dashboard.
    const backPath = (user?.role === 'manager' || user?.role === 'superuser')
        ? '/managers/display-users'
        : '/cashier';
    const [utorid, setUtorid] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [createdUser, setCreatedUser] = useState(null); // To store success response

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Creating user:", { utorid, name, email });

        const token = localStorage.getItem("token");

        // Basic validation in frontend, backend has stricter regex
        if (!email.toLowerCase().endsWith("@mail.utoronto.ca") && !email.toLowerCase().endsWith("@utoronto.ca")) {
            alert("Warning: Email should typically be a UofT email.");
            // Proceeding anyway as backend validates strictly
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ utorid, name, email })
            });

            if (response.ok) {
                const data = await response.json();
                setCreatedUser(data); // Save data to display on screen
                // Clear form
                setUtorid('');
                setName('');
                setEmail('');
            } else {
                const err = await response.json();
                alert("Error: " + err.message);
            }
        } catch (error) {
            alert("Network error: " + error.message);
        }
    };

    return (
        <div className="p-10 max-w-lg mx-auto">
            <button
                onClick={() => navigate(backPath)}
                className="mb-4 text-gray-600 hover:text-gray-900 underline"
            >
                &larr; Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-6">Create New User</h1>

            {/* Success Message & Token Display */}
            {createdUser && (
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h2 className="text-xl font-bold text-green-800 mb-2">User Created Successfully!</h2>
                    <p className="mb-4 text-green-700">Please provide the new user with this activation code:</p>

                    <div className="bg-white p-4 rounded border text-center">
                        <span className="block text-sm text-gray-500 uppercase tracking-wide">Activation Code</span>
                        <span className="block text-2xl font-mono font-bold tracking-widest text-black select-all">
                            {createdUser.resetToken}
                        </span>
                    </div>

                    <div className="mt-4 text-sm text-green-700">
                        <p><strong>UtorID:</strong> {createdUser.utorid}</p>
                        <p><strong>Email:</strong> {createdUser.email}</p>
                    </div>

                    <button
                        onClick={() => setCreatedUser(null)}
                        className="mt-4 text-green-800 underline hover:text-green-900"
                    >
                        Create Another User
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">

                {/* UtorID Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UtorID <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={utorid}
                        onChange={(e) => setUtorid(e.target.value)}
                        className="w-full border p-2 rounded-md"
                        placeholder="e.g. smithj"
                        required
                    />
                </div>

                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border p-2 rounded-md"
                        placeholder="e.g. John Smith"
                        required
                    />
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UofT Email <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-2 rounded-md"
                        placeholder="e.g. john.smith@mail.utoronto.ca"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition duration-200"
                >
                    Create User
                </button>

            </form>
        </div>
    );
}
