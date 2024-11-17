import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import PatientProfiles from './components/PatientProfiles';
import FeedbackPage from './components/Feedback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />  {/* Add Register Route */}
        <Route path="/patients" element={<PatientProfiles />} /> {/* Add the PatientList route */}
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
