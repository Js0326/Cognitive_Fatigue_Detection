from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import os

app = Flask(__name__)
# Configure CORS for both development and production
allowed_origins = [
    "http://localhost:3000",  # Development
    "https://cognifatigue-detection-2n0r43gt9-js0326s-projects.vercel.app",  # Production - Update this with your frontend URL
    "https://cognifatigue.vercel.app/",
]

CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# Load the trained Random Forest model and scaler
current_dir = os.path.dirname(os.path.abspath(__file__))
rf_model = joblib.load(os.path.join(current_dir, "fatigue_rf_model1.pkl"))
scaler = joblib.load(os.path.join(current_dir, "scaler_rf1.pkl"))

# Define feature names (must match training data)
FEATURE_NAMES = ["Multitasking_Index", "Fastest_Reaction", "Math_Response_Time", "Typing_Accuracy", "Equation_Accuracy"]

# Function to map score to fatigue level
def fatigue_category(score):
    if score <= 40:
        return "Low"
    elif score <= 70:
        return "Medium"
    else:
        return "High"

@app.route("/predict", methods=["POST"])
def predict_fatigue():
    try:
        # Get JSON data from request
        data = request.json

        # Validate input fields
        if not all(key in data for key in FEATURE_NAMES):
            return jsonify({"error": "Missing or incorrect feature names"}), 400

        # Convert input to DataFrame with correct column order
        user_df = pd.DataFrame([data], columns=FEATURE_NAMES)

        # Standardize input using the saved scaler
        user_data_scaled = scaler.transform(user_df)

        # Predict fatigue level
        predicted_label = rf_model.predict(user_data_scaled)[0]

        # Convert label to score (ensure int type)
        fatigue_score = int((predicted_label == 0) * 20 + (predicted_label == 1) * 55 + (predicted_label == 2) * 85)
        fatigue_level = fatigue_category(fatigue_score)

        # Send response
        response = {
            "features": {k: float(v) if isinstance(v, (np.integer, np.floating)) else v for k, v in data.items()},
            "fatigue_level": fatigue_level,
            "fatigue_score": fatigue_score
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Use production config when deployed, development config when local
    debug_mode = os.environ.get("FLASK_ENV") == "development"
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
