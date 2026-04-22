import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function CoursDetail() {

  const { id } = useParams();

  const [cours, setCours] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCours();
  }, [id]);

  const fetchCours = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cours/${id}`);
      setCours(res.data.cours);
    } catch (err) {
      console.error("Erreur chargement cours:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>⏳ Chargement...</p>;

  if (!cours) return <p>❌ Cours introuvable</p>;

  return (
    <div className="container">
      <h2>{cours.titre}</h2>
      <p>{cours.description}</p>

      <p>💰 {cours.prix} FCFA</p>
      <p>📊 Niveau: {cours.niveau}</p>

      <button onClick={() => window.history.back()}>
        ⬅️ Retour
      </button>
    </div>
  );
}

export default CoursDetail;