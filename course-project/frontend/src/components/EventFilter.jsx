export default function EventFilter({ filter, onChange, type }) {
  return (
    <div className='mt-2'>
      <label className='font-bold text-sm'>{type}</label>
      <div className='flex w-full justify-center mt-1 space-x-2'>
        <input
          type="text"
          className="border shadow-sm h-[33px] px-3 rounded-[7px] mb-4 w-full"
          placeholder="Input filter here"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = e.target.value;
              if (val.trim() === '') return;
              onChange([...filter, val]);
              e.target.value = '';
            }
          }}
        />
        <button 
          className="border rounded-[7px] px-4 shadow-sm h-[33px] hover:bg-blue-600 hover:text-white text-sm" 
          onClick={(e) => {
            if (e.target.previousSibling.value.trim() === '') return;
            onChange([...filter, e.target.previousSibling.value]);
            e.target.previousSibling.value = '';
          }}>
            Apply
          </button>
      </div>  
      <div className="flex space-x-2 flex-wrap gap-y-2">
        {filter.map((item, index) => (
          <div key={index} className='flex space-x-3 items-center justify-center bg-blue-100 shadow-sm text-xs px-3 py-2 rounded-full'>
            <div className="flex items-center">{item}</div>
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className='fill-black hover:fill-red-500' height="7px" width="7px" version="1.1" id="Capa_1" viewBox="0 0 460.775 460.775" xmlSpace="preserve" onClick={() => onChange(filter.filter((_, i) => i !== index))}>
              <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}