import { WorkPattern } from "@shared/schema";

/**
 * Maps of Queensland public holidays by year
 */
const queenslandPublicHolidays: Record<number, { date: string; name: string }[]> = {
  2025: [
    { date: '2025-01-01', name: 'New Year\'s Day' },
    { date: '2025-01-27', name: 'Australia Day' },
    { date: '2025-04-18', name: 'Good Friday' },
    { date: '2025-04-19', name: 'Easter Saturday' },
    { date: '2025-04-20', name: 'Easter Sunday' },
    { date: '2025-04-21', name: 'Easter Monday' },
    { date: '2025-04-25', name: 'Anzac Day' },
    { date: '2025-05-05', name: 'Labour Day' },
    { date: '2025-06-11', name: 'King\'s Birthday' },
    { date: '2025-08-13', name: 'Royal Queensland Show Day (Brisbane only)' },
    { date: '2025-10-06', name: 'Queen\'s Birthday' },
    { date: '2025-12-25', name: 'Christmas Day' },
    { date: '2025-12-26', name: 'Boxing Day' }
  ],
  2024: [
    { date: '2024-01-01', name: 'New Year\'s Day' },
    { date: '2024-01-26', name: 'Australia Day' },
    { date: '2024-03-29', name: 'Good Friday' },
    { date: '2024-03-30', name: 'Easter Saturday' },
    { date: '2024-03-31', name: 'Easter Sunday' },
    { date: '2024-04-01', name: 'Easter Monday' },
    { date: '2024-04-25', name: 'Anzac Day' },
    { date: '2024-05-06', name: 'Labour Day' },
    { date: '2024-10-07', name: 'Queen\'s Birthday' },
    { date: '2024-12-25', name: 'Christmas Day' },
    { date: '2024-12-26', name: 'Boxing Day' }
  ],
  2023: [
    { date: '2023-01-01', name: 'New Year\'s Day' },
    { date: '2023-01-02', name: 'New Year\'s Day (additional day)' },
    { date: '2023-01-26', name: 'Australia Day' },
    { date: '2023-04-07', name: 'Good Friday' },
    { date: '2023-04-08', name: 'Easter Saturday' },
    { date: '2023-04-09', name: 'Easter Sunday' },
    { date: '2023-04-10', name: 'Easter Monday' },
    { date: '2023-04-25', name: 'Anzac Day' },
    { date: '2023-05-01', name: 'Labour Day' },
    { date: '2023-10-02', name: 'Queen\'s Birthday' },
    { date: '2023-12-25', name: 'Christmas Day' },
    { date: '2023-12-26', name: 'Boxing Day' }
  ]
};

/**
 * Checks if a date is a Queensland public holiday
 */
export function isQueenslandPublicHoliday(date: Date): boolean {
  // Format date as YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  
  // Check if we have holidays for this year
  if (!queenslandPublicHolidays[year]) {
    return false;
  }
  
  // Check if date is in the public holidays list
  return queenslandPublicHolidays[year].some(holiday => holiday.date === formattedDate);
}

/**
 * Gets the name of a Queensland public holiday
 */
export function getQueenslandPublicHolidayName(date: Date): string | null {
  // Format date as YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  
  // Check if we have holidays for this year
  if (!queenslandPublicHolidays[year]) {
    return null;
  }
  
  // Find the holiday
  const holiday = queenslandPublicHolidays[year].find(holiday => holiday.date === formattedDate);
  
  return holiday ? holiday.name : null;
}

/**
 * Get a list of public holidays as work patterns within a date range
 */
export function getQueenslandPublicHolidaysAsWorkPatterns(
  userId: number,
  startDate: Date, 
  endDate: Date
): WorkPattern[] {
  const patterns: WorkPattern[] = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  // Iterate through the years in our range
  for (let year = startYear; year <= endYear; year++) {
    if (!queenslandPublicHolidays[year]) continue;
    
    // For each holiday in this year
    for (const holiday of queenslandPublicHolidays[year]) {
      const holidayDate = new Date(holiday.date);
      
      // Check if holiday is between startDate and endDate
      if (holidayDate >= startDate && holidayDate <= endDate) {
        patterns.push({
          id: -1, // Will be assigned by database
          userId,
          date: holidayDate,
          location: "public_holiday",
          notes: holiday.name,
          createdAt: new Date()
        });
      }
    }
  }
  
  return patterns;
}