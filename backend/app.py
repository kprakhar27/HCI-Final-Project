from flask import Flask
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from app.routes import routes_bp
from app.auth import auth_bp
from config import Config
from app.models import Users, Patient, db
from flask_cors import CORS  # Allow cross-origin requests for frontend-backend communication
import sys

print(sys.path, 'HERE')

app = Flask(__name__)

# Enable CORS for all routes (this will allow the frontend to make requests to the backend)
CORS(app)

# # Flask app configuration
app.config.from_object(Config)
# app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.SQLALCHEMY_TRACK_MODIFICATIONS
# app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY  # Secret key for JWT

# Initialize database and JWT
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Register blueprints for authentication and routes
app.register_blueprint(auth_bp, url_prefix='/auth')  # Authentication routes (login, signup, etc.)
app.register_blueprint(routes_bp, url_prefix='/api')  # Main API routes (patients, feedback, etc.)


# @app.before_first_request
# def create_tables():
#     # Create all tables before the first request is made (if they don't exist)
#     db.create_all()

if __name__ == "__main__":
    # Run the Flask app
    app.run(debug=True)  # Set to False in production, or use a WSGI server like Gunicorn
