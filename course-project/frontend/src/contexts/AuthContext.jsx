import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const BACKEND_URL = import.meta.env.VITE_API_URL;


export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/users/me`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    localStorage.removeItem("token");
                    setUser(null);
                    return;
                }

                const data = await res.json();
                setUser(data);
            } catch {
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        // TODO: complete me

        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} utorid - The UTORid of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (utorid, password) => {
        try {
            // try to login with user credentials
            const res = await fetch(`${BACKEND_URL}/auth/tokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ utorid, password }),
            });

            // login failed 
            if (!res.ok) {
                const err = await res.json();
                return err.message || "Login failed.";
            }
            const { token } = await res.json();
            localStorage.setItem("token", token);

            // success, fetch user info after login
            const userRes = await fetch(`${BACKEND_URL}/users/me`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!userRes.ok) {
                localStorage.removeItem("token");
                const err = await userRes.json();
                return err.message || "Failed to fetch user data.";
            }

            const userData = await userRes.json();
            setUser(userData); // update user context (response is user object directly)

            if (userData.role === 'cashier') {
                navigate("/cashier");
            } else if (userData.role === 'manager' || userData.role === 'superuser') {
                navigate("/managers");
            } else {
                navigate("/user");
            }
        } catch (error) {
            setUser(null);
            return error.message || "An error occurred during login.";
        }
        return "";
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @param {string} userData.utorid - The UTORid (7-8 alphanumeric characters).
     * @param {string} userData.name - The full name of the user.
     * @param {string} userData.email - The University of Toronto email.
     * @param {string} userData.password - The password.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async ({ utorid, name, email, password }) => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ utorid, name, email, password }),
            });

            // registration failed
            if (!res.ok) {
                const err = await res.json();
                return err.message || "Registration failed.";
            }

            navigate("/");
        } catch (error) {
            return error.message || "An error occurred during registration.";
        }
        return "";
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
