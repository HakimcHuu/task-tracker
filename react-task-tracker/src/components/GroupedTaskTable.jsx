import React, { useMemo, useState } from "react";
import { format, isToday, isPast, isFuture, isSameMonth } from "date-fns";
import { formatTime } from "../utils/dateUtils";

const GroupedTaskTable = ({
  tasks,
  toggleTaskCompletion,
  handleEditTask,
  deleteTask,
}) => {
  const today = new Date();
  const [editTaskId, setEditTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  const currentMonthTasks = useMemo(() => {
    return tasks.filter(task => isSameMonth(new Date(task.dateFor), today));
  }, [tasks, today]);

  const pastDaysTasks = useMemo(() => {
    return currentMonthTasks
      .filter(
        (task) =>
          isPast(new Date(task.dateFor)) && !isToday(new Date(task.dateFor))
      )
      .sort((a, b) => new Date(a.dateFor) - new Date(b.dateFor));
  }, [currentMonthTasks, today]);

  const todayTasks = useMemo(() => {
    return currentMonthTasks
      .filter((task) => isToday(new Date(task.dateFor)))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [currentMonthTasks]);

  const upcomingDaysTasks = useMemo(() => {
    return currentMonthTasks
      .filter((task) => isFuture(new Date(task.dateFor)))
      .sort((a, b) => new Date(a.dateFor) - new Date(b.dateFor));
  }, [currentMonthTasks, today]);

  const futureMonthsTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          !isSameMonth(new Date(task.dateFor), today) &&
          isFuture(new Date(task.dateFor))
      )
      .sort((a, b) => new Date(a.dateFor) - new Date(b.dateFor));
  }, [tasks, today]);

  const startEditing = (task) => {
    setEditTaskId(task.id);
    setEditedTaskData({
      name: task.name,
      startTime: task.startTime,
      endTime: task.endTime,
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTaskData({ name: "", startTime: "", endTime: "" });
  };

  const saveEditedTask = (id) => {
    handleEditTask(id, editedTaskData);
    setEditingTaskId(null);
    setEditedTaskData({ name: "", startTime: "", endTime: "" });
  };

  const renderTaskRow = (task) => {
    const isEditing = editTaskId === task.id;

    return (
      <tr key={task.id}>
        <td>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedTaskData.name}
              onChange={handleFormChange}
              className="form-control"
            />
          ) : (
            task.name
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="time"
              name="startTime"
              value={editedTaskData.startTime}
              onChange={handleFormChange}
              className="form-control"
            />
          ) : (
            formatTime(task.startTime) || "N/A"
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="time"
              name="endTime"
              value={editedTaskData.endTime}
              onChange={handleFormChange}
              className="form-control"
            />
          ) : (
            formatTime(task.endTime) || "N/A"
          )}
        </td>
        <td>{format(new Date(task.dateFor), "MMM d, yyyy")}</td>
        <td>{format(new Date(task.createdAt), "MMM d, yyyy h:mm a")}</td>
        <td>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task.id)}
          />
        </td>
        <td>
          {isEditing ? (
            <button
              className="btn btn-success btn-sm me-2"
              onClick={() => saveEditedTask(task.id)}
            >
              Save
            </button>
          ) : (
            <button
              className="btn btn-warning btn-sm me-2"
              onClick={() => handleEditClick(task)}
            >
              Edit
            </button>
          )}
        </td>
        <td>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => deleteTask(task.id)}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Date</th>
          <th>Created</th>
          <th>Completed</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {/* Render Tasks */}
        {todayTasks.length > 0 && (
          <>
            <tr>
              <th colSpan="8">Today's Tasks</th>
            </tr>
            {todayTasks.map(renderTaskRow)}
          </>
        )}
        {pastDaysTasks.length > 0 && (
          <>
            <tr>
              <th colSpan="8">Past Days</th>
            </tr>
            {pastDaysTasks.map(renderTaskRow)}
          </>
        )}
        {upcomingDaysTasks.length > 0 && (
          <>
            <tr>
              <th colSpan="8">Upcoming Days</th>
            </tr>
            {upcomingDaysTasks.map(renderTaskRow)}
          </>
        )}
        {futureMonthsTasks.length > 0 && (
          <>
            <tr>
              <th colSpan="8">Future Months</th>
            </tr>
            {futureMonthsTasks.map(renderTaskRow)}
          </>
        )}
      </tbody>
    </table>
  );
};

export default GroupedTaskTable;
