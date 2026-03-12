"use client";

import { useEffect, useMemo, useState, CSSProperties } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type AnalyticsData = {
  status: string;
  set_num: string;
  listing_count: number;
  average_price: number | null;
  median_price: number | null;
  filtered_average_price: number | null;
  filtered_min_price: number | null;
  filtered_max_price: number | null;
  min_price: number | null;
  max_price: number | null;
};

type HistoryPoint = {
  date: string;
  average_price: number;
  median_price: number;
  listing_count: number;
};

type HistoryData = {
  status: string;
  set_num: string;
  points: HistoryPoint[];
};

export default function Home() {
  const [setNum, setSetNum] = useState("75313");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
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

      if (!analyticsRes.ok) {
        throw new Error(`Analytics request failed: ${analyticsRes.status}`);
      }

      const analyticsData = await analyticsRes.json();

      const historyRes = await fetch(
        `${backendBaseUrl}/api/history/set/${setNum}/daily`
      );

      if (!historyRes.ok) {
        throw new Error(`History request failed: ${historyRes.status}`);
      }

      const historyData = await historyRes.json();

      setAnalytics(analyticsData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data from backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    return history?.points ?? [];
  }, [history]);

  function formatCurrency(value: number | null) {
    if (value === null || value === undefined) return "-";
    return `$${value.toFixed(2)}`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatPrice(value: number) {
    return `$${value.toFixed(2)}`;
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        LEGO Market Analytics
      </h1>

      {analytics && (
        <div
          style={{
            marginTop: "0.25rem",
            marginBottom: "1.25rem",
            fontSize: "1.4rem",
            fontWeight: 600,
          }}
        >
          Set {analytics.set_num}
        </div>
      )}
      <div
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
          background: "#fafafa",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
          About this app
        </h2>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          This app tracks secondary-market listing data for collectible LEGO sets and
          turns it into structured set-level analytics. It currently uses listing-based
          marketplace data to estimate pricing signals such as average price, median
          price, listing count, and daily price history.
        </p>
      </div>

      <div
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          border: "1px solid #e5d9b6",
          borderRadius: "12px",
          background: "#fffaf0",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
          Data note
        </h2>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Current analytics are based on marketplace listing data rather than realized
          transaction data. This makes the platform useful for tracking listing-side
          market signals today, while future access to sold-price data would improve
          the accuracy of fair-value estimates and volatility analytics.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          value={setNum}
          onChange={(e) => setSetNum(e.target.value)}
          placeholder="Enter LEGO set number"
          style={{
            padding: "0.75rem",
            fontSize: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        />
        <button
          onClick={fetchData}
          style={{
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Load Data
        </button>
      </div>

      {!loading && !analytics && !history && !error && (
        <div
          style={{
            padding: "1rem",
            border: "1px dashed #ccc",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            background: "#fcfcfc",
          }}
        >
          Enter a LEGO set number and load market data.
        </div>
      )}

      {analytics && (
        <section
          style={{
            marginBottom: "2rem",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1.25rem",
            background: "#fafafa",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Analytics</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
            }}
          >
            <MetricCard label="Set Number" value={analytics.set_num} />
            <MetricCard label="Listing Count" value={String(analytics.listing_count)} />
            <MetricCard
              label="Average Price"
              value={formatCurrency(analytics.average_price)}
            />
            <MetricCard
              label="Median Price"
              value={formatCurrency(analytics.median_price)}
            />
            <MetricCard
              label="Filtered Average"
              value={formatCurrency(analytics.filtered_average_price)}
            />
            <MetricCard
              label="Filtered Min"
              value={formatCurrency(analytics.filtered_min_price)}
            />
            <MetricCard
              label="Filtered Max"
              value={formatCurrency(analytics.filtered_max_price)}
            />
            <MetricCard label="Raw Min" value={formatCurrency(analytics.min_price)} />
            <MetricCard label="Raw Max" value={formatCurrency(analytics.max_price)} />
          </div>
        </section>
      )}

      {history && (
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1.25rem",
            background: "#fafafa",
          }}
        >

          <h2 style={{ marginBottom: "1rem" }}>Daily History</h2>

          <div
            style={{
              width: "100%",
              height: "420px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "1rem",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => formatDate(label as string)}
                  formatter={(value) => formatPrice(Number(value ?? 0))}
                 />
                <Legend />
                <Line type="monotone" dataKey="average_price" name="Average Price" />
                <Line type="monotone" dataKey="median_price" name="Median Price" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Daily Summary</h3>
            <div
              style={{
                overflowX: "auto",
                border: "1px solid #ddd",
                borderRadius: "12px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f7f7f7" }}>
                    <th style={tableHeaderStyle}>Date</th>
                    <th style={tableHeaderStyle}>Average Price</th>
                    <th style={tableHeaderStyle}>Median Price</th>
                    <th style={tableHeaderStyle}>Listing Count</th>
                  </tr>
                </thead>
                <tbody>
                  {history.points.map((point) => (
                    <tr key={point.date}>
                      <td style={tableCellStyle}>{formatDate(point.date)}</td>
                      <td style={tableCellStyle}>{formatPrice(point.average_price)}</td>
                      <td style={tableCellStyle}>{formatPrice(point.median_price)}</td>
                      <td style={tableCellStyle}>{point.listing_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

const tableHeaderStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.75rem",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle: CSSProperties = {
  padding: "0.75rem",
  borderBottom: "1px solid #eee",
};

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "1rem",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}