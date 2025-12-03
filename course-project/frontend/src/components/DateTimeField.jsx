import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers';

export default function DateTimeField({ field }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='flex flex-col space-y-1'>
        <label className="font-medium" htmlFor='start-time'>{field}</label>
        {/* Source - https://stackoverflow.com/a
        Posted by Akis, modified by community. See post 'Timeline' for change history
        Retrieved 2025-12-02, License - CC BY-SA 4.0 */}
        <DateTimePicker
              className="DatePicker"
              slotProps={{textField:{
                size:'small',
                InputProps: {
                  sx: { borderRadius: '7px', height: '37px', borderColor: '#d1d5db' },
                },
              }}}
              sx={{"& .MuiInputBase-input": {
                  height: "80px"
                }}}
          />
      </div>
    </LocalizationProvider>
  )
}