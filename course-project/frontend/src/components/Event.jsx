import { useNavigate } from "react-router-dom";

export default function Event({ event }) {
  const startDate = new Date(event.startTime);
  const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endDate = new Date(event.endTime);
  const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const navigate = useNavigate();

  return (
    <div className='border rounded-lg p-6 shadow'>
      {/* <h3 className='text-xs bg-blue-100 w-fit px-3 py-0.5 rounded-full'>Event #{event.id}</h3> */}
      <div className='flex w-full justify-between'>
        <h1 className="font-semibold text-lg">{event.name}</h1>
        <div className="hover:cursor-pointer hover:bg-blue-100 rounded-md p-1 items-center flex justify-center">
          <svg className="ml-[2px]" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" version="1.1" id="Capa_1" width="17px" height="17px" viewBox="0 0 494.936 494.936" xml:space="preserve" onClick={() => navigate(`/managers/manage-event/${event.id}`)}>
            <g>
              <g>
                <path d="M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157    c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21    s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741    c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z"/>
                <path d="M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069    c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963    c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692    C494.936,37.396,491.007,27.915,483.876,20.791z M466.61,56.897L257.457,266.05c-0.035,0.036-0.055,0.078-0.089,0.107    l-33.989,15.131L238.51,247.3c0.03-0.036,0.071-0.055,0.107-0.09L447.765,38.058c5.038-5.039,13.819-5.033,18.846,0.005    c2.518,2.51,3.905,5.855,3.905,9.414C470.516,51.036,469.127,54.38,466.61,56.897z"/>
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div className='flex items-center space-x-4 mt-1'>
        <div className='flex space-x-0.5 items-center'>
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" height="12px" width="12px" version="1.1" id="Capa_1" viewBox="0 0 297 297" xml:space="preserve">
            <path d="M148.5,0C87.43,0,37.747,49.703,37.747,110.797c0,91.026,99.729,179.905,103.976,183.645  c1.936,1.705,4.356,2.559,6.777,2.559c2.421,0,4.841-0.853,6.778-2.559c4.245-3.739,103.975-92.618,103.975-183.645  C259.253,49.703,209.57,0,148.5,0z M148.5,79.693c16.964,0,30.765,13.953,30.765,31.104c0,17.151-13.801,31.104-30.765,31.104  c-16.964,0-30.765-13.953-30.765-31.104C117.735,93.646,131.536,79.693,148.5,79.693z"/>
          </svg>
          <p className='text-xs ml-1 text-neutral-500 font-light'>{event.location}</p>
        </div>
        <div className='flex space-x-0.5 items-center'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="15px" height="15px" viewBox="0 0 24 24">
            <path d="M.221 16.268a15.064 15.064 0 0 0 1.789 1.9C2.008 18.111 2 18.057 2 18a5.029 5.029 0 0 1 3.233-4.678 1 1 0 0 0 .175-1.784A2.968 2.968 0 0 1 4 9a2.988 2.988 0 0 1 5.022-2.2 5.951 5.951 0 0 1 2.022-.715 4.994 4.994 0 1 0-7.913 6.085 7.07 7.07 0 0 0-2.91 4.098zM23.779 16.268a7.07 7.07 0 0 0-2.91-4.1 4.994 4.994 0 1 0-7.913-6.086 5.949 5.949 0 0 1 2.022.715 2.993 2.993 0 1 1 3.614 4.74 1 1 0 0 0 .175 1.784A5.029 5.029 0 0 1 22 18c0 .057-.008.111-.01.167a15.065 15.065 0 0 0 1.789-1.899z"/>
            <path d="M18.954 20.284a7.051 7.051 0 0 0-3.085-5.114A4.956 4.956 0 0 0 17 12a5 5 0 1 0-8.869 3.17 7.051 7.051 0 0 0-3.085 5.114 14.923 14.923 0 0 0 1.968.849C7.012 21.088 7 21.046 7 21a5.031 5.031 0 0 1 3.233-4.678 1 1 0 0 0 .175-1.785A2.964 2.964 0 0 1 9 12a3 3 0 1 1 6 0 2.964 2.964 0 0 1-1.408 2.537 1 1 0 0 0 .175 1.785A5.031 5.031 0 0 1 17 21c0 .046-.012.088-.013.133a14.919 14.919 0 0 0 1.967-.849z"/>
          </svg>
          <p className='text-xs ml-1 text-neutral-500 font-light'><span className="text-green-700">{event.numGuests}</span>/{event.capacity}</p>
        </div>
      </div>
      <div className='flex space-x-6'>
        <p className="text-sm mt-2"><span className="font-medium">Start:</span> <span className="text-neutral-500">{startDate.toLocaleString('default', { month: 'long' })} {startDate.getDate()}, {startDate.getFullYear()} – {startTime}</span></p>
        <p className="text-sm mt-2"><span className="font-medium">End:</span> <span className="text-neutral-500">{endDate.toLocaleString('default', { month: 'long' })} {startDate.getDate()}, {startDate.getFullYear()} – {endTime}</span></p>
      </div>
    </div>
  )
}