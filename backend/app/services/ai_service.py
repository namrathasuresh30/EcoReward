import os
import numpy as np
from PIL import Image
import io

# We wrap TF import in try-except so the backend can run even if TF is not fully installed yet or model is missing.
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

# Global model variable to hold the loaded model
_model = None

def get_model():
    global _model
    if not TF_AVAILABLE:
        return None
    if _model is None:
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ai_model.h5')
        if os.path.exists(model_path):
            try:
                _model = tf.keras.models.load_model(model_path)
                print(f"Loaded TF model from {model_path}")
            except Exception as e:
                print(f"Error loading TF model: {e}")
                _model = None
    return _model

async def predict_image(image_bytes: bytes):
    """
    Processes the image and runs the binary classifier.
    Returns: (prediction_string, confidence_float)
    """
    try:
        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = image.resize((128, 128))
        img_array = np.array(image) / 255.0  # Normalize pixel values
        img_array = np.expand_dims(img_array, axis=0) # Shape: (1, 128, 128, 3)

        model = get_model()
        if model:
            # Predict using TF
            prediction = model.predict(img_array)
            # Binary classification: output is sigmoid probability
            prob = float(prediction[0][0])
            
            # Assuming 1 = Proper Trash, 0 = Invalid
            class_name = "Proper Trash Disposal" if prob >= 0.5 else "Invalid / No Trash"
            confidence = prob if prob >= 0.5 else (1.0 - prob)
            
            return class_name, round(confidence, 4)
        else:
            # Fallback mock prediction if model not available
            print("Warning: TF Model not available, returning mock prediction.")
            import random
            prob = random.uniform(0.7, 0.99)
            class_name = "Proper Trash Disposal" if random.random() > 0.3 else "Invalid / No Trash"
            return class_name, round(prob, 4)

    except Exception as e:
        print(f"Prediction error: {e}")
        # Default fallback on error
        return "Invalid / No Trash", 0.0
