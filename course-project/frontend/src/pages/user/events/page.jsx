import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserEventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem("token");

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEvents(data.events || []); // Adjust based on actual API response structure (might return array directly or object with list)
            } else {
                setError("Failed to load events.");
            }
        } catch (err) {
            setError("Network error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRSVP = async (eventId) => {
        try {
            const response = await fetch(`/api/events/${eventId}/rsvps`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("RSVP Successful! See you there.");
                // Optimistically update UI or re-fetch? Let's just alert for now.
                fetchEvents(); // simple re-fetch to update status if backend returns it
            } else {
                const err = await response.json();
                alert("Error: " + (err.message || "Could not RSVP"));
            }
        } catch (err) {
            alert("Network error: " + err.message);
        }
    };

    return (
        <div className="p-10 max-w-5xl mx-auto">
            <button
                onClick={() => navigate('/user')}
                className="mb-4 text-gray-600 hover:text-gray-900 underline"
            >
                &larr; Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

            {loading && <p>Loading events...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && events.length === 0 && (
                <p className="text-gray-500 italic">No upcoming events found.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col">
                        <div className="p-6 flex-1">
                            <h2 className="text-xl font-bold mb-2 text-gray-900">{event.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">{new Date(event.date).toLocaleString()}</p>

                            <div className="space-y-2 text-sm text-gray-700">
                                <p><strong>Location:</strong> {event.location || "TBD"}</p>
                                <p><strong>Capacity:</strong> {event.capacity}</p>
                                {event.description && <p className="text-gray-600 italic mt-2 line-clamp-3">{event.description}</p>}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 border-t text-center">
                            {/* Logic to disable if full or already RSVPd would go here if backend sends that data */}
                            <button
                                onClick={() => handleRSVP(event.id)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
                            >
                                RSVP Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
