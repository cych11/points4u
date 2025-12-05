import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import React, { useState } from "react";
import { UserPlus } from 'lucide-react';

function Register() {
    const [utorid, setUtorid] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handle_submit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Password validation (must match backend requirements)
        if (password.length < 8 || password.length > 20) {
            setError("Password must be between 8 and 20 characters.");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError("Password must contain at least one lowercase letter.");
            return;
        }

        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one number.");
            return;
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            setError("Password must contain at least one special character.");
            return;
        }

        // UTORid validation
        if (!/^[a-zA-Z0-9]{7,8}$/.test(utorid.trim())) {
            setError("UTORid must be 7-8 alphanumeric characters.");
            return;
        }

        // Email validation
        if (!/^[a-zA-Z0-9._%+-]+@(?:mail\.)?utoronto\.ca$/i.test(email.trim())) {
            setError("Email must be a valid University of Toronto email (@utoronto.ca or @mail.utoronto.ca).");
            return;
        }

        setIsLoading(true);
        
        try {
            const errorMessage = await register({ utorid, name, email, password });
            if (errorMessage) {
                setError(errorMessage);
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <UserPlus className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
                        <p className="text-muted-foreground">Sign up to get started</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handle_submit} className="space-y-4">
                        {/* UTORid Input */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="utorid" 
                                className="text-sm font-medium text-foreground"
                            >
                                UTORid
                            </label>
                            <input
                                type="text"
                                id="utorid"
                                name="utorid"
                                placeholder="Enter your UTORid (7-8 characters)"
                                value={utorid}
                                onChange={(e) => setUtorid(e.target.value)}
                                disabled={isLoading}
                                required
                                maxLength={8}
                                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <p className="text-xs text-muted-foreground">7-8 alphanumeric characters</p>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="name" 
                                className="text-sm font-medium text-foreground"
                            >
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                                maxLength={50}
                                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="email" 
                                className="text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="your.name@utoronto.ca"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <p className="text-xs text-muted-foreground">Must be a @utoronto.ca or @mail.utoronto.ca email</p>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="password" 
                                className="text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                minLength={8}
                                maxLength={20}
                                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <p className="text-xs text-muted-foreground">8-20 characters, must include uppercase, lowercase, number, and special character</p>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-2">
                            <label 
                                htmlFor="confirmPassword" 
                                className="text-sm font-medium text-foreground"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link 
                                to="/" 
                                className="font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;

