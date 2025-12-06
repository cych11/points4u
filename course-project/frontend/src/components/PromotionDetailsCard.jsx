import EventFormField from "@/components/EventFormField"
import DateTimeField from "@/components/DateTimeField";

export default function PromotionDetailsCard({ handleSubmit, name, setName, description, setDescription, promoType, setPromoType, startDate, setStartDate, endDate, setEndDate, rate, setRate, points, setPoints, minSpending, setMinSpending, errorMsg, successMsg, type }) {
    return (
        <div className="border w-full p-6 rounded-lg shadow-sm">
            <h1 className='text-2xl font-bold'>{type} Promotion</h1>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }} className='mt-8 grid grid-cols-2 gap-x-10 gap-y-5'>
                <EventFormField field="Name" type='text' value={name} onChange={setName} />
                <EventFormField field="Description" type='text' value={description} onChange={setDescription} />
                <div className='flex flex-col space-y-1'>
                    <label className="font-medium" htmlFor='new-event-name'>Type</label>
                    <select
                        id={type}
                        field="Type"
                        value={promoType}
                        onChange={(e) => setPromoType(e.target.value)}
                        className="border border-neutral-300 h-[37px] px-3 rounded-[7px]"
                    >
                        <option value="automatic">Automatic</option>
                        <option value="onetime">One-Time</option>
                    </select>

                </div>
                {promoType === "automatic" ? <EventFormField field="Rate" type='pos-int' value={rate} onChange={setRate} /> : null}
                {promoType === "onetime" ? <EventFormField field="Points" type='pos-int' value={points} onChange={setPoints} /> : null}
                <DateTimeField field="Start Time" type='text' value={startDate} onChange={setStartDate} />
                <DateTimeField field="End Time" type='text' value={endDate} onChange={setEndDate} />
                <EventFormField field="Minimum Spending (Optional)" type='pos-int' value={minSpending} onChange={setMinSpending} />
                <button type="submit" className="bg-blue-600 text-white rounded-lg h-[37px] mt-auto hover:bg-blue-700 transition duration-200">{type} Promotion</button>
                <p className={`${errorMsg ? 'text-red-600' : 'text-green-600'} col-span-2`}>{errorMsg ? errorMsg : successMsg}</p>
            </form>
        </div>
    );
}