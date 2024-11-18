import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PreferenceForm.css';
import axios from 'axios';

function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    topic: '',
    disorderDetails: '',
    isDiagnosed: false,
    level: '',
    caregiverUsername: ''
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [editingField, setEditingField] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle boolean checkbox change (for isDiagnosed)
  const handleCheckboxChange = (e) => {
      const { name, checked } = e.target;
      setFormData({
          ...formData,
          [name]: checked,
      });
  };

  // Submit form to backend
  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await fetch('http://localhost:8000/user/addprofile', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(formData),
          });
          const result = await response.json();
          setSubmittedData(result.user); // Store submitted data for display
      } catch (error) {
          console.error('Error submitting form:', error);
      }
  };

  // Handle field update
  const handleUpdateField = async (field) => {
      try {
          const response = await fetch(`/update-details/${submittedData.id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ [field]: formData[field] }),
          });
          const result = await response.json();
          setSubmittedData((prev) => ({
              ...prev,
              [field]: formData[field],
          }));
          setEditingField(null); // Stop editing mode after update
      } catch (error) {
          console.error('Error updating field:', error);
      }
  };

  return (
      <div>
          <h2>User Details Form</h2>
          <form onSubmit={handleSubmit}>
              <label>
                  Name:
                  <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </label>
              <br />
              <label>
                  Age:
                  <input type="number" name="age" value={formData.age} onChange={handleChange} />
              </label>
              <br />
              <label>
                  Occupation:
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
              </label>
              <br />
              <label>
                  Topic:
                  <input type="text" name="topic" value={formData.topic} onChange={handleChange} />
              </label>
              <br />
              <label>
                  Disorder Details:
                  <input type="text" name="disorderDetails" value={formData.disorderDetails} onChange={handleChange} />
              </label>
              <br />
              <label>
                  Is Diagnosed:
                  <input type="checkbox" name="isDiagnosed" checked={formData.isDiagnosed} onChange={handleCheckboxChange} />
              </label>
              <br />
              <label>
                  Caregiver Username:
                  <input type="text" name="caregiverUsername" value={formData.caregiverUsername} onChange={handleChange} />
              </label>
              <br />
              <label>
                  Level:
                  <input type="text" name="level" value={formData.level} onChange={handleChange} />
              </label>
              <br />
              
              {/* Submit Button */}
              {!submittedData && (
                <button type="submit">Submit</button>
              )}
          </form>

          {/* Display Submitted Data */}
          {submittedData && (
            <>
                <h3>Submitted Data:</h3>
                {Object.keys(submittedData).map((key) => (
                    <div key={key}>
                        {editingField === key ? (
                            <>
                                {/* Editable Input Field */}
                                <input 
                                    type={key === "isDiagnosed" ? "checkbox" : "text"}
                                    name={key}
                                    value={formData[key]}
                                    checked={key === "isDiagnosed" ? formData[key] : undefined}
                                    onChange={(e) => key === "isDiagnosed" ? handleCheckboxChange(e) : handleChange(e)}
                                />
                                {/* Update Button */}
                                <button onClick={() => handleUpdateField(key)}>Update</button>
                            </>
                        ) : (
                            <>
                                {/* Display Field */}
                                {key}: {submittedData[key].toString()}
                                {/* Edit Button */}
                                <button onClick={() => setEditingField(key)}>Edit</button>
                            </>
                        )}
                    </div>
                ))}
            </>
          )}
      </div>
  );
}

export default UserForm;