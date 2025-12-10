import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useContext } from "react";
import { PageContext } from "../contexts/PageContext.jsx";
import EventDetailsCard from "@/components/EventDetailsCard.jsx";
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

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
  const [guestList, setGuestList] = useState([]);
  const [organizerList, setOrganizerList] = useState([]);
  const [newOrganizerUtorid, setNewOrganizerUtorid] = useState('');
  const [newGuestUtorid, setNewGuestUtorid] = useState('');
  const [remainingPoints, setRemainingPoints] = useState(null);
  const [awardedPointsAll, setAwardedPointsAll] = useState('');
  const [awardedPointsGuest, setAwardedPointsGuest] = useState('');
  const [openAll, setOpenAll] = useState(false);
  const [openGuest, setOpenGuest] = useState(false);
  const [currUser, setCurrUser] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    // Only fetch full user details when guest dialog is opened and we have a numeric id
    if (!openGuest || !currUser?.id) return;
    async function openDialog() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`/api/users/${currUser.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const body = await response.json().catch(() => null);
        if (response.ok) {
          setCurrUser(body);
        } else {
          console.warn('Failed to fetch user details', response.status, body);
        }
      } catch (err) {
        console.error('Failed to fetch user details', err);
      }
    }
    openDialog()
  }, [openGuest, currUser?.id])

  useEffect(() => {
    async function getEventDetails() {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        setPoints(data.pointsRemain + data.pointsAwarded || null);
        setRemainingPoints(data.pointsRemain);
        setGuestList(data.guests || []);
        setOrganizerList(data.organizers || []);
      }
    }
    getEventDetails();
  }, [id]);

  async function handleSubmit() {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

  async function handleAddGuestPoints(utorid, points) {
    if (!utorid || typeof utorid !== 'string') {
      toast("Error", {
        description: "Invalid user selected",
        action: { label: "Ok", onClick: () => {} },
      });
      return null;
    }
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${id}/points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: "event",
        utorid: utorid.trim(),
        amount: Number(points),
        remark: null
      })
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const errorMsg = body?.message || `Failed to add points (${response.status})`;
      toast("Failed to add points", {
        description: errorMsg,
        action: {
          label: "Ok",
          onClick: () => console.log("Failed to add points"),
        },
      });
      return null;
    }
    toast("Success", {
      description: "Points awarded successfully",
      action: { label: "Ok", onClick: () => {} },
    });
    return await response.json()
  }

  async function addPointsToAllGuests(points) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${id}/points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        type: "event",
        amount: Number(points),
        remark: null 
      })
    });
    if (!response.ok) {
      toast("Failed to add points", {
        description: "There was an error adding points",
        action: {
          label: "Ok",
          onClick: () => console.log("Failed to add points"),
        },
      });
      return null;
    }
  }

  async function handleAddedGuest(utorid) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${id}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ utorid: utorid })
    });
    if (!response.ok) {
      toast("Failed to add guest", {
        description: "There was an error adding guest",
        action: {
          label: "Ok",
          onClick: () => console.log("Failed to add guest"),
        },
      });
    }
  }

  async function handleAddedOrganizer(utorid) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${id}/organizers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ utorid: utorid })
    });
    if (!response.ok) {
      toast("Failed to add guest", {
        description: "There was an error adding guest",
        action: {
          label: "Ok",
          onClick: () => console.log("Failed to add guest"),
        },
      });
    }
  }

  async function handleDeleteGuest(user_id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${id}/guests/${user_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      toast("Failed to delete guest", {
        description: "There was an error deleting guest",
        action: {
          label: "Ok",
          onClick: () => console.log("Failed to delete guest"),
        },
      });
    }
  }

  async function handleDeleteOrganizer(user_id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${id}/organizers/${user_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      toast("Failed to delete guest", {
        description: "There was an error deleting guest",
        action: {
          label: "Ok",
          onClick: () => console.log("Failed to deleting guest"),
        },
      });
    }
  }

  return (
    <div className="flex space-x-4">
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
      {/* Part of the code below was generated by github co-pilot agent mode, to help in speed of development. I understand all the code and made modifications to it. */}
      <div className='border p-6 rounded-lg shadow-sm mt-20 w-[23%]'>
        <h1 className="text-2xl font-bold mb-6">Manage Attendees</h1>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Organizers</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="utorid"
              value={newOrganizerUtorid}
              onChange={(e) => setNewOrganizerUtorid(e.target.value)}
              placeholder="Enter organizer utorid"
              className="border rounded-lg px-3 py-2 text-sm flex-1 shadow-sm"
            />
            <button
              onClick={() => {
                if (newOrganizerUtorid.trim()) {
                  handleAddedOrganizer(newOrganizerUtorid);
                  setOrganizerList([...organizerList, { utorid: newOrganizerUtorid }]);
                  setNewOrganizerUtorid('');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition duration-200 font-medium"
            >
              Add
            </button>
          </div>
          <div className="border rounded-lg h-48 overflow-y-auto bg-gray-50">
            {organizerList.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No organizers added</div>
            ) : (
              <ul className="divide-y">
                {organizerList.map((organizer, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-blue-50 transition duration-150"
                  >
                    <span className="text-sm truncate flex-1">{organizer.utorid || organizer}</span>
                    <button
                      onClick={() => {
                        handleDeleteOrganizer(organizer.id);
                        setOrganizerList(organizerList.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition duration-150 ml-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 460.775 460.775"
                        fill="currentColor"
                      >
                        <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <div className='flex items-center mb-3 justify-between'>
            <h2 className="text-lg font-semibold">Guests</h2>
            <Dialog open={openAll} onOpenChange={setOpenAll}>
              <DialogTrigger asChild>
                <button className='text-xs mr-1 hover:bg-gray-200 border shadow-sm rounded-sm px-2 py-1'>
                  + Points
                </button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Award All Guests Points</DialogTitle>
                  <DialogDescription>
                    <div className='flex items-center space-x-2 mt-4'>
                      <span className='text-sm'>Award Points:</span>
                      <input
                        type='number'
                        min={1}
                        max={remainingPoints}
                        value={awardedPointsAll ?? ''}
                        onChange={(e) => setAwardedPointsAll(e.target.value)}
                        className='border w-[70px] rounded-md p-1'
                      />
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        className='bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700'
                        onClick={() => {
                            if (!awardedPointsAll || Number(awardedPointsAll) <= 0) {
                              return;
                            }
                            addPointsToAllGuests(awardedPointsAll);
                            setOpenAll(false);
                            setAwardedPointsAll('');
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="utorid"
              value={newGuestUtorid}
              onChange={(e) => setNewGuestUtorid(e.target.value)}
              placeholder="Enter guest utorid"
              className="border rounded-lg px-3 py-2 text-sm flex-1 shadow-sm"
            />
            <button
              onClick={() => {
                if (newGuestUtorid.trim()) {
                  handleAddedGuest(newGuestUtorid);
                  setGuestList([...guestList, { utorid: newGuestUtorid }]);
                  setNewGuestUtorid('');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition duration-200 font-medium"
            >
              Add
            </button>
          </div>
          <div className="border rounded-lg h-48 overflow-y-auto bg-gray-50">
            {guestList.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No guests added</div>
            ) : (
              <ul className="divide-y">
                {guestList.map((guest, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-blue-50 transition duration-150"
                  >
                    <span className="text-sm truncate flex-1">{guest.utorid || guest}</span>
                    {/* <button className='text-xs mr-1 hover:bg-gray-200 rounded-sm px-2 py-1'>points: xx</button> */}
                    {/* {user.role === 'event organizer' && ( */}
                    <Dialog open={openGuest} onOpenChange={setOpenGuest}>
                      <DialogTrigger asChild>
                          <button className='text-xs mr-1 hover:bg-gray-200 rounded-sm px-2 py-1 border' onClick={() => { setCurrUser(guest); setOpenGuest(true); }}>
                            points
                          </button>
                        </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Award {currUser?.utorid ?? ''} points</DialogTitle>
                          <DialogDescription>
                            Award points to {currUser?.utorid ?? 'guest'}
                          </DialogDescription>
                        </DialogHeader>
                          <div className='mt-2'>Current Points: {currUser?.points ?? 'N/A'}</div>
                          <div className='flex items-center space-x-2 mt-2'>
                            <span>Award Points:</span>
                            <input
                              type='number'
                              min={1}
                              max={remainingPoints}
                              value={awardedPointsGuest ?? ''}
                              onChange={(e) => setAwardedPointsGuest(e.target.value)}
                              className='border w-[70px] rounded-md p-1'
                            />
                          </div>
                          <div className="flex justify-end mt-3">
                            <button
                              className='bg-blue-600 text-white px-3 py-1 rounded-md'
                              onClick={() => {
                                  if (!awardedPointsGuest || Number(awardedPointsGuest) <= 0) {
                                    return;
                                  }
                                  handleAddGuestPoints(currUser?.utorid, awardedPointsGuest);
                                  setOpenGuest(false);
                                  setAwardedPointsGuest('');
                              }}
                            >
                              Submit
                            </button>
                          </div>
                      </DialogContent>
                    </Dialog>
                    {/* )} */}
                    <button
                      onClick={() => {
                        handleDeleteGuest(guest.id)
                        setGuestList(guestList.filter((_, i) => i !== index))
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition duration-150 ml-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 460.775 460.775"
                        fill="currentColor"
                      >
                        <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}