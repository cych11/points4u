import EventFormField from "@/components/EventFormField"
import DateTimeField from "@/components/DateTimeField";

export default function EventDetailsCard({ handleSubmit, eventName, setEventName, description, setDescription, location, setLocation, capacity, setCapacity, startDate, setStartDate, endDate, setEndDate, points, setPoints, errorMsg, successMsg, type }) {
  return (
    <div className="ml-40 mt-20 border w-[60%] p-6 rounded-lg shadow-sm">
      <h1 className='text-2xl font-bold'>{type} Event</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
        }} className='mt-8 grid grid-cols-2 gap-x-10 gap-y-5'>
        <EventFormField field="Name" type='text' value={eventName} onChange={setEventName} />
        <EventFormField field="Description" type='text' value={description} onChange={setDescription} />
        <EventFormField field="Location" type='text' value={location} onChange={setLocation} />
        <EventFormField field="Capacity" type='pos-int' value={capacity} onChange={setCapacity} />
        <DateTimeField field="Start Time" type='text' value={startDate} onChange={setStartDate} />
        <DateTimeField field="End Time" type='text' value={endDate} onChange={setEndDate} />
        <EventFormField field="Points" type='pos-int' value={points} onChange={setPoints} />
        <button type="submit" className="bg-blue-600 text-white rounded-lg h-[37px] mt-auto hover:bg-blue-700 transition duration-200">Create Event</button>
        <p className={`${errorMsg ? 'text-red-600' : 'text-green-600'} col-span-2`}>{errorMsg ? errorMsg : successMsg}</p>
      </form>
    </div>
  );
}