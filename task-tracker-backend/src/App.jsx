import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="container">
      <header>
        <h1>Task Tracker Backend</h1>
        <p>The backend server is running. API endpoints are available at:</p>
        <ul>
          <li><code>/api/tasks</code> - GET, POST, PUT, DELETE operations for tasks</li>
          <li><code>/api/scores</code> - GET operation for task scores</li>
        </ul>
        <p>To use the frontend application, please run the React frontend application.</p>
      </header>
    </div>
  );
}

export default App;
