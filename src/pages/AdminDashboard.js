import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    const res = await API.get("/api/admin/stats");
    setStats(res.data);
  };

  // ✅ ICI
  useEffect(() => {
    loadStats();

    const interval = setInterval(() => {
      loadStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {stats && <p>Revenus: {stats.revenus}</p>}
    </div>
  );
}