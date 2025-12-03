import { useEffect } from 'react'

export default function EventFormField({ field, type, value, onChange }) {
  function handleNumberChange(e) {
    const value = e.target.value;
    const cleaned = value.replace(/[^0-9]/g, "");
    onChange(cleaned);
  }

  return (
    <div className='flex flex-col space-y-1'>
      <label className="font-medium" for='new-event-name'>{field}</label>
      <input 
        id='new-event-name' 
        type={type === 'pos-int' ? "number" : 'text'}
        min={type === 'pos-int' ? 0 : ''} step={type === 'pos-int' ? "1" : ''} 
        placeholder={`Enter ${field}`} 
        className="border border-neutral-300 h-[37px] px-3 rounded-[7px]" 
        value={value ? value : ''}
        onChange={event => (
          type === 'pos-int' ? handleNumberChange(event) :
          onChange(event.target.value)
        )} />
    </div>
  );
}
