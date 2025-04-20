import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { consultations, patients, doctors } from '../data/mockData';
import { Patient, Consultation, ReimbursementStatus } from '../types';

const PatientConsultations = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientConsultations, setPatientConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!patientId) {
      navigate('/patients');
      return;
    }

    setLoading(true);

    // Simuler un délai de chargement
    setTimeout(() => {
      const foundPatient = patients.find(p => p.id === patientId);

      if (foundPatient) {
        setPatient(foundPatient);

        // Récupérer toutes les consultations du patient
        const foundConsultations = consultations
          .filter(c => c.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setPatientConsultations(foundConsultations);
      } else {
        console.error(`Patient with ID ${patientId} not found`);
      }

      setLoading(false);
    }, 300);
  }, [patientId, navigate]);

  // Filtre les consultations en fonction des critères de recherche et de statut
  const filteredConsultations = patientConsultations.filter(consultation => {
    const doctor = doctors.find(d => d.id === consultation.doctorId);
    const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.toLowerCase() : '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = doctorName.includes(searchTermLower) ||
                          consultation.date.includes(searchTermLower) ||
                          consultation.notes.toLowerCase().includes(searchTermLower);

    const matchesStatus = statusFilter === 'all' ||
                          statusFilter === consultation.reimbursementStatus;

    return matchesSearch && matchesStatus;
  });

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: ReimbursementStatus) => {
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
  };

  // Page de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Chargement des consultations du patient...</span>
      </div>
    );
  }

  // Page d'erreur si le patient n'est pas trouvé
  if (!patient) {
    return (
      <div className="flex flex-col justify-center items-center h-full py-16">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Patient non trouvé</h2>
          <p className="text-gray-500 mb-6">
            Le patient recherché n'existe pas ou a été supprimé.
          </p>
          <Button
            variant="primary"
            className="w-full"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/patients')}
          >
            Retour à la liste des patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            className="mr-4"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consultations du patient
            </h1>
            <div className="flex items-center text-gray-500 mt-1">
              <UserIcon className="w-4 h-4 mr-1" />
              <span>{patient.firstName} {patient.lastName}</span>
            </div>
          </div>
        </div>

        <Link to={`/consultations/new?patientId=${patientId}`}>
          <Button>
            Nouvelle consultation
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher par médecin, date ou notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:w-52">
            <div className="flex">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-9 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value={ReimbursementStatus.PENDING}>En attente</option>
                  <option value={ReimbursementStatus.APPROVED}>Approuvé</option>
                  <option value={ReimbursementStatus.COMPLETED}>Remboursé</option>
                  <option value={ReimbursementStatus.REJECTED}>Rejeté</option>
                  <option value={ReimbursementStatus.PARTIAL}>Partiel</option>
                </select>
              </div>
              <button
                className="ml-2 p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remboursement
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(consultation.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getDoctorName(consultation.doctorId)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {consultation.notes.substring(0, 50)}{consultation.notes.length > 50 ? '...' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(consultation.reimbursementStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.reimbursementAmount ? `${consultation.reimbursementAmount} €` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/consultations/${consultation.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredConsultations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune consultation ne correspond à votre recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PatientConsultations;
