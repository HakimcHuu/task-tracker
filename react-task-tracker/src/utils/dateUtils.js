import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

export const formatTime = (time) => {
  if (!time) return null;
  try {
    let parsedTime;
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      parsedTime = parse(time, "HH:mm:ss", new Date());
      console.log(`Formatted time: ${time} -> ${format(parsedTime, "h:mm a")}`);
      return format(parsedTime, "h:mm a");
    } else if (/^\d{2}:\d{2}$/.test(time)) {
      parsedTime = parse(time, "HH:mm", new Date());
      console.log(`Formatted time: ${time} -> ${format(parsedTime, "h:mm a")}`);
      return format(parsedTime, "h:mm a");
    } else {
      console.warn(`Time does not match HH:mm or HH:mm:ss format: ${time}`);
      return time;
    }
  } catch (error) {
    console.error("Error formatting time:", error);
    return time;
  }
};

export const getWeekRange = (date) => {
  if (!date) {
    console.warn("getWeekRange: No date provided, using current date");
    date = new Date();
  }
  try {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    console.log(
      `getWeekRange: ${format(date, "yyyy-MM-dd")} -> start: ${format(
        start,
        "yyyy-MM-dd"
      )}, end: ${format(end, "yyyy-MM-dd")}`
    );
    return { start, end };
  } catch (error) {
    console.error("Error in getWeekRange:", error);
    return { start: date, end: date };
  }
};

export const getMonthRange = (date) => {
  if (!date) {
    console.warn("getMonthRange: No date provided, using current date");
    date = new Date();
  }
  try {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    console.log(
      `getMonthRange: ${format(date, "yyyy-MM-dd")} -> start: ${format(
        start,
        "yyyy-MM-dd"
      )}, end: ${format(end, "yyyy-MM-dd")}`
    );
    return { start, end };
  } catch (error) {
    console.error("Error in getMonthRange:", error);
    return { start: date, end: date };
  }
};

export const getYearRange = (date) => {
  if (!date) {
    console.warn("getYearRange: No date provided, using current date");
    date = new Date();
  }
  try {
    const start = startOfYear(date);
    const end = endOfYear(date);
    console.log(
      `getYearRange: ${format(date, "yyyy-MM-dd")} -> start: ${format(
        start,
        "yyyy-MM-dd"
      )}, end: ${format(end, "yyyy-MM-dd")}`
    );
    return { start, end };
  } catch (error) {
    console.error("Error in getYearRange:", error);
    return { start: date, end: date };
  }
};
