from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text

from .models import Patient, Feedback, Users, Caregiver, db

ai_bp = Blueprint("ai", __name__)
routes_bp = Blueprint("routes", __name__)


@ai_bp.route("/process", methods=["POST"])
@jwt_required()
def process_input():
    data = request.get_json()

    # Placeholder for AI processing logic.
    response = {"message": "Processed input: " + data.get("input")}

    return jsonify(response), 200


@ai_bp.route("/patients", methods=["GET"])
@jwt_required()
def get_patients():
    user = get_jwt_identity()
    caregiver = Users.query.filter_by(username=user).first()
    if not caregiver:
        return jsonify({"error": "Caregiver not found"}), 404

    patients = Patient.query.filter_by(caregiver_id=caregiver.id).all()
    return jsonify([{"id": p.id, "name": p.name, "age": p.age} for p in patients]), 200


@routes_bp.route("/add_user", methods=["POST"])
def add_user():
    data = request.get_json()

    # Extract user data from the request
    username = data.get("username")
    password_hash = data.get("password_hash")
    role = data.get("role")

    if username and password_hash and role:
        # Create a new user
        new_user = Users(username=username, password_hash=password_hash, role=role)

        # Add the user to the database
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": f"User {username} created successfully!"}), 201
    else:
        return jsonify({"message": "Missing user information!"}), 400


@routes_bp.route("/addprofile", methods=["POST"])
@jwt_required()
def add_profile():
    try:
        data = request.get_json()

        current_user = get_jwt_identity()
        user = Users.query.filter_by(username=current_user).first()

        new_user = Caregiver(
            name=data["name"],
            age=data["age"],
            occupation=data["occupation"],
            license=data["license"],
            user_id=user.id,
        )
        db.session.add(new_user)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Caregiver details added successfully!",
                    "status": "success",
                }
            ),
            201,
        )
    except Exception as e:
        response = {"error": "error occured", "detail": str(e), "status": "fail"}
        return jsonify(response), 400


@routes_bp.route("/getprofile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        current_user = get_jwt_identity()

        query = f"""SELECT *
		FROM users u
		JOIN caregiver c 
		ON u.id=c.user_id
		AND u.username='{current_user}';"""

        with db.engine.connect() as conn:
            result = conn.execute(text(query))

        user_detail = None

        for row in result:
            user_detail = row._asdict()

        if user_detail:
            user_detail["status"] = "success"
            user_detail["message"] = "Caregiver details successfully fetched"
            return jsonify(user_detail), 201
        else:
            return (
                jsonify({"message": "User details not added", "status": "notexist"}),
                201,
            )
    except Exception as e:
        response = {"error": "error occured", "detail": str(e), "status": "fail"}
        return jsonify(response), 400


@routes_bp.route("/updateprofile", methods=["POST"])
@jwt_required()
def update_profile():
    try:
        data = request.get_json()

        current_user = get_jwt_identity()
        user = Users.query.filter_by(username=current_user).first()

        caregiver = Caregiver.query.filter_by(user_id=user.id).first()

        caregiver.name = data["name"]
        caregiver.age = data["age"]
        caregiver.occupation = data["occupation"]
        caregiver.license = data["license"]
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


@routes_bp.route("/deleteprofile", methods=["POST"])
@jwt_required()
def delete_profile():
    try:
        # Get the current user's identity
        current_user = get_jwt_identity()

        # Find the user in the database
        user = Users.query.filter_by(username=current_user).first()
        if not user:
            return jsonify({"error": "User not found", "status": "fail"}), 404

        # Find the caregiver profile associated with the user
        caregiver = Caregiver.query.filter_by(user_id=user.id).first()
        if not caregiver:
            return (
                jsonify({"error": "Caregiver profile not found", "status": "fail"}),
                404,
            )

        # Remove caregiver_id from patients associated with this caregiver
        Patient.query.filter_by(caregiver_id=user.id).update({"caregiver_id": None})

        # Delete all related feedback messages for the users
        Feedback.query.filter_by(user_id=user.id).delete()

        # Delete the caregiver profile
        db.session.delete(caregiver)

        # Delete the user record
        db.session.delete(user)

        # Commit all changes to the database
        db.session.commit()

        return (
            jsonify({"message": "Profile deleted successfully", "status": "success"}),
            200,
        )

    except Exception as e:
        # Return a detailed error response if something goes wrong
        response = {"error": "An error occurred", "detail": str(e), "status": "fail"}
        return jsonify(response), 500
