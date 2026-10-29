import cv2
import mediapipe as mp
import joblib
from collections import deque

def recognizer():

    model = joblib.load("gesture_model.pkl")

    mp_hands = mp.solutions.hands
    mp_drawing_styles = mp.solutions.drawing_styles
    hands = mp_hands.Hands()
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(0)

    prediction_buffer = deque(maxlen=7)

    def normalize_landmarks(hand_landmarks):
        landmarks = []

        base_x = hand_landmarks.landmark[0].x
        base_y = hand_landmarks.landmark[0].y

        for lm in hand_landmarks.landmark:
            landmarks.append(lm.x - base_x)
            landmarks.append(lm.y - base_y)

        return landmarks

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            continue

        image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
        results = hands.process(image)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                
                # Draws the landmarks 
                mp_drawing.draw_landmarks(
                        image, 
                        hand_landmarks, 
                        mp_hands.HAND_CONNECTIONS,
                        mp_drawing_styles.get_default_hand_landmarks_style(),
                        mp_drawing_styles.get_default_hand_connections_style()
                        
                    )
                # Extract the drawing landmarks
                landmarks = normalize_landmarks(hand_landmarks)

                # Get probabilities
                probs = model.predict_proba([landmarks])[0]
                confidence = max(probs)

                # Get predicted label
                prediction = model.classes_[probs.argmax()]

                if confidence > 0.6:
                    prediction_buffer.append(prediction)

                # Majority vote
                if len(prediction_buffer) > 0:
                    final_prediction = max(
                        set(prediction_buffer),
                        key=prediction_buffer.count
                    )
                else:
                    final_prediction = "Detecting..." 

                # Gets Right/left Label
                hand_label = results.multi_handedness[idx].classification[0].label

                # Combine text
                display_text = f"{hand_label}: {final_prediction}"
                print(display_text)


                # Positioning of text
                w, h, _ = image.shape
                if hand_label == "Left":
                    text_x, text_y = 30, 40                 # Top-left
                else:
                    text_x, text_y = w - 150, 40            # Top-right


                cv2.putText(image, display_text, (text_x, text_y),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("Gesture Recognition", image)

        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()
    pass

if __name__ == "__main__":
    recognizer()