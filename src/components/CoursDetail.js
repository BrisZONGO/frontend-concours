import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "https://shortelement.onrender.com";

const CoursDetail = () => {
  const { id } = useParams();

  const [cours, setCours] = useState(null);
  const [modules, setModules] = useState([]);
  const [partiesByModule, setPartiesByModule] = useState({});
  const [openModules, setOpenModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [contentLocked, setContentLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCoursData();
  }, [id]);

  const fetchCoursData = async () => {
    try {
      setLoading(true);
      setContentLocked(false);
      setLockMessage("");

      const token = localStorage.getItem("token");

      const coursRes = await axios.get(`${API_URL}/api/cours/${id}`);
      const coursData = coursRes.data.cours || coursRes.data;
      setCours(coursData);

      if (token) {
        try {
          const profilRes = await axios.get(`${API_URL}/api/auth/profil`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(profilRes.data.user || null);
        } catch (err) {
          setUser(null);
        }
      }

      try {
        const moduleHeaders = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const modulesRes = await axios.get(
          `${API_URL}/api/modules/cours/${id}`,
          moduleHeaders
        );

        const modulesData = modulesRes.data.modules || [];
        setModules(modulesData);

        const partiesEntries = await Promise.all(
          modulesData.map(async (module) => {
            const partiesRes = await axios.get(
              `${API_URL}/api/parties/module/${module._id}`,
              moduleHeaders
            );
            return [module._id, partiesRes.data.parties || []];
          })
        );

        setPartiesByModule(Object.fromEntries(partiesEntries));
      } catch (contentError) {
        if (contentError.response?.status === 403) {
          setContentLocked(true);
          setLockMessage(
            contentError.response?.data?.message ||
              "Ce contenu est réservé aux abonnés"
          );
          setModules([]);
          setPartiesByModule({});
        } else {
          throw contentError;
        }
      }
    } catch (err) {
      console.error("❌ Erreur chargement cours:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ Chargement...</p>;
  }

  if (!cours) {
    return <p style={{ textAlign: "center" }}>❌ Cours introuvable</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>{cours.titre}</h2>
      <p>{cours.description}</p>

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "20px" }}>
        <span>📊 {cours.niveau}</span>
        <span>⏱️ {cours.duree || "-"}</span>
        <span>💰 {cours.prix || 0} FCFA</span>
        <span>{cours.estPremium ? "💎 Premium" : "🆓 Gratuit"}</span>
      </div>

      {contentLocked && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffe69c",
            color: "#856404",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}
        >
          🔒 {lockMessage}
        </div>
      )}

      <hr />

      <h3>📚 Modules du cours</h3>

      {contentLocked ? (
        <p>Le contenu de ce cours premium n’est pas accessible avec ce compte.</p>
      ) : modules.length === 0 ? (
        <p>Aucun module disponible pour ce cours.</p>
      ) : (
        modules.map((module, index) => {
          const parties = partiesByModule[module._id] || [];
          const isOpen = openModules[module._id];

          return (
            <div
              key={module._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
                background: "#fff"
              }}
            >
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                onClick={() => toggleModule(module._id)}
              >
                <div>
                  <h4 style={{ margin: 0 }}>
                    Module {index + 1}: {module.titre}
                  </h4>
                  <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                    {module.description || "Sans description"}
                  </p>
                </div>

                <button type="button">
                  {isOpen ? "Masquer" : "Afficher"}
                </button>
              </div>

              {isOpen && (
                <div style={{ marginTop: "16px" }}>
                  {parties.length === 0 ? (
                    <p>Aucune partie dans ce module.</p>
                  ) : (
                    parties.map((partie, pIndex) => (
                      <div
                        key={partie._id}
                        style={{
                          borderTop: "1px solid #eee",
                          paddingTop: "12px",
                          marginTop: "12px"
                        }}
                      >
                        <h5 style={{ marginBottom: "6px" }}>
                          Partie {pIndex + 1}: {partie.titre}
                        </h5>

                        <p style={{ margin: "0 0 8px 0" }}>
                          {partie.description || "Sans description"}
                        </p>

                        <p style={{ margin: "0 0 8px 0", color: "#666" }}>
                          Type: {partie.type} | Durée: {partie.duree || "-"}
                        </p>

                        {partie.contenu && (
                          <div
                            style={{
                              background: "#f8f9fa",
                              padding: "12px",
                              borderRadius: "6px",
                              marginTop: "8px"
                            }}
                          >
                            {partie.contenu}
                          </div>
                        )}

                        {partie.url && (
                          <div style={{ marginTop: "8px" }}>
                            <a href={partie.url} target="_blank" rel="noreferrer">
                              Ouvrir la ressource
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CoursDetail;

