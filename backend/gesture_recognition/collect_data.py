import cv2
import csv
import mediapipe as mp


def collect():
    mp_hands = mp.solutions.hands
    mp_drawing_styles = mp.solutions.drawing_styles
    hands = mp_hands.Hands()
    mp_drawing = mp.solutions.drawing_utils
    cap = cv2.VideoCapture(0)

    def normalize_landmarks(hand_landmarks):
        landmarks = []

        base_x = hand_landmarks.landmark[0].x
        base_y = hand_landmarks.landmark[0].y

        for lm in hand_landmarks.landmark:
            landmarks.append(lm.x - base_x)
            landmarks.append(lm.y - base_y)

        return landmarks

    label = input("Enter gesture label (e.g. fist, peace): ")


    with open("gesture-data.csv", "a", newline="") as f:
        write = csv.writer(f)

        while cap.isOpened():
            success, image = cap.read()
            if not success:
                continue

            image = cv2.cvtColor(cv2.flip(image,1), cv2.COLOR_BGR2RGB)
            results = hands.process(image)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            key = cv2.waitKey(1) & 0xFF

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

                    # Gets Right/left Label
                    hand_label = results.multi_handedness[idx].classification[0].label

                    # Combine text
                    display_text = f"{hand_label}:"

                    # Positioning of text
                    r, l, _ = image.shape
                    x = int(hand_landmarks.landmark[0].x * r)
                    y = int(hand_landmarks.landmark[0].y * l)
                    
                    # text posistioning 
                    h, w, _ = image.shape

                    cv2.putText(image, display_text, (x - 40, y - 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
                    cv2.putText(image, "Press S to save the data", (10, h - 50), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 1)
                    cv2.putText(image, "Press C to create new data", (10, h - 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 1)
                    cv2.putText(image, "Press ESC to exit", (10, h - 80),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 1),
                
                if key == ord('s'):
                    write.writerow(landmarks + [label])
                    print(f"Saved {label} ({hand_label})")
                elif key == ord('c'):
                    label = input("Enter New Gesture label: ")
                    print("Swicthed to label: {label}")

            elif key == 27:
                break
            
            cv2.imshow("Collect Data", image)

    cap.release()
    cv2.destroyAllWindows()
    pass

if __name__ == "__main__":
    collect()
