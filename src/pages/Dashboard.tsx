import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { ReimbursementStatus } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectPatients, fetchPatients } from '../redux/patientSlice';
import { selectDoctors, fetchDoctors } from '../redux/doctorSlice';
import {
  selectConsultations,
  fetchConsultations,
  selectRecentConsultations,
  selectPendingReimbursements
} from '../redux/consultationSlice';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const patients = useAppSelector(selectPatients);
  const doctors = useAppSelector(selectDoctors);
  const consultations = useAppSelector(selectConsultations);
  const recentConsultations = useAppSelector(state => selectRecentConsultations(state, 5));
  const pendingReimbursements = useAppSelector(selectPendingReimbursements);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utiliser useMemo pour calculer les statistiques
  const stats = useMemo(() => ({
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalConsultations: consultations.length,
    pendingReimbursements: pendingReimbursements.length
  }), [patients.length, doctors.length, consultations.length, pendingReimbursements.length]);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Utiliser Promise.all pour charger les données en parallèle
        await Promise.all([
          dispatch(fetchPatients()),
          dispatch(fetchDoctors()),
          dispatch(fetchConsultations())
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

  // Memoize pour éviter les rendus inutiles
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

  // Optimiser le rendu avec useMemo
  const getPatientName = useMemo(() => (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  }, [patients]);

  const getDoctorName = useMemo(() => (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
  }, [doctors]);

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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Aperçu de votre système de gestion de santé</p>
      </div>

      {/* Stats - responsive grid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="flex items-center p-2 sm:p-4">
          <div className="mr-2 sm:mr-4 p-2 sm:p-3 rounded-full bg-blue-100">
            <UserGroupIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Patients</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalPatients}</p>
          </div>
        </Card>

        <Card className="flex items-center p-2 sm:p-4">
          <div className="mr-2 sm:mr-4 p-2 sm:p-3 rounded-full bg-green-100">
            <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Médecins</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalDoctors}</p>
          </div>
        </Card>

        <Card className="flex items-center p-2 sm:p-4">
          <div className="mr-2 sm:mr-4 p-2 sm:p-3 rounded-full bg-purple-100">
            <ClipboardDocumentListIcon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Consultations</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalConsultations}</p>
          </div>
        </Card>

        <Card className="flex items-center p-2 sm:p-4">
          <div className="mr-2 sm:mr-4 p-2 sm:p-3 rounded-full bg-yellow-100">
            <ClockIcon className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Remb. en attente</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.pendingReimbursements}</p>
          </div>
        </Card>
      </div>

      {/* Recent consultations - Responsive table */}
      <Card
        title="Consultations récentes"
        className="overflow-hidden"
        footer={
          <Link to="/consultations" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
            Voir toutes les consultations →
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Médecin
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentConsultations.length > 0 ? (
                  recentConsultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {new Date(consultation.date).toLocaleDateString()}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {getPatientName(consultation.patientId)}
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {getDoctorName(consultation.doctorId)}
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        {getStatusBadge(consultation.reimbursementStatus)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-2 sm:px-6 py-4 text-center text-sm text-gray-500">
                      Aucune consultation récente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Quick links and info - responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Actions rapides">
          <div className="space-y-2 sm:space-y-4">
            <Link
              to="/patients/new"
              className="block p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-xs sm:text-sm font-medium">Inscrire un nouvel assuré</span>
              </div>
            </Link>
            <Link
              to="/consultations/new"
              className="block p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-xs sm:text-sm font-medium">Enregistrer une consultation</span>
              </div>
            </Link>
            <Link
              to="/prescriptions/new"
              className="block p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-xs sm:text-sm font-medium">Créer une prescription</span>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Informations">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-600">
                Les médecins peuvent enregistrer des feuilles de maladie, prescrire des médicaments et référer à des spécialistes.
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-600">
                Les assurés peuvent consulter leurs remboursements et leurs historiques de consultations.
              </p>
            </div>
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-600">
                N'oubliez pas de renseigner le médecin traitant de chaque assuré pour optimiser les remboursements.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
