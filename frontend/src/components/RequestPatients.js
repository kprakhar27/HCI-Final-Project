import React from 'react';
import './RequestPatients.css';

const RequestPatientsButton = () => {
    return (
        <div className="request-patients-container">
            <button className="request-patients-btn">
                Request Patients
            </button>
            <div className="request-patients-tooltip">
                You can request that a patient gives access to their profile. But the patient will have to approve the request on their end for it to show on your profile.
            </div>
        </div>
    );
};

export default RequestPatientsButton;
