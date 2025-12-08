document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("prediction-form");
  const resetButton = document.getElementById("reset-button");
  const submitButton = document.getElementById("submit-button");
  const predictionResultDiv = document.getElementById("prediction-result");
  const finalPredictionSpan = document.getElementById("final-prediction");
  const submitContent = document.getElementById("submit-text");
  const loadingContent = document.getElementById("loading-text");

  // Fonction pour afficher des messages d'erreur
  function showError(message) {
    alert(`❌ Erreur\n${message}`);
  }

  // Fonction pour valider les nombres réels positifs
  function validatePositiveReal(value, fieldName, min = 0, max = null) {
    // Vérifier si c'est un nombre
    if (isNaN(value) || value === null || value === "") {
      return `${fieldName} doit être un nombre valide`;
    }

    // Convertir en nombre flottant
    const numValue = parseFloat(value);

    // Vérifier si c'est positif
    if (numValue <= min) {
      return `${fieldName} doit être strictement supérieur à ${min}`;
    }

    // Vérifier la valeur maximale si spécifiée
    if (max !== null && numValue > max) {
      return `${fieldName} ne doit pas dépasser ${max}`;
    }

    // Vérifier si c'est un nombre fini
    if (!isFinite(numValue)) {
      return `${fieldName} doit être un nombre fini`;
    }

    return null; // Pas d'erreur
  }

  // Soumission du formulaire
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Récupération des valeurs
    const region = document.getElementById("region").value;
    const soilType = document.getElementById("soilType").value;
    const cropType = document.getElementById("cropType").value;
    const rainfall = document.getElementById("rainfall").value;
    const temperature = document.getElementById("temperature").value;
    const weatherCondition = document.getElementById("weatherCondition").value;
    const growingDays = document.getElementById("growingDays").value;
    const fertilizerUsed = document.getElementById("fertilizerUsed").checked
      ? 1
      : 0;
    const irrigationUsed = document.getElementById("irrigationUsed").checked
      ? 1
      : 0;

    // Validation des champs requis
    if (
      !region ||
      !soilType ||
      !cropType ||
      !weatherCondition ||
      !growingDays
    ) {
      showError("Veuillez compléter tous les champs obligatoires.");
      return;
    }

    // Validation spécifique pour Rainfall_mm (précipitations)
    const rainfallError = validatePositiveReal(
      rainfall,
      "Les précipitations (mm)",
      0, // Minimum strict
      10000 // Maximum raisonnable pour les précipitations annuelles
    );

    if (rainfallError) {
      showError(rainfallError);
      document.getElementById("rainfall").focus();
      return;
    }

    // Validation spécifique pour Temperature_Celsius (température)
    const temperatureError = validatePositiveReal(
      temperature,
      "La température (°C)",
      -50, // Minimum réaliste pour l'agriculture
      60 // Maximum réaliste pour l'agriculture
    );

    if (temperatureError) {
      showError(temperatureError);
      document.getElementById("temperature").focus();
      return;
    }

    // Validation pour Days_to_Harvest (jours de croissance)
    const growingDaysError = validatePositiveReal(
      growingDays,
      "La durée de croissance (jours)",
      1, // Minimum 1 jour
      365 // Maximum 1 an
    );

    if (growingDaysError) {
      showError(growingDaysError);
      document.getElementById("growingDays").focus();
      return;
    }

    // 📌 CORRESPONDANCE EXACTE AVEC TON MODEL.pkl
    const formData = {
      Region: region,
      Soil_Type: soilType,
      Crop: cropType,
      Rainfall_mm: parseFloat(rainfall),
      Temperature_Celsius: parseFloat(temperature),
      Fertilizer_Used: fertilizerUsed,
      Irrigation_Used: irrigationUsed,
      Weather_Condition: weatherCondition,
      Days_to_Harvest: parseInt(growingDays),
    };

    console.log("Données envoyées:", formData);

    // Activation du mode chargement
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

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();
      console.log("Réponse de l'API:", data);

      if (data.predicted_yield !== undefined && data.predicted_yield !== null) {
        const formattedYield = parseFloat(data.predicted_yield).toFixed(2);
        finalPredictionSpan.textContent = formattedYield;

        if (parseFloat(formattedYield) < 2.0) {
          finalPredictionSpan.style.color = "var(--destructive)";
        } else if (parseFloat(formattedYield) < 4.0) {
          finalPredictionSpan.style.color = "var(--sun)";
        } else {
          finalPredictionSpan.style.color = "var(--leaf)";
        }
      } else {
        finalPredictionSpan.textContent = "N/A";
        finalPredictionSpan.style.color = "var(--muted-foreground)";
        showError(data.error || "Données de prédiction non disponibles");
      }
    } catch (error) {
      console.error("Erreur API:", error);
      finalPredictionSpan.textContent = "Erreur";
      finalPredictionSpan.style.color = "var(--destructive)";
      showError(`Erreur de connexion: ${error.message}`);
    } finally {
      // Désactivation du mode chargement
      submitButton.disabled = false;
      submitContent.classList.remove("hidden");
      loadingContent.classList.add("hidden");

      // Affichage du résultat
      predictionResultDiv.classList.remove("hidden");
      predictionResultDiv.classList.add("animate-slide-up");
    }
  });

  document.getElementById("rainfall").addEventListener("blur", function () {
    const value = this.value;
    if (value) {
      const error = validatePositiveReal(value, "Les précipitations", 0, 10000);
      if (error) {
        this.style.borderColor = "var(--destructive)";
        this.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)";
      } else {
        this.style.borderColor = "";
        this.style.boxShadow = "";
      }
    }
  });

  document.getElementById("temperature").addEventListener("blur", function () {
    const value = this.value;
    if (value) {
      const error = validatePositiveReal(value, "La température", -50, 60);
      if (error) {
        this.style.borderColor = "var(--destructive)";
        this.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)";
      } else {
        this.style.borderColor = "";
        this.style.boxShadow = "";
      }
    }
  });

  document.getElementById("growingDays").addEventListener("blur", function () {
    const value = this.value;
    if (value) {
      const error = validatePositiveReal(
        value,
        "La durée de croissance",
        1,
        365
      );
      if (error) {
        this.style.borderColor = "var(--destructive)";
        this.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)";
      } else {
        this.style.borderColor = "";
        this.style.boxShadow = "";
      }
    }
  });

  // Réinitialisation du formulaire
  resetButton.addEventListener("click", () => {
    form.reset();
    predictionResultDiv.classList.add("hidden");
    predictionResultDiv.classList.remove("animate-slide-up");
    finalPredictionSpan.textContent = "";
    finalPredictionSpan.style.color = "";

    // Réinitialiser les styles de validation
    const inputs = document.querySelectorAll(".form-control");
    inputs.forEach((input) => {
      input.style.borderColor = "";
      input.style.boxShadow = "";
    });
  });

  function initializeValidation() {
    const rainfallInput = document.getElementById("rainfall");
    const temperatureInput = document.getElementById("temperature");
    const growingDaysInput = document.getElementById("growingDays");

    rainfallInput.placeholder = "Ex: 750.5";
    temperatureInput.placeholder = "Ex: 25.3 ";
    growingDaysInput.placeholder = "Ex: 120 ";

    rainfallInput.min = "0.1";
    rainfallInput.max = "10000";
    rainfallInput.step = "0.1";

    temperatureInput.min = "-49.9";
    temperatureInput.max = "59.9";
    temperatureInput.step = "0.1";

    growingDaysInput.min = "1";
    growingDaysInput.max = "365";
    growingDaysInput.step = "1";
  }

  initializeValidation();
});
