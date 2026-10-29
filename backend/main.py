import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field
from gesture_recognition.web_recognizer import recognize_gesture
import cv2
import numpy as np



# loads the .env file form the backend
load_dotenv()

api_key = os.getenv("MODEL_API_KEY")

if not api_key:
    raise RuntimeError (
        "MODEL_API_KEY: is missing from .env file"
    )

# creating the meta Model API client
client = OpenAI(
    base_url="https://api.meta.ai/v1",
    api_key=api_key
)

app = FastAPI(title="SignBridge API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]

)


class MessageRequest(BaseModel):
    labels: list[str] = Field(min_length=1, max_length=12)


class MessageResponse(BaseModel):
    confirmed_labels: list[str]
    suggested_message: str


@app.get("/")
def home():
    return {
        "message": "SignBridge API is running!"
    }


@app.post(
    "/api/build-message",
    response_model=MessageResponse,
)
def build_message(request: MessageRequest):
    # Keep the labels as the source of truth.
    labels = [
        label.strip()
        for label in request.labels
        if label.strip()
    ]

    if not labels:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one confirmed gesture label.",
        )

    if any(len(label) > 40 for label in labels):
        raise HTTPException(
            status_code=400,
            detail="Each gesture label must be 40 characters or fewer.",
        )

    try:
        response = client.chat.completions.create(
            model="muse-spark-1.3",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You help users turn confirmed gesture labels "
                        "into a short, natural message. Use only the "
                        "meaning explicitly supported by the labels. "
                        "Do not invent people, events, emotions, needs, "
                        "or other details. If the labels are ambiguous, "
                        "keep the wording simple and close to the labels. "
                        "Return only the suggested message."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        "Create a concise message from these "
                        "user-confirmed gesture labels: "
                        + ", ".join(labels)
                    ),
                },
            ],
        )

        message = response.choices[0].message.content

        if not message or not message.strip():
            raise HTTPException(
                status_code=502,
                detail="The AI returned an empty message.",
            )

        return MessageResponse(
            confirmed_labels=labels,
            suggested_message=message.strip(),
        )

    except HTTPException:
        raise
    except Exception:
        
        raise HTTPException(
            status_code=502,
            detail="Message generation failed. Please try again.",
        )


@app.post("/api/recognize-gesture")
async def recognize_gesture_endpoint(request: Request):
    # Receive the image bytes sent by the browser.
    image_bytes = await request.body()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="No image was provided.",
        )

    # Decode the JPEG image into an OpenCV frame.
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image. Please send a JPEG frame.",
        )

    try:
        # Run your existing gesture recognition pipeline.
        result = recognize_gesture(frame)
        return result

    except Exception as error:
        print("Gesture recognition error:", error)
        raise HTTPException(
            status_code=500,
            detail="Gesture recognition failed.",
        )
