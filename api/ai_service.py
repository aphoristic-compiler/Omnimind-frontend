import os
import json
import io
import pypdf
import docx
import urllib.request
import urllib.error

COHERE_API_KEY = os.getenv("COHERE_API_KEY")

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
    if not COHERE_API_KEY:
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
        url = "https://api.cohere.com/v1/chat"
        payload = {
            "model": "command-r-plus-08-2024",
            "message": prompt,
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }
        headers = {
            "Authorization": f"Bearer {COHERE_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers)
        
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            text_response = res_data.get("text", "")
            
            # Clean potential markdown JSON fences
            text_response = text_response.strip()
            if text_response.startswith("```json"): text_response = text_response[7:]
            elif text_response.startswith("```"): text_response = text_response[3:]
            if text_response.endswith("```"): text_response = text_response[:-3]
            text_response = text_response.strip()
            
            return json.loads(text_response)
            
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        print(f"Cohere REST Error: {e.code} - {error_msg}", flush=True)
    except Exception as e:
        print(f"Cohere unexpected error: {e}", flush=True)
        
    return {"category_slug": "general", "summary": "Analysis failed.", "tags": []}

def generate_embedding(text: str) -> list[float]:
    if not COHERE_API_KEY: 
        return [0.0] * 1024
        
    try:
        url = "https://api.cohere.com/v1/embed"
        payload = {
            "model": "embed-english-v3.0",
            "texts": [text[:5000]],
            "input_type": "search_document"
        }
        headers = {
            "Authorization": f"Bearer {COHERE_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers)
        
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            embeddings = res_data.get("embeddings", [])
            if embeddings and len(embeddings) > 0:
                return embeddings[0]
                
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        print(f"Cohere Embed REST Error: {e.code} - {error_msg}", flush=True)
    except Exception as e:
        print(f"Cohere Embed unexpected error: {e}", flush=True)
        
    return [0.0] * 1024