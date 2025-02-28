// src/renderer/utils/FormatDateTime.ts

export const FormatDateTime = (dateTimeString?: string): { date: string; time: string } => {
  if (!dateTimeString) {
      console.error("dateTimeString is undefined or null");
      return { date: 'Invalid date', time: '' };
  }

  // Check if the date is in DD/MM/YYYY format and convert it to YYYY-MM-DD
  const dateParts = dateTimeString.split(' ')[0].split('/');
  let formattedDateTimeString = dateTimeString;
  if (dateParts.length === 3) {
    formattedDateTimeString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}${dateTimeString.substring(10)}`;
  }

  const dateObj = new Date(formattedDateTimeString.split('.')[0].replace(" ", "T")); // Remove fractional seconds and replace space with "T" for ISO parsing
  
  if (isNaN(dateObj.getTime())) {
      console.error(`Invalid date provided: ${dateTimeString}`);
      return { date: 'Invalid date', time: '' };
  }
  
  const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const time = `${hours}:${minutes} ${ampm}`;

  return { date, time };
};
