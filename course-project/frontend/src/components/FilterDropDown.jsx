export default function FilterDropDown({ filter, onChange, type }) {
    return (
        <div className='flex items-center gap-2 mt-2'>
            <label htmlFor={type} className='text-sm font-medium'>{type}</label>

            <select
                id={type}
                value={filter}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded-md p-1"
            >
                <option value="all">All Roles</option>
                <option value="regular">Regular</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="superuser">Superuser</option>
            </select>
        </div>
    );
}
