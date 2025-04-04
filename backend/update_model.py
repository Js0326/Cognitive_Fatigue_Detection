import joblib
import os

# Load the model using scikit-learn 1.2.2
model_path = r"C:\Users\KIIT\Documents\AD\CFD_ML\backend\fatigue_rf_model.pkl"
if not os.path.exists(model_path):
    print(f"Error: Model file '{model_path}' not found. Please ensure the file exists.")
else:
    try:
        model = joblib.load(model_path)
        print("Model loaded successfully.")

        # Re-save the model
        updated_model_path = "fatigue_rf_model_updated.pkl"
        joblib.dump(model, updated_model_path)
        print(f"Model updated and saved to {updated_model_path}.")
    except Exception as e:
        print(f"Error while updating the model: {e}")
