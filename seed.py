from backend import create_app, db
from backend.models import Users, Patient, Feedback
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Clear existing data (optional)
    db.session.query(Users).delete()
    db.session.query(Patient).delete()
    db.session.query(Feedback).delete()

    # Add new data
    caregiver = Users(username='test1', password_hash=generate_password_hash('test1'), role='caregiver')
    patient = Patient(name='Patient A', age=30, caregiver_id=1)
    feedback = Feedback(caregiver_id=1, feedback_text='Great platform!', patient_id=1)

    db.session.add(caregiver)
    db.session.add(patient)
    db.session.add(feedback)
    db.session.commit()

    print("Database seeded!")
