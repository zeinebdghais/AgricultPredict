from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import pandas as pd
import joblib
import os
import time

app = Flask(__name__,
            static_folder='../frontend/static',
            template_folder='../frontend/templates')

CORS(app, resources={r"/*": {"origins": "*"}})

# ─── Métriques Prometheus ───────────────────────────────────────
REQUEST_COUNT = Counter(
    'app_request_count_total',
    'Nombre total de requêtes',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'app_request_latency_seconds',
    'Latence des requêtes',
    ['endpoint']
)

PREDICTION_COUNT = Counter(
    'app_prediction_total',
    'Nombre total de prédictions effectuées'
)

# ─── Chargement du modèle ───────────────────────────────────────
try:
    model = joblib.load("model.pkl")
    print("Modèle chargé avec succès")
except Exception as e:
    print(f"Erreur chargement modèle: {e}")
    model = None


# ─── Routes ─────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def home():
    return render_template('index.html')


@app.route("/predict", methods=["POST"])
def predict():
    start_time = time.time()
    try:
        data = request.get_json()
        df = pd.DataFrame([data])
        prediction = model.predict(df)

        # Incrémenter métriques
        PREDICTION_COUNT.inc()
        REQUEST_COUNT.labels(
            method='POST',
            endpoint='/predict',
            status='200'
        ).inc()
        REQUEST_LATENCY.labels(
            endpoint='/predict'
        ).observe(time.time() - start_time)

        return jsonify({"predicted_yield": float(prediction[0])})

    except Exception as e:
        REQUEST_COUNT.labels(
            method='POST',
            endpoint='/predict',
            status='500'
        ).inc()
        return jsonify({"error": str(e)}), 500


@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


@app.route("/test")
def test():
    REQUEST_COUNT.labels(
        method='GET',
        endpoint='/test',
        status='200'
    ).inc()
    return jsonify({"status": "API fonctionne !"})


@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
