import os
import json
import io
import pypdf
import docx
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    text = ""
    try:
        if filename.endswith(".pdf"):
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                if page.extract_text():
                    text += page.extract_text() + "\n"
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif filename.endswith((".txt", ".md")):
            text = file_bytes.decode("utf-8")
    except Exception as e:
        print(f"Error parsing {filename}: {e}")
    return text.strip()

def analyze_content(filename: str, extracted_text: str) -> dict:
    if not client: return {"category_slug": "general", "summary": "No AI key provided.", "tags": []}
    
    prompt = f"""
    Analyze the text from '{filename}'.
    1. Write a 1-2 sentence summary.
    2. Generate up to 5 tags.
    3. Categorize into exactly one of these slugs: 'ai-machine-learning', 'data-science', 'software-engineering', 'mathematics', 'physics', 'chemistry', 'biology', 'engineering', 'business', 'literature-arts', 'history-social-sciences', 'medicine-health', 'economics', 'general'.
    Output strict JSON: {{"category_slug": "slug", "summary": "text", "tags": ["tag"]}}
    Text: {extracted_text[:10000]}
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.2),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"AI error: {e}")
        return {"category_slug": "general", "summary": "Analysis failed.", "tags": []}

def generate_embedding(text: str) -> list[float]:
    if not GEMINI_API_KEY: return [0.0] * 768
    try:
        if client:
            result = client.models.embed_content(model="text-embedding-004", contents=text[:5000])
            if hasattr(result, 'embeddings') and result.embeddings:
                return result.embeddings[0].values
            elif isinstance(result, dict) and 'embedding' in result:
                return result['embedding']
    except Exception as e:
        print(f"SDK Embedding error: {e}")
    
    # Fallback to REST API
    try:
        import urllib.request
        import json
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
        data = json.dumps({"model": "models/text-embedding-004", "content": {"parts": [{"text": text[:5000]}]}})
        req = urllib.request.Request(url, data=data.encode("utf-8"), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            if "embedding" in res and "values" in res["embedding"]:
                return res["embedding"]["values"]
    except Exception as e:
        print(f"REST API Embedding error: {e}")
        
    return [0.0] * 768