
from pathlib import Path

import cv2
import joblib
import mediapipe as mp
import numpy as np


MODEL_PATH = Path(__file__).with_name("gesture_model.pkl")
model = joblib.load(MODEL_PATH)

# Initialize MediaPipe for up to two hands.
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)


def normalize_landmarks(hand_landmarks):
    """Convert landmarks into wrist-relative coordinates."""
    landmarks = []

    base_x = hand_landmarks.landmark[0].x
    base_y = hand_landmarks.landmark[0].y

    for landmark in hand_landmarks.landmark:
        landmarks.append(landmark.x - base_x)
        landmarks.append(landmark.y - base_y)

    return landmarks


def recognize_gesture(frame):
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)

    if not results.multi_hand_landmarks:
        return {
            "detected": False,
            "hands": [],
        }

    detected_hands = []

    for hand_landmarks, handedness in zip(
        results.multi_hand_landmarks,
        results.multi_handedness,
    ):
        hand_label = handedness.classification[0].label

        # Coordinates for drawing this hand in the browser.
        landmarks_for_display = [
            {"x": float(lm.x), "y": float(lm.y)}
            for lm in hand_landmarks.landmark
        ]

        # Predict this hand's gesture using the existing model.
        normalized_landmarks = normalize_landmarks(hand_landmarks)

        probabilities = model.predict_proba(
            [normalized_landmarks]
        )[0]

        best_index = int(np.argmax(probabilities))
        confidence = float(probabilities[best_index])
        prediction = str(model.classes_[best_index])

        if confidence < 0.6:
            prediction = "Detecting..."

        detected_hands.append({
            "hand": hand_label,
            "label": prediction,
            "confidence": round(confidence, 3),
            "landmarks": landmarks_for_display,
        })

    return {
        "detected": True,
        "hands": detected_hands,
    }
