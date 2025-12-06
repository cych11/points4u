import Event from "@/components/Event.jsx"
import { PageContext } from "../contexts/PageContext"
import { useContext, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import EventFilter from "@/components/EventFilter.jsx";
import FilterCheckBox from "@/components/FilterCheckBox";

const mock_data = [
  {
    id: 1,
    name: "Event 1",
    location: "BA 2250",
    startTime: "2025-11-10T09:00:00Z",
    endTime: "2025-11-10T17:00:00Z",
    capacity: 200,
    numGuests: 0,
  },
  {
    id: 2,
    name: "Event 2",
    location: "Online",
    startTime: "2025-12-01T12:00:00Z",
    endTime: "2025-12-01T15:00:00Z",
    capacity: 100,
    numGuests: 50,
  },
  {
    id: 3,
    name: "Event 3",
    location: "Online",
    startTime: "2025-12-08T12:00:00Z",
    endTime: "2025-12-10T15:00:00Z",
    capacity: 100,
    numGuests: 50,
  },
  {
    id: 4,
    name: "Event 4",
    location: "Online",
    startTime: "2025-12-01T12:00:00Z",
    endTime: "2025-12-01T15:00:00Z",
    capacity: 100,
    numGuests: 50,
  },
  {
    id: 5,
    name: "Event 5",
    location: "Online",
    startTime: "2025-12-01T12:00:00Z",
    endTime: "2025-12-01T15:00:00Z",
    capacity: 100,
    numGuests: 50,
  }
]

export default function DisplayEventsPage() {
  const { setPage } = useContext(PageContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(mock_data);
  const [filteredNames, setFilteredNames] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [startedOnly, setStartedOnly] = useState(false);
  const [endedOnly, setEndedOnly] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [eventsPerPage, setEventsPerPage] = useState(10);

  useEffect(() => {
    setPage('display-events');
  }, [setPage]);

  // TODO: Create GET request to the fetch the events
  useEffect(() => {
    async function getEvents() {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        // const data = await response.json();
        // setFilteredData(data);
      } else {
        console.log('Failed to fetch events');
      }
    }
    getEvents();
  })

  useEffect(() => {
    function applyFilters() {
      setFilteredData(mock_data.filter(event => {
        for (let name of filteredNames) {
          if (!event.name.toLowerCase().includes(name.toLowerCase())) {
            return false;
          }
        }
        for (let location of filteredLocations) {
          if (!event.location.toLowerCase().includes(location.toLowerCase())) {
            return false;
          }
        }
        if (startedOnly) {
          const start = new Date(event.startTime);
          const now = new Date();
          if (start > now) {
            return false;
          }
        }
        if (endedOnly) {
          const end = new Date(event.endTime);
          const now = new Date();
          if (end > now) {
            return false;
          }
        }
        if (showFull && event.numGuests < event.capacity) {
          return false;
        }
        return true;
      }));
    }
    applyFilters();
  }, [filteredNames, filteredLocations, startedOnly, endedOnly, showFull]);

  return (
    <div className="flex ml-40 mt-5">
      <div className="w-[50%]">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Events</h1>
          <a
            className="flex flex-col border rounded-md p-2 transition-all duration-150 ease-in-out hover:scale-110 hover:bg-blue-100"
            href="/managers/create-events"
          >
            <h1 className="font-semibold text-2xl">Create Event</h1>
          </a>
        </div>
        <div className="flex space-x-3 items-center mt-4">
          <label htmlFor="events-per-page" className="text-sm font-medium">Events per page:</label>
          <input type='number' min={1} step={1} className='border rounded-md text-sm p-1 w-[50px]' value={eventsPerPage} onChange={(e) => setEventsPerPage(e.target.value)} />
        </div>
        <div className='space-y-4 max-h-[580px] min-h-[580px] overflow-y-auto mt-3'>
          {filteredData.slice((currentPage - 1) * eventsPerPage, ((currentPage - 1) * eventsPerPage) + eventsPerPage).map((event) => (
            <Event key={event.id} event={event} />
          ))}
        </div>
        {filteredData.length === 0 && (
          <div className="text-center text-gray-500">No events found.</div>
        )}
        <div className='flex justify-center mt-5'>
          <Pagination count={Math.ceil(filteredData.length / eventsPerPage)} page={currentPage} onChange={(event, value) => setCurrentPage(value)} />
        </div>
      </div>
      <div className="ml-16 mt-[90px] w-[35%]">
        <h2 className="text-xl font-semibold">Filter Events</h2>
        <div className='mt-10'>
          <EventFilter filter={filteredNames} onChange={setFilteredNames} type="Name" />
          <EventFilter filter={filteredLocations} onChange={setFilteredLocations} type="Location" />
          <div className='flex w-full space-x-10 flex-wrap'>
            <FilterCheckBox filter={startedOnly} onChange={setStartedOnly} type="Already Started" />
            <FilterCheckBox filter={endedOnly} onChange={setEndedOnly} type="Already Ended" />
            <FilterCheckBox filter={showFull} onChange={setShowFull} type="Show Full Events" />
          </div>
        </div>
      </div>
    </div>
  )
}