// src/components/TaskList.jsx
import React, { useState } from "react";
import TaskItem from "./TaskItem";
import { formatDate } from "../utils/dateUtils";
import { isToday, isSameDay, format } from "date-fns";

function TaskList({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onCopyTask,
  viewMode,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTasks, setShowTasks] = useState(false);

  const uniqueDates = [...new Set(tasks.map((task) => task.dateFor))].sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const handleDateClick = (date) => {
    setSelectedDate(new Date(date));
    setShowTasks(false);
  };

  const handleShowTasksClick = () => {
    setShowTasks(true);
  };

  const filteredTasks = tasks.filter((task) =>
    showTasks && selectedDate ? isSameDay(new Date(task.dateFor), selectedDate) : false
  );

  const renderTaskGroup = (tasksToRender) => {
    if (!tasksToRender || tasksToRender.length === 0) {
      return <p>No tasks for this day.</p>;
    }

    return (
      <ul className="task-list">
        {tasksToRender.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            onCopyTask={onCopyTask}
            isUpdating={task._isUpdating}
            isDeleting={isDeleting}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="task-list-container">
      <h2>Tasks</h2>
      <div className="date-buttons">
        {uniqueDates.map((date) => (
          <button
            key={date}
            onClick={() => handleDateClick(date)}
            className={`date-button ${
              isToday(new Date(date)) ? "today" : ""
            } ${selectedDate && isSameDay(new Date(date), selectedDate) ? "selected" : ""}`}
          >
            {format(new Date(date), "EEEE MMMM d, yyyy")}
          </button>
        ))}
      </div>
      <button onClick={handleShowTasksClick} disabled={!selectedDate}>Show Tasks</button>
      <div>
        <button>All</button>
        <button>Completed</button>
        <button>Incomplete</button>
      </div>
      {showTasks && renderTaskGroup(filteredTasks)}
    </div>
  );
}

export default TaskList;
