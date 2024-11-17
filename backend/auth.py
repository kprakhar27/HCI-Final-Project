from flask import request, jsonify, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import BadRequestKeyError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from .models import Users, db, Patient, Feedback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello World'}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()  # Expecting JSON data
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
        
        hashed_password = generate_password_hash(password, method="pbkdf2:sha256")
        
        # Create and add new user to the database with role
        new_user = Users(username=username, password_hash=hashed_password, role=role)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        return jsonify({'error': 'Server Error', 'detail': str(e)}), 500



@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Users.query.filter_by(username=data['username']).first()

    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    if not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity={'username': user.username})
    return jsonify(access_token=access_token), 200


@auth_bp.route('/patients', methods=['GET'])
@jwt_required()  # Ensure user is authenticated with JWT
def get_patients():
    current_user = get_jwt_identity()  # Get the current logged-in user's identity
    print('Current_user:', current_user)
    caregiver = Users.query.filter_by(username=current_user['username']).first()  # Get user by username

    if caregiver:
        # Fetch patients assigned to the caregiver
        patients = Patient.query.filter_by(caregiver_id=caregiver.id).all()
        patients_list = [{'id': patient.id, 'name': patient.name, 'age': patient.age} for patient in patients]

        return jsonify(patients_list), 200
    else:
        return jsonify({'message': 'Caregiver not found'}), 404


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
