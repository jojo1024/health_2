import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { doctors, consultations, patients } from '../data/mockData';
import { Doctor, Consultation, DoctorSpecialty, Patient } from '../types';

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorConsultations, setDoctorConsultations] = useState<Consultation[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!id) return;

    // Find doctor
    const foundDoctor = doctors.find(d => d.id === id);
    if (foundDoctor) {
      setDoctor(foundDoctor);

      // Find consultations
      const foundConsultations = consultations
        .filter(c => c.doctorId === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setDoctorConsultations(foundConsultations);

      // Find patients who have this doctor as their primary
      const primaryPatients = patients.filter(p => p.primaryDoctorId === id);
      setDoctorPatients(primaryPatients);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (!doctor) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Médecin non trouvé</h2>
          <p className="mt-2 text-gray-500">Le médecin recherché n'existe pas ou a été supprimé.</p>
          <Button
            variant="outline"
            className="mt-4"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/doctors')}
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getSpecialtyBadge = (specialty: DoctorSpecialty, specialistType?: string) => {
    if (specialty === DoctorSpecialty.GENERAL) {
      return <Badge variant="primary">Généraliste</Badge>;
    } else {
      return (
        <div>
          <Badge variant="info">Spécialiste</Badge>
          {specialistType && <div className="text-xs mt-1">{specialistType}</div>}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            className="mr-4"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/doctors')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            <p className="text-gray-500 mt-1">
              Détails du médecin
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Link to={`/doctors/${id}/edit`}>
            <Button
              variant="outline"
              icon={<PencilIcon className="w-5 h-5" />}
            >
              Modifier
            </Button>
          </Link>
          <Link to={`/consultations/new?doctorId=${id}`}>
            <Button
              icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
            >
              Nouvelle consultation
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card title="Informations professionnelles">
            <div className="space-y-4">
              <div className="flex items-start">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Nom complet</div>
                  <div className="text-base">Dr. {doctor.firstName} {doctor.lastName}</div>
                </div>
              </div>

              <div className="flex items-start">
                <AcademicCapIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Spécialité</div>
                  <div className="text-base">
                    {getSpecialtyBadge(doctor.specialty, doctor.specialistType)}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <IdentificationIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Numéro de licence</div>
                  <div className="text-base">{doctor.licenseNumber}</div>
                </div>
              </div>

              <div className="flex items-start">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Date de naissance</div>
                  <div className="text-base">{formatDate(doctor.dateOfBirth)}</div>
                </div>
              </div>

              <div className="flex items-start">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Statut</div>
                  <div className="text-base">
                    {doctor.isAlsoPatient ? (
                      <Badge variant="warning">Également patient</Badge>
                    ) : (
                      <Badge variant="default">Médecin uniquement</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Coordonnées">
            <div className="space-y-4">
              <div className="flex items-start">
                <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Téléphone</div>
                  <div className="text-base">{doctor.phoneNumber}</div>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-base">{doctor.email}</div>
                </div>
              </div>

              <div className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Adresse</div>
                  <div className="text-base">{doctor.address}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card
            title="Consultations récentes"
            footer={doctorConsultations.length > 5 && (
              <Link to={`/consultations?doctorId=${id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Voir toutes les consultations →
              </Link>
            )}
          >
            {doctorConsultations.length > 0 ? (
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
                        Notes
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctorConsultations.slice(0, 5).map((consultation) => (
                      <tr key={consultation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {consultation.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getPatientName(consultation.patientId)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {consultation.notes}
                          </div>
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
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune consultation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ce médecin n'a pas encore de consultations enregistrées.
                </p>
                <div className="mt-6">
                  <Link to={`/consultations/new?doctorId=${id}`}>
                    <Button>
                      Nouvelle consultation
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <Card title={`Patients (${doctorPatients.length})`}>
            {doctorPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro de SS
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctorPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.socialSecurityNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{patient.email}</div>
                          <div>{patient.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Détails
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun patient</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ce médecin n'a pas encore de patients qui l'ont désigné comme médecin traitant.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
