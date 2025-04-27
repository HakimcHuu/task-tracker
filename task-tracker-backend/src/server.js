// backend/server.js
const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize"); // Import Sequelize and Operators
const sequelize = require("./config/database"); // Import Sequelize instance
const Task = require("./models/Task"); // Import the Task model

const app = express();
app.use(cors());
app.use(express.json());

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    return sequelize.sync({ alter: true }); // Synchronize the model with the database
  })
  .then(() => {
    console.log("Database synchronized.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/api/tasks", async (req, res) => {
  const { listId } = req.query;
  if (!listId) {
    return res.status(400).json({ error: "listId is required" });
  }
  try {
    console.log(`Fetching tasks for listId: ${listId}`);
    const tasks = await Task.findAll({ where: { listId } });
    console.log(`Fetched ${tasks.length} tasks:`, tasks);
    res.json(tasks);
  } catch (err) {
    console.error(`Error fetching tasks for listId ${listId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { text, startTime, endTime, dateFor, listId } = req.body;
  if (!text || !dateFor || !listId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    console.log("Inserting task:", req.body);
    const task = await Task.create({
      text,
      startTime,
      endTime,
      dateFor,
      listId,
    });
    console.log("Task inserted:", task.toJSON());
    res.json(task);
  } catch (err) {
    console.error("Error adding task:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { text, startTime, endTime, dateFor, listId, completed } = req.body;
  try {
    console.log(`Updating task ${id}:`, req.body);
    const task = await Task.findByPk(id);
    if (task) {
      await task.update({
        text,
        startTime,
        endTime,
        dateFor,
        listId,
        completed,
      });
      console.log("Task updated:", task.toJSON());
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (err) {
    console.error(`Error updating task ${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Deleting task ${id}`);
    const task = await Task.findByPk(id);
    if (task) {
      await task.destroy();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (err) {
    console.error(`Error deleting task ${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scores", async (req, res) => {
  const { listId, startDate, endDate } = req.query;
  if (!listId || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }
  try {
    console.log(
      `Fetching scores for listId ${listId}, ${startDate} to ${endDate}`
    );
    const tasks = await Task.findAll({
      where: {
        listId,
        dateFor: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const score = total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";
    console.log(
      `Scores: total=${total}, completed=${completed}, score=${score}`
    );
    res.json({ total, completed, score, tasks });
  } catch (err) {
    console.error(`Error fetching scores for listId ${listId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});
