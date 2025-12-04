import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import EventDetailsCard from "@/components/EventDetailsCard.jsx";

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
    <EventDetailsCard 
      handleSubmit={handleSubmit} 
      eventName={eventName} 
      setEventName={setEventName} 
      description={description} 
      setDescription={setDescription} 
      location={location} 
      setLocation={setLocation} 
      capacity={capacity} 
      setCapacity={setCapacity} 
      startDate={startDate} 
      setStartDate={setStartDate} 
      endDate={endDate} 
      setEndDate={setEndDate} 
      points={points} 
      setPoints={setPoints} 
      errorMsg={errorMsg}
      successMsg={successMsg} 
      type='Create'
    />
  );
}