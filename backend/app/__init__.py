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
        
        from .routes import ai_bp, routes_bp
        from .auth import auth_bp
        from .revoked_tokens import is_token_revoked

        app.register_blueprint(routes_bp, url_prefix='/api')
        app.register_blueprint(auth_bp, url_prefix='/auth')
        
         # Configure JWT to check if the token is revoked by querying the database
        @jwt.token_in_blocklist_loader
        def check_if_token_revoked(jwt_header, jwt_payload):
            return is_token_revoked(jwt_payload)

    return app