import { useState } from "react";

export default function TransactionAmountFilter({ value, onChange, type }) {
    
    const handleOperatorChange = (e) => {
        onChange({
            ...value,
            filteredOperator: e.target.value
        });
    };
    
    const handleAmountChange = (e) => {
        const num = e.target.value === "" ? "" : Number(e.target.value);
        onChange({
            ...value,
            filteredAmount: num
        });
    };
    

    return (
        <div className="flex items-center gap-2 mt-2">
            <label htmlFor={type} className="text-sm font-medium">{type}</label>

            {/* Operator dropdown */}
            <select
                id={`${type}-filteredOperator`}
                value={value.filteredOperator}
                onChange={handleOperatorChange}
                className="border rounded-md p-1"
            >
                <option value="all">Any</option>
                <option value="gte">≥</option>
                <option value="lte">≤</option>
            </select>

            {/* Number input */}
            <input
                type="filteredAmount"
                value={value.filteredAmount}
                onChange={handleAmountChange}
                disabled={value.filteredOperator === "all"}
                className="border rounded-md p-1 w-20"
                placeholder="0"
            />
        </div>
    );
}
