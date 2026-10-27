import os 
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("MODEL_API_KEY")

if not api_key:
    raise RuntimeError("MODEL_API_KEY is missing from .env")

client = OpenAI(
    base_url="https://api.meta.ai/v1",
    api_key=api_key,
)

response = client.responses.create(
    model="muse-spark-1.3",
    input=("You are testing SignBridge"
           "Reply with exactly: SignBridge API works!")
)

print(response.output_text)