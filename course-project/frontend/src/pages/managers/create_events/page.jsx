import EventFormField from "@/components/EventFormField"
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import DateTimeField from "@/components/DateTimeField";
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";

export default function CreateEventsPage() {

  const { setPage } = useContext(PageContext);
  
  useEffect(() => {
    setPage('create-events');
  }, [setPage]);

  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(null);
  const [points, setPoints] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit() {
    console.log('Submitting')
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: eventName,
        description: description,
        location: location,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        capacity: capacity ? Number(capacity) : null,
        points: points ? Number(points) : null
      })
    })
    if (!response.ok) {
      console.log('Failed to create event');
      setErrorMsg(response.statusText || 'Failed to create event');
      setSuccessMsg('');
    } else {
      console.log('Event created successfully');
      setSuccessMsg('Event created successfully!');
      setErrorMsg('');
    }
  }

  return (
    <div className="ml-40 mt-20 border w-[60%] p-6 rounded-lg shadow-sm">
      <h1 className='text-2xl font-bold'>Create Event</h1>
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
  )
}