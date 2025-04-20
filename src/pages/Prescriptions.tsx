import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectPrescriptions } from '../redux/prescriptionSlice';
import { selectPatients } from '../redux/patientSlice';
import { selectDoctors } from '../redux/doctorSlice';

const Prescriptions = () => {
  const dispatch = useAppDispatch();
  const prescriptions = useAppSelector(selectPrescriptions);
  const patients = useAppSelector(selectPatients);
  const doctors = useAppSelector(selectDoctors);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Log prescription IDs for debugging
  useEffect(() => {
    console.log("Prescriptions loaded. IDs:", prescriptions.map(p => p.id));
  }, [prescriptions]);

  const forceRefresh = () => {
    // Force a reload of the page
    window.location.reload();
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const patient = patients.find(p => p.id === prescription.patientId);
    const doctor = doctors.find(d => d.id === prescription.doctorId);

    const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
    const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.toLowerCase() : '';
    const medicationString = prescription.medications.map(m => m.name).join(' ').toLowerCase();

    const searchTermLower = searchTerm.toLowerCase();

    return patientName.includes(searchTermLower) ||
           doctorName.includes(searchTermLower) ||
           medicationString.includes(searchTermLower) ||
           prescription.date.includes(searchTermLower);
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
  };

  const getMedicationsList = (medications: any[]) => {
    if (medications.length === 0) return '-';

    if (medications.length === 1) {
      return medications[0].name;
    }

    return `${medications[0].name} + ${medications.length - 1} autre(s)`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 mt-1">Gérez toutes les prescriptions médicales</p>
        </div>

        <div className="flex gap-2">
          <Link to="/prescriptions/new">
            <Button icon={<PlusIcon className="w-5 h-5" />}>
              Nouvelle Prescription
            </Button>
          </Link>
          <Button
            variant="outline"
            icon={<ArrowPathIcon className="w-5 h-5" />}
            onClick={forceRefresh}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Debug info */}
      {showDebugInfo && (
        <Card>
          <h3 className="font-medium text-gray-900 mb-2">Informations de debug</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-auto">
            <p>Nombre de prescriptions: {prescriptions.length}</p>
            <div className="mt-2">
              <p>IDs des prescriptions:</p>
              <ul className="list-disc pl-5">
                {prescriptions.map((p, i) => (
                  <li key={i}>{p.id} - {p.notes ? p.notes.substring(0, 30) : 'Aucune note'}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugInfo(false)}
            >
              Masquer
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher par patient, médecin, médicament ou date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {!showDebugInfo && (
            <Button
              variant="text"
              size="sm"
              className="ml-3"
              onClick={() => setShowDebugInfo(true)}
            >
              Debug
            </Button>
          )}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médicaments
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPatientName(prescription.patientId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDoctorName(prescription.doctorId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {getMedicationsList(prescription.medications)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/prescriptions/${prescription.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredPrescriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune prescription ne correspond à votre recherche
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

export default Prescriptions;
