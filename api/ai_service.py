import os
import json
import io
import pypdf
import docx
import urllib.request
import urllib.error

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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
        print(f"Error parsing {filename}: {e}", flush=True)
    return text.strip()

def analyze_content(filename: str, extracted_text: str) -> dict:
    if not GEMINI_API_KEY:
        return {"category_slug": "general", "summary": "No AI key provided.", "tags": []}
    
    prompt = f"""
    Analyze the text from '{filename}'.
    1. Write a 1-2 sentence summary.
    2. Generate up to 5 tags.
    3. Categorize into exactly one of these slugs: 'ai-machine-learning', 'data-science', 'software-engineering', 'mathematics', 'physics', 'chemistry', 'biology', 'engineering', 'business', 'literature-arts', 'history-social-sciences', 'medicine-health', 'economics', 'general'.
    Output strict JSON: {{"category_slug": "slug", "summary": "text", "tags": ["tag"]}}
    Text: {extracted_text[:10000]}
    """
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            text_response = res_data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean potential markdown JSON fences returned by the model
            text_response = text_response.strip()
            if text_response.startswith("```json"): text_response = text_response[7:]
            elif text_response.startswith("```"): text_response = text_response[3:]
            if text_response.endswith("```"): text_response = text_response[:-3]
            text_response = text_response.strip()
            
            return json.loads(text_response)
            
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        print(f"AI REST Error: {e.code} - {error_msg}", flush=True)
    except Exception as e:
        print(f"AI unexpected error: {e}", flush=True)
        
    return {"category_slug": "general", "summary": "Analysis failed.", "tags": []}

def generate_embedding(text: str) -> list[float]:
    if not GEMINI_API_KEY: 
        return [0.0] * 768
        
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
        payload = {
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": text[:5000]}]}
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            if "embedding" in res_data and "values" in res_data["embedding"]:
                return res_data["embedding"]["values"]
                
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        print(f"Embedding REST Error: {e.code} - {error_msg}", flush=True)
    except Exception as e:
        print(f"Embedding unexpected error: {e}", flush=True)
        
    return [0.0] * 768