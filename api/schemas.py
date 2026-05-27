from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class MaterialOut(BaseModel):
    id: UUID
    title: str
    summary: Optional[str]
    tags: List[str]
    views: int
    created_at: datetime
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_materials: int
    total_views: int
    personal_uploads: int
    trending_categories: List[str]
