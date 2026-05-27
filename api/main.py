from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
import uuid

from .database import engine, get_db, Base
from .models import User, Category, Material, MaterialView
from . import auth, ai_service, schemas

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OmniMind API")

# Setup default categories on startup
def seed_categories(db: Session):
    cats = [
        {"name": "AI & Machine Learning", "slug": "ai-machine-learning", "color_code": "#FF5733"},
        {"name": "Data Science", "slug": "data-science", "color_code": "#33FF57"},
        {"name": "Software Engineering", "slug": "software-engineering", "color_code": "#3357FF"},
        {"name": "General", "slug": "general", "color_code": "#888888"}
    ]
    for c in cats:
        if not db.query(Category).filter(Category.slug == c["slug"]).first():
            db.add(Category(**c))
    db.commit()

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_categories(db)

# --- AUTH ENDPOINTS ---
@app.post("/api/auth/signup", response_model=schemas.Token)
@app.post("/api/auth/register", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed_pw = auth.get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = auth.create_access_token(data={"sub": str(new_user.id)})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Allow login by username or email
    user = db.query(User).filter(
        (User.username == form_data.username) | (User.email == form_data.username)
    ).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/api/auth/user", response_model=schemas.UserOut)
def get_user(current_user: User = Depends(auth.get_current_user)):
    return current_user

# --- MATERIAL & UPLOAD ENDPOINTS ---
@app.post("/api/materials")
async def upload_materials(files: List[UploadFile] = File(...), current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    results = []
    for file in files:
        contents = await file.read()
        extracted_text = ai_service.extract_text_from_file(file.filename, contents)
        if not extracted_text: continue
        
        ai_data = ai_service.analyze_content(file.filename, extracted_text)
        embedding = ai_service.generate_embedding(extracted_text)
        
        category = db.query(Category).filter(Category.slug == ai_data["category_slug"]).first()
        cat_id = category.id if category else None

        new_material = Material(
            user_id=current_user.id, category_id=cat_id, title=file.filename,
            content=extracted_text, summary=ai_data["summary"], tags=ai_data["tags"], embedding=embedding
        )
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        results.append({"id": new_material.id, "title": new_material.title})
    return {"message": "Success", "materials": results}

@app.get("/api/materials/{material_id}")
def get_material(material_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    material.views += 1
    db.add(MaterialView(material_id=material_id, user_id=current_user.id))
    db.commit()
    return material

# --- BROWSE & DASHBOARD ENDPOINTS ---
@app.get("/api/materials/browse/most-viewed", response_model=List[schemas.MaterialOut])
def get_most_viewed(db: Session = Depends(get_db)):
    return db.query(Material).order_by(desc(Material.views)).limit(10).all()

@app.get("/api/materials/browse/all", response_model=List[schemas.MaterialOut])
def get_all_materials(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(Material).order_by(desc(Material.created_at)).offset(skip).limit(limit).all()

@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Get most viewed materials
    most_viewed_materials = db.query(Material).order_by(desc(Material.views)).limit(5).all()
    most_visited = []
    for m in most_viewed_materials:
        category_name = "General"
        if m.category_id:
            cat = db.query(Category).filter(Category.id == m.category_id).first()
            if cat:
                category_name = cat.name
        most_visited.append({
            "id": str(m.id),
            "title": m.title,
            "category": category_name,
            "views": m.views,
            "summary": m.summary or "No summary available"
        })
    
    # If no materials, add a placeholder
    if not most_visited:
        most_visited.append({
            "id": "placeholder",
            "title": "No materials yet",
            "category": "General",
            "views": 0,
            "summary": "Upload your first material to get started!"
        })
    
    # Get recently uploaded materials
    recent_materials = db.query(Material).order_by(desc(Material.created_at)).limit(10).all()
    recently_uploaded = []
    for m in recent_materials:
        category_name = "General"
        if m.category_id:
            cat = db.query(Category).filter(Category.id == m.category_id).first()
            if cat:
                category_name = cat.name
        recently_uploaded.append({
            "id": str(m.id),
            "title": m.title,
            "category": category_name,
            "uploaded_at": m.created_at.isoformat() if m.created_at else ""
        })
    
    # Count user's personal contributions
    user_contributions = db.query(Material).filter(Material.user_id == current_user.id).count()
    
    # Trending topics (simplified - could be enhanced with actual trending logic)
    trending_topics = [
        {"topic": "AI & Machine Learning", "trend": [10, 15, 12, 18, 22, 25, 30]},
        {"topic": "Data Science", "trend": [8, 12, 15, 14, 18, 20, 22]},
        {"topic": "Software Engineering", "trend": [5, 8, 10, 12, 15, 18, 20]}
    ]
    
    return schemas.DashboardStats(
        most_visited=most_visited,
        recently_uploaded=recently_uploaded,
        user_contributions=user_contributions,
        trending_topics=trending_topics
    )

# --- SEARCH ENDPOINT ---
@app.get("/api/search")
def search_materials(q: str, db: Session = Depends(get_db)):
    query_embedding = ai_service.generate_embedding(q)
    return db.query(Material).order_by(Material.embedding.cosine_distance(query_embedding)).limit(10).all()
