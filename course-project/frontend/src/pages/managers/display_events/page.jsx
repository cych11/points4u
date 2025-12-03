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
    startTime: "2025-12-01T12:00:00Z",
    endTime: "2025-12-01T15:00:00Z",
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
        return true;
      }));
    }
    applyFilters();
  }, [filteredNames, filteredLocations])

  return (
    <div className="flex ml-40 mt-20">
      <div className="space-y-6 w-[50%]">
        <h1 className="text-3xl font-bold">Events</h1>
        {filteredData.slice((currentPage - 1) * 4, ((currentPage - 1) * 4) + 4).map((event) => (
          <Event key={event.id} event={event} />
        ))}
        <div className='flex justify-center'>
          <Pagination count={Math.ceil(filteredData.length / 4)} page={currentPage} onChange={(event, value) => setCurrentPage(value)} />
        </div>
      </div>
      <div className="ml-16 mt-[60px] w-[35%]">
        <h2 className="text-xl font-semibold">Filter Events</h2>
        <div className='mt-10'>
          <EventFilter filter={filteredNames} onChange={setFilteredNames} type="Name" />
          <EventFilter filter={filteredLocations} onChange={setFilteredLocations} type="Location" />
        </div>
      </div>
    </div>
  )
}