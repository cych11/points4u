import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import PromotionDetailsCard from "@/components/PromotionDetailsCard.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL;

function onlyChanged(original, updated) {
    const changed = {};

    for (const key in updated) {
        const orig = original[key];
        const curr = updated[key];

        // Normalize null vs '' and number vs string(num)
        const normalizedOrig = orig === null || orig === undefined ? null : String(orig);
        const normalizedCurr = curr === null || curr === undefined ? null : String(curr);

        if (normalizedOrig !== normalizedCurr) {
            changed[key] = updated[key];
        }
    }

    return changed;
}

export default function ManagePromotionPage() {
    const { setPage } = useContext(PageContext);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        setPage('display-promotions');
    }, [setPage]);

    // Form state
    const [original, setOriginal] = useState(null);
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [promoType, setPromoType] = useState("automatic");
    const [minSpending, setMinSpending] = useState(null);
    const [rate, setRate] = useState(null);
    const [points, setPoints] = useState(null);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Load existing promotion
    useEffect(() => {
        async function getPromotion() {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/api/promotions/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return;

            const data = await response.json();

            // Pre-fill fields
            setName(data.name || '');
            setDescription(data.description || '');
            setPromoType(data.type || 'automatic');
            setMinSpending(data.minSpending ?? null);
            setRate(data.rate ?? null);
            setPoints(data.points ?? null);
            setStartDate(dayjs(data.startTime));
            setEndDate(dayjs(data.endTime));

            setOriginal({
                name: data.name || "",
                description: data.description || "",
                type: data.type || "automatic",
                minSpending: data.minSpending ?? null,
                rate: data.rate ?? null,
                points: data.points ?? null,
                startTime: data.startTime,
                endTime: data.endTime,
            });
        }

        getPromotion();
    }, [id]);

    async function handleSubmit() {
        const token = localStorage.getItem('token');

        const updated = {
            name,
            description,
            type: promoType,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            minSpending: minSpending ? Number(minSpending) : null,
            rate: promoType === "automatic" ? (rate ? Number(rate) : null) : null,
            points: promoType === "onetime" ? (points ? Number(points) : null) : null
        };

        const patchBody = onlyChanged(original, updated);

        const response = await fetch(`${BACKEND_URL}/api/promotions/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(patchBody)
        });


        if (!response.ok) {
            try {
                const err = await response.json();
                setErrorMsg(err.message || "Failed to update promotion");
            } catch {
                setErrorMsg("Failed to update promotion");
            }
            setSuccessMsg('');
        } else {
            setSuccessMsg("Promotion updated successfully!");
            setErrorMsg('');
        }
    }

    return (
        <div className="flex flex-col justify-center items-center mt-20">
            <div className="w-[80%]">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-blue-600 underline hover:text-blue-800"
                >
                    ← Back
                </button>
                <PromotionDetailsCard
                    handleSubmit={handleSubmit}
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                    promoType={promoType}
                    setPromoType={setPromoType}
                    minSpending={minSpending}
                    setMinSpending={setMinSpending}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    points={points}
                    setPoints={setPoints}
                    rate={rate}
                    setRate={setRate}
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                    type="Modify"
                />
            </div>
        </div>
    );
}
