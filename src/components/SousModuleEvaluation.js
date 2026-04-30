import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://shortelement.onrender.com";

function SousModuleEvaluation({ partie }) {
  const [answers, setAnswers] = useState({});
  const [tentatives, setTentatives] = useState([]);
  const [result, setResult] = useState(null);
  const [correction, setCorrection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCorrection, setLoadingCorrection] = useState(false);

  const evaluableContenus = (partie.contenus || []).filter(
    (contenu) => contenu.kind === "qcm" || contenu.kind === "exercice"
  );

  useEffect(() => {
    fetchTentatives();
  }, [partie._id]);

  const fetchTentatives = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/parties/${partie._id}/tentatives`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTentatives(res.data.tentatives || []);
    } catch (error) {
      console.error("Erreur chargement tentatives:", error);
    }
  };

  const setQcmAnswer = (contenuIndex, questionIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [contenuIndex]: {
        ...(prev[contenuIndex] || {}),
        [questionIndex]: value
      }
    }));
  };

  const setExerciceAnswer = (contenuIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [contenuIndex]: value
    }));
  };

  const computeResultsPayload = () => {
    return evaluableContenus.map((contenu, contenuIndex) => {
      let noteObtenue = 0;
      let noteMax = 0;
      let reponseUtilisateur = answers[contenuIndex] || null;

      if (contenu.kind === "qcm") {
        (contenu.questions || []).forEach((question, questionIndex) => {
          const userAnswer = answers?.[contenuIndex]?.[questionIndex];
          const points = Number(question.points || 1);
          noteMax += points;

          if (userAnswer && userAnswer === question.bonneReponse) {
            noteObtenue += points;
          }
        });
      }

      if (contenu.kind === "exercice") {
        noteMax += Number(contenu.pointsMax || 20);

        const texte = typeof answers?.[contenuIndex] === "string"
          ? answers[contenuIndex].trim()
          : "";

        if (texte.length > 0) {
          noteObtenue = Number(contenu.pointsMax || 20);
        }
      }

      return {
        contenuIndex,
        kind: contenu.kind,
        titre: contenu.titre,
        noteObtenue,
        noteMax,
        reponseUtilisateur
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vous devez être connecté");
        return;
      }

      const payload = {
        resultats: computeResultsPayload()
      };

      const res = await axios.post(
        `${API_URL}/api/parties/${partie._id}/traitement`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResult(res.data.tentative);
      await fetchTentatives();

      if (res.data.tentative.reponsesDebloquees) {
        alert("✅ Traitement enregistré. Les réponses sont disponibles.");
      } else {
        alert("✅ Traitement enregistré. Les réponses restent verrouillées pour le moment.");
      }
    } catch (error) {
      console.error("Erreur traitement:", error);
      alert(error.response?.data?.message || "Erreur lors du traitement");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCorrection = async () => {
    try {
      setLoadingCorrection(true);

      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/parties/${partie._id}/correction`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCorrection(res.data);
    } catch (error) {
      console.error("Erreur correction:", error);
      alert(error.response?.data?.message || "Correction non disponible");
    } finally {
      setLoadingCorrection(false);
    }
  };

  if (evaluableContenus.length === 0) {
    return null;
  }

  const lastTentative = result || tentatives[tentatives.length - 1];

  return (
    <div
      style={{
        marginTop: "16px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "16px",
        background: "#fcfcfc"
      }}
    >
      <h4>📝 Traitement du sous-module</h4>

      {evaluableContenus.map((contenu, contenuIndex) => (
        <div
          key={`${contenu.kind}-${contenuIndex}`}
          style={{
            borderTop: "1px solid #eee",
            marginTop: "12px",
            paddingTop: "12px"
          }}
        >
          <strong>
            {contenu.kind.toUpperCase()} : {contenu.titre || `Bloc ${contenuIndex + 1}`}
          </strong>

          {contenu.kind === "qcm" && (
            <div style={{ marginTop: "10px" }}>
              {(contenu.questions || []).map((question, questionIndex) => (
                <div key={questionIndex} style={{ marginBottom: "14px" }}>
                  <div style={{ marginBottom: "6px" }}>
                    {question.question || question.texte}
                  </div>

                  {(question.choix || question.propositions || []).map((choix, choixIndex) => {
                    const valeur = typeof choix === "string" ? choix : choix.texte;
                    return (
                      <label key={choixIndex} style={{ display: "block", marginBottom: "4px" }}>
                        <input
                          type="radio"
                          name={`qcm-${contenuIndex}-${questionIndex}`}
                          value={valeur}
                          checked={answers?.[contenuIndex]?.[questionIndex] === valeur}
                          onChange={(e) =>
                            setQcmAnswer(contenuIndex, questionIndex, e.target.value)
                          }
                        />
                        {' '}{valeur}
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {contenu.kind === "exercice" && (
            <div style={{ marginTop: "10px" }}>
              <textarea
                placeholder="Saisissez votre réponse / traitement ici"
                value={answers?.[contenuIndex] || ""}
                onChange={(e) => setExerciceAnswer(contenuIndex, e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "10px"
                }}
              />
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: "16px" }}>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Traitement..." : "✅ Valider le traitement du sous-module"}
        </button>
      </div>

      {lastTentative && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "#f3f4f6"
          }}
        >
          <p>Tentative : {lastTentative.tentativeNumero || tentatives.length}</p>
          <p>Note totale : {lastTentative.noteTotale} / {lastTentative.noteMaxTotale}</p>
          <p>Pourcentage : {lastTentative.pourcentage}%</p>
          <p>Réussi : {lastTentative.estReussi ? "✅ Oui" : "❌ Non"}</p>

          {lastTentative.reponsesDebloquees ? (
            <button onClick={handleLoadCorrection} disabled={loadingCorrection}>
              {loadingCorrection ? "Chargement..." : "📘 Voir les réponses et commentaires"}
            </button>
          ) : (
            <p style={{ color: "#92400e" }}>
              Les réponses seront visibles à partir de 80% ou après la deuxième tentative.
            </p>
          )}
        </div>
      )}

      {correction && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "#eef6ff"
          }}
        >
          <h5>Corrigé du sous-module</h5>

          {(correction.corrections || []).map((bloc, blocIndex) => (
            <div key={blocIndex} style={{ marginTop: "12px" }}>
              <strong>{bloc.kind.toUpperCase()} - {bloc.titre}</strong>

              {bloc.texte && (
                <div style={{ marginTop: "6px", whiteSpace: "pre-wrap" }}>
                  {bloc.texte}
                </div>
              )}

              {(bloc.questions || []).map((question, qIndex) => (
                <div key={qIndex} style={{ marginTop: "10px", paddingLeft: "10px" }}>
                  <div>{question.question || question.texte}</div>
                  <div>✅ Bonne réponse : {question.bonneReponse}</div>
                  {question.commentaire && <div>💬 Commentaire : {question.commentaire}</div>}
                  {question.explication && <div>📘 Explication : {question.explication}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SousModuleEvaluation;
