import os
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

# NullPool prevents database connection exhaustion on Vercel Serverless
engine = create_engine(
    DATABASE_URL, 
    poolclass=pool.NullPool 
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()