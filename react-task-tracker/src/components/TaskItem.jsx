import React, { useState, useMemo, useEffect } from "react";
import ScoreDisplay from "./ScoreDisplay";
import { format, parse, isValid, parseISO } from "date-fns";
import axios from "axios";
import { formatTime } from "../utils/dateUtils";

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
  darkMode,
  setDarkMode,
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
}) => {
  const [showScores, setShowScores] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [completionFilter, setCompletionFilter] = useState("All");

  const toggleDarkMode = () => {
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
    switch (completionFilter) {
      case "Completed":
        return tasks.filter((task) => task.completed);
      case "Incomplete":
        return tasks.filter((task) => !task.completed);
      default:
        return tasks;
    }
  }, [tasks, completionFilter]);

  console.log("TaskView rendered with tasks:", tasks);
  console.log("TaskView loading:", loading);
  console.log("TaskView error:", error);
  console.log("TaskView selectedDate:", selectedDate);
  console.log("TaskView form state:", {
    newTaskName,
    newTaskStartTime,
    newTaskEndTime,
    showScores,
  });

  const parseTime = (time) => {
    if (!time) return "";
    try {
      const parsed = parse(time, "h:mm a", new Date());
      return format(parsed, "HH:mm");
    } catch {
      return time;
    }
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setEditName(task.name);
    setEditStartTime(parseTime(formatTime(task.startTime)));
    setEditEndTime(parseTime(formatTime(task.endTime)));
  };

  const saveEditTask = async () => {
    if (!editName.trim() || !editStartTime || !editEndTime) {
      alert("Please provide task name, start time, and end time.");
      return;
    }
    try {
      await axios.put(`/api/tasks/${editTask.id}`, {
        text: editName,
        startTime: parseTime(editStartTime),
        endTime: parseTime(editEndTime),
        dateFor: editTask.dateFor,
        listId: editTask.listType,
        completed: editTask.completed,
      });
      setEditTask(null);
      toggleTaskCompletion(editTask.id, editTask.completed); // Trigger refresh
    } catch (err) {
      alert(
        "Failed to update task: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const exportScores = async () => {
    try {
      const { data } = await axios.get("/api/scores", {
        params: {
          listId: listType,
          startDate: format(range.start, "yyyy-MM-dd"),
          endDate: format(range.end, "yyyy-MM-dd"),
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
      alert(
        "Failed to export scores: " + (err.response?.data?.error || err.message)
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="task-view">
        <h2>{listType} Task List</h2>
        <p>Selected Date for Tasks: {formatDateDisplay(selectedDate)}</p>

        {/* Task Addition Form */}
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
        <label className="ms-3">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            aria-label="Toggle dark mode"
          />
          Dark Mode
        </label>

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
          {["All", "Completed", "Incomplete"].map((filter) => (
            <button
              key={filter}
              className={`btn btn-sm ${
                completionFilter === filter
                  ? "btn-primary"
                  : "btn-outline-secondary"
              } me-1`}
              onClick={() => setCompletionFilter(filter)}
              disabled={completionFilter === filter}
              aria-label={`Filter tasks by ${filter.toLowerCase()} status`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks to display.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className={darkMode ? "table-dark" : "table-light"}>
                <tr>
                  <th scope="col">Checkbox</th>
                  <th scope="col">Task Name</th>
                  <th scope="col">Start Time</th>
                  <th scope="col">End Time</th>
                  <th scope="col">Date</th>
                  <th scope="col">Created</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const dateFor = new Date(task.dateFor);
                  const createdAt = new Date(task.createdAt);
                  const isValidDateFor = isValid(dateFor);
                  const isValidCreatedAt = isValid(createdAt);
                  console.log("Rendering task:", {
                    id: task.id,
                    name: task.name,
                    startTime: task.startTime,
                    endTime: task.endTime,
                    dateFor: task.dateFor,
                    createdAt: task.createdAt,
                    completed: task.completed,
                  });
                  return (
                    <tr key={task.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            console.log(
                              "Toggling task:",
                              task.id,
                              "to",
                              e.target.checked
                            );
                            toggleTaskCompletion(task.id, e.target.checked);
                          }}
                          aria-label={`Mark ${task.name} as ${
                            task.completed ? "incomplete" : "complete"
                          }`}
                        />
                      </td>
                      <td
                        className={
                          task.completed ? "text-decoration-line-through" : ""
                        }
                      >
                        {task.name}
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
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditTask(task)}
                          aria-label={`Edit task ${task.name}`}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete task ${task.name}`}
                        >
                          Delete
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
      </div>
    </ErrorBoundary>
  );
};

export default TaskView;
