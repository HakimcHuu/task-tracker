import React, { useState, useMemo, useEffect, useRef } from "react";
import ScoreDisplay from "./ScoreDisplay";
import {
  format,
  parse,
  isValid,
  parseISO,
  startOfDay,
  compareAsc,
} from "date-fns";
import axios from "axios";
import { formatTime } from "../utils/dateUtils";
import { useDarkMode } from "../context/DarkModeContext";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  if (hasError) {
    return (
      <div className="text-danger">
        <p>Error: {error?.message || "Unknown error"}</p>
        <p>Please try again or contact support.</p>
      </div>
    );
  }

  return children;
};

const TaskView = ({
  listType,
  tasks,
  loading,
  error,
  mode,
  handleModeChange,
  newTaskName,
  setNewTaskName,
  newTaskStartTime,
  setNewTaskStartTime,
  newTaskEndTime,
  setNewTaskEndTime,
  handleAddTask,
  toggleTaskCompletion,
  deleteTask,
  viewMode,
  selectedDate,
  setSelectedDate,
  range,
  isRepeating,
  setIsRepeating,
  repeatDays,
  setRepeatDays,
}) => {
  const { darkMode, setDarkMode } = useDarkMode();
  const [showScores, setShowScores] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [completionFilter, setCompletionFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState("");
  const [toastPosition, setToastPosition] = useState({ top: 0, left: 0 });
  const [toastType, setToastType] = useState("");
  const taskRefs = useRef({});

  const toggleDarkMode = () => {
    console.log(
      "Toggling dark mode: Current state =",
      darkMode,
      "New state =",
      !darkMode
    );
    setDarkMode((prevDarkMode) => !prevDarkMode);
  };

  const formatDateDisplay = (date) => {
    if (!date) {
      return "None";
    }
    try {
      return format(date, "EEEE, MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (mode === "WEEK" || mode === "MONTH" || mode === "YEAR") {
      const taskMap = new Map();
      filtered.forEach((task) => {
        if (!taskMap.has(task.text)) {
          taskMap.set(task.text, {
            text: task.text,
            startTime: task.startTime,
            endTime: task.endTime,
            dateFor: task.dateFor,
            createdAt: task.createdAt,
            completed: task.completed,
            isRepeating: task.isRepeating,
            id: task.id,
            timesCompleted: task.completed ? 1 : 0,
            instances: [task],
          });
        } else {
          const existing = taskMap.get(task.text);
          existing.timesCompleted += task.completed ? 1 : 0;
          existing.instances.push(task);
          if (new Date(task.dateFor) < new Date(existing.dateFor)) {
            existing.dateFor = task.dateFor;
          }
          if (new Date(task.createdAt) < new Date(existing.createdAt)) {
            existing.createdAt = task.createdAt;
          }
          existing.completed = existing.completed || task.completed;
          existing.isRepeating = existing.isRepeating || task.isRepeating;
        }
      });

      filtered = Array.from(taskMap.values());

      console.log(
        "Aggregated tasks:",
        filtered.map((t) => ({
          text: t.text,
          timesCompleted: t.timesCompleted,
          instances: t.instances.length,
        }))
      );
    } else if (mode === "DAY" && selectedDate) {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
      filtered = tasks.filter((task) => task.dateFor === selectedDateStr);
    }

    switch (completionFilter) {
      case "Completed":
        filtered = filtered.filter((task) => task.completed);
        break;
      case "Incomplete":
        filtered = filtered.filter((task) => !task.completed);
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => {
      if (mode === "DAY") {
        const dateA = new Date(a.dateFor);
        const dateB = new Date(b.dateFor);
        const dateCompare = compareAsc(dateA, dateB);
        if (dateCompare !== 0) {
          return dateCompare;
        }
        const timeA = a.startTime || "23:59";
        const timeB = b.startTime || "23:59";
        return timeA.localeCompare(timeB);
      } else {
        if (a.timesCompleted !== b.timesCompleted) {
          return b.timesCompleted - a.timesCompleted;
        }
        return a.text.localeCompare(b.text);
      }
    });
  }, [tasks, completionFilter, mode, selectedDate]);

  const isFutureDate = (dateFor) => {
    try {
      const taskDate = startOfDay(new Date(dateFor));
      const today = startOfDay(new Date());
      const isFuture = taskDate > today;
      console.log(
        `isFutureDate: ${dateFor} -> ${isFuture} (taskDate: ${taskDate}, today: ${today})`
      );
      return isFuture;
    } catch (e) {
      console.error("Error checking future date:", e);
      return false;
    }
  };

  const handleCheckboxClick = (task, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Checkbox clicked:", {
      taskName: task.text,
      taskId: task.id,
      dateFor: task.dateFor,
      isFuture: isFutureDate(task.dateFor),
      completed: task.completed,
    });

    if (!task.id) {
      console.error("Task ID missing:", task);
      setToastMessage("Error: Task ID is missing. Please try again.");
      setToastType("error");
      setTimeout(() => {
        setToastMessage("");
        setToastType("");
      }, 3000);
      return;
    }

    if (isFutureDate(task.dateFor)) {
      const alertMessage = `Cannot mark "${
        task.text
      }" as complete until its date: ${format(
        new Date(task.dateFor),
        "MMMM d, yyyy"
      )}.`;
      console.log("Showing toast:", alertMessage);

      const taskRow = taskRefs.current[task.id];
      let top = 0;
      let left = 0;
      if (taskRow) {
        const rect = taskRow.getBoundingClientRect();
        top = rect.top + window.scrollY + rect.height;
        left = rect.left + window.scrollX;
      } else {
        top = window.innerHeight - 100;
        left = window.innerWidth - 300;
      }

      setToastPosition({ top, left });
      setToastMessage(alertMessage);
      setToastType("error");

      setTimeout(() => {
        setToastMessage("");
        setToastPosition({ top: 0, left: 0 });
        setToastType("");
      }, 3000);
    } else {
      console.log(
        "Toggling completion for task:",
        task.id,
        "to",
        !task.completed
      );
      toggleTaskCompletion(task.id, !task.completed);
    }
  };

  console.log("TaskView rendered with:", {
    tasks: filteredTasks,
    loading,
    error,
    selectedDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "none",
    darkMode,
    tableClass: darkMode ? "table-dark" : "table-light",
  });

  const parseTime = (time) => {
    if (!time) return "";
    try {
      const parsed = parse(time, "HH:mm", new Date());
      return format(parsed, "HH:mm");
    } catch {
      return time;
    }
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setEditName(task.text);
    setEditStartTime(task.startTime || "");
    setEditEndTime(task.endTime || "");
  };

  const saveEditTask = async () => {
    if (!editName.trim() || !editStartTime || !editEndTime) {
      setToastMessage("Please provide task name, start time, and end time.");
      setToastType("error");
      setTimeout(() => {
        setToastMessage("");
        setToastType("");
      }, 3000);
      return;
    }
    try {
      console.log("Saving edited task:", {
        id: editTask.id,
        text: editName,
        startTime: editStartTime,
        endTime: editEndTime,
      });
      await axios.put(`/api/tasks/${editTask.id}`, {
        text: editName,
        startTime: parseTime(editStartTime),
        endTime: parseTime(editEndTime),
        dateFor: editTask.dateFor,
        listId: editTask.listType,
        completed: editTask.completed,
        isRepeating: editTask.isRepeating,
      });
      setEditTask(null);
      toggleTaskCompletion(editTask.id, editTask.completed);
    } catch (err) {
      console.error("Error updating task:", err);
      setToastMessage(
        "Failed to update task: " + (err.response?.data?.error || err.message)
      );
      setToastType("error");
      setTimeout(() => {
        setToastMessage("");
        setToastType("");
      }, 3000);
    }
  };

  const exportScores = async () => {
    try {
      const { data } = await axios.get("/api/scores", {
        params: {
          listId: listType,
          startDate: format(range.start, "yyyy-MM-dd"),
          endDate: format(range.end, "yyyy-MM-dd"),
          maxDate: format(new Date(), "yyyy-MM-dd"),
        },
      });
      const csv = `Period,Total Tasks,Completed Tasks,Score (%)\n${viewMode},${data.total},${data.completed},${data.score}`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${viewMode}_scores.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToastMessage(
        "Failed to export scores: " + (err.response?.data?.error || err.message)
      );
      setToastType("error");
      setTimeout(() => {
        setToastMessage("");
        setToastType("");
      }, 3000);
    }
  };

  return (
    <ErrorBoundary>
      <div className="task-view">
        <button
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        />
        <h2>{listType} Task List</h2>
        <p>Selected Date for Tasks: {formatDateDisplay(selectedDate)}</p>

        <div className="mb-3 task-form">
          <input
            type="date"
            className="form-control d-inline-block w-auto me-2"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const newDate = e.target.value ? parseISO(e.target.value) : null;
              console.log(
                "Date picker changed to:",
                newDate ? newDate.toISOString() : "null"
              );
              setSelectedDate(newDate);
            }}
            aria-label="Select date for task"
          />
          <input
            type="text"
            className="form-control d-inline-block w-auto me-2"
            placeholder="Add new task"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            aria-label="New task name"
          />
          <input
            type="time"
            className="form-control d-inline-block w-auto me-2"
            value={newTaskStartTime}
            onChange={(e) => setNewTaskStartTime(e.target.value)}
            aria-label="Start time"
            step="300"
          />
          <input
            type="time"
            className="form-control d-inline-block w-auto me-2"
            value={newTaskEndTime}
            onChange={(e) => setNewTaskEndTime(e.target.value)}
            aria-label="End time"
            step="300"
          />
          <label className="me-2 repeat-checkbox">
            <input
              type="checkbox"
              checked={isRepeating}
              onChange={(e) => setIsRepeating(e.target.checked)}
              aria-label="Repeat task daily"
            />
            Repeat Daily
          </label>
          {isRepeating && (
            <input
              type="number"
              className="form-control d-inline-block w-auto me-2"
              value={repeatDays}
              onChange={(e) => setRepeatDays(e.target.value)}
              min="1"
              placeholder="Days to repeat"
              aria-label="Number of days to repeat"
            />
          )}
          <button className="btn btn-primary btn-sm" onClick={handleAddTask}>
            Add Task
          </button>
        </div>

        <div className="mb-3">
          <label className="me-2">View Mode:</label>
          {["DAY", "WEEK", "MONTH", "YEAR"].map((m) => (
            <button
              key={m}
              className={`btn btn-sm ${
                mode === m ? "btn-primary" : "btn-outline-secondary"
              } me-1`}
              onClick={() => handleModeChange(m)}
              disabled={mode === m}
              aria-label={`Switch to ${m.toLowerCase()} view`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <button
            className="btn btn-secondary me-2"
            onClick={() => setShowScores(!showScores)}
            disabled={loading}
          >
            {showScores ? "Hide Scores" : "Show Scores"}
          </button>
          {showScores && (
            <button className="btn btn-info" onClick={exportScores}>
              Export Scores
            </button>
          )}
        </div>

        {showScores && !loading && (
          <ErrorBoundary>
            <ScoreDisplay
              tasks={filteredTasks}
              range={range}
              viewMode={viewMode}
              listId={listType}
            />
          </ErrorBoundary>
        )}
        {showScores && loading && <p>Loading scores...</p>}

        <div className="mb-3">
          <label className="me-2">Filter Tasks:</label>
          {[
            { name: "All", class: "btn-primary" },
            { name: "Completed", class: "btn-success", icon: "✅" },
            { name: "Incomplete", class: "btn-danger", icon: "⚠️" },
          ].map((filter) => (
            <button
              key={filter.name}
              className={`btn btn-sm ${
                completionFilter === filter.name
                  ? filter.class
                  : `btn-outline-${filter.class.split("-")[1]}`
              } me-1`}
              onClick={() => setCompletionFilter(filter.name)}
              disabled={completionFilter === filter.name}
              aria-label={`Filter tasks by ${filter.name.toLowerCase()} status`}
            >
              {filter.icon ? `${filter.icon} ${filter.name}` : filter.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="text-danger">Error loading tasks</p>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks to display.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className={darkMode ? "table-dark" : "table-light"}>
                <tr>
                  <th scope="col">Checkbox</th>
                  <th scope="col">Task Name</th>
                  <th scope="col">Start Time</th>
                  <th scope="col">End Time</th>
                  <th scope="col">Date</th>
                  <th scope="col">Created</th>
                  <th scope="col">Completed</th>
                  {mode !== "DAY" && <th scope="col">Times Completed</th>}
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const dateFor = new Date(task.dateFor);
                  const createdAt = new Date(task.createdAt);
                  const isValidDateFor = isValid(dateFor);
                  const isValidCreatedAt = isValid(createdAt);
                  const isFuture = isFutureDate(task.dateFor);
                  console.log("Rendering task:", {
                    id: task.id,
                    text: task.text,
                    startTime: task.startTime,
                    endTime: task.endTime,
                    dateFor: task.dateFor,
                    createdAt: task.createdAt,
                    completed: task.completed,
                    isRepeating: task.isRepeating,
                    isFuture,
                    timesCompleted: task.timesCompleted,
                  });
                  return (
                    <tr
                      key={task.id}
                      ref={(el) => (taskRefs.current[task.id] = el)}
                    >
                      <td>
                        <label
                          onClick={(e) => handleCheckboxClick(task, e)}
                          style={{
                            cursor: isFuture ? "not-allowed" : "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            disabled={isFuture}
                            aria-label={
                              isFuture
                                ? `Cannot mark ${
                                    task.text
                                  } as complete until ${format(
                                    dateFor,
                                    "MMM d, yyyy"
                                  )}`
                                : `Mark ${task.text} as ${
                                    task.completed ? "incomplete" : "complete"
                                  }`
                            }
                          />
                        </label>
                      </td>
                      <td
                        className={
                          task.completed ? "text-decoration-line-through" : ""
                        }
                      >
                        {task.isRepeating && (
                          <span className="repeat-icon">📅 </span>
                        )}
                        {task.text || "Unnamed Task"}
                      </td>
                      <td>{formatTime(task.startTime) || "N/A"}</td>
                      <td>{formatTime(task.endTime) || "N/A"}</td>
                      <td className="date-column">
                        {isValidDateFor
                          ? format(dateFor, "EEEE, MMMM d, yyyy")
                          : "Invalid Date"}
                      </td>
                      <td className="created-column">
                        {isValidCreatedAt
                          ? format(createdAt, "EEEE, MMMM d, yyyy")
                          : "Invalid Date"}
                      </td>
                      <td
                        className="completed-column"
                        aria-label={
                          task.completed ? "Completed" : "Not Completed"
                        }
                      >
                        {task.completed ? "✅" : "❌"}
                      </td>
                      {mode !== "DAY" && (
                        <td className="times-completed-column">
                          {task.timesCompleted || 0}
                        </td>
                      )}
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditTask(task)}
                          aria-label={`Edit task ${task.text}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete task ${task.text}`}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {editTask && (
          <div
            className="modal"
            style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Edit Task</h5>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Task name"
                  />
                  <input
                    type="time"
                    className="form-control mb-2"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    step="300"
                  />
                  <input
                    type="time"
                    className="form-control mb-2"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    step="300"
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={saveEditTask}>
                    Save
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditTask(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toastMessage && (
          <div
            className={`toast show ${
              toastType === "error" ? "toast-error" : ""
            }`}
            role="alert"
            style={{
              position: "absolute",
              top: `${toastPosition.top}px`,
              left: `${toastPosition.left}px`,
              zIndex: 1050,
              minWidth: "200px",
            }}
          >
            <div className="toast-body">
              {toastMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setToastMessage("")}
              ></button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TaskView;
