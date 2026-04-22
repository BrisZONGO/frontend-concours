import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import QCM from "./QCM";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CoursDetail = () => {

  const { id } = useParams(); // 🔥 récupère l'id du cours depuis l'URL

  const [cours, setCours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =============================
  // 📚 FETCH COURS DETAIL
  // =============================
  useEffect(() => {
    fetchCours();
  }, [id]);

  const fetchCours = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cours/${id}`);
      setCours(res.data.cours);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur chargement cours");
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

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>❌ {error}</p>;
  }

  if (!cours) {
    return <p style={{ textAlign: "center" }}>Cours introuvable</p>;
  }

  // =============================
  // 🎨 UI
  // =============================
  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>

      <h1>{cours.titre}</h1>

      <p>{cours.description}</p>

      <hr />

      {/* =============================
          📅 SEMAINES
      ============================= */}
      {cours.semaines && cours.semaines.length > 0 ? (
        cours.semaines.map((week, index) => (
          <div key={index} style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}>

            <h3>📅 Semaine {index + 1}</h3>

            {week.unlocked ? (
              <>
                <p>✅ Contenu disponible</p>

                {/* =============================
                    🧠 QCM INTÉGRÉ
                ============================= */}
                <QCM
                  coursId={cours._id}
                  semaineIndex={index}
                  partieIndex={0}
                />
              </>
            ) : (
              <p style={{ color: "orange" }}>
                🔒 Semaine verrouillée
              </p>
            )}

          </div>
        ))
      ) : (
        <p>Aucune semaine disponible</p>
      )}

    </div>
  );
};

export default CoursDetail;