import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserRole } from "./types";

// Pages communes
import Login from "./pages/Login";

// Pages Admin
import Consultations from "./pages/Consultations";
import DoctorConsultation from "./pages/doctor/Consultations";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import DoctorPatient from "./pages/doctor/Patients";
import PatientConsultation from "./pages/patient/Consulation";
import Patients from "./pages/Patients";


// Pages Médecin
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Pages Patient

// Route protection component with role-based access
const ProtectedRoute = ({ children, requiredRoles }: { children: JSX.Element, requiredRoles?: UserRole[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Log for debugging
  console.log("Protected route check:", { isAuthenticated, isLoading, path: location.pathname, userRole: user?.typeUtilisateur, requiredRoles });

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
    if (!user || !requiredRoles.includes(user.typeUtilisateur)) {
      // Rediriger vers la page appropriée en fonction du rôle de l'utilisateur
      if (user?.typeUtilisateur === UserRole.ADMIN) {
        return <Navigate to="/" replace />;
      } else if (user?.typeUtilisateur === UserRole.DOCTOR) {
        return <Navigate to="/doctor" replace />;
      } else if (user?.typeUtilisateur === UserRole.PATIENT) {
        return <Navigate to="/patient/consultations" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return children;
};

function CatchAllRedirect() {
  const { user } = useAuth();
  switch (user?.typeUtilisateur) {
    case UserRole.ADMIN:
      return <Navigate to="/" replace />;
    case UserRole.DOCTOR:
      return <Navigate to="/doctor" replace />;
    case UserRole.PATIENT:
      return <Navigate to="/patient/consultations" replace />;
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

          <Route path="/patients" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <Patients />
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

          <Route path="/consultations" element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Layout>
                <Consultations />
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

          <Route path="/doctor/consultations" element={
            <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
              <Layout>
                <DoctorConsultation />
              </Layout>
            </ProtectedRoute>
          } />


          <Route path="/doctor/patients" element={
            <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
              <Layout>
                <DoctorPatient />
              </Layout>
            </ProtectedRoute>
          } />



          {/* Routes Patient */}
          <Route path="/patient" element={
            <ProtectedRoute requiredRoles={[UserRole.PATIENT]}>
              <Layout>
                <div>Patient dash</div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/patient/consultations" element={
            <ProtectedRoute requiredRoles={[UserRole.PATIENT]}>
              <Layout>
                <PatientConsultation />
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
