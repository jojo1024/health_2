import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon,
  HeartIcon,
  UserIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { ReimbursementStatus, Patient } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectConsultations, fetchConsultations } from '../../redux/consultationSlice';
import { selectPatients, fetchPatients } from '../../redux/patientSlice';
import { selectDoctors, fetchDoctors } from '../../redux/doctorSlice';
import { patients as allPatientData, patientRelationships } from '../../data/mockData';

const PatientDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const consultations = useAppSelector(selectConsultations);
  const patients = useAppSelector(selectPatients);
  const doctors = useAppSelector(selectDoctors);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [childrenInfo, setChildrenInfo] = useState<Patient[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  // Trouver l'ID du patient à partir du numéro de téléphone de l'utilisateur
  const patientId = useMemo(() => {
    if (!user) return null;
    const patientFound = patients.find(p => p.phoneNumber === user.phoneNumber);
    return patientFound?.id || null;
  }, [patients, user]);

  // Filtrer les consultations du patient
  const patientConsultations = useMemo(() => {
    if (!patientId) return [];
    return consultations.filter(c => c.patientId === patientId);
  }, [consultations, patientId]);

  // Calculer le montant total des remboursements
  const totalReimbursements = useMemo(() => {
    return patientConsultations
      .filter(c => c.reimbursementStatus === ReimbursementStatus.COMPLETED || c.reimbursementStatus === ReimbursementStatus.PARTIAL)
      .reduce((total, c) => total + (c.reimbursementAmount || 0), 0);
  }, [patientConsultations]);

  // Filtrer les remboursements en attente
  const pendingReimbursements = useMemo(() => {
    return patientConsultations.filter(c => c.reimbursementStatus === ReimbursementStatus.PENDING);
  }, [patientConsultations]);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Chargement des données
        await Promise.all([
          dispatch(fetchConsultations()),
          dispatch(fetchPatients()),
          dispatch(fetchDoctors())
        ]);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
        console.error('Erreur de chargement des données:', err);
      }
    };

    loadData();
  }, [dispatch]);

  // Récupérer les informations du patient et ses enfants
  useEffect(() => {
    if (patientId && patients.length > 0) {
      // Récupérer les infos du patient
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setPatientInfo(patient);

        // Récupérer les enfants associés au patient
        const children = patientRelationships
          .filter(rel => rel.patientId === patientId)
          .map(rel => patients.find(p => p.id === rel.childPatientId))
          .filter(Boolean) as Patient[];

        setChildrenInfo(children);

        // Simuler des rendez-vous à venir
        const mockAppointments = [
          {
            id: '1',
            date: new Date(new Date().getTime() + 3 * 86400000).toISOString(), // 3 jours plus tard
            doctorId: patient.primaryDoctorId || doctors[0].id,
            reason: 'Consultation de routine'
          },
          {
            id: '2',
            date: new Date(new Date().getTime() + 10 * 86400000).toISOString(), // 10 jours plus tard
            doctorId: doctors[1].id,
            reason: 'Suivi spécialiste'
          }
        ];
        setUpcomingAppointments(mockAppointments);
      }
    }
  }, [patientId, patients, doctors]);

  // Fonction pour récupérer le nom du médecin
  const getDoctorName = useMemo(() => (doctorId: string | null) => {
    if (!doctorId) return 'Pas de médecin traitant';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
  }, [doctors]);

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

  if (!patientInfo) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
        <p>Nous n'avons pas trouvé vos informations de patient. Veuillez contacter votre administrateur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Espace Santé</h1>
        <p className="text-sm text-gray-500">Bienvenue, {patientInfo.firstName} {patientInfo.lastName}</p>
      </div>

      {/* Profil rapide */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{patientInfo.firstName} {patientInfo.lastName}</h2>
              <p className="text-sm text-gray-500">Né(e) le {new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">N° Sécu: {patientInfo.socialSecurityNumber}</p>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Médecin traitant:</span> {getDoctorName(patientInfo.primaryDoctorId)}
            </div>
            <Link to="/patient/profile" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir mon profil complet →
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-blue-100">
            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Consultations</p>
            <p className="text-2xl font-bold">{patientConsultations.length}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-green-100">
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Prescriptions</p>
            <p className="text-2xl font-bold">{patientConsultations.reduce((acc, curr) => acc + curr.prescriptions.length, 0)}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-yellow-100">
            <BanknotesIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Remboursés</p>
            <p className="text-2xl font-bold">{totalReimbursements.toFixed(2)} €</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="mr-4 p-3 rounded-full bg-red-100">
            <ClockIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">En attente</p>
            <p className="text-2xl font-bold">{pendingReimbursements.length}</p>
          </div>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card
        title="Prochains rendez-vous"
        className="overflow-hidden"
        footer={
          <Link to="/patient/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Voir tous mes rendez-vous →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
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
                      <div className="text-sm font-medium text-gray-900">{getDoctorName(appointment.doctorId)}</div>
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
        title="Mes consultations récentes"
        className="overflow-hidden"
        footer={
          <Link to="/patient/consultations" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Voir toutes mes consultations →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remboursement</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patientConsultations.length > 0 ? (
                patientConsultations
                  .slice(0, 5)
                  .map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(consultation.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getDoctorName(consultation.doctorId)}</div>
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

      {/* Children */}
      {childrenInfo.length > 0 && (
        <Card
          title="Mes enfants"
          className="overflow-hidden"
          footer={
            <Link to="/patient/children" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Gérer mes enfants →
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Âge</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {childrenInfo.map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{child.firstName} {child.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDoctorName(child.primaryDoctorId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Link
                        to={`/patient/children/${child.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Quick Links */}
      <Card title="Accès rapides">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/patient/consultations"
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center text-center"
          >
            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Mes Consultations</span>
          </Link>
          <Link
            to="/patient/prescriptions"
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center text-center"
          >
            <DocumentTextIcon className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium">Mes Prescriptions</span>
          </Link>
          <Link
            to="/patient/reimbursements"
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center text-center"
          >
            <BanknotesIcon className="w-6 h-6 text-yellow-600 mb-2" />
            <span className="text-sm font-medium">Mes Remboursements</span>
          </Link>
          <Link
            to="/patient/appointments"
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center text-center"
          >
            <CalendarIcon className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium">Mes Rendez-vous</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default PatientDashboard;
