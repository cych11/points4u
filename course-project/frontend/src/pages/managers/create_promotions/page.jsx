import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import dayjs from 'dayjs';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import PromotionDetailsCard from "@/components/PromotionDetailsCard.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function CreatePromotionsPage() {
    const navigate = useNavigate();
    const { setPage } = useContext(PageContext);

    useEffect(() => {
        setPage('create-promotions');
    }, [setPage]);

    const [startDate, setStartDate] = useState(dayjs().add(1, 'hour'));
    const [endDate, setEndDate] = useState(dayjs().add(2, 'hours'));
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [promoType, setPromoType] = useState("automatic");
    const [minSpending, setMinSpending] = useState(null);
    const [rate, setRate] = useState(null);
    const [points, setPoints] = useState(null);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('')

    async function handleSubmit() {
        console.log('Submitting');

        // Client-side validation
        if (!name.trim()) {
            setErrorMsg('Name is required');
            return;
        }
        if (!description.trim()) {
            setErrorMsg('Description is required');
            return;
        }
        if (!minSpending.trim()) {
            setErrorMsg('minSpending is required');
            return;
        }

        // Validate dates
        if (!startDate || !startDate.isValid()) {
            setErrorMsg('Invalid start time');
            return;
        }
        if (!endDate || !endDate.isValid()) {
            setErrorMsg('Invalid end time');
            return;
        }
        if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
            setErrorMsg('End time must be after start time');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMsg('You must be logged in to create promotions');
            return;
        }

        const response = await fetch(`${BACKEND_URL}/api/promotions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name.trim(),
                description: description.trim(),
                type: promoType,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                minSpending: minSpending ? Number(minSpending) : undefined,
                rate: promoType === "automatic" && rate !== null && rate !== '' ? Number(rate) : undefined,
                points: promoType === "onetime" && points !== null && points !== '' ? Number(points) : undefined
            })
        })
        if (!response.ok) {
            console.log('Failed to create promotion');
            try {
                const errorData = await response.json();
                setErrorMsg(errorData.message || response.statusText || 'Failed to create promotion');
            } catch {
                setErrorMsg(response.statusText || 'Failed to create promotion');
            }
            setSuccessMsg('');
        } else {
            console.log('Promotion created successfully');
            setSuccessMsg('Promotion created successfully!');
            setErrorMsg('');
            // Reset form
            setName('');
            setDescription('');
            setMinSpending(null);
            setRate(null);
            setPoints(null);
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
                    type='Create'
                />
            </div>
        </div>
    );
}