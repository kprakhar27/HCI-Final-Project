from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from .models import Patient, Feedback, Users

user_bp = Blueprint('user', __name__)

@user_bp.route('/process', methods=['POST'])
@jwt_required()
def process_input():
    data = request.get_json()
    
    # Placeholder for AI processing logic.
    response = {"message": "Processed input: " + data.get('input')}
    
    return jsonify(response), 200