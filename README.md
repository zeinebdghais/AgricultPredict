# Agricultural Yield Prediction

Application de prédiction de rendement agricole basée sur le Machine Learning.

## Architecture
- **Backend** : Python Flask + Scikit-learn
- **Frontend** : HTML/CSS/JS
- **CI/CD** : GitHub Actions
- **Containerisation** : Docker
- **Orchestration** : Kubernetes + ArgoCD
- **Monitoring** : Prometheus + Grafana
- **Sécurité** : Trivy + Snyk

## Structure du projet
\`\`\`
frontend/     → Interface utilisateur
backend/      → API Flask + modèle ML
docker/       → Dockerfiles
k8s/          → Manifests Kubernetes
.github/      → Pipelines CI/CD
\`\`\`

## Lancement local
\`\`\`bash
cd backend
pip install -r requirements.txt
python app.py
\`\`\`

## Accès
- Application : http://localhost:5000
- Métriques : http://localhost:5000/metrics