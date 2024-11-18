from flask import request, jsonify, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import BadRequestKeyError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import text

from .models import Users, db, Patient, Feedback
from .revoked_tokens import add_token_to_blocklist

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello World'}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        role = data.get("role", "caregiver")  # Default to "user" if role is not provided
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        elif not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Check if user already exists
        existing_user = Users.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 400
        
        hashed_password = generate_password_hash(password, method="pbkdf2")
        
        try:
            new_user = Users(username=username, password_hash=hashed_password, role=role)
            db.session.add(new_user)
            db.session.commit()
            
            return jsonify({'message': 'User registered successfully'}), 201
        except  Exception as e:
            return jsonify({'error': 'Unable to register user', 'detail':e.args[0]}), 400
    except Exception as e:
        return jsonify({'error': 'Server Error', 'detail':e.args[0]}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Find user by username
    user = Users.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Create a new access token for this user
    access_token = create_access_token(identity={'username': user.username})

    # Store the generated access token in the user's record
    user.access_token = access_token
    db.session.commit()  # Commit changes to save updated token

    return jsonify(access_token=access_token, role=user.role), 200

# Logout route - revoke access token and store it in PostgreSQL
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Get the current token's unique identifier (JTI)
    jti = get_jwt()["jti"]

    # Add the JTI to the blocklist (revoking the token) by storing it in PostgreSQL
    add_token_to_blocklist(jti)

    return jsonify({"message": "Successfully logged out"}), 200

@auth_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    current_user = get_jwt_identity()
    return jsonify({"valid": True, "user": current_user}), 200

@auth_bp.route('/patients', methods=['GET'])
@jwt_required()  # Ensure user is authenticated with JWT
def get_patients():
    current_user = get_jwt_identity()  # Get the current logged-in user's identity
    print('Current_user:', current_user)
    caregiver = Users.query.filter_by(username=current_user['username']).first()  # Get user by username
    
    query = f"""SELECT *
		FROM users u
		JOIN patient p 
		ON u.id=p.user_id
		AND p.caregiver_id={caregiver.id};"""
  
    with db.engine.connect() as conn:
        result = conn.execute(text(query))
        
    patients_list = [] 
    for row in result:
        patients_list.append(row._asdict())

    # if caregiver:
    #     # Fetch patients assigned to the caregiver
    #     patients = Patient.query.filter_by(caregiver_id=caregiver.id).all()
    #     patients_list = [{'id': patient.id, 'name': patient.name, 'age': patient.age} for patient in patients]

    return jsonify(patients_list), 200
    # else:
    #     return jsonify({'message': 'Caregiver not found'}), 404


@auth_bp.route('/add_patient', methods=['POST'])
@jwt_required()  # Make sure the user is logged in
def add_patient():
    current_user = get_jwt_identity()  # Get the current logged-in user
    
    # Check if the user is a caregiver
    user = Users.query.filter_by(username=current_user['username']).first()
    if user is None or user.role != 'caregiver':
        return jsonify({'error': 'Unauthorized, only caregivers can add patients'}), 403

    # Get the patient data from the request
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')

    if not name or not age:
        return jsonify({'error': 'Name and age are required'}), 400

    # Add the new patient
    new_patient = Patient(name=name, age=age, caregiver_id=user.id)
    db.session.add(new_patient)
    db.session.commit()

    return jsonify({'message': 'Patient added successfully'}), 201

@auth_bp.route('/feedback', methods=['POST'])
@jwt_required()
def give_feedback():
    current_user = get_jwt_identity()
    caregiver = Users.query.filter_by(username=current_user['username']).first()

    if caregiver:
        data = request.get_json()
        feedback_text = data.get('feedback_text')

        if not feedback_text:
            return jsonify({'message': 'Feedback text is required'}), 400

        # Create the feedback entry
        feedback = Feedback(caregiver_id=caregiver.id, feedback_text=feedback_text)
        db.session.add(feedback)
        db.session.commit()

        return jsonify({'message': 'Feedback submitted successfully'}), 200

    return jsonify({'message': 'Unauthorized'}), 403