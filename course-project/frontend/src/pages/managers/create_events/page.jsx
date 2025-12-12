import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import EventDetailsCard from "@/components/EventDetailsCard.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function CreateEventsPage() {

  const { setPage } = useContext(PageContext);
  
  useEffect(() => {
    setPage('create-events');
  }, [setPage]);

  const [startDate, setStartDate] = useState(dayjs().add(1, 'hour'));
  const [endDate, setEndDate] = useState(dayjs().add(2, 'hours'));
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(null);
  const [points, setPoints] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit() {
    console.log('Submitting')
    
    // Client-side validation
    if (!eventName.trim()) {
      setErrorMsg('Name is required');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Description is required');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Location is required');
      return;
    }
    if (!points) {
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
      setErrorMsg('You must be logged in to create events');
      return;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: eventName.trim(),
        description: description.trim(),
        location: location.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        capacity: capacity ? Number(capacity) : null,
        points: Number(points)
      })
    })
    if (!response.ok) {
      console.log('Failed to create event');
      try {
        const errorData = await response.json();
        setErrorMsg(errorData.message || response.statusText || 'Failed to create event');
      } catch {
        setErrorMsg(response.statusText || 'Failed to create event');
      }
      setSuccessMsg('');
    } else {
      console.log('Event created successfully');
      setSuccessMsg('Event created successfully!');
      setErrorMsg('');
      // Reset form
      setEventName('');
      setDescription('');
      setLocation('');
      setCapacity(null);
      setPoints(null);
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