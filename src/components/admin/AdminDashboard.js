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

      setModuleFormData({
        coursId: selectedCoursId || "",
        titre: "",
        description: "",
        ordre: 0,
        dureeEstimee: ""
      });

      setShowModuleForm(false);

      const coursIdToReload = selectedCoursId || moduleFormData.coursId;
      if (coursIdToReload) {
        setSelectedCoursId(coursIdToReload);
        await loadModules(coursIdToReload);
      }
    } catch (error) {
      console.error("Erreur création module:", error);
      alert(error.response?.data?.message || "Erreur lors de la création du module");
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

          {cours.length === 0 ? (
            <p>Aucun cours trouvé.</p>
          ) : (
            cours.map((c) => (
              <div key={c._id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                <strong>{c.titre}</strong> - {c.anneeAcademique} - {c.niveau}
              </div>
            ))
          )}
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
            <form
              onSubmit={handleCreateModule}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px"
              }}
            >
              <h3>Création de module</h3>

              <div style={{ marginBottom: "10px" }}>
                <label>Cours *</label>
                <select
                  name="coursId"
                  value={moduleFormData.coursId}
                  onChange={handleModuleChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="">Choisir un cours</option>
                  {cours.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Titre *</label>
                <input
                  type="text"
                  name="titre"
                  value={moduleFormData.titre}
                  onChange={handleModuleChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={moduleFormData.description}
                  onChange={handleModuleChange}
                  rows="3"
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label>Ordre</label>
                  <input
                    type="number"
                    name="ordre"
                    value={moduleFormData.ordre}
                    onChange={handleModuleChange}
                    min="0"
                    style={{ width: "100%", padding: "8px" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label>Durée estimée</label>
                  <input
                    type="text"
                    name="dureeEstimee"
                    value={moduleFormData.dureeEstimee}
                    onChange={handleModuleChange}
                    placeholder="Ex: 2h"
                    style={{ width: "100%", padding: "8px" }}
                  />
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


