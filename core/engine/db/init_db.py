import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from core.engine.db.database import engine, Base
from core.engine.db import models

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created locally in core/data.")

if __name__ == "__main__":
    init_db()
