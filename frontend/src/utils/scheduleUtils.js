/**
 * Utility to calculate the complex meeting schedule of the 
 * Church of Pentecost Ayikai Doblo District.
 */

/**
 * Gets the week type of the given date.
 * Returns: 'FIRST' (Lord's Supper), 'LAST' (Ministry Week), or 'REGULAR'
 */
export const getWeekType = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    // Find the first Sunday of the month
    const firstDay = new Date(year, month, 1);
    const daysToFirstSunday = (7 - firstDay.getDay()) % 7;
    const firstSunday = 1 + daysToFirstSunday;

    // Lord's Supper week is the week leading to and including the first Sunday
    // (Usually Sunday to Saturday cycle)
    // We'll define the 'First Week' as the days from the 1st until the first Sunday + remaining days of that seven-day block
    // Simplification: If the date is <= firstSunday + some buffer, OR if it's within the first 7 days
    if (day <= firstSunday + (6 - (new Date(year, month, firstSunday)).getDay())) {
        if (day <= 7 || day < firstSunday + 1) return 'FIRST';
    }

    // Find the last day of the month
    const lastDay = new Date(year, month + 1, 0).getDate();
    if (day > lastDay - 7) return 'LAST';

    return 'REGULAR';
};

/**
 * Returns the meetings for the current day based on the COP district cycle
 */
export const getMeetingsForDate = (date = new Date()) => {
    const weekType = getWeekType(date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Sunday is always Church Service
    if (dayOfWeek === 0) {
        return [{ 
            name: "Sunday Worship Service", 
            time: "10:00 AM — 12:00 PM", 
            description: weekType === 'FIRST' ? "Lord's Supper Service" : "General Worship Service"
        }];
    }

    const meetings = [];

    if (weekType === 'FIRST') {
        if (dayOfWeek === 1) meetings.push({ name: "Home Cells", time: "6:30 PM — 7:30 PM", description: "Localized interaction and prayer." });
        if (dayOfWeek === 2) meetings.push({ name: "District Joint (Miracle Hour)", time: "6:30 PM — 8:30 PM", description: "District-wide prayer and miracles." });
    }

    if (dayOfWeek === 1 && weekType !== 'FIRST') {
        meetings.push({ name: "Youth Meeting", time: "6:30 PM — 8:30 PM", description: "Empowering the next generation." });
    }

    if (weekType === 'LAST') {
        if (dayOfWeek === 2) meetings.push({ name: "Women's Ministry", time: "6:30 PM — 8:30 PM", description: "Virtuous women gathering." });
        if (dayOfWeek === 3) meetings.push({ name: "Evangelism Ministry", time: "6:30 PM — 8:30 PM", description: "Spreading the Good News." });
        if (dayOfWeek === 4) meetings.push({ name: "PEMEM", time: "6:30 PM — 8:30 PM", description: "Pentecost Men's Movement." });
    }

    return meetings;
};
