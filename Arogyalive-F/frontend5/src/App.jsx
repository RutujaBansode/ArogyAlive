
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AssistantProvider } from './context/AssistantContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceAssistant from './components/VoiceAssistant';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import FindCare from './pages/FindCare';
import Doctors from './pages/Doctors';
import HospitalDetails from './pages/HospitalDetails';
import DoctorProfile from './pages/DoctorProfile';
import Appointment from './pages/Appointment';
import Emergency from './pages/Emergency';
import EmergencyRequest from './pages/EmergencyRequest';

import Login from './pages/Login';
import Register from './pages/Register';

import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import AdminDashboard from './pages/AdminDashboard';

import AmbulanceDashboard from './pages/AmbulanceDashboard';
import AmbulanceVerification from './pages/AmbulanceVerification';

import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AssistantProvider>
          <BrowserRouter>
            <Navbar />

            <main className="al-main">
              <Routes>
                {/* Home */}
                <Route
                  path="/"
                  element={<Home />}
                />

                {/* Find Care */}
                <Route
                  path="/find-care"
                  element={<FindCare />}
                />

                {/* Doctors */}
                <Route
                  path="/doctors"
                  element={<Doctors />}
                />

                {/* Hospital Details */}
                <Route
                  path="/hospital/:id"
                  element={<HospitalDetails />}
                />

                {/* Doctor Profile */}
                <Route
                  path="/doctor/:id"
                  element={<DoctorProfile />}
                />

                {/* Appointment */}
                <Route
                  path="/appointment"
                  element={<Appointment />}
                />

                {/* General Emergency Page */}
                <Route
                  path="/emergency"
                  element={<Emergency />}
                />

                {/* Emergency Ambulance Request */}
                <Route
                  path="/emergency-request"
                  element={<EmergencyRequest />}
                />

                {/* Login */}
                <Route
                  path="/login"
                  element={<Login />}
                />

                {/* Register */}
                <Route
                  path="/register"
                  element={<Register />}
                />

                {/* Patient Dashboard */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute role="patient">
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Dashboard */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute role="doctor">
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Receptionist Dashboard */}
                <Route
                  path="/receptionist/dashboard"
                  element={
                    <ProtectedRoute role="receptionist">
                      <ReceptionistDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Dashboard */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Ambulance Dashboard */}
                <Route
                  path="/ambulance/dashboard"
                  element={
                    <ProtectedRoute role="ambulance">
                      <AmbulanceDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Ambulance Verification */}
                <Route
                  path="/ambulance-verification"
                  element={<AmbulanceVerification />}
                />

                {/* 404 */}
                <Route
                  path="*"
                  element={<NotFound />}
                />
              </Routes>
            </main>

            <Footer />
            <VoiceAssistant />
          </BrowserRouter>
        </AssistantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}