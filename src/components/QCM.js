import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const QCM = ({ coursId, semaineIndex, partieIndex }) => {

  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // =============================
  // 📤 SUBMIT QCM (P7 + P8)
  // =============================
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/cours/qcm`, {
        coursId,
        semaineIndex,
        partieIndex,
        score
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setResult(res.data);

      if (res.data.validated) {
        alert("✅ Accès aux réponses");
      } else if (res.data.tentatives >= 2) {
        alert("🔓 Accès après 2 tentatives");
      } else {
        alert("❌ Score insuffisant");
      }

    } catch (error) {
      console.error(error);
      alert("Erreur QCM");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
      
      <h3>🧠 QCM</h3>

      <p>Simule ton score :</p>

      <input
        type="number"
        placeholder="Score /100"
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        style={{ padding: "10px", marginBottom: "10px" }}
      />

      <br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "⏳ Envoi..." : "📤 Soumettre"}
      </button>

      {/* Résultat */}
      {result && (
        <div style={{ marginTop: "15px" }}>
          <p>🎯 Score validé: {result.validated ? "Oui" : "Non"}</p>
          <p>🔁 Tentatives: {result.tentatives}</p>
        </div>
      )}

    </div>
  );
};

export default QCM;