// Format date for display (Month Day, Year)
export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Calculate the duration between two dates in years and months
export const calculateDuration = (startDate: string | Date, endDate: string | Date | null | undefined) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  
  let years = yearDiff;
  let months = monthDiff;
  
  if (monthDiff < 0) {
    years--;
    months += 12;
  }
  
  const yearText = years > 0 ? `${years} ${years === 1 ? 'yr' : 'yrs'}` : '';
  const monthText = months > 0 ? `${months} ${months === 1 ? 'mo' : 'mos'}` : '';
  
  if (yearText && monthText) {
    return `${yearText}, ${monthText}`;
  } else {
    return yearText || monthText || '< 1 mo';
  }
}; 