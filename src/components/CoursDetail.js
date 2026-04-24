import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import QCM from "./QCM";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CoursDetail = () => {
  const { id } = useParams();

  const [cours, setCours] = useState(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // 🔓 LOGIQUE DÉBLOCAGE (P4)
  // =============================
  const isUnlocked = (weekIndex, startDate) => {
    const now = new Date();
    const unlockDate = new Date(startDate);

    unlockDate.setDate(unlockDate.getDate() + (7 * weekIndex));

    return now >= unlockDate;
  };

  // =============================
  // 📡 FETCH COURS
  // =============================
  useEffect(() => {
    fetchCours();
  }, [id]);

  const fetchCours = async () => {
    try {
      console.log("📡 Chargement cours:", id);

      const res = await axios.get(`${API_URL}/api/cours/${id}`);

      const data = res.data.cours || res.data;

      console.log("✅ Cours reçu:", data);

      setCours(data);

    } catch (err) {
      console.error("❌ Erreur chargement cours:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // ⏳ LOADING
  // =============================
  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ Chargement...</p>;
  }

  // =============================
  // ❌ ERREUR
  // =============================
  if (!cours) {
    return <p style={{ textAlign: "center" }}>❌ Cours introuvable</p>;
  }

  // =============================
  // 🧠 DATE DE DÉPART (simulation)
  // =============================
  const startDate = cours.createdAt || new Date();

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>

      {/* ================= HEADER ================= */}
      <h2>{cours.titre}</h2>
      <p>{cours.description}</p>

      <hr />

      {/* ================= CONTENU SIMULÉ ================= */}
      <h3>📚 Contenu du cours</h3>

      {[0, 1, 2].map((weekIndex) => {
        const unlocked = isUnlocked(weekIndex, startDate);

        return (
          <div key={weekIndex} style={{
            padding: "15px",
            marginBottom: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: unlocked ? "#f9f9f9" : "#eee"
          }}>

            <h4>📅 Semaine {weekIndex + 1}</h4>

            {unlocked ? (
              <>
                <p>✅ Contenu accessible</p>

                {/* ================= QCM ================= */}
                <QCM
                  coursId={cours._id}
                  semaineIndex={weekIndex}
                  partieIndex={0}
                />
              </>
            ) : (
              <p>🔒 Débloqué dans {7 * weekIndex} jours</p>
            )}

          </div>
        );
      })}

    </div>
  );
};

export default CoursDetail;