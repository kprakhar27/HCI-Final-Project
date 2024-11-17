from app import create_app, db
from app.models import Users, Patient, Feedback
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Clear existing data
    db.session.query(Feedback).delete()
    db.session.query(Patient).delete()
    db.session.query(Users).delete()

    # Add new data
    caregiver = Users(username='test1', password_hash=generate_password_hash('test1'), role='caregiver')
    db.session.add(caregiver)
    db.session.commit()

    # Now add patient and feedback
    patient = Patient(name='Patient A', age=30, caregiver_id=caregiver.id) 
    db.session.add(patient)
    db.session.commit()  

    feedback = Feedback(caregiver_id=caregiver.id, feedback_text='Great platform!', patient_id=patient.id)
    db.session.add(feedback)
    db.session.commit() 

    print("Database seeded!")