import { useState, useEffect } from "react";
import "./App.css";

// Use the dynamic API URL from Vite config
const API_URL = __API_URL__;

function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Example: Fetch health data from API
    fetch(`${API_URL}/health`)
      .then((response) => response.json())
      .then((data) => {
        setHealthData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <h1>FaceAlert Dashboard</h1>
      {healthData && (
        <div>
          <h2>Server Status</h2>
          <p>Status: {healthData.message}</p>
          <p>Environment: {healthData.environment}</p>
          <p>Uptime: {healthData.uptime?.toFixed(2)} seconds</p>
        </div>
      )}
    </>
  );
}

export default App;
