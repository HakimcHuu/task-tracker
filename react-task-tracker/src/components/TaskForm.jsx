// // src/components/TaskForm.jsx
// import React, { useState, useEffect } from "react";
// import { formatDateKey } from "../utils/dateUtils";

// function TaskForm({ onAddTask, isSubmitting }) {
//   const [taskText, setTaskText] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [dateFor, setDateFor] = useState(() => {
//     try {
//       const initialDate = formatDateKey(new Date());
//       return initialDate || new Date().toISOString().split("T")[0];
//     } catch (error) {
//       console.error("Error initializing dateFor state in TaskForm:", error);
//       return new Date().toISOString().split("T")[0];
//     }
//   });

//   useEffect(() => {
//     if (!dateFor || dateFor === "invalid-date" || dateFor === "") {
//       console.warn(
//         "TaskForm dateFor state was invalid, resetting to current date."
//       );
//       setDateFor(new Date().toISOString().split("T")[0]);
//     }
//   }, [dateFor]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (isSubmitting) return;

//     if (!taskText.trim() || !dateFor || !startTime || !endTime) {
//       alert("Please fill in all fields: Task, Date, Start Time, and End Time.");
//       return;
//     }
//     if (startTime >= endTime) {
//       alert("End time must be after start time.");
//       return;
//     }
//     const formattedStartTime =
//       startTime.length === 5 ? `${startTime}:00` : startTime;
//     const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;
//     const newTaskData = {
//       text: taskText.trim(),
//       startTime: formattedStartTime,
//       endTime: formattedEndTime,
//       dateFor: dateFor,
//     };
//     onAddTask(newTaskData);
//     // Reset only text/time after attempting add
//     setTaskText("");
//     setStartTime("");
//     setEndTime("");
//   };

//   return (
//     <form onSubmit={handleSubmit} className="task-form">
//       <h3>Add New Task</h3>
//       <div>
//         <label htmlFor="taskText">Task:</label>
//         <input
//           type="text"
//           id="taskText"
//           value={taskText}
//           onChange={(e) => setTaskText(e.target.value)}
//           placeholder="Enter task description"
//           required
//           disabled={isSubmitting}
//         />
//       </div>
//       <div>
//         <label htmlFor="dateFor">Date:</label>
//         <input
//           type="date"
//           id="dateFor"
//           value={dateFor}
//           onChange={(e) => setDateFor(e.target.value)}
//           required
//           disabled={isSubmitting}
//         />
//       </div>
//       <div>
//         <label htmlFor="startTime">Start Time:</label>
//         <input
//           type="time"
//           id="startTime"
//           value={startTime}
//           onChange={(e) => setStartTime(e.target.value)}
//           required
//           step="1" // Allows seconds
//           disabled={isSubmitting}
//         />
//       </div>
//       <div>
//         <label htmlFor="endTime">End Time:</label>
//         <input
//           type="time"
//           id="endTime"
//           value={endTime}
//           onChange={(e) => setEndTime(e.target.value)}
//           required
//           step="1" // Allows seconds
//           disabled={isSubmitting}
//         />
//       </div>
//       {/* Use general btn classes */}
//       <button type="submit" className="btn btn-success" disabled={isSubmitting}>
//         {isSubmitting ? "Adding..." : "Add Task"}
//       </button>
//     </form>
//   );
// }

// export default TaskForm;
