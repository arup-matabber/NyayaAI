import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ensure absolute rigid pathing so we don't spawn ghost DBs based on terminal CWD
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
db_dir = os.path.join(BASE_DIR, "data")
if not os.path.exists(db_dir):
    os.makedirs(db_dir)
    
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(db_dir, 'nyaya_db.sqlite')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
