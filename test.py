import joblib

try:
    model = joblib.load("model.pkl")
    print("✅ Modèle chargé")
    
    # Vérifie ce qu'attend le modèle
    if hasattr(model, 'feature_names_in_'):
        print(f"🔑 Colonnes attendues: {model.feature_names_in_}")
    else:
        print("⚠️ Pas d'info sur les colonnes attendues")
        
    # Vérifie le type de modèle
    print(f"📊 Type de modèle: {type(model)}")
    
except Exception as e:
    print(f"❌ Erreur: {e}")