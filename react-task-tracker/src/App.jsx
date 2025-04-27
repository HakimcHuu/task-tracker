import React, { useState, useEffect, useMemo } from "react";
import TaskView from "./components/TaskView";
import { DarkModeProvider, useDarkMode } from "./context/DarkModeContext";
import axios from "axios";
import { format, parseISO, addDays } from "date-fns";
import {
  formatTime,
  getWeekRange,
  getMonthRange,
  getYearRange,
} from "./utils/dateUtils";

const App = () => {
  const { darkMode, setDarkMode } = useDarkMode();
  const [listType, setListType] = useState("main");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("DAY");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskStartTime, setNewTaskStartTime] = useState("");
  const [newTaskEndTime, setNewTaskEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatDays, setRepeatDays] = useState(7);

  const range = useMemo(() => {
    if (mode === "WEEK") {
      return getWeekRange(selectedDate);
    } else if (mode === "MONTH") {
      return getMonthRange(selectedDate);
    } else if (mode === "YEAR") {
      return getYearRange(selectedDate);
    } else {
      return { start: selectedDate, end: selectedDate };
    }
  }, [mode, selectedDate]);

  const viewMode = mode;

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching tasks with params:", {
          listId: listType,
          startDate: range.start ? format(range.start, "yyyy-MM-dd") : "none",
          endDate: range.end ? format(range.end, "yyyy-MM-dd") : "none",
        });
        const response = await axios.get(`/api/tasks`, {
          params: {
            listId: listType,
            startDate: range.start
              ? format(range.start, "yyyy-MM-dd")
              : undefined,
            endDate: range.end ? format(range.end, "yyyy-MM-dd") : undefined,
          },
        });
        console.log("Fetched tasks:", response.data);
        setTasks(
          response.data.map((task) => ({
            ...task,
            dateFor: task.dateFor,
            createdAt: task.createdAt,
          }))
        );
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(
          err.response?.data?.error || err.message || "Failed to fetch tasks"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [listType, range.start, range.end]);

  const handleModeChange = (newMode) => {
    console.log("Changing mode to:", newMode);
    setMode(newMode);
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      alert("Task name is required");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    if (!newTaskStartTime || !newTaskEndTime) {
      alert("Start and end times are required");
      return;
    }
    try {
      setLoading(true);
      const tasksToCreate = [];
      const baseTask = {
        text: newTaskName,
        startTime: newTaskStartTime,
        endTime: newTaskEndTime,
        dateFor: format(selectedDate, "yyyy-MM-dd"),
        listId: listType,
        completed: false,
        isRepeating: isRepeating,
      };

      tasksToCreate.push(baseTask);

      if (isRepeating) {
        const numDays = parseInt(repeatDays, 10);
        if (isNaN(numDays) || numDays < 1) {
          alert("Please enter a valid number of days to repeat");
          return;
        }
        for (let i = 1; i < numDays; i++) {
          const nextDate = addDays(selectedDate, i);
          tasksToCreate.push({
            ...baseTask,
            dateFor: format(nextDate, "yyyy-MM-dd"),
          });
        }
      }

      console.log("Creating tasks:", tasksToCreate);
      const createdTasks = [];
      for (const task of tasksToCreate) {
        const response = await axios.post("/api/tasks", task);
        createdTasks.push({
          ...response.data,
          dateFor: response.data.dateFor,
          createdAt: response.data.createdAt,
        });
      }

      setTasks((prevTasks) => [...prevTasks, ...createdTasks]);
      setNewTaskName("");
      setNewTaskStartTime("");
      setNewTaskEndTime("");
      setIsRepeating(false);
      setRepeatDays(7);
    } catch (err) {
      console.error("Error adding task:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to add task"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      setLoading(true);
      console.log("Sending PUT request to update task:", {
        taskId,
        completed,
      });
      const response = await axios.put(`/api/tasks/${taskId}`, { completed });
      console.log("Task updated:", response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to update task"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      console.log("Deleting task:", taskId);
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to delete task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <TaskView
        listType={listType}
        tasks={tasks}
        loading={loading}
        error={error}
        mode={mode}
        handleModeChange={handleModeChange}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        newTaskName={newTaskName}
        setNewTaskName={setNewTaskName}
        newTaskStartTime={newTaskStartTime}
        setNewTaskStartTime={setNewTaskStartTime}
        newTaskEndTime={newTaskEndTime}
        setNewTaskEndTime={setNewTaskEndTime}
        handleAddTask={handleAddTask}
        toggleTaskCompletion={toggleTaskCompletion}
        deleteTask={deleteTask}
        viewMode={viewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        range={range}
        isRepeating={isRepeating}
        setIsRepeating={setIsRepeating}
        repeatDays={repeatDays}
        setRepeatDays={setRepeatDays}
      />
    </div>
  );
};

const AppWrapper = () => (
  <DarkModeProvider>
    <App />
  </DarkModeProvider>
);

export default AppWrapper;
