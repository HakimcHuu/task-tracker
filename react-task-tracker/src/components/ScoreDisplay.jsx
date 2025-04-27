// import React, { useEffect, useState } from "react";
// import { format } from "date-fns";
// import axios from "axios";
// import { formatTime } from "../utils/dateUtils";

// const ScoreDisplay = ({ tasks, range, viewMode, listId, refreshKey }) => {
//   const [scoreData, setScoreData] = useState({
//     total: 0,
//     completed: 0,
//     score: "0.00",
//     // tasks: [],
//   });
//   const [error, setError] = useState(null);

//   const calculateLocalScores = (tasks) => {
//     const total = tasks.length;
//     const completed = tasks.filter((task) => task.completed).length;
//     const score = total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";
//     return { total, completed, score, tasks };
//   };

//   const fetchScores = async () => {
//     try {
//       console.log(
//         `ScoreDisplay fetching scores for listId ${listId}, range: ${format(
//           range.start,
//           "yyyy-MM-dd"
//         )} to ${format(range.end, "yyyy-MM-dd")}`
//       );
//       const { data } = await axios.get("/api/scores", {
//         params: {
//           listId,
//           startDate: format(range.start, "yyyy-MM-dd"),
//           endDate: format(range.end, "yyyy-MM-dd"),
//         },
//       });
//       setScoreData({
//         total: data.total || 0,
//         completed: data.completed || 0,
//         score: data.score || "0.00",
//         // tasks: Array.isArray(data.tasks) ? data.tasks : [],
//       });
//       setError(null);
//       console.log("Fetched scores:", data);
//     } catch (err) {
//       console.error("Failed to fetch scores:", err);
//       setError(
//         `Failed to load scores: ${err.response?.data?.error || err.message}`
//       );
//       // Fallback to local calculation
//       setScoreData(calculateLocalScores(tasks));
//     }
//   };

//   useEffect(() => {
//     if (range.start && range.end) {
//       fetchScores();
//     } else {
//       // Use local tasks if range is invalid
//       setScoreData(calculateLocalScores(tasks));
//     }
//   }, [range, listId, tasks, refreshKey]);

//   if (error && scoreData.total === 0) {
//     return <div className="text-danger">{error}</div>;
//   }

//   return (
//     <div className="score-display">
//       <h3>{viewMode} Score</h3>
//       {range.start && range.end ? (
//         <p>
//           Period: {format(range.start, "MMM d, yyyy")} -{" "}
//           {format(range.end, "MMM d, yyyy")}
//         </p>
//       ) : (
//         <p>Invalid date range</p>
//       )}
//       <p>Total Tasks: {scoreData.total}</p>
//       <p>Completed Tasks: {scoreData.completed}</p>
//       <p>Score: {scoreData.score}%</p>
//       <div className="progress">
//         <div
//           className="progress-bar"
//           style={{ width: `${scoreData.score}%` }}
//           role="progressbar"
//           aria-valuenow={scoreData.score}
//           aria-valuemin="0"
//           aria-valuemax="100"
//         ></div>
//       </div>
//       {/* {scoreData.tasks &&
//       scoreData.tasks.length > 0 &&
//       scoreData.tasks.some((task) => task.completed) ? (
//         <ul className="list-unstyled mt-3">
//           {scoreData.tasks
//             .filter((task) => task.completed)
//             .map((task) => (
//               <li key={task.id}>
//                 {task.name || task.text} (
//                 {format(new Date(task.dateFor), "MMM d, yyyy")}{" "}
//                 {formatTime(task.startTime)} - {formatTime(task.endTime)})
//               </li>
//             ))}
//         </ul>
//       ) : (
//         <p>No completed tasks in this period.</p>
//       )} */}
//     </div>
//   );
// };

// export default ScoreDisplay;

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";

const ScoreDisplay = ({ tasks, range, viewMode, listId, refreshKey }) => {
  const [scoreData, setScoreData] = useState({
    total: 0,
    completed: 0,
    score: "0.00",
  });
  const [error, setError] = useState(null);

  const calculateLocalScores = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const score = total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";
    return { total, completed, score };
  };

  const fetchScores = async () => {
    try {
      console.log(
        `ScoreDisplay fetching scores for listId ${listId}, range: ${format(
          range.start,
          "yyyy-MM-dd"
        )} to ${format(range.end, "yyyy-MM-dd")}`
      );
      const { data } = await axios.get("/api/scores", {
        params: {
          listId,
          startDate: format(range.start, "yyyy-MM-dd"),
          endDate: format(range.end, "yyyy-MM-dd"),
        },
      });
      setScoreData({
        total: data.total || 0,
        completed: data.completed || 0,
        score: data.score || "0.00",
      });
      setError(null);
      console.log("Fetched scores:", data);
    } catch (err) {
      console.error("Failed to fetch scores:", err);
      setError(
        `Failed to load scores: ${err.response?.data?.error || err.message}`
      );
      // Fallback to local calculation
      setScoreData(calculateLocalScores(tasks));
    }
  };

  useEffect(() => {
    if (range.start && range.end) {
      fetchScores();
    } else {
      // Use local tasks if range is invalid
      setScoreData(calculateLocalScores(tasks));
    }
  }, [range, listId, tasks, refreshKey]);

  if (error && scoreData.total === 0) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <div className="score-display">
      <h3>{viewMode} Score</h3>
      {range.start && range.end ? (
        <p>
          Period: {format(range.start, "MMM d, yyyy")} -{" "}
          {format(range.end, "MMM d, yyyy")}
        </p>
      ) : (
        <p>Invalid date range</p>
      )}
      <p>Total Tasks: {scoreData.total}</p>
      <p>Completed Tasks: {scoreData.completed}</p>
      <p>Score: {scoreData.score}%</p>
      <div className="progress">
        <div
          className="progress-bar"
          style={{ width: `${scoreData.score}%` }}
          role="progressbar"
          aria-valuenow={scoreData.score}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default ScoreDisplay;