import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { fetchConsultations, selectConsultations } from '../../redux/consultationSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchPatients, selectPatients } from '../../redux/patientSlice';
import { Patient } from '../../types';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const consultations = useAppSelector(selectConsultations);
  const allPatients = useAppSelector(selectPatients);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizedPatients, setAuthorizedPatients] = useState<Patient[]>([]);

  const doctorId = user?.idUtilisateur;

  // Filtrer les consultations du médecin connecté
  const doctorConsultations = useMemo(() => {
    if (!doctorId || !user?.nomUtilisateur) return [];
    return consultations.flatMap(patient =>
      patient.consultations.filter(c => c.nomSoignant === user.nomUtilisateur)
    );
  }, [consultations, user?.nomUtilisateur]);

  // Calculer le nombre total de prescriptions
  const totalPrescriptions = useMemo(() => {
    return doctorConsultations.reduce((acc, curr) => {
      return acc + (curr.ordonnance ? 1 : 0);
    }, 0);
  }, [doctorConsultations]);



  // Mettre à jour les patients autorisés quand les consultations ou les patients changent
  useEffect(() => {
    if (consultations.length > 0 && allPatients.length > 0) {
      const authorized = allPatients.filter(patient =>
        consultations.some(p => String(p.idPatient) === String(patient.idPatient))
      );
      setAuthorizedPatients(authorized);
    }
  }, [consultations, allPatients]);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      if (!doctorId) return;

      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          dispatch(fetchConsultations()),
          dispatch(fetchPatients())
        ]);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
        console.error('Erreur de chargement des données:', err);
      }
    };

    loadData();
  }, [dispatch, doctorId]); // Ne dépend que de doctorId et dispatch

  // Fonction pour récupérer le nom du patient
  const getPatientName = useMemo(() => (patientId: string) => {
    const patient = allPatients.find(p => p.idPatient === patientId);
    return patient ? `${patient.prenomUtilisateur} ${patient.nomUtilisateur}` : 'Patient inconnu';
  }, [allPatients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Médecin</h1>
        <p className="text-sm text-gray-500">Bienvenue, Dr. {user?.nomUtilisateur}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-blue-100">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Patients suivis</p>
            <p className="text-2xl font-bold">{authorizedPatients.length}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-purple-100">
            <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Consultations</p>
            <p className="text-2xl font-bold">{doctorConsultations.length}</p>
          </div>
        </Card>


      </div>

      {/* Quick Links & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Actions rapides">
          <div className="space-y-4">
            <Link
              to="/doctor/request-access"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Demander l'accès à un patient</span>
              </div>
            </Link>
            <Link
              to="/doctor/consultations"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Nouvelle consultation</span>
              </div>
            </Link>
            <Link
              to="/doctor/prescriptions/new"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Nouvelle prescription</span>
              </div>
            </Link>
            <Link
              to="/doctor/appointments/schedule"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Planifier un rendez-vous</span>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Patients autorisés">
          {authorizedPatients.length > 0 ? (
            <div className="space-y-3">
              {authorizedPatients.slice(0, 5).map(patient => (
                <Link
                  key={patient.idPatient}
                  to={`/doctor/patients/${patient.idPatient}`}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.prenomUtilisateur} {patient.nomUtilisateur}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {patient.idPatient}
                    </div>
                  </div>
                  <div className="text-blue-600">
                    <ClockIcon className="h-4 w-4" />
                  </div>
                </Link>
              ))}

              {authorizedPatients.length > 5 && (
                <Link to="/doctor/patients" className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-2">
                  Voir tous les patients ({authorizedPatients.length}) →
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="mb-2">Vous n'avez pas encore de patients autorisés.</p>
              <Link
                to="/doctor/request-access"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Demander un accès patient →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
