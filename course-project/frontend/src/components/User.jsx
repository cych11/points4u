import { useNavigate } from "react-router-dom";

function sliceDate(date) {
    if (!date) { return "Never"; }
    return date.slice(0, 10);
}

export default function User({ user }) {
    const navigate = useNavigate();
    return (
        <div className="flex border p-3 rounded-md justify-between">
            <div>
                <h3 className="font-bold">{user.name} ({user.utorid})</h3>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>Points: {user.points}</p>
                <p>Verified: {user.verified ? "Yes" : "No"}</p>
                <p>Last Login: {sliceDate(user.lastLogin)}</p>
            </div>
            <div className="flex text-xl font-semibold p-4 mr-10 items-center justify-center" onClick={() => navigate(`/managers/display-user/${user.id}`)}>
                <a className="p-2 rounded-md hover:bg-neutral-300 cursor-pointer">Edit Profile</a>
            </div>
        </div>
    );
}
