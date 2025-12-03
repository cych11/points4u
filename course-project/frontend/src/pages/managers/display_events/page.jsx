import Event from "@/components/Event.jsx"
import { PageContext } from "../contexts/PageContext"
import { useContext, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import EventFilter from "@/components/EventFilter.jsx";

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
  
  useEffect(() => {
    setPage('display-events');
  }, [setPage]);

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
        return true;
      }));
    }
    applyFilters();
  }, [filteredNames, filteredLocations, startedOnly, endedOnly]);

  return (
    <div className="flex ml-40 mt-20">
      <div className="space-y-6 w-[50%]">
        <h1 className="text-3xl font-bold">Events</h1>
        {filteredData.slice((currentPage - 1) * 4, ((currentPage - 1) * 4) + 4).map((event) => (
          <Event key={event.id} event={event} />
        ))}
        {filteredData.length === 0 && (
          <div className="text-center text-gray-500">No events found.</div>
        )}
        <div className='flex justify-center'>
          <Pagination count={Math.ceil(filteredData.length / 4)} page={currentPage} onChange={(event, value) => setCurrentPage(value)} />
        </div>
      </div>
      <div className="ml-16 mt-[60px] w-[35%]">
        <h2 className="text-xl font-semibold">Filter Events</h2>
        <div className='mt-10'>
          <EventFilter filter={filteredNames} onChange={setFilteredNames} type="Name" />
          <EventFilter filter={filteredLocations} onChange={setFilteredLocations} type="Location" />
          <div className='flex w-full space-x-10'>
            <div className='flex items-center gap-2 mt-2'>
              <input type='checkbox' id="Already Started" onClick={() => setStartedOnly(!startedOnly)} />
              <label htmlFor="Already Started" className='text-sm font-medium'>Already Started</label>
            </div>
            <div className='flex items-center gap-2 mt-2'>
              <input type='checkbox' id="Already Ended" onClick={() => setEndedOnly(!endedOnly)} />
              <label htmlFor="Already Ended" className='text-sm font-medium'>Already Ended</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}