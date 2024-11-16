from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.models import Patient, Feedback, Users

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