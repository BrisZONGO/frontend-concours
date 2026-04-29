import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import GestionSousModules from "./GestionSousModules";

const API_URL = process.env.REACT_APP_API_URL || "https://shortelement.onrender.com";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [cours, setCours] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCoursId, setSelectedCoursId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [loading, setLoading] = useState(true);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, authConfig);
      setStats(res.data.stats || null);
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  };

  const loadUtilisateurs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, authConfig);
      setUtilisateurs(res.data.users || []);
    } catch (error) {
      console.error("Erreur utilisateurs:", error);
    }
  };

  const loadCours = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cours`);
      setCours(res.data.cours || []);
    } catch (error) {
      console.error("Erreur cours:", error);
    }
  };

  const loadModules = async (coursId) => {
    if (!coursId) {
      setModules([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/modules/cours/${coursId}`);
      setModules(res.data.modules || []);
    } catch (error) {
      console.error("Erreur modules:", error);
      setModules([]);
    }
  };

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      await Promise.all([loadStats(), loadUtilisateurs(), loadCours()]);
      setLoading(false);
    };

    init();
  }, [token]);

  useEffect(() => {
    loadModules(selectedCoursId);
  }, [selectedCoursId]);

  if (!token) {
    return <p style={{ textAlign: "center", padding: "50px" }}>⛔ Accès refusé</p>;
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1>📊 Tableau de bord Administrateur</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("utilisateurs")}>Utilisateurs</button>
        <button onClick={() => setActiveTab("cours")}>Cours</button>
        <button onClick={() => setActiveTab("modules")}>Modules</button>
      </div>

      {activeTab === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: "20px" }}>
          <motion.div animate={{ scale: [0.9, 1] }}>
            👥 {stats?.totalUsers || 0} utilisateurs
          </motion.div>

          <motion.div animate={{ scale: [0.9, 1] }}>
            💎 {stats?.abonnementsActifs || 0} premium
          </motion.div>

          <motion.div animate={{ scale: [0.9, 1] }}>
            📚 {stats?.totalCourses || cours.length || 0} cours
          </motion.div>

          <motion.div animate={{ scale: [0.9, 1] }}>
            💰 {stats?.revenus || 0} FCFA
          </motion.div>
        </div>
      )}

      {activeTab === "utilisateurs" && (
        <div>
          {utilisateurs.length === 0 ? (
            <p>Aucun utilisateur trouvé.</p>
          ) : (
            utilisateurs.map((u) => (
              <div key={u._id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {u.nom} {u.prenom} - {u.email} - {u.role}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "cours" && (
        <div>
          {cours.length === 0 ? (
            <p>Aucun cours trouvé.</p>
          ) : (
            cours.map((c) => (
              <div key={c._id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {c.titre}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "modules" && (
        <div>
          <select
            value={selectedCoursId}
            onChange={(e) => {
              setSelectedCoursId(e.target.value);
              setSelectedModuleId(null);
            }}
          >
            <option value="">Choisir un cours</option>
            {cours.map((c) => (
              <option key={c._id} value={c._id}>
                {c.titre}
              </option>
            ))}
          </select>

          <div style={{ marginTop: "20px" }}>
            {modules.map((m) => (
              <div key={m._id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {m.titre}
                <button style={{ marginLeft: "10px" }} onClick={() => setSelectedModuleId(m._id)}>
                  Gérer
                </button>
              </div>
            ))}
          </div>

          {selectedModuleId && (
            <GestionSousModules
              moduleId={selectedModuleId}
              token={token}
              onRefresh={() => loadModules(selectedCoursId)}
            />
          )}
        </div>
      )}
    </div>
  );
}
