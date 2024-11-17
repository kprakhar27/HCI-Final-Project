from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
# from flask_migrate import Migrate
from .config import Config
from .models import db, Users, Patient, Feedback

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:3000"])

    db.init_app(app)
    # migrate.init_app(app, db)
    jwt.init_app(app)

    # Register blueprints here to avoid circular imports
    from .routes import routes_bp
    from .auth import auth_bp

    app.register_blueprint(routes_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/auth')

    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "Users": Users,
            "Patient": Patient,
            "Feedback": Feedback,
        }

    with app.app_context():
        db.create_all()

    return app
