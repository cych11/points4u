import { Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../contexts/PageContext";
import Pagination from "@mui/material/Pagination";
import EventFilter from "@/components/EventFilter.jsx";
import FilterCheckBox from "@/components/FilterCheckBox";
import TransactionTypeDropDown from "@/components/TransactionTypeDropDown.jsx";
import TransactionAmountFilter from "@/components/TransactionAmountFilter.jsx";
import Transaction from "@/components/Transaction.jsx";

export default function DisplayTransactionsPage() {
    const { setPage } = useContext(PageContext);

    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage, settransactionsPerPage] = useState(10);
    const [filteredNames, setFilteredNames] = useState([]);
    const [filteredCreator, setFilteredCreator] = useState([]);
    const [filteredPromotions, setFilteredPromotions] = useState([]);
    const [filteredType, setFilteredType] = useState("all");
    const [filteredRelatedId, setFilteredRelatedId] = useState([]);
    const [filterAmountOperator, setFilterAmountOperator] = useState({
        filteredAmount: "",
        filteredOperator: "all"
    });
    const [suspiciousOnly, setSuspiciousOnly] = useState(false);

    const [transactionData, setTransactionData] = useState([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPage("display-transactions");
    }, [setPage]);

    useEffect(() => {
        async function getTransactions() {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                const params = new URLSearchParams();
                if (filteredNames.length > 0) params.append('name', filteredNames.join(','));
                if (filteredCreator.length > 0) params.append('createdBy', filteredCreator.join(','));
                if (filteredPromotions.length > 0) params.append('promotionId', filteredPromotions.join(','));
                if (filteredType) {
                    if (filteredType !== "all") {
                        params.append('type', filteredType);
                    }
                }
                if (filteredRelatedId.length > 0) { params.append('relatedId', filteredRelatedId); }
                
                if (suspiciousOnly) params.append('suspicious', 'true');
                if (filterAmountOperator.filteredOperator !== "all") { 
                    if (filterAmountOperator.filteredAmount !== "") {
                        params.append('amount', filterAmountOperator.filteredAmount);
                    }
                    params.append('operator', filterAmountOperator.filteredOperator); 
                }
                params.append('page', currentPage);
                params.append('limit', transactionsPerPage);

                const response = await fetch(`/api/transactions?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.log('Failed to fetch transactions');
                    return;
                }

                const data = await response.json();
                setTransactionData(data.results);
                setTotalTransactions(data.count);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getTransactions();
    }, [currentPage, transactionsPerPage, filteredNames, filteredCreator, filteredPromotions, filteredType, filteredRelatedId, filterAmountOperator, suspiciousOnly]);

    return (
        <div className="flex ml-40 mt-5">
            <div className="w-[50%]">
                <h1 className="text-3xl font-bold">Transactions</h1>
                <div className="flex space-x-3 items-center mt-4">
                    <label htmlFor="transactions-per-page" className="text-sm font-medium">Transactions per page:</label>
                    <input
                        id="transactions-per-page"
                        type="number"
                        min={1}
                        step={1}
                        className="border rounded-md text-sm p-1 w-[50px]"
                        value={transactionsPerPage}
                        onChange={(e) => settransactionsPerPage(Number(e.target.value))}
                    />
                </div>

                {/* Users list */}
                <div className="space-y-4 max-h-[580px] min-h-[580px] overflow-y-auto mt-3">
                    {loading ? (
                        <div>Loading transactions...</div>
                    ) : transactionData.length === 0 ? (
                        <div className="text-center text-gray-500">No transactions found.</div>
                    ) : (
                        transactionData.map((transaction) => <Transaction key={transaction.id} transaction={transaction} />)
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-5">
                    <Pagination
                        count={Math.ceil(totalTransactions / transactionsPerPage)}
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
                    <EventFilter filter={filteredCreator} onChange={setFilteredCreator} type="Created By" />
                    <EventFilter filter={filteredPromotions} onChange={setFilteredPromotions} type="Promotions" />
                    <EventFilter filter={filteredRelatedId} onChange={setFilteredRelatedId} type="Related ID" />
                    <div className="flex flex-wrap space-x-10">
                        <TransactionTypeDropDown
                            filter={filteredType}
                            onChange={setFilteredType}
                            type="Type"
                        />
                        <FilterCheckBox filter={suspiciousOnly} onChange={setSuspiciousOnly} type="Suspicious" />
                    </div>
                    <TransactionAmountFilter
                        value={filterAmountOperator}
                        onChange={setFilterAmountOperator}
                        type="Amount"
                    />

                </div>
            </div>
            <main>
                <Outlet />
            </main>
        </div>

    );
}
