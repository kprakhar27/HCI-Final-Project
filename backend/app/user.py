from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from dotenv import load_dotenv
import os

load_dotenv()

from .models import Patient, Feedback, Users
from . import db

import requests

user_bp = Blueprint("user", __name__)


@user_bp.route("/checkprofile", methods=["POST"])
@jwt_required()
def process_input():
    data = request.get_json()
    username = data.get("username")

    query = f"""SELECT
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


@user_bp.route("/llm", methods=["POST"])
@jwt_required()
def llm_response():
    try:
        OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
        OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

        data = request.get_json()
        input = data.get("prompt")

        if not input:
            return jsonify({"error": "No prompt provided"}), 400

        current_user = get_jwt_identity()
        user = Users.query.filter_by(username=current_user).first()
        patient = Patient.query.filter_by(user_id=user.id).first()

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        context_message = f"""You are a supportive and detail-oriented conversational 
        assistant designed to interact with individuals on the autism spectrum. 
        Your responses should prioritize clarity, structure, and precision, tailored 
        to the user's preferences and communication style. Always strive to provide 
        direct answers when the question is clear. If the question is vague or lacks 
        sufficient detail, engage the user by discussing their preferred topics or gently
        asking for clarification.
        The user has the following profile:
        Autism Level: {patient.level}
        Diagnosis Details:{patient.disorder_details}
        Preferred Topics: {patient.topic}
        Guidelines for Interaction:
        Clarity and Precision: Always give direct and fact-based answers when possible. 
        Avoid overloading with unnecessary information unless requested.
        Structured Responses: Present information in clear, organized formats such as
        bullet points, numbered lists, or concise paragraphs.
        Engagement through Interests: If the question is vague or you’re unsure of the 
        intent, shift the conversation toward the user’s favorite topics or interests
        to keep them engaged.
        Sensitivity to Communication Style: Be patient and respectful. Avoid using 
        overly figurative language or idioms unless they align with the user’s understanding.
        Encouraging Detail: If needed, gently ask clarifying questions to help the 
        user provide more context or refine their inquiry.
        For example:

        If the user asks, "What's something interesting?" and they like trains, 
        you might respond with, "Did you know that the world’s fastest train is 
        the Shanghai Maglev, which can reach speeds of 267 miles per hour?"
        """

        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": context_message},
                {"role": "user", "content": input},
            ],
        }

        # payload = {
        #     "model": "gpt-3.5-turbo",
        #     "messages": [{"role": "user", "content": input}]
        # }

        response = requests.post(OPENAI_API_URL, json=payload, headers=headers)
        # write llm code
        if response.status_code == 200:
            response_data = response.json()
            llm_output = response_data["choices"][0]["message"]["content"]
            return jsonify({"response": llm_output}), 200
        else:
            return (
                jsonify({"error": "Error from OpenAI API", "details": response.text}),
                response.status_cod,
            )

        # Placeholder for AI processing logic.
        # response = {"response": llm_output}

        # return jsonify(response), 200
    except Exception as e:
        response = {"error": "error occured", "detail": str(e)}
        return jsonify(response), 400


@user_bp.route("/addprofile", methods=["POST"])
@jwt_required()
def add_profile():
    try:
        data = request.get_json()

        current_user = get_jwt_identity()
        caregiver_username = (data.get("caregiverUsername"),)

        user_query = f"""SELECT id FROM users WHERE username = '{current_user}';"""
        caregiver_query = (
            f"""SELECT id FROM users WHERE username = '{caregiver_username[0]}';"""
        )

        with db.engine.connect() as conn:
            user_result = conn.execute(text(user_query))
            caregiver_result = conn.execute(text(caregiver_query))

        for row in user_result:
            user_id = row[0]

        caregiver_id = None

        for row in caregiver_result:
            caregiver_id = row[0]

        new_user = Patient(
            name=data["name"],
            age=data["age"],
            occupation=data["occupation"],
            topic=data["topic"],
            disorder_details=data["disorderDetails"],
            is_diagnosed=data["isDiagnosed"],
            level=data["level"],
            user_id=user_id,
            caregiver_id=caregiver_id,
        )
        db.session.add(new_user)
        db.session.commit()

        return (
            jsonify(
                {"message": "User details added successfully!", "status": "success"}
            ),
            201,
        )
    except Exception as e:
        response = {"error": "error occured", "detail": str(e), "status": "fail"}
        return jsonify(response), 400


@user_bp.route("/getprofile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        current_user = get_jwt_identity()

        query = f"""SELECT *
		FROM users u
		JOIN patient p 
		ON u.id=p.user_id
		AND u.username='{current_user}';"""

        with db.engine.connect() as conn:
            result = conn.execute(text(query))

        user_detail = None

        for row in result:
            user_detail = row._asdict()

        if user_detail:
            if user_detail["caregiver_id"]:
                caregiver_query = f"""SELECT username FROM users WHERE id = '{user_detail['caregiver_id']}';"""

                with db.engine.connect() as conn:
                    result = conn.execute(text(caregiver_query))

                for row in result:
                    caregiver = row._asdict()

                user_detail["cg_name"] = caregiver["username"]
            else:
                user_detail["cg_name"] = ""

            user_detail["status"] = "success"
            user_detail["message"] = "User details successfully fetched"
            return jsonify(user_detail), 201
        else:
            return (
                jsonify({"message": "User details not added", "status": "notexist"}),
                201,
            )
    except Exception as e:
        response = {"error": "error occured", "detail": str(e), "status": "fail"}
        return jsonify(response), 400


@user_bp.route("/updateprofile", methods=["POST"])
@jwt_required()
def update_profile():
    try:
        data = request.get_json()

        current_user = get_jwt_identity()
        user = Users.query.filter_by(username=current_user).first()
        caregiver = Users.query.filter_by(
            username=data.get("caregiverUsername")
        ).first()

        patient = Patient.query.filter_by(user_id=user.id).first()

        patient.name = data["name"]
        patient.age = data["age"]
        patient.occupation = data["occupation"]
        patient.topic = data["topic"]
        patient.disorder_details = data["disorderDetails"]
        patient.is_diagnosed = data["isDiagnosed"]
        patient.level = data["level"]
        patient.user_id = user.id
        if caregiver:
            patient.caregiver_id = caregiver.id
        else:
            patient.caregiver_id = None

        db.session.commit()

        return (
            jsonify(
                {"message": "User details updated successfully!", "status": "success"}
            ),
            201,
        )
    except Exception as e:
        response = {"error": "error occured", "detail": str(e), "status": "fail"}
        return jsonify(response), 400


@user_bp.route("/patients/<int:id>/topics", methods=["POST"])
@jwt_required()
def addTopicsForPatients(id):
    try:
        current_user_id = (
            get_jwt_identity()
        )  # Ensure `get_jwt_identity` is properly set up

        patient = Patient.query.filter_by(id=id).first()
        print(patient)

        if not patient:
            return jsonify({"error": f"Patient with ID {id} not found."}), 404

        # Get the JSON payload
        data = request.get_json()
        if not data or "topics" not in data:
            return (
                jsonify({"error": 'Invalid request. "topics" field is required.'}),
                400,
            )

        print(data)
        # Update the topics field for the patient
        patient.topic = data["topics"]
        db.session.commit()

        return jsonify({"message": "Topics successfully updated for the patient."}), 200

    except Exception as e:
        print(f"Error adding topics for patient: {e}")
        return (
            jsonify({"error": "An unexpected error occurred. Please try again later."}),
            500,
        )


@user_bp.route("/patients/<int:id>", methods=["GET"])
@jwt_required()
def getPatientDetchrailsForCaregiver(id):
    try:
        current_user = get_jwt_identity()
        # print('id:',id)
        query = f"""SELECT *
		FROM patient p
		WHERE p.id = '{id}';"""

        # print(query)

        with db.engine.connect() as conn:
            result = conn.execute(text(query))

        patient_details = None

        for row in result:
            patient_details = row._asdict()

        # print(patient_details)

        return jsonify(patient_details), 201

    except Exception as e:
        response = {"error": "error occured", "detail": str(e), "status": "fail"}
        return jsonify(response), 400
