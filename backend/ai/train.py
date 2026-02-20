import tensorflow as tf
from tensorflow.keras import layers, models
import os
import numpy as np

def create_model():
    model = models.Sequential([
        layers.Input(shape=(128, 128, 3)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dense(1, activation='sigmoid') # Binary classification
    ])
    model.compile(optimizer='adam',
                  loss='binary_crossentropy',
                  metrics=['accuracy'])
    return model

def generate_dummy_data(num_samples=100):
    # Dummy images
    X = np.random.rand(num_samples, 128, 128, 3).astype('float32')
    # Dummy labels (0: Invalid / No Trash, 1: Proper Trash Disposal)
    y = np.random.randint(0, 2, size=(num_samples, 1)).astype('float32')
    return X, y

def main():
    print("Creating model...")
    model = create_model()
    
    print("Generating dummy training data...")
    X_train, y_train = generate_dummy_data(500)
    
    print("Training dummy model for 1 epoch to save architecture & weights...")
    model.fit(X_train, y_train, epochs=1, batch_size=32)
    
    save_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app', 'ai_model.h5')
    model.save(save_path)
    print(f"Dummy model saved to {save_path}")

if __name__ == "__main__":
    main()
