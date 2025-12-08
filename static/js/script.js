document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("prediction-form");
  const resetButton = document.getElementById("reset-button");
  const submitButton = document.getElementById("submit-button");
  const predictionResultDiv = document.getElementById("prediction-result");
  const finalPredictionSpan = document.getElementById("final-prediction");
  const submitContent = document.getElementById("submit-text");
  const loadingContent = document.getElementById("loading-text");

  // Petit Toast
  function showToast(title, description, isDestructive = false) {
    alert(`${title}\n${description}`);
  }

  // Soumission du formulaire
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 📌 CORRESPONDANCE EXACTE AVEC TON MODEL.pkl
    const formData = {
      Region: document.getElementById("region").value,
      Soil_Type: document.getElementById("soilType").value,
      Crop: document.getElementById("cropType").value,
      Rainfall_mm: Number(document.getElementById("rainfall").value),
      Temperature_Celsius: Number(document.getElementById("temperature").value),
      Fertilizer_Used: document.getElementById("fertilizerUsed").checked
        ? 1
        : 0,
      Irrigation_Used: document.getElementById("irrigationUsed").checked
        ? 1
        : 0,
      Weather_Condition: document.getElementById("weatherCondition").value,
      Days_to_Harvest: Number(document.getElementById("growingDays").value),
    };

    // Vérification champs
    const requiredFields = [
      formData.Region,
      formData.Soil_Type,
      formData.Crop,
      formData.Rainfall_mm,
      formData.Temperature_Celsius,
      formData.Weather_Condition,
      formData.Days_to_Harvest,
    ];

    if (requiredFields.some((v) => v === "" || v === null)) {
      showToast("Champs requis", "Veuillez compléter tous les champs.", true);
      return;
    }

    // Loading
    submitButton.disabled = true;
    submitContent.classList.add("hidden");
    loadingContent.classList.remove("hidden");
    predictionResultDiv.classList.add("hidden");

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("API RESPONSE:", data);

      if (data.predicted_yield !== undefined) {
        finalPredictionSpan.textContent = data.predicted_yield.toFixed(2);
      } else {
        finalPredictionSpan.textContent =
          "Erreur : " + (data.error || "Données invalides");
      }
    } catch (error) {
      console.error("API ERROR:", error);
      finalPredictionSpan.textContent = "Erreur de connexion API";
    }

    // Loading OFF
    submitButton.disabled = false;
    submitContent.classList.remove("hidden");
    loadingContent.classList.add("hidden");

    // Afficher résultat
    predictionResultDiv.classList.remove("hidden");
    predictionResultDiv.classList.add("animate-slide-up");

    // showToast("Prédiction terminée", "Rendement estimé calculé.");
  });

  // Reset
  resetButton.addEventListener("click", () => {
    form.reset();
    predictionResultDiv.classList.add("hidden");
    predictionResultDiv.classList.remove("animate-slide-up");
    finalPredictionSpan.textContent = "";
    // showToast("Formulaire réinitialisé", "Les champs ont été effacés.");
  });
});
