// // src/utils/scoreCalculator.js
// import {
//   formatDateKey,
//   getWeekRange,
//   getMonthRange,
//   getYearRange,
//   isDateInRange,
//   getYearFromDate,
// } from "./dateUtils";

// // Import directly from date-fns and rename it
// import { isValid as dateFnsIsValid } from "date-fns";

// // Helper function for percentage calculation
// const calculatePercentage = (completed, total) => {
//   if (total === 0) return 0; // Avoid division by zero
//   return Math.round((completed / total) * 100);
// };

// // ======================================================
// // >>> THIS LINE MUST START WITH 'export const' <<<
// export const calculateScores = (tasks) => {
//   // ======================================================
//   // Ensure tasks is an array before proceeding
//   if (!Array.isArray(tasks) || tasks.length === 0) {
//     return { daily: 0, weekly: 0, monthly: 0, yearly: 0, pastYears: [] };
//   }

//   const today = new Date();
//   const todayKey = formatDateKey(today);
//   if (!todayKey || todayKey === "invalid-date" || todayKey === "") {
//     console.error("[ScoreCalc] Could not get a valid date key for today.");
//     return { daily: 0, weekly: 0, monthly: 0, yearly: 0, pastYears: [] };
//   }

//   // --- Daily Score ---
//   const todayTasks = tasks.filter((task) => task && task.dateFor === todayKey);
//   const completedToday = todayTasks.filter(
//     (task) => task && task.completed
//   ).length;
//   const dailyScore = calculatePercentage(completedToday, todayTasks.length);

//   // --- Weekly Score ---
//   const currentWeekRange = getWeekRange(today);
//   let weekTasks = [];
//   if (currentWeekRange.start && currentWeekRange.end) {
//     weekTasks = tasks.filter(
//       (task) =>
//         task && task.dateFor && isDateInRange(task.dateFor, currentWeekRange)
//     );
//   } else {
//     console.warn("[ScoreCalc] Invalid week range calculated.");
//   }
//   const completedWeek = weekTasks.filter(
//     (task) => task && task.completed
//   ).length;
//   const weeklyScore = calculatePercentage(completedWeek, weekTasks.length);

//   // --- Monthly Score ---
//   const currentMonthRange = getMonthRange(today);
//   let monthTasks = [];
//   if (currentMonthRange.start && currentMonthRange.end) {
//     monthTasks = tasks.filter(
//       (task) =>
//         task && task.dateFor && isDateInRange(task.dateFor, currentMonthRange)
//     );
//   } else {
//     console.warn("[ScoreCalc] Invalid month range calculated.");
//   }
//   const completedMonth = monthTasks.filter(
//     (task) => task && task.completed
//   ).length;
//   const monthlyScore = calculatePercentage(completedMonth, monthTasks.length);

//   // --- Yearly Score (Current Year) ---
//   const currentYearRange = getYearRange(today);
//   let yearTasks = [];
//   if (currentYearRange.start && currentYearRange.end) {
//     yearTasks = tasks.filter(
//       (task) =>
//         task && task.dateFor && isDateInRange(task.dateFor, currentYearRange)
//     );
//   } else {
//     console.warn("[ScoreCalc] Invalid year range calculated for current year.");
//   }
//   const completedYear = yearTasks.filter(
//     (task) => task && task.completed
//   ).length;
//   const yearlyScore = calculatePercentage(completedYear, yearTasks.length);

//   // --- Past Yearly Scores ---
//   const pastYearsScores = [];
//   const currentYear = getYearFromDate(today);

//   if (currentYear !== null) {
//     for (let i = 0; i < 5; i++) {
//       const year = currentYear - i;
//       const yearDate = new Date(year, 0, 1);
//       // Use the renamed isValid from date-fns here
//       if (!dateFnsIsValid(yearDate)) {
//         console.warn(
//           `[ScoreCalc] Skipping invalid year calculation for ${year}`
//         );
//         continue;
//       }

//       const yearRange = getYearRange(yearDate);
//       let tasksForYear = [];
//       if (yearRange.start && yearRange.end) {
//         tasksForYear = tasks.filter(
//           (task) =>
//             task && task.dateFor && isDateInRange(task.dateFor, yearRange)
//         );
//       } else {
//         console.warn(`[ScoreCalc] Invalid year range calculated for ${year}`);
//       }

//       const completedForYear = tasksForYear.filter(
//         (task) => task && task.completed
//       ).length;
//       const score = calculatePercentage(completedForYear, tasksForYear.length);

//       if (i === 0 || tasksForYear.length > 0) {
//         pastYearsScores.push({ year, score });
//       }
//     }
//   } else {
//     console.error("[ScoreCalc] Could not get current year.");
//   }

//   const finalScores = {
//     daily: dailyScore,
//     weekly: weeklyScore,
//     monthly: monthlyScore,
//     yearly: yearlyScore,
//     pastYears: pastYearsScores,
//   };

//   return finalScores;
// };

// // DO NOT add 'export default' here for calculateScores
