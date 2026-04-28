# ─── Stage 1 : Build ────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

COPY backend/requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─── Stage 2 : Production ───────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Installer libgomp (nécessaire pour LightGBM/XGBoost)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY backend/ ./backend/
COPY frontend/ ./frontend/

RUN chown -R appuser:appgroup /app

USER appuser

ENV PORT=5000
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/test')"

WORKDIR /app/backend
CMD ["python", "app.py"]
