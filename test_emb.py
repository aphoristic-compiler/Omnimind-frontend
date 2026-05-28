import os
os.environ["GEMINI_API_KEY"] = "fake_key"
from api.ai_service import generate_embedding
print("Output:", generate_embedding("hello")[:5])
