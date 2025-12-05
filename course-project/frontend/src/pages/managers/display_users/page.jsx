import { Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../contexts/PageContext";
import Pagination from "@mui/material/Pagination";
import EventFilter from "@/components/EventFilter.jsx";
import FilterCheckBox from "@/components/FilterCheckBox";
import FilterDropDown from "@/components/FilterDropDown";
import User from "@/components/User.jsx";

export default function DisplayUsersPage() {
    const { setPage } = useContext(PageContext);

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [filteredNames, setFilteredNames] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState("all");
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [activatedOnly, setActivatedOnly] = useState(false);

    const [usersData, setUsersData] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPage("display-users");
    }, [setPage]);

    useEffect(() => {
        async function getUsers() {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                const params = new URLSearchParams();
                if (filteredNames.length > 0) params.append('name', filteredNames.join(','));
                if (filteredRoles) {
                    if (filteredRoles !== "all") {
                        params.append('role', filteredRoles);
                    }
                }
                if (verifiedOnly) params.append('verified', 'true');
                if (activatedOnly) params.append('activated', 'true');
                params.append('page', currentPage);
                params.append('limit', usersPerPage);

                const response = await fetch(`/api/users?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.log('Failed to fetch users');
                    return;
                }

                const data = await response.json();
                setUsersData(data.results);
                setTotalUsers(data.count);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getUsers();
    }, [currentPage, usersPerPage, filteredNames, filteredRoles, verifiedOnly, activatedOnly]);

    return (
        <div className="flex ml-40 mt-5">
            {/* Users list */}
            <div className="w-[50%]">
                <h1 className="text-3xl font-bold">Users</h1>

                {/* Users per page */}
                <div className="flex space-x-3 items-center mt-4">
                    <label htmlFor="users-per-page" className="text-sm font-medium">Users per page:</label>
                    <input
                        id="users-per-page"
                        type="number"
                        min={1}
                        step={1}
                        className="border rounded-md text-sm p-1 w-[50px]"
                        value={usersPerPage}
                        onChange={(e) => setUsersPerPage(Number(e.target.value))}
                    />
                </div>

                {/* Users list */}
                <div className="space-y-4 max-h-[580px] min-h-[580px] overflow-y-auto mt-3">
                    {loading ? (
                        <div>Loading users...</div>
                    ) : usersData.length === 0 ? (
                        <div className="text-center text-gray-500">No users found.</div>
                    ) : (
                        usersData.map((user) => <User key={user.id} user={user} />)
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-5">
                    <Pagination
                        count={Math.ceil(totalUsers / usersPerPage)}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="ml-16 mt-[90px] w-[35%]">
                <h2 className="text-xl font-semibold">Filters</h2>

                <div className="mt-10 space-y-4">
                    <EventFilter filter={filteredNames} onChange={setFilteredNames} type="Name" />
                    <div className="flex flex-wrap space-x-10">
                        <FilterDropDown
                            filter={filteredRoles}
                            onChange={setFilteredRoles}
                            type="Role"
                        />
                        <FilterCheckBox filter={verifiedOnly} onChange={setVerifiedOnly} type="Verified" />
                        <FilterCheckBox filter={activatedOnly} onChange={setActivatedOnly} type="Activated" />
                    </div>
                </div>
            </div>
            <main>
                <Outlet />
            </main>
        </div>

    );
}
