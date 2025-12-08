import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [utorid, setUtorid] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await fetch('/api/auth/resets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ utorid })
            });

            if (response.ok) {
                // The backend might return the token in the response for development purposes
                // or just say "email sent".
                const data = await response.json();

                // For development convenience, if token is in response, display it.
                if (data.resetToken) {
                    setMessage(`Success! (DEV MODE: Token is ${data.resetToken})`);
                } else {
                    setMessage("If an account exists with that UtorID, a password reset link has been sent (check server logs).");
                }
            } else {
                const err = await response.json();
                setError(err.message || "Failed to request reset.");
            }
        } catch (err) {
            setError("Network error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 mt-2">Enter your UtorID to receive a reset token.</p>
                </div>

                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md text-sm break-all">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UtorID</label>
                        <input
                            type="text"
                            value={utorid}
                            onChange={(e) => setUtorid(e.target.value)}
                            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. smithj"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Request Reset Link"}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <Link to="/" className="text-blue-600 hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}
