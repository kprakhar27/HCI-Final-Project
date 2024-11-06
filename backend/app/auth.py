from flask import request, jsonify, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import BadRequestKeyError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from .models import Users, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello World'}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        username = request.form["username"]
        password = request.form["password"]
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        elif not password:
            return jsonify({'error': 'Password is required'}), 400
            
        hashed_password = generate_password_hash(password, method="pbkdf2")
        
        try:
            new_user = Users(username=username, password_hash=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            
            return jsonify({'message': 'User registered successfully'}), 201
        except  Exception as e:
            return jsonify({'error': 'Unable to register user', 'detail':e.args[0].split('DETAIL:  ')[1]}), 400
    except Exception as e:
        return jsonify({'error': 'Server Error', 'detail':e.args[0]}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Users.query.filter_by(username=data['username']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity={'username': user.username})
    return jsonify(access_token=access_token), 200