import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { ReimbursementStatus } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectConsultations, fetchConsultations, selectRecentConsultations } from '../../redux/consultationSlice';
import { selectPatients, fetchPatients } from '../../redux/patientSlice';
import { AuthorizationService } from '../../services/authorizationService';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const consultations = useAppSelector(selectConsultations);
  const allPatients = useAppSelector(selectPatients);
  const recentConsultations = useAppSelector(state => selectRecentConsultations(state, 5));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizedPatients, setAuthorizedPatients] = useState<any[]>([]);

  const doctorId = user?.doctorId;

  // Filtrer les consultations du médecin connecté
  const doctorConsultations = useMemo(() => {
    if (!doctorId) return [];
    return consultations.filter(c => c.doctorId === doctorId);
  }, [consultations, doctorId]);

  // Récupérer les prochains rendez-vous (à implémenter avec une vraie API)
  const upcomingAppointments = useMemo(() => {
    // Simuler des rendez-vous à venir
    return doctorConsultations.slice(0, 3).map(c => ({
      id: c.id,
      patientId: c.patientId,
      date: new Date(new Date().getTime() + (Math.floor(Math.random() * 7) + 1) * 86400000).toISOString(),
      reason: "Consultation de suivi"
    }));
  }, [doctorConsultations]);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Chargement des données
        await Promise.all([
          dispatch(fetchConsultations()),
          dispatch(fetchPatients())
        ]);

        // Si doctorId est disponible, charger les patients autorisés
        if (doctorId) {
          const patients = await AuthorizationService.getAuthorizedPatients(doctorId);
          setAuthorizedPatients(patients);
        }

        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
        console.error('Erreur de chargement des données:', err);
      }
    };

    loadData();
  }, [dispatch, doctorId]);

  // Fonction pour récupérer le nom du patient
  const getPatientName = useMemo(() => (patientId: string) => {
    const patient = allPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  }, [allPatients]);

  // Fonction pour récupérer le statut du remboursement
  const getStatusBadge = useMemo(() => (status: ReimbursementStatus) => {
    switch (status) {
      case ReimbursementStatus.COMPLETED:
        return <Badge variant="success">Remboursé</Badge>;
      case ReimbursementStatus.APPROVED:
        return <Badge variant="primary">Approuvé</Badge>;
      case ReimbursementStatus.PENDING:
        return <Badge variant="warning">En attente</Badge>;
      case ReimbursementStatus.REJECTED:
        return <Badge variant="danger">Rejeté</Badge>;
      case ReimbursementStatus.PARTIAL:
        return <Badge variant="info">Partiel</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  }, []);

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
        <p className="text-sm text-gray-500">Bienvenue, Dr. {user?.username}</p>
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

        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-green-100">
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Prescriptions</p>
            <p className="text-2xl font-bold">{doctorConsultations.reduce((acc, curr) => acc + curr.prescriptions.length, 0)}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-yellow-100">
            <CalendarIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rdv à venir</p>
            <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
          </div>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card
        title="Prochains rendez-vous"
        className="overflow-hidden"
        footer={
          <Link to="/doctor/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Voir tous les rendez-vous →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getPatientName(appointment.patientId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.reason}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun rendez-vous à venir
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Consultations */}
      <Card
        title="Consultations récentes"
        className="overflow-hidden"
        footer={
          <Link to="/doctor/consultations" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Voir toutes les consultations →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentConsultations.filter(c => c.doctorId === doctorId).length > 0 ? (
                recentConsultations
                  .filter(c => c.doctorId === doctorId)
                  .map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(consultation.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getPatientName(consultation.patientId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(consultation.reimbursementStatus)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune consultation récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
              to="/doctor/consultations/new"
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
                  key={patient.id}
                  to={`/doctor/patients/${patient.id}`}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                    <div className="text-xs text-gray-500">ID: {patient.socialSecurityNumber}</div>
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
