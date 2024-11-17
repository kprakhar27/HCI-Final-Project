from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(50), nullable=False)

class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    caregiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    caregiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=True)
    feedback_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())
