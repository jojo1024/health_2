import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserRole } from "./types";
import Layout from "./components/Layout";

// Pages communes
import Login from "./pages/Login";

// Pages Admin
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientForm from "./pages/PatientForm";
import Doctors from "./pages/Doctors";
import DoctorForm from "./pages/DoctorForm";
import Consultations from "./pages/Consultations";
import Prescriptions from "./pages/Prescriptions";
import PatientDetails from "./pages/PatientDetails";
import PatientConsultations from "./pages/PatientConsultations";
import DoctorDetails from "./pages/DoctorDetails";
import ConsultationForm from "./pages/ConsultationForm";
import ConsultationDetails from "./pages/ConsultationDetails";
import ReimbursementForm from "./pages/ReimbursementForm";
import PrescriptionDetails from "./pages/PrescriptionDetails";
import PrescriptionForm from "./pages/PrescriptionForm";

// Pages Médecin
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import RequestAccess from "./pages/doctor/RequestAccess";

// Pages Patient
import PatientDashboard from "./pages/patient/PatientDashboard";

// Route protection component with role-based access
const ProtectedRoute = ({ children, requiredRoles }: { children: JSX.Element, requiredRoles?: UserRole[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Log for debugging
  console.log("Protected route check:", { isAuthenticated, isLoading, path: location.pathname, userRole: user?.role, requiredRoles });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles sont requis, vérifier que l'utilisateur a l'un de ces rôles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!user || !requiredRoles.includes(user.role)) {
      // Rediriger vers la page appropriée en fonction du rôle de l'utilisateur
      if (user?.role === UserRole.ADMIN) {
        return <Navigate to="/" replace />;
      } else if (user?.role === UserRole.DOCTOR) {
        return <Navigate to="/doctor" replace />;
      } else if (user?.role === UserRole.PATIENT) {
        return <Navigate to="/patient" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return children;
};

function CatchAllRedirect() {
  const { user } = useAuth();
  switch (user?.role) {
    case UserRole.ADMIN:
      return <Navigate to="/" replace />;
    case UserRole.DOCTOR:
      return <Navigate to="/doctor" replace />;
    case UserRole.PATIENT:
      return <Navigate to="/patient" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  // Log the application bootstrap
  console.log("App rendering");

  return (
    <AuthProvider>
      <Router>
        {/* Added a key to force remount when the route changes */}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/patients/new" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <PatientForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/patients" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <Patients />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/patients/:id" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <PatientDetails />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/patients/:patientId/consultations" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <PatientConsultations />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/doctors" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <Doctors />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/doctors/new" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <DoctorForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/doctors/:id" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <DoctorDetails />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/doctors/:id/edit" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <DoctorForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/consultations" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <Consultations />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/consultations/new" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <ConsultationForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/consultations/:id" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <ConsultationDetails />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/consultations/:id/edit" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <ConsultationForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/consultations/:consultationId/reimbursement" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <ReimbursementForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/prescriptions/new" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <PrescriptionForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/prescriptions" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <Prescriptions />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/prescriptions/:id" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <PrescriptionDetails />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/prescriptions/:id/edit" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <PrescriptionForm />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Routes Médecin */}
          <Route path="/doctor" element={
            <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
              <Layout>
                <DoctorDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/doctor/request-access" element={
            <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
              <Layout>
                <RequestAccess />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Routes Patient */}
          <Route path="/patient" element={
            <ProtectedRoute requiredRoles={[UserRole.PATIENT]}>
              <Layout>
                <PatientDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Redirection role-based pour la racine */}
          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
