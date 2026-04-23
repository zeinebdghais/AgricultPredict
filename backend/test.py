import pytest
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


# ─── Données de test réalistes ──────────────────────────────────
SAMPLE_DATA = {
    "Region": "North",
    "Soil_Type": "Clay",
    "Crop": "Wheat",
    "Rainfall_mm": 200.5,
    "Temperature_Celsius": 25.3,
    "Fertilizer_Used": 1,
    "Irrigation_Used": 1,
    "Weather_Condition": "Sunny",
    "Days_to_Harvest": 90
}


# ─── Tests ──────────────────────────────────────────────────────
def test_home(client):
    """Test page d'accueil retourne 200"""
    response = client.get('/')
    assert response.status_code == 200


def test_test_endpoint(client):
    """Test endpoint /test retourne status OK"""
    response = client.get('/test')
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['status'] == "API fonctionne !"


def test_metrics_endpoint(client):
    """Test endpoint /metrics Prometheus disponible"""
    response = client.get('/metrics')
    assert response.status_code == 200


def test_predict_valid_data(client):
    """Test prédiction avec données valides"""
    response = client.post(
        '/predict',
        json=SAMPLE_DATA,
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'predicted_yield' in data
    assert isinstance(data['predicted_yield'], float)


def test_predict_missing_data(client):
    """Test prédiction avec données manquantes → doit retourner erreur"""
    response = client.post(
        '/predict',
        json={},
        content_type='application/json'
    )
    assert response.status_code == 500
    data = json.loads(response.data)
    assert 'error' in data


def test_predict_returns_number(client):
    """Test que la prédiction retourne bien un nombre"""
    response = client.post(
        '/predict',
        json=SAMPLE_DATA,
        content_type='application/json'
    )
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['predicted_yield'] > 0