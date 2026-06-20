import sqlite3
import os
import sys

# pointing to dashboard
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.insert(0, parent_dir)

# python read config.py file to get the database path
from config import Config

def init_db():
    db_path = Config.DATABASE
    schema_path = os.path.join(current_dir, 'schema.sql')

    print(f"🚀 Initializing database at: {db_path}")
    
    connection = sqlite3.connect(db_path)
    with open(schema_path, 'r') as f:
        connection.executescript(f.read())
        
    connection.commit()
    connection.close()
    
    print("✅ Database successfully initialized with 'sales' table and dummy data!")

if __name__ == '__main__':
    init_db()