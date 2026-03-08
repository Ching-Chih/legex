"use client";

import { useState } from "react";

export default function Home() {
  const [setNum, setSetNum] = useState("75313");
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backendBaseUrl = "https://legex-production.up.railway.app";

  async function fetchData() {
    setLoading(true);
    setError("");

    try {
      const analyticsRes = await fetch(
        `${backendBaseUrl}/api/analytics/set/${setNum}`
      );
      const analyticsData = await analyticsRes.json();

      const historyRes = await fetch(
        `${backendBaseUrl}/api/history/set/${setNum}/daily`
      );
      const historyData = await historyRes.json();

      setAnalytics(analyticsData);
      setHistory(historyData);
    } catch (err) {
      setError("Failed to fetch data from backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>LEGO Market Analytics</h1>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={setNum}
          onChange={(e) => setSetNum(e.target.value)}
          placeholder="Enter LEGO set number"
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={fetchData}
          style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
        >
          Load Data
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {analytics && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Analytics</h2>
          <pre>{JSON.stringify(analytics, null, 2)}</pre>
        </div>
      )}

      {history && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Daily History</h2>
          <pre>{JSON.stringify(history, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}