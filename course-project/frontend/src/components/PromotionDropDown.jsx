export default function PromotionDropDown({ filter, onChange, type }) {
    return (
        <div className='flex items-center gap-2 mt-2'>
            <label htmlFor={type} className='text-sm font-medium'>{type}</label>

            <select
                id={type}
                value={filter}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded-md p-1"
            >
                <option value="all">All Types</option>
                <option value="onetime">One-Time</option>
                <option value="automatic">Automatic</option>
            </select>
        </div>
    );
}
