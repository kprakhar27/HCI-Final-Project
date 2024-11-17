from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from .models import Patient, Feedback, Users

ai_bp = Blueprint('ai', __name__)
routes_bp = Blueprint('routes', __name__)

@ai_bp.route('/process', methods=['POST'])
@jwt_required()
def process_input():
    data = request.get_json()
    
    # Placeholder for AI processing logic.
    response = {"message": "Processed input: " + data.get('input')}
    
    return jsonify(response), 200


@ai_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    user = get_jwt_identity()
    caregiver = Users.query.filter_by(username=user['username']).first()
    if not caregiver:
        return jsonify({'error': 'Caregiver not found'}), 404

    patients = Patient.query.filter_by(caregiver_id=caregiver.id).all()
    return jsonify([{'id': p.id, 'name': p.name, 'age': p.age} for p in patients]), 200

@ai_bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    data = request.get_json()
    user = get_jwt_identity()
    caregiver = Users.query.filter_by(username=user['username']).first()
    
    if not caregiver:
        return jsonify({'error': 'Caregiver not found'}), 404

    feedback = Feedback(
        caregiver_id=caregiver.id,
        patient_id=data.get('patient_id'),
        feedback_text=data['feedback']
    )
    db.session.add(feedback)
    db.session.commit()

    return jsonify({'message': 'Feedback submitted successfully'}), 201


@routes_bp.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()

    # Extract user data from the request
    username = data.get('username')
    password_hash = data.get('password_hash')
    role = data.get('role')

    if username and password_hash and role:
        # Create a new user
        new_user = Users(username=username, password_hash=password_hash, role=role)
        
        # Add the user to the database
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": f"User {username} created successfully!"}), 201
    else:
        return jsonify({"message": "Missing user information!"}), 400


# @routes_bp.route('/add_patient', methods=['POST'])
# @jwt_required()
# def add_patient():
#     current_user = get_jwt_identity()
    
#     # Check if the user is a caregiver
#     user = Users.query.filter_by(username=current_user['username']).first()
#     if user is None or user.role != 'caregiver':
#         return jsonify({'error': 'Unauthorized, only caregivers can add patients'}), 403

#     # Get the patient data from the request
#     data = request.get_json()
#     name = data.get('name')
#     age = data.get('age')

#     if not name or not age:
#         return jsonify({'error': 'Name and age are required'}), 400

#     # Add the new patient
#     new_patient = Patient(name=name, age=age, caregiver_id=user.id)
#     db.session.add(new_patient)
#     db.session.commit()

#     return jsonify({'message': 'Patient added successfully'}), 201


# @routes_bp.route('/patients', methods=['GET'])
# @jwt_required()
# def get_patients():
#     current_user = get_jwt_identity()
    
#     # Get the user object
#     user = Users.query.filter_by(username=current_user['username']).first()
    
#     if user is None or user.role != 'caregiver':
#         return jsonify({'error': 'Unauthorized, only caregivers can view patients'}), 403
    
#     # Query the patients who are assigned to this caregiver
#     patients = Patient.query.filter_by(caregiver_id=user.id).all()
    
#     # Convert patients to a list of dictionaries to return as JSON
#     patients_list = [{'id': patient.id, 'name': patient.name, 'age': patient.age} for patient in patients]
    
#     return jsonify(patients_list), 200
