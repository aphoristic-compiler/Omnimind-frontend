import os
from dotenv import load_dotenv

# Try to load .env from the root directory or api directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv()

from database import engine, Base
import models

def reset_database():
    print("=========================================")
    print("⚠️  WARNING: DATABASE RESET TOOL ⚠️")
    print("=========================================")
    print("This will completely drop all existing tables and data.")
    print("This is required to apply the new Vector(1024) schema for Cohere.")
    confirm = input("\nType 'YES' to confirm and wipe the database: ")
    
    if confirm == "YES":
        print("\nDropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        print("Recreating all tables with the new schema...")
        Base.metadata.create_all(bind=engine)
        
        print("\n✅ Database successfully reinitialized!")
        print("You can now start your FastAPI server. The seeder will automatically add categories.")
    else:
        print("\nAborted. No changes were made.")

if __name__ == "__main__":
    reset_database()
