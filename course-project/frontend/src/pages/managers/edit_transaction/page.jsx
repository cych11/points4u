import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

function CheckVerified({ boolean, trueMessage, falseMessage }) {
    return boolean ? (
        <h3 className="inline-block bg-green-200 rounded-lg p-2">{trueMessage}</h3>
    ) : (
        <h3 className="inline-block bg-red-200 rounded-lg p-2">{falseMessage}</h3>
    );
}

export default function EditTransactionPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { setPage } = useContext(PageContext);

    useEffect(() => {
        setPage('edit-transaction');
    }, [setPage]);

    const [utorid, setUtorid] = useState('');
    const [type, setType] = useState('');
    const [spent, setSpent] = useState('');
    const [amount, setAmount] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [remark, setRemark] = useState('');
    const [relatedId, setRelatedId] = useState('');
    const [suspicious, setSuspicious] = useState(false);
    const [promotionIds, setPromotionIds] = useState([]);

    async function getTransactionDetails() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_URL}/api/transactions/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setUtorid(data.utorid || '');
            setType(data.type || '');
            setSpent(data.spent || '');
            setAmount(data.amount || '');
            setCreatedBy(data.createdBy || '');
            setRemark(data.remark || '');
            setRelatedId(data.relatedId || '');
            setSuspicious(data.suspicious || false);
            setPromotionIds(data.promotionIds || []);
        }
    }

    useEffect(() => {
        getTransactionDetails();
    }, [id]);

    async function toggleSuspicious() {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${BACKEND_URL}/api/transactions/${id}/suspicious`, {
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

    const [editing, setEditing] = useState(false);
    const [newAmount, setNewAmount] = useState("");
    const [newRemark, setNewRemark] = useState("");

    async function handleConfirm() {
        if (newAmount === "") return;
        const num = Number(newAmount);
        if (isNaN(num)) {
            alert("Please enter a valid number");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${BACKEND_URL}/api/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    utorid: utorid,
                    type: "adjustment",
                    amount: newAmount,
                    remark: newRemark,
                    relatedId: id,
                    promotionIds: promotionIds
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Failed to create adjustment transaction:", errorData);
                return;
            }
        } catch (err) {
            console.error("Error creating adjustment transaction:", err);
        }
        setEditing(false);
        setNewAmount("");
    };

    const handleCancel = () => {
        setEditing(false);
        setNewAmount("");
    };

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
                    <h1 className="text-3xl font-bold mb-5">Transaction #{id}</h1>

                    <hr />

                    <h3 className="font-semibold mt-3">Owner</h3>
                    <p>{utorid}</p>

                    <h3 className="font-semibold mt-3">Type</h3>
                    <p>{type}</p>

                    <h3 className="font-semibold mt-3">Spent</h3>
                    <p>{spent}</p>

                    <h3 className="font-semibold mt-3">Amount</h3>
                    <p>{amount}</p>

                    <h3 className="font-semibold mt-3">Created By</h3>
                    <p>{createdBy}</p>

                    <h3 className="font-semibold mt-3">Remark</h3>
                    <p>{remark}</p>

                    {type !== "purchase" ? <h3 className="font-semibold mt-3">Related ID</h3> : null}
                    {type !== "purchase" ? <p>{relatedId}</p> : null}

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
                        <h3 className="font-bold">Suspicion</h3>
                        <p>Flag suspicious transactions to delay points</p>
                    </div>

                    <div
                        className="flex text-xl font-semibold p-4 items-center justify-center cursor-pointer"
                        onClick={toggleSuspicious}
                    >
                        <span className="p-2 rounded-md bg-neutral-300 hover:bg-neutral-400">
                            {suspicious ? "Clear Suspicion" : "Mark as Suspicious"}
                        </span>
                    </div>
                </div>

                <div className="flex border p-3 rounded-md items-center justify-between">
                    <div>
                        <h3 className="font-bold">Create Adjustment Transaction</h3>
                        <p>Change the amount of points given in this transaction</p>
                    </div>
                    <div
                        className="flex text-xl font-semibold p-4 items-center justify-center cursor-pointer"
                        onClick={() => setEditing(true)}
                    >
                        <span className="p-2 rounded-md bg-neutral-300 hover:bg-neutral-400">Adjust</span>
                    </div>
                </div>

                {/* If editing, show input + buttons */}
                {editing ? (
                    <div className="gap-2 items-center">
                        <div>
                            <h1 className="text-xl font-semibold">Adjustment Amount</h1>
                            <input
                                type="number"
                                className="border rounded-md p-1 flex-1 w-full"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="e.g. 100, -100"
                                required
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold mt-4">Remark</h1>
                            <input
                                type="textarea"
                                className="border rounded-md p-1 flex-1 w-full"
                                value={newRemark}
                                onChange={(e) => setNewRemark(e.target.value)}
                                placeholder="Enter a reason for the change"
                            />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button
                                className="bg-green-500 text-white px-3 py-1 rounded-md w-1/2 hover:bg-green-600"
                                onClick={handleConfirm}
                            >
                                Confirm
                            </button>
                            <button
                                className="bg-red-500 text-white px-3 py-1 rounded-md w-1/2 hover:bg-red-600"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );

}
