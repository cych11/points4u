import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import EventDetailsCard from "@/components/EventDetailsCard.jsx";

export default function ManageEventPage() {

  const { setPage } = useContext(PageContext);
  
  useEffect(() => {
    setPage('manage-event');
  }, [setPage]);

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [capacity, setCapacity] = useState(null);
  const [points, setPoints] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { id } = useParams();

  useEffect(() => {
    async function getEventDetails() {
      const response = await fetch(`/api/events/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEventName(data.name || '');
        setDescription(data.description || '');
        setLocation(data.location || '');
        setStartDate(dayjs(data.startTime) || dayjs());
        setEndDate(dayjs(data.endTime) || dayjs());
        setCapacity(data.capacity || null);
        setPoints(data.points || null);
      }
    }
    getEventDetails();
  }, [id]);

  async function handleSubmit() {
    // TODO: Create Path request to modify event and get the event ID either from context
    const response = await fetch('/api/events', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: eventName ? eventName : null,
        description: description ? description : null,
        location: location ? location : null,
        startTime: startDate.toISOString() ? startDate.toISOString() : null,
        endTime: endDate.toISOString() ? endDate.toISOString() : null,
        capacity: capacity ? Number(capacity) : null,
        points: points ? Number(points) : null
      })
    })
    if (!response.ok) {
      console.log('Failed to modify event');
      setErrorMsg(response.statusText || 'Failed to modify event');
      setSuccessMsg('');
    } else {
      console.log('Event modified successfully');
      setSuccessMsg('Event modified successfully!');
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
      type="Modify"
    />
  );
}