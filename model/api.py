import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import numpy as np

app = Flask(__name__)
CORS(app)

MODEL_PATH = "densenet_model.keras"
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Please ensure 'densenet_model.keras' is in the correct path relative to this script.")
    model = None
    
class_names = ["Blight", "Common Rust", "Gray Leaf Spot", "Healthy"]

def preprocess_image(img_stream):
    img = Image.open(img_stream).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_image(img_stream, model):
    if model is None:
        return "Error", 0.0, {"error": "Model not loaded"}

    img_array = preprocess_image(img_stream)
    predictions = model.predict(img_array)[0]

    predicted_index = np.argmax(predictions)
    predicted_class_name = class_names[predicted_index]
    confidence = float(predictions[predicted_index])

    raw_probs_dict = {class_names[i]: float(prob) for i, prob in enumerate(predictions)}

    return predicted_class_name, confidence, raw_probs_dict

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected image file"}), 400

    if file:
        try:
            predicted_class, confidence, raw_probs = predict_image(file, model)
            return jsonify({
                "predicted_class": predicted_class,
                "confidence": confidence,
                "probabilities": raw_probs
            })
        except Exception as e:
            return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
    
    return jsonify({"error": "Something went wrong with the file upload."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)