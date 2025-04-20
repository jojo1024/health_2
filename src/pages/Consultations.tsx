import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { consultations, patients, doctors } from '../data/mockData';
import { ReimbursementStatus } from '../types';

const Consultations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredConsultations = consultations.filter(consultation => {
    const patient = patients.find(p => p.id === consultation.patientId);
    const doctor = doctors.find(d => d.id === consultation.doctorId);

    const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
    const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.toLowerCase() : '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = patientName.includes(searchTermLower) ||
                          doctorName.includes(searchTermLower) ||
                          consultation.date.includes(searchTermLower);

    const matchesStatus = statusFilter === 'all' ||
                          statusFilter === consultation.reimbursementStatus;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-500 mt-1">Gestion de l'ensemble des consultations médicales</p>
        </div>

        <Link to="/consultations/new">
          <Button icon={<PlusIcon className="w-5 h-5" />}>
            Nouvelle Consultation
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
              placeholder="Rechercher par patient, médecin ou date..."
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
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th> */}
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remboursement
                </th> */}
                <th scope="col" className="relative px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPatientName(consultation.patientId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDoctorName(consultation.doctorId)}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(consultation.reimbursementStatus)}
                  </td> */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.reimbursementAmount ? `${consultation.reimbursementAmount} €` : '-'}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Link
                        to={`/consultations/${consultation.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Détails
                      </Link>
                      {/* <Link
                        to={`/consultations/${consultation.id}/reimbursement`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Remboursement
                      </Link> */}
                    </div>
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

export default Consultations;
