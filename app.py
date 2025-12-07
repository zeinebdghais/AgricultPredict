from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__, static_folder='static')
CORS(app)

try:
    model = joblib.load("model.pkl")
    print("Modèle chargé avec succès")
except Exception as e:
    print(f"Erreur chargement modèle: {e}")
    model = None


@app.route("/", methods=["GET"])
def home():
    return render_template('index.html')


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        df = pd.DataFrame([data])

        prediction = model.predict(df)

        return jsonify({"predicted_yield": float(prediction[0])})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


@app.route("/test")
def test():
    return jsonify({"status": "API fonctionne !"})


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
