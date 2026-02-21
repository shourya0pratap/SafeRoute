from flask import Flask

# Initialize the Flask application
app = Flask(__name__)

# Import the routes so Flask knows what pages exist
from app import routes