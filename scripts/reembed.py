import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from api.database import SessionLocal
from api.models import Material
from api import ai_service

def reembed_all():
    db = SessionLocal()
    materials = db.query(Material).all()
    print(f"Found {len(materials)} materials to re-embed.")
    
    for mat in materials:
        print(f"Re-embedding {mat.title}...")
        tags_str = ", ".join(mat.tags) if mat.tags else ""
        summary_str = mat.summary or ""
        content_str = mat.content or ""
        
        advanced_semantic_text = f"Title: {mat.title}\nTags: {tags_str}\nSummary: {summary_str}\n\nContent: {content_str}"
        
        # Use the fixed generate_embedding which has REST API fallback
        new_embedding = ai_service.generate_embedding(advanced_semantic_text)
        
        # Verify it worked
        if sum(abs(v) for v in new_embedding) > 0.0:
            mat.embedding = new_embedding
            print(f"Successfully re-embedded {mat.title}")
        else:
            print(f"Failed to generate valid embedding for {mat.title}")
            
    db.commit()
    print("Done.")

if __name__ == "__main__":
    reembed_all()
