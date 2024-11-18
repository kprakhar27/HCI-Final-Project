import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import PatientProfiles from './components/PatientProfiles';
import FeedbackPage from './components/Feedback';
import CGDashboard from './components/CGDashboard';
import Main from './components/Main';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />  {/* Add Register Route */}
        <Route path="/cgdashboard" element={<CGDashboard />} /> {/* Add the dashboard route */}
        <Route path="/main" element={<Main />} /> {/* Add the main dashboard route */}
        <Route path="/feedback" element={<FeedbackPage />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;
