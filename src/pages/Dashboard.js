import API from "../services/api";

const payer = async () => {
  try {
    const res = await API.post("/api/payment/init", {
      montant: 1000,
      email: "test@test.com"
    });
<button className="btn" onClick={payer}>
💳 Payer abonnement
</button>

    window.location.href = res.data.data.payment_url;
  } catch (e) {
    alert("Erreur paiement");
  }
};