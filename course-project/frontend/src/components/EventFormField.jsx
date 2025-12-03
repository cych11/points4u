export default function EventFormField({ field, type, value, onChange }) {
  return (
    <div className='flex flex-col space-y-1'>
      <label className="font-medium" for='new-event-name'>{field}</label>
      <input id='new-event-name' type={type === 'pos-int' ? "number" : ''} min={type === 'pos-int' ? 0 : ''} step={type === 'pos-int' ? "1" : ''} placeholder={`Enter ${field}`} className="border border-neutral-300 h-[37px] px-3 rounded-[7px]" value={value ? value : ''} onChange={event => onChange(event.target.value)} />
    </div>
  );
}
