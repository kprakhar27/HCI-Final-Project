from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        db.create_all()
        
        from .routes import ai_bp
        from .auth import auth_bp

        app.register_blueprint(ai_bp)
        app.register_blueprint(auth_bp)

    return app