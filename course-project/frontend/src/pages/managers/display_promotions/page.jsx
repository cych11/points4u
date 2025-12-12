import { Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../contexts/PageContext";
import { useAuth } from "../../../contexts/AuthContext";
import Pagination from "@mui/material/Pagination";
import EventFilter from "@/components/EventFilter.jsx";
import FilterCheckBox from "@/components/FilterCheckBox";
import PromotionDropDown from "@/components/PromotionDropDown.jsx";
import Promotion from "@/components/Promotion.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function DisplayPromotionsPage() {
    const { setPage } = useContext(PageContext);
    const { user } = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const [promotionsPerPage, setPromotionsPerPage] = useState(10);

    const [filteredNames, setFilteredNames] = useState([]);
    const [filteredType, setFilteredType] = useState("all");
    const [filterStarted, setFilterStarted] = useState(false);
    const [filterEnded, setFilterEnded] = useState(false);

    const [promotionData, setPromotionData] = useState([]);
    const [totalPromotions, setTotalPromotions] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPage("display-promotions");
    }, [setPage]);

    useEffect(() => {
        async function getPromotions() {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams();

                filteredNames.forEach(name => {
                    if (name) params.append('name', name);
                });

                if (filteredType && filteredType !== 'all') {
                    params.append('type', filteredType);
                }

                if (filterStarted) params.append('started', 'true');
                if (filterEnded) params.append('ended', 'true');


                params.append('page', currentPage);
                params.append('limit', promotionsPerPage);

                const response = await fetch(`/api/promotions?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.error('Failed to fetch promotions');
                    return;
                }

                const data = await response.json();

                setPromotionData(data.results);
                setTotalPromotions(data.count);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        // cannot have both filters enabled
        if (filterStarted && filterEnded) {
            console.warn("Cannot filter by both started and ended. Ignoring filters.");
            return;
        }

        getPromotions();
    }, [currentPage, promotionsPerPage, filteredNames, filteredType, filterStarted, filterEnded]);


    return (
        <div className="flex ml-40 mt-5">
            <div className="w-[50%]">
                <div className="flex justify-between">
                    <h1 className="text-3xl font-bold">Promotions</h1>
                    {(user?.role === 'manager' || user?.role === 'superuser') && (
                        <a
                            className="flex flex-col border rounded-md p-2 transition-all duration-150 ease-in-out hover:scale-110 hover:bg-blue-100"
                            href="/managers/create-promotions"
                        >
                            <h1 className="font-semibold text-2xl">Create Promotion</h1>
                        </a>
                    )}
                </div>
                <div className="flex space-x-3 items-center mt-4">
                    <label htmlFor="promotions-per-page" className="text-sm font-medium">Promotions per page:</label>
                    <input
                        id="promotions-per-page"
                        type="number"
                        min={1}
                        step={1}
                        className="border rounded-md text-sm p-1 w-[50px]"
                        value={promotionsPerPage}
                        onChange={(e) => setPromotionsPerPage(Number(e.target.value))}
                    />
                </div>

                {/* Promotions list */}
                <div className="space-y-4 max-h-[580px] min-h-[580px] overflow-y-auto mt-3">
                    {loading ? (
                        <div>Loading promotions...</div>
                    ) : promotionData.length === 0 ? (
                        <div className="text-center text-gray-500">No promotions found.</div>
                    ) : (
                        promotionData.map((promotion) => <Promotion key={promotion.id} promotion={promotion} />)
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-5">
                    <Pagination
                        count={Math.ceil(totalPromotions / promotionsPerPage)}
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
                    <div className="flex flex-wrap space-x-6">
                        <PromotionDropDown
                            filter={filteredType}
                            onChange={setFilteredType}
                            type="Type"
                        />
                        <FilterCheckBox filter={filterStarted} onChange={setFilterStarted} type="Already Started" />
                        <FilterCheckBox filter={filterEnded} onChange={setFilterEnded} type="Already Ended" />
                    </div>

                </div>
            </div>
            <main>
                <Outlet />
            </main>
        </div>

    );
}
