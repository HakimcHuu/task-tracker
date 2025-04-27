// src/components/TaskTrackerMain.jsx
// This component remains the same, it just displays based on props.
import React from "react";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import ScoreDisplay from "./ScoreDisplay";

function TaskTrackerMain({
  tasks,
  loading,
  error,
  processingState,
  addTask,
  toggleComplete,
  deleteTask,
  handleCopyTask,
  showScores,
  setShowScores,
}) {
  return (
    <>
      <h1>Task Tracker</h1>{" "}
      {/* You could make this dynamic based on listId later */}
      {error && <p className="error-message">Error: {error}</p>}
      <TaskForm
        onAddTask={addTask}
        isSubmitting={processingState.isSubmitting}
      />
      <hr />
      <button
        className="btn btn-secondary results-button"
        onClick={() => setShowScores(!showScores)}
        disabled={loading}
      >
        {showScores ? "Hide Results" : "Show Results"}
      </button>
      {showScores && !loading && <ScoreDisplay tasks={tasks} />}
      {showScores && loading && (
        <p className="loading-message">Loading scores...</p>
      )}
      <hr />
      {loading && <p className="loading-message">Loading tasks...</p>}
      {!loading && tasks.length > 0 && (
        <TaskList
          tasks={tasks.map((task) => ({
            ...task,
            _isUpdating:
              processingState.taskId === task.id && processingState.isUpdating,
            _isDeleting:
              processingState.taskId === task.id && processingState.isDeleting,
          }))}
          onToggleComplete={toggleComplete}
          onDeleteTask={deleteTask}
          onCopyTask={handleCopyTask}
        />
      )}
      {!loading && tasks.length === 0 && !error && (
        <p className="info-message">No tasks found for this list.</p>
      )}
    </>
  );
}
export default TaskTrackerMain;
