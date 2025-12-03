import Event from "@/components/Event.jsx"
import { PageContext } from "../contexts/PageContext"
import { useContext, useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";

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
  const [filteredNames, setFilteredNames] = useState([]);
  const [filteredData, setFilteredData] = useState(mock_data);
  
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
        return true;
      }));
    }
    applyFilters();
  }, [filteredNames])

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
          <label className='font-bold text-sm'>Name</label>
          <div className='flex w-full justify-center mt-1 space-x-2'>
            <input type="text" className="border shadow-sm h-[33px] px-3 rounded-[7px] mb-4 w-full" placeholder="Enter event name" />
            <button 
              className="border rounded-[7px] px-4 shadow-sm h-[33px] hover:bg-blue-600 hover:text-white" 
              onClick={(e) => {
                if (e.target.previousSibling.value.trim() === '') return;
                setFilteredNames([...filteredNames, e.target.previousSibling.value]);
                e.target.previousSibling.value = '';
              }}>
                Apply
              </button>
          </div>  
          <div className="flex">
            {filteredNames.map((name, index) => (
              <div key={index} className='flex space-x-3 items-center justify-center bg-blue-100 shadow-sm text-xs px-3 py-2 rounded-full'>
                <div className="flex items-center">{name}</div>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" className='fill-black hover:fill-red-500' height="7px" width="7px" version="1.1" id="Capa_1" viewBox="0 0 460.775 460.775" xml:space="preserve" onClick={() => setFilteredNames(filteredNames.filter((_, i) => i !== index))}>
                  <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}