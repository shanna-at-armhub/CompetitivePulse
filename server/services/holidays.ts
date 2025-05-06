import { WorkPattern } from "../../shared/schema";

// Australian public holidays for 2025
// Source: https://www.officeholidays.com/countries/australia/2025
const australianPublicHolidays2025 = [
  { name: "New Year's Day", date: new Date("2025-01-01") },
  { name: "Australia Day", date: new Date("2025-01-27") }, // Observed on the Monday
  { name: "Good Friday", date: new Date("2025-04-18") },
  { name: "Easter Monday", date: new Date("2025-04-21") },
  { name: "Anzac Day", date: new Date("2025-04-25") },
  { name: "Labour Day", date: new Date("2025-05-05") }, // First Monday in May
  { name: "Queen's Birthday", date: new Date("2025-06-09") }, // Second Monday in June (varies by state)
  { name: "Christmas Day", date: new Date("2025-12-25") },
  { name: "Boxing Day", date: new Date("2025-12-26") }
];

// Test if a date is an Australian public holiday
export function isAustralianPublicHoliday(date: Date): boolean {
  const formattedDate = new Date(date);
  formattedDate.setHours(0, 0, 0, 0);
  
  return australianPublicHolidays2025.some(holiday => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() === formattedDate.getTime();
  });
}

// Get the name of an Australian public holiday
export function getAustralianPublicHolidayName(date: Date): string | null {
  const formattedDate = new Date(date);
  formattedDate.setHours(0, 0, 0, 0);
  
  const holiday = australianPublicHolidays2025.find(holiday => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() === formattedDate.getTime();
  });
  
  return holiday ? holiday.name : null;
}

// Get public holiday work patterns for a date range
export function getPublicHolidaysAsWorkPatterns(startDate: Date, endDate: Date): WorkPattern[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Add one day to include the end date
  end.setDate(end.getDate() + 1);
  
  const publicHolidays: WorkPattern[] = [];
  const currentDate = new Date(start);
  
  // Loop through all dates in the range
  while (currentDate < end) {
    if (isAustralianPublicHoliday(currentDate)) {
      const holidayName = getAustralianPublicHolidayName(currentDate);
      
      publicHolidays.push({
        id: -999000 - publicHolidays.length, // Use negative IDs to avoid conflicts
        userId: 0, // System user ID
        date: new Date(currentDate),
        location: "public_holiday",
        notes: holidayName,
        createdAt: new Date()
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return publicHolidays;
}