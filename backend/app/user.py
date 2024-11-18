from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text

from .models import Patient, Feedback, Users
from . import db

import requests

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
        OPENAI_API_KEY = ""
        OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

        data = request.get_json()
        input = data.get("prompt")

        if not input:
            return jsonify({"error": "No prompt provided"}), 400

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "gpt-3.5-turbo", 
            "messages": [{"role": "user", "content": input}]
        }

        response = requests.post(OPENAI_API_URL, json=payload, headers=headers)
        # write llm code
        if response.status_code == 200:
            response_data = response.json()
            llm_output = response_data['choices'][0]['message']['content']
            return jsonify({"response": llm_output}), 200
        else:
            return jsonify({"error": "Error from OpenAI API", "details": response.text}), response.status_cod
        
        # Placeholder for AI processing logic.
        # response = {"response": llm_output}
        
        # return jsonify(response), 200
    except Exception as e:
        response = {"error": "error occured", "detail":str(e)}
        return jsonify(response), 400

@user_bp.route('/addprofile', methods=['POST'])
@jwt_required()
def add_profile():
    try:
        data = request.get_json()
        
        current_user = get_jwt_identity()
        caregiver_username=data.get('caregiverUsername'),
        
        user_query = f"""SELECT id FROM users WHERE username = '{current_user['username']}';"""
        caregiver_query = f"""SELECT id FROM users WHERE username = '{caregiver_username[0]}';"""
        
        with db.engine.connect() as conn:
            user_result = conn.execute(text(user_query))
            caregiver_result = conn.execute(text(caregiver_query))
        
        for row in user_result:
            user_id = row[0]
            
        caregiver_id = None

        for row in caregiver_result:
            caregiver_id = row[0]
        
        new_user = Patient(
            name=data['name'],
            age=data['age'],
            occupation=data['occupation'],
            topic=data['topic'],
            disorder_details=data['disorderDetails'],
            is_diagnosed=data['isDiagnosed'],
            level=data['level'],
            user_id = user_id,
            caregiver_id = caregiver_id,
        )
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User details added successfully!", "status":"success"}), 201
    except Exception as e:
        response = {"error": "error occured", "detail":str(e), "status":"fail"}
        return jsonify(response), 400

