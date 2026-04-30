import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import GestionSousModules from "./GestionSousModules";
import CoursForm from "../CoursForm";

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
  const [message, setMessage] = useState("");

  const [showCoursForm, setShowCoursForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);

  const [moduleFormData, setModuleFormData] = useState({
    coursId: "",
    titre: "",
    description: "",
    ordre: 0,
    dureeEstimee: ""
  });

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const badgeStyle = (type) => {
    const map = {
      admin: { background: "#d4edda", color: "#155724" },
      user: { background: "#dbeafe", color: "#1d4ed8" },
      inactive: { background: "#e5e7eb", color: "#374151" }
    };

    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      ...map[type]
    };
  };

  const showTempMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
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

  const handleCoursCreated = async () => {
    setShowCoursForm(false);
    await loadCours();
    await loadStats();
    showTempMessage("✅ Cours créé avec succès");
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setModuleFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/api/modules`,
        {
          coursId: moduleFormData.coursId,
          titre: moduleFormData.titre.trim(),
          description: moduleFormData.description.trim(),
          ordre: parseInt(moduleFormData.ordre, 10) || 0,
          dureeEstimee: moduleFormData.dureeEstimee.trim()
        },
        authConfig
      );

      const coursIdToReload = selectedCoursId || moduleFormData.coursId;

      setModuleFormData({
        coursId: coursIdToReload || "",
        titre: "",
        description: "",
        ordre: 0,
        dureeEstimee: ""
      });

      setShowModuleForm(false);

      if (coursIdToReload) {
        setSelectedCoursId(coursIdToReload);
        await loadModules(coursIdToReload);
      }

      showTempMessage("✅ Module créé avec succès");
    } catch (error) {
      console.error("Erreur création module:", error);
      alert(error.response?.data?.message || "Erreur lors de la création du module");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_URL}/api/auth/utilisateurs/${userId}/role`,
        { role: newRole },
        authConfig
      );

      await loadUtilisateurs();
      await loadStats();
      showTempMessage(`✅ Rôle changé en ${newRole}`);
    } catch (error) {
      console.error("Erreur changement rôle:", error);
      alert(error.response?.data?.message || "Erreur lors du changement de rôle");
    }
  };

  const handleToggleActif = async (userId, actifActuel) => {
    try {
      await axios.put(
        `${API_URL}/api/auth/utilisateurs/${userId}/actif`,
        { actif: !actifActuel },
        authConfig
      );

      await loadUtilisateurs();
      showTempMessage(!actifActuel ? "✅ Utilisateur réactivé" : "✅ Utilisateur désactivé");
    } catch (error) {
      console.error("Erreur statut utilisateur:", error);
      alert(error.response?.data?.message || "Erreur lors du changement de statut");
    }
  };

  if (!token) {
    return <p style={{ textAlign: "center", padding: "50px" }}>⛔ Accès refusé</p>;
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1>📊 Tableau de bord Administrateur</h1>

      {message && (
        <div
          style={{
            background: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("utilisateurs")}>Utilisateurs</button>
        <button onClick={() => setActiveTab("cours")}>Cours</button>
        <button onClick={() => setActiveTab("modules")}>Modules</button>
      </div>

      {activeTab === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: "20px" }}>
          <motion.div animate={{ scale: [0.9, 1] }}>👥 {stats?.totalUsers || 0} utilisateurs</motion.div>
          <motion.div animate={{ scale: [0.9, 1] }}>💎 {stats?.abonnementsActifs || 0} premium</motion.div>
          <motion.div animate={{ scale: [0.9, 1] }}>📚 {stats?.totalCourses || cours.length || 0} cours</motion.div>
          <motion.div animate={{ scale: [0.9, 1] }}>💰 {stats?.revenus || 0} FCFA</motion.div>
        </div>
      )}

      {activeTab === "utilisateurs" && (
        <div>
          {utilisateurs.length === 0 ? (
            <p>Aucun utilisateur trouvé.</p>
          ) : (
            utilisateurs.map((u) => (
              <div
                key={u._id}
                style={{
                  padding: "14px",
                  borderBottom: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <strong>{u.nom} {u.prenom}</strong>
                  <div>{u.email}</div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                    <span style={badgeStyle(u.role === "admin" ? "admin" : "user")}>
                      {u.role}
                    </span>
                    <span style={badgeStyle(u.actif === false ? "inactive" : "admin")}>
                      {u.actif === false ? "désactivé" : "actif"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u._id, e.target.value)}
                    style={{ padding: "8px" }}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>

                  <button
                    onClick={() => handleToggleActif(u._id, u.actif)}
                    style={{
                      background: u.actif === false ? "#198754" : "#6c757d",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    {u.actif === false ? "Réactiver" : "Désactiver"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "cours" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <button onClick={() => setShowCoursForm((prev) => !prev)}>
              {showCoursForm ? "Fermer la création de cours" : "➕ Créer un cours"}
            </button>
          </div>

          {showCoursForm && (
            <div style={{ marginBottom: "30px" }}>
              <CoursForm token={token} onCoursCreated={handleCoursCreated} />
            </div>
          )}

          {cours.map((c) => (
            <div key={c._id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              <strong>{c.titre}</strong> - {c.anneeAcademique} - {c.niveau}
            </div>
          ))}
        </div>
      )}

      {activeTab === "modules" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <select
              value={selectedCoursId}
              onChange={(e) => {
                setSelectedCoursId(e.target.value);
                setSelectedModuleId(null);
                setModuleFormData((prev) => ({
                  ...prev,
                  coursId: e.target.value
                }));
              }}
            >
              <option value="">Choisir un cours</option>
              {cours.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.titre}
                </option>
              ))}
            </select>

            <button
              style={{ marginLeft: "10px" }}
              onClick={() => {
                if (!selectedCoursId) {
                  alert("Choisis d'abord un cours");
                  return;
                }
                setShowModuleForm((prev) => !prev);
              }}
            >
              {showModuleForm ? "Fermer la création de module" : "➕ Créer un module"}
            </button>
          </div>

          {showModuleForm && (
            <form onSubmit={handleCreateModule} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
              <h3>Création de module</h3>

              <div style={{ marginBottom: "10px" }}>
                <label>Cours *</label>
                <select name="coursId" value={moduleFormData.coursId} onChange={handleModuleChange} required style={{ width: "100%", padding: "8px" }}>
                  <option value="">Choisir un cours</option>
                  {cours.map((c) => (
                    <option key={c._id} value={c._id}>{c.titre}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Titre *</label>
                <input type="text" name="titre" value={moduleFormData.titre} onChange={handleModuleChange} required style={{ width: "100%", padding: "8px" }} />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Description</label>
                <textarea name="description" value={moduleFormData.description} onChange={handleModuleChange} rows="3" style={{ width: "100%", padding: "8px" }} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label>Ordre</label>
                  <input type="number" name="ordre" value={moduleFormData.ordre} onChange={handleModuleChange} min="0" style={{ width: "100%", padding: "8px" }} />
                </div>

                <div style={{ flex: 1 }}>
                  <label>Durée estimée</label>
                  <input type="text" name="dureeEstimee" value={moduleFormData.dureeEstimee} onChange={handleModuleChange} placeholder="Ex: 2h" style={{ width: "100%", padding: "8px" }} />
                </div>
              </div>

              <button type="submit">💾 Enregistrer le module</button>
            </form>
          )}

          <div style={{ marginTop: "20px" }}>
            {modules.length === 0 ? (
              <p>Aucun module trouvé pour ce cours.</p>
            ) : (
              modules.map((m) => (
                <div key={m._id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  <strong>{m.titre}</strong>
                  {m.dureeEstimee ? ` - ${m.dureeEstimee}` : ""}
                  <button style={{ marginLeft: "10px" }} onClick={() => setSelectedModuleId(m._id)}>
                    Gérer les sous-modules
                  </button>
                </div>
              ))
            )}
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
