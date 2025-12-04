export default function FilterCheckBox({ filter, onChange, type }) {
  return (
    <div className='flex items-center gap-2 mt-2'>
      <input type='checkbox' id={type} onClick={() => onChange(!filter)} />
      <label htmlFor={type} className='text-sm font-medium'>{type}</label>
    </div>
  )
}