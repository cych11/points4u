export default function Event({ event }) {
  const startDate = new Date(event.startTime);
  const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endDate = new Date(event.endTime);
  const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className='border rounded-lg p-6 shadow'>
      {/* <h3 className='text-xs bg-blue-100 w-fit px-3 py-0.5 rounded-full'>Event #{event.id}</h3> */}
      <h1 className="font-semibold text-lg">{event.name}</h1>
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