# ─── Stage 1 : Build ────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Copier requirements en premier (cache Docker)
COPY backend/requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─── Stage 2 : Production ───────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Créer utilisateur non-root (sécurité)
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

# Copier les dépendances installées depuis builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copier le code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Donner les droits à appuser
RUN chown -R appuser:appgroup /app

# Utiliser utilisateur non-root
USER appuser

# Variables d'environnement
ENV PORT=5000
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Exposer le port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/test')"

# Lancer l'app
WORKDIR /app/backend
CMD ["python", "app.py"]