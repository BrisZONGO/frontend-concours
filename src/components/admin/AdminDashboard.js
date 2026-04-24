import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import GestionSousModules from "./GestionSousModules";

const API_URL = process.env.REACT_APP_API_URL || "https://shortelement.onrender.com";

export default function AdminDashboard() {

  const token = localStorage.getItem("token");

  // =========================
  // 🔥 STATES
  // =========================
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [cours, setCours] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCoursId, setSelectedCoursId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCoursForm, setShowCoursForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingCours, setEditingCours] = useState(null);

  const [coursFormData, setCoursFormData] = useState({
    titre: "",
    description: "",
    prix: 0,
    estPremium: false,
    anneeAcademique: "",
    image: ""
  });

  const [moduleFormData, setModuleFormData] = useState({
    titre: "",
    description: ""
  });

  // =========================
  // 📊 LOAD DATA
  // =========================
  const loadStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats || res.data);
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  };

  const loadUtilisateurs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    if (!coursId) return;
    try {
      const res = await axios.get(`${API_URL}/api/modules/cours/${coursId}`);
      setModules(res.data.modules || []);
    } catch (error) {
      console.error("Erreur modules:", error);
      setModules([]);
    }
  };

  // =========================
  // 🧠 HOOKS (TOUJOURS AVANT RETURN)
  // =========================
  useEffect(() => {
    if (!token) return;

    const init = async () => {
      await Promise.all([
        loadStats(),
        loadUtilisateurs(),
        loadCours()
      ]);
      setLoading(false);
    };

    init();

  }, [token]);

  useEffect(() => {
    if (selectedCoursId) {
      loadModules(selectedCoursId);
    }
  }, [selectedCoursId]);

  // =========================
  // 🔒 PROTECTION (APRÈS HOOKS)
  // =========================
  if (!token) {
    return <p style={{ textAlign: "center", padding: "50px" }}>⛔ Accès refusé</p>;
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Chargement du dashboard...</div>;
  }

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>

      <h1>📊 Tableau de bord Administrateur</h1>

      {/* TABS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("utilisateurs")}>Utilisateurs</button>
        <button onClick={() => setActiveTab("cours")}>Cours</button>
        <button onClick={() => setActiveTab("modules")}>Modules</button>
      </div>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: "20px" }}>

          <motion.div animate={{ scale: [0.9, 1] }}>
            👥 {stats?.totalUsers || 0} utilisateurs
          </motion.div>

          <motion.div animate={{ scale: [0.9, 1] }}>
            💎 {stats?.abonnementsActifs || 0} premium
          </motion.div>

          <motion.div animate={{ scale: [0.9, 1] }}>
            📚 {cours.length} cours
          </motion.div>

          <motion.div animate={{ scale: [0.9, 1] }}>
            💰 {stats?.revenus || 0} FCFA
          </motion.div>

        </div>
      )}

      {/* UTILISATEURS */}
      {activeTab === "utilisateurs" && (
        <div>
          {utilisateurs.map(u => (
            <div key={u._id}>
              {u.nom} - {u.email}
            </div>
          ))}
        </div>
      )}

      {/* COURS */}
      {activeTab === "cours" && (
        <div>
          {cours.map(c => (
            <div key={c._id}>{c.titre}</div>
          ))}
        </div>
      )}

      {/* MODULES */}
      {activeTab === "modules" && (
        <div>

          <select onChange={(e) => setSelectedCoursId(e.target.value)}>
            <option value="">Choisir un cours</option>
            {cours.map(c => (
              <option key={c._id} value={c._id}>{c.titre}</option>
            ))}
          </select>

          {modules.map(m => (
            <div key={m._id}>
              {m.titre}
              <button onClick={() => setSelectedModuleId(m._id)}>Gérer</button>
            </div>
          ))}

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