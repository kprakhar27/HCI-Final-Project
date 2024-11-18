from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import text

from .models import Patient, Feedback, Users
from . import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/checkprofile', methods=['POST'])
@jwt_required()
def process_input():
    data = request.get_json()
    username = data.get("username")
    
    query  = f"""SELECT
                CASE WHEN EXISTS 
                (
                    SELECT p.name
                    FROM users u
                    JOIN patient p 
                    ON u.id=p.user_id
                    AND u.username='{username}'
                )
                THEN 'TRUE'
                ELSE 'FALSE'
            END"""
    
    with db.engine.connect() as conn:
        result = conn.execute(text(query))
    
    for row in result:
        ans = row[0]
    
    # Placeholder for AI processing logic.
    response = {"response": ans}
    
    return jsonify(response), 200

@user_bp.route('/llm', methods=['POST'])
@jwt_required()
def llm_response():
    try:
        data = request.get_json()
        input = data.get("prompt")
        
        # Placeholder for AI processing logic.
        response = {"response": "sample response " + input}
        
        return jsonify(response), 200
    except Exception as e:
        response = {"error": "error occured", "detail":str(e)}
        return jsonify(response), 400