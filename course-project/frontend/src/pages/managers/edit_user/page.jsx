import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext.jsx";

function CheckVerified({ boolean, trueMessage, falseMessage }) {
    return boolean ? (
        <h3 className="inline-block bg-green-200 rounded-lg p-2">{trueMessage}</h3>
    ) : (
        <h3 className="inline-block bg-red-200 rounded-lg p-2">{falseMessage}</h3>
    );
}

export default function EditUserPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const { setPage } = useContext(PageContext);

    useEffect(() => {
        setPage('edit-user');
    }, [setPage]);

    const [name, setName] = useState('');
    const [utorid, setUtorid] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState();
    const [verified, setVerified] = useState(false);
    const [suspicious, setSuspicious] = useState(false);
    const [points, setPoints] = useState(0);

    async function getUserDetails() {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setName(data.name || '');
            setUtorid(data.utorid || '');
            setRole(data.role || '');
            setEmail(data.email || '');
            setBirthday(data.birthday || '');
            setVerified(data.verified || false);
            setSuspicious(data.suspicious || false);
            setPoints(data.points || 0);
        }
    }

    useEffect(() => {
        getUserDetails();
    }, [id]);

    async function toggleSuspicious() {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    suspicious: !suspicious,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Failed to update suspicious:", errorData);
                return;
            }

            setSuspicious(prev => !prev);

        } catch (err) {
            console.error("Error updating suspicious:", err);
        }
    }

    async function toggleVerified() {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    verified: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Failed to update verified:", errorData);
                return;
            }

            setVerified(true);

        } catch (err) {
            console.error("Error updating verified:", err);
        }
    }

    async function changeRole(newRole) {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    role: newRole,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Failed to update role:", errorData);
                alert(`Failed to update role: ${errorData.message}`);
                return;
            }

            setRole(newRole);

        } catch (err) {
            console.error("Error updating role:", err);
        }
    }

    async function updateEmail(newEmail) {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: newEmail,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Failed to update email:", errorData);
                alert("Ensure email is a valid University of Toronto email.");
                return;
            }

            setEmail(newEmail);

        } catch (err) {
            console.error("Error updating email:", err);
        }
    }

    async function handleSubmit() {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                email: email ? email : null,
                role: role ? role : null,
                suspicious: suspicious ? suspicious : null,
                verified: verified ? verified : null,
            })
        })
        if (!response.ok) {
            console.log('Failed to modify user info');
        } else {
            console.log('User info modified successfully');
        }
    }

    return (
        <div className="flex justify-center pt-10">

            <div className="flex flex-col items-start mr-20">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-blue-600 underline hover:text-blue-800"
                >
                    ← Back
                </button>

                <div className="p-4 border rounded shadow-lg w-80">
                    <h1 className="text-3xl font-bold mb-5">{name} ({utorid})</h1>

                    <hr />

                    <h3 className="font-semibold mt-3">Email</h3>
                    <p>{email}</p>

                    <h3 className="font-semibold mt-3">Birthday</h3>
                    <p>{birthday}</p>

                    <h3 className="font-semibold mt-3">Role</h3>
                    <p>{role}</p>

                    <h3 className="font-semibold mt-3">Points</h3>
                    <p>{points}</p>
                    <p>{suspicious}</p>

                    <div className="mt-3">
                        <CheckVerified
                            boolean={verified}
                            trueMessage="Verified"
                            falseMessage="Unverified"
                        />
                    </div>

                    <div className="mt-3">
                        <CheckVerified
                            boolean={!suspicious}
                            trueMessage="No Suspicion"
                            falseMessage="Suspicious"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col p-4 border rounded w-1/2 gap-4 items-stretch shadow-lg">
                <div className="flex border p-3 rounded-md items-center justify-between">
                    <div>
                        <h3 className="font-bold">Email Address</h3>
                        <p>Change email address if it was incorrect during registration</p>
                    </div>
                    <div
                        className="flex text-xl font-semibold p-4 items-center justify-center cursor-pointer"
                        onClick={() => {
                            const newEmail = window.prompt("Enter the new email:");

                            if (!newEmail) return;

                            const valid = /\S+@\S+\.\S+/.test(newEmail);

                            if (!valid) {
                                alert("Please enter a valid email address.");
                                return;
                            }
                            updateEmail(newEmail);
                        }}
                    >
                        <span className="p-2 rounded-md bg-neutral-300">Change Email</span>
                    </div>
                </div>

                <div className="flex border p-3 rounded-md items-center justify-between">
                    <div>
                        <h3 className="font-bold">Verification</h3>
                        <p>Verified users can transfer and redeem points</p>
                    </div>
                    <div
                        className={`flex text-xl font-semibold p-1 rounded-md items-center justify-center 
                ${verified ? 'cursor-not-allowed bg-green-200' : 'cursor-pointer bg-neutral-300'}`}
                        onClick={() => {
                            if (!verified) toggleVerified();
                        }}
                    >
                        <span className="p-2 rounded-md">
                            {verified ? "Already Verified" : "Verify User"}
                        </span>
                    </div>

                </div>

                <div className="flex border p-3 rounded-md items-center justify-between">
                    <div>
                        <h3 className="font-bold">Suspicion</h3>
                        <p>Flag suspicious users to delay points</p>
                    </div>

                    <div
                        className="flex text-xl font-semibold p-4 items-center justify-center cursor-pointer"
                        onClick={toggleSuspicious}
                    >
                        <span className="p-2 rounded-md bg-neutral-300">
                            {suspicious ? "Clear Suspicion" : "Mark as Suspicious"}
                        </span>
                    </div>
                </div>


                <div className="flex border p-3 rounded-md items-center justify-between">
                    <div>
                        <h3 className="font-bold">Change Role</h3>
                        <p>Assign a new role to this user</p>
                    </div>
                    <div>
                        <select
                            value={role}
                            onChange={(e) => changeRole(e.target.value)}
                            // Disable rule:
                            // 1. If target is Superuser, ONLY Superuser can edit (and even then, usually self-demotion is risky, but allowed here).
                            // 2. If target is Manager, ONLY Superuser can edit.
                            // 3. If I am Manager, I can ONLY edit Casher/Regular.
                            disabled={
                                (role === 'superuser' && currentUser?.role !== 'superuser') ||
                                (role === 'manager' && currentUser?.role !== 'superuser')
                            }
                            className="bg-neutral-300 p-2 rounded-md font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="regular">Regular</option>
                            <option value="cashier">Cashier</option>
                            {/* Only Superusers can promote people to Manager/Superuser, or demote Managers/Superusers */}
                            {currentUser?.role === 'superuser' && (
                                <>
                                    <option value="manager">Manager</option>
                                    <option value="superuser">Superuser</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </div>

        </div>
    );

}
