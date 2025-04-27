// src/routes/taskRoutes.js
const express = require("express");
const Task = require("../models/Task"); // Import the Task model
const { Op } = require("sequelize"); // Import operators if needed for complex queries
const router = express.Router();

// Helper function for consistent error responses
const sendErrorResponse = (res, statusCode, message, error = null) => {
  // Log detailed error on the server for debugging
  console.error(
    `API Error (${statusCode}): ${message}`,
    error ? `\nDetails: ${JSON.stringify(error, null, 2)}` : ""
  );
  // Send a cleaner error message to the client
  res.status(statusCode).json({
    error: message,
    details: error?.errors ? error.errors.map((e) => e.message) : undefined,
  });
};

// ==========================================================================
// >>> THIS IS THE ROUTE HANDLER WHERE THE FETCH ERROR IS HAPPENING <<<
// ==========================================================================
router.get("/", async (req, res) => {
  // 'req' is available here
  const listId = req.query.listId;
  console.log(`[GET /api/tasks] Received request. Query Params:`, req.query);

  // 1. Check if listId was provided
  if (!listId) {
    console.warn(
      "[GET /api/tasks] Validation failed: Missing listId query parameter."
    );
    return sendErrorResponse(
      res,
      400,
      "Missing required query parameter: listId"
    );
  }

  // 2. Try to fetch tasks from the database
  try {
    console.log(
      `[GET /api/tasks] Attempting Task.findAll for listId: ${listId}...`
    );

    // --- This is the database query that is likely failing ---
    const tasks = await Task.findAll({
      where: { listId: listId }, // Filter by the provided listId
      order: [
        ["dateFor", "DESC"],
        ["startTime", "ASC"],
      ],
    });
    // --- If it gets past here, the query was successful ---

    console.log(
      `[GET /api/tasks] Task.findAll successful. Found ${tasks.length} tasks for listId: ${listId}.`
    );
    res.status(200).json(tasks);
    console.log(
      `[GET /api/tasks] Response sent successfully for listId: ${listId}.`
    );

    // 3. CATCH BLOCK: If Task.findAll fails, this code runs
  } catch (error) {
    console.error(
      `[GET /api/tasks] ERROR caught while fetching tasks for listId ${listId}:`,
      error.name,
      error.message
    );
    // Log the original database error if available (IMPORTANT for diagnosis)
    if (error.original) {
      console.error(
        `[GET /api/tasks] Original DB Error (listId: ${listId}):`,
        error.original
      );
    }
    // Send the 500 error response back to the frontend
    sendErrorResponse(
      res,
      500,
      `Failed to fetch tasks for listId ${listId}`,
      error
    );
    // --- END OF CATCH BLOCK ---
  }
});
// ==========================================================================
// >>> END OF THE RELEVANT ROUTE HANDLER <<<
// ==========================================================================

// --- POST /api/tasks --- (Create a new task)
router.post("/", async (req, res) => {
  console.log(
    "[POST /api/tasks] Received request. Body:",
    JSON.stringify(req.body, null, 2)
  );
  try {
    const { text, startTime, endTime, dateFor, listId } = req.body;
    if (!text || !startTime || !endTime || !dateFor || !listId) {
      console.warn(
        "[POST /api/tasks] Validation failed: Missing required fields."
      );
      return sendErrorResponse(
        res,
        400,
        "Missing required fields (text, startTime, endTime, dateFor, listId)"
      );
    }
    console.log("[POST /api/tasks] Basic validation passed.");
    console.log("[POST /api/tasks] Attempting Task.create with data:", {
      text,
      startTime,
      endTime,
      dateFor,
      listId,
      completed: false,
    });
    const newTask = await Task.create({
      text,
      startTime,
      endTime,
      dateFor,
      listId,
      completed: false,
    });
    console.log(
      "[POST /api/tasks] Task.create successful. New Task ID:",
      newTask.id
    );
    console.log("[POST /api/tasks] Full New Task:", newTask.toJSON());
    res.status(201).json(newTask);
    console.log("[POST /api/tasks] Response sent successfully.");
  } catch (error) {
    console.error(
      "[POST /api/tasks] ERROR caught in POST handler:",
      error.name,
      error.message
    );
    if (error.original) {
      console.error("[POST /api/tasks] Original DB Error:", error.original);
    }
    if (error.name === "SequelizeValidationError") {
      console.error(
        "[POST /api/tasks] Validation Errors:",
        error.errors.map((e) => e.message)
      );
      sendErrorResponse(
        res,
        400,
        "Validation failed. Please check input data.",
        error
      );
    } else {
      sendErrorResponse(res, 500, "Failed to add task to database", error);
    }
  }
});

// --- PUT /api/tasks/:id --- (Update a task)
router.put("/:id", async (req, res) => {
  const taskId = req.params.id;
  console.log(
    `[PUT /api/tasks/:id] Received request for ID: ${taskId}. Body:`,
    JSON.stringify(req.body, null, 2)
  );
  try {
    const { text, startTime, endTime, dateFor, listId, completed } = req.body;

    // Validate required fields
    if (text === undefined || startTime === undefined || endTime === undefined || dateFor === undefined || listId === undefined || completed === undefined) {
      return sendErrorResponse(
        res,
        400,
        "Missing required fields in request body"
      );
    }

    console.log(
      `[PUT /api/tasks/:id] Attempting Task.findByPk for ID: ${taskId}...`
    );
    const task = await Task.findByPk(taskId);

    if (!task) {
      return sendErrorResponse(
        res,
        404,
        `Task with ID ${taskId} not found`
      );
    }

    console.log(
      `[PUT /api/tasks/:id] Task found. Attempting task.save for ID: ${taskId}...`
    );

    // Update task fields
    task.text = text;
    task.startTime = startTime;
    task.endTime = endTime;
    task.dateFor = dateFor;
    task.listId = listId;
    task.completed = completed;

    await task.save();

    console.log(
      `[PUT /api/tasks/:id] task.save successful for ID: ${taskId}. Updated Task:`,
      task.toJSON()
    );
    res.status(200).json(task);
    console.log(
      `[PUT /api/tasks/:id] Response sent successfully for ID: ${taskId}.`
    );
  } catch (error) {
    console.error(
      `[PUT /api/tasks/:id] ERROR caught for ID: ${taskId}:`,
      error.name,
      error.message
    );
    if (error.original) {
      console.error(`[PUT /api/tasks/:id] Original DB Error:`, error.original);
    }
    if (error.name === "SequelizeValidationError") {
      return sendErrorResponse(
        res,
        400,
        "Validation failed during update",
        error
      );
    } else {
      sendErrorResponse(
        res,
        500,
        `Failed to update task with ID ${taskId}`,
        error
      );
    }
  }
});

// --- DELETE /api/tasks/:id --- (Delete a task)
router.delete("/:id", async (req, res) => {
  const taskId = req.params.id;
  console.log(`[DELETE /api/tasks/:id] Received request for ID: ${taskId}.`);
  try {
    console.log(
      `[DELETE /api/tasks/:id] Attempting Task.findByPk for ID: ${taskId}...`
    );
    const task = await Task.findByPk(taskId);
    if (!task) {
      /* ... not found ... */ return sendErrorResponse(
        res,
        404,
        `Task with ID ${taskId} not found`
      );
    }
    console.log(
      `[DELETE /api/tasks/:id] Task found. Attempting task.destroy for ID: ${taskId}...`
    );
    await task.destroy();
    console.log(
      `[DELETE /api/tasks/:id] task.destroy successful for ID: ${taskId}.`
    );
    res.status(200).json({ message: `Task ${taskId} deleted successfully` });
    console.log(
      `[DELETE /api/tasks/:id] Response sent successfully for ID: ${taskId}.`
    );
  } catch (error) {
    console.error(
      `[DELETE /api/tasks/:id] ERROR caught for ID: ${taskId}:`,
      error.name,
      error.message
    );
    if (error.original) {
      console.error(
        `[DELETE /api/tasks/:id] Original DB Error:`,
        error.original
      );
    }
    sendErrorResponse(
      res,
      500,
      `Failed to delete task with ID ${taskId}`,
      error
    );
  }
});

module.exports = router;
