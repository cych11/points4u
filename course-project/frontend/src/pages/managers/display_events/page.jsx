import Event from "@/components/Event.jsx"
import { PageContext } from "../contexts/PageContext"
import { useContext, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import EventFilter from "@/components/EventFilter.jsx";
import FilterCheckBox from "@/components/FilterCheckBox";
import { useAuth } from "../../../contexts/AuthContext";

export default function DisplayEventsPage() {
  const { setPage } = useContext(PageContext);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [startedOnly, setStartedOnly] = useState(false);
  const [endedOnly, setEndedOnly] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [eventsPerPage, setEventsPerPage] = useState(10);
  const [viewOrganizerEvents, setViewOrganizerEvents] = useState(false);
  
  useEffect(() => {
    setPage('display-events');
  }, [setPage]);

  useEffect(() => {
    async function getEvents() {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const body = await response.json();

      if (response.ok) {
        console.log(body);
        setAllEvents(body.results);
      } else {
        console.log('Failed to fetch events', body);
      }
    }
    getEvents();
  }, []);

  useEffect(() => {
    function applyFilters() {
      setFilteredData(allEvents.filter(event => {
        for (let name of filteredNames) {
          if (!event.name.toLowerCase().includes(name.toLowerCase())) {
            return false;
          }
        }
        for (let location of filteredLocations) {
          if ((!event.location && !location.toLowerCase().includes('tbd')) || !event.location.toLowerCase().includes(location.toLowerCase())) {
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
        if (viewOrganizerEvents) {
          let found = false;
          if (event.organizers && event.organizers.length > 0) {
            for (let i = 0; i < event.organizers.length; i++) {
              if (event.organizers[i].utorid === user.utorid) {
                found = true
                break;
              }
            }
          }
          if (!found) return false;
        }
        return true;
      }));
    }
    applyFilters();
  }, [filteredNames, filteredLocations, startedOnly, endedOnly, showFull, viewOrganizerEvents, user, allEvents]);

  return (
    <div className="flex flex-col lg:flex-row lg:ml-40 ml-4 mt-5 gap-6 md:min-w-[700px]">
      <div className="w-full lg:w-1/2">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex justify-between items-center">
          <div className="flex space-x-3 items-center mt-4">
            <label htmlFor="events-per-page" className="text-sm font-medium">Events per page:</label>
            <input type='number' min={1} step={1} className='border rounded-md text-sm p-1 w-[50px]' value={eventsPerPage} onChange={(e) => setEventsPerPage(e.target.value)} />
          </div>
          <button className={`border rounded-lg px-3 text-sm h-[40px] hover:scale-[1.01] shadow-sm ${viewOrganizerEvents ? 'bg-blue-100' : 'hover:bg-gray-100'}`} onClick={() => setViewOrganizerEvents(!viewOrganizerEvents)}>View My Events</button>
        </div>
        <div className='space-y-4 max-h-[60vh] lg:max-h-[580px] min-h-[40vh] lg:min-h-[580px] overflow-y-auto mt-3'>
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
      <div className="w-full lg:w-1/3 lg:ml-16 mt-6 lg:mt-[90px]">
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