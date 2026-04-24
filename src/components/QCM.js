import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const QCM = ({ coursId, semaineIndex, partieIndex }) => {

  const [score, setScore] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =============================
  // 📤 SUBMIT QCM (P7 + P8)
  // =============================
  const handleSubmit = async () => {

    // 🔒 Validation frontend
    if (score === "" || score < 0 || score > 100) {
      setError("❌ Score invalide (0 - 100)");
      return;
    }

    setError("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("⛔ Vous devez être connecté");
        return;
      }

      console.log("📤 Envoi QCM:", {
        coursId,
        semaineIndex,
        partieIndex,
        score
      });

      const res = await axios.post(
        `${API_URL}/api/cours/qcm`,
        {
          coursId,
          semaineIndex,
          partieIndex,
          score: Number(score)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("✅ Réponse QCM:", res.data);

      setResult(res.data);

      // =============================
      // 🔔 LOGIQUE MÉTIER
      // =============================
      if (res.data.validated) {
        alert("✅ QCM validé ! Accès aux réponses");
      } else if (res.data.tentatives >= 2) {
        alert("🔓 Accès autorisé après 2 tentatives");
      } else {
        alert("❌ Score insuffisant, réessaie");
      }

    } catch (error) {
      console.error("❌ Erreur QCM:", error.response?.data || error.message);

      setError(
        error.response?.data?.message || "Erreur lors de l'envoi du QCM"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      marginTop: "10px"
    }}>

      <h3>🧠 QCM</h3>

      <p>Simule ton score (0 - 100) :</p>

      {/* INPUT SCORE */}
      <input
        type="number"
        placeholder="Score /100"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "10px",
          width: "100%"
        }}
      />

      {/* ERREUR */}
      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {/* BOUTON */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {loading ? "⏳ Envoi..." : "📤 Soumettre"}
      </button>

      {/* =============================
          📊 RÉSULTAT
      ============================= */}
      {result && (
        <div style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "5px"
        }}>
          <p>🎯 Validé : {result.validated ? "✅ Oui" : "❌ Non"}</p>
          <p>🔁 Tentatives : {result.tentatives}</p>

          {result.validated && (
            <p style={{ color: "green" }}>
              📘 Les réponses sont maintenant accessibles
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default QCM;