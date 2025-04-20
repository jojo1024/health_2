import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { consultations, patients, doctors, medications, prescriptions } from '../data/mockData';
import { Consultation, Medication, ReimbursementStatus, SpecialistReferral } from '../types';

// Fonction pour récupérer l'ID d'une consultation par défaut
const getDefaultConsultationId = () => {
  return localStorage.getItem('defaultConsultationId') || consultations[0]?.id || "";
};

const ConsultationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<{ name: string; id: string } | null>(null);
  const [doctor, setDoctor] = useState<{ name: string; id: string } | null>(null);
  const [medicationList, setMedicationList] = useState<Medication[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Simuler un délai de chargement pour l'affichage des données
    setTimeout(() => {
      // Trouver la consultation
      const foundConsultation = consultations.find(c => c.id === id);

      if (foundConsultation) {
        setConsultation(foundConsultation);

        // Récupérer les informations sur le patient
        const foundPatient = patients.find(p => p.id === foundConsultation.patientId);
        if (foundPatient) {
          setPatient({
            name: `${foundPatient.firstName} ${foundPatient.lastName}`,
            id: foundPatient.id
          });
        }

        // Récupérer les informations sur le médecin
        const foundDoctor = doctors.find(d => d.id === foundConsultation.doctorId);
        if (foundDoctor) {
          setDoctor({
            name: `Dr. ${foundDoctor.firstName} ${foundDoctor.lastName}`,
            id: foundDoctor.id
          });
        }

        // Récupérer les médicaments prescrits
        const consultationPrescriptions = prescriptions.filter(
          p => foundConsultation.prescriptions.includes(p.id)
        );

        const meds: Medication[] = [];
        consultationPrescriptions.forEach(prescription => {
          prescription.medications.forEach(med => {
            if (!meds.some(m => m.id === med.id)) {
              meds.push(med);
            }
          });
        });

        setMedicationList(meds);
      } else {
        console.error(`Consultation with ID ${id} not found`);

        // Tenter de rediriger vers la consultation par défaut
        const defaultConsultationId = getDefaultConsultationId();
        if (defaultConsultationId && defaultConsultationId !== id) {
          console.log(`Redirecting to default consultation: ${defaultConsultationId}`);
          navigate(`/consultations/${defaultConsultationId}`, { replace: true });
          return;
        }
      }

      setLoading(false);
    }, 300);
  }, [id, navigate]);

  const handlePrintConsultation = () => {
    window.print();
  };

  const handleDeleteConsultation = () => {
    // Dans une application réelle, nous ferions un appel API ici
    console.log('Consultation supprimée:', consultation?.id);
    navigate('/consultations');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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

  const getSpecialistTypeName = (referral: SpecialistReferral) => {
    const specialist = doctors.find(d => d.id === referral.specialistId);
    if (specialist) {
      return `Dr. ${specialist.firstName} ${specialist.lastName}`;
    }
    return referral.specialistType;
  };

  // Page de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Chargement des informations de la consultation...</span>
      </div>
    );
  }

  // Page d'erreur si la consultation n'est pas trouvée
  if (!consultation) {
    return (
      <div className="flex flex-col justify-center items-center h-full py-16">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Consultation non trouvée</h2>
          <p className="text-gray-500 mb-6">
            La consultation recherchée (ID: {id}) n'existe pas ou a été supprimée.
          </p>
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => navigate('/consultations')}
            >
              Retour à la liste des consultations
            </Button>
            {consultations.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/consultations/${getDefaultConsultationId()}`)}
              >
                Accéder à une consultation existante
              </Button>
            )}
          </div>
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
            onClick={() => navigate('/consultations')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Détails de la consultation
            </h1>
            <p className="text-gray-500 mt-1">
              {`Consultation du ${formatDate(consultation.date)}`}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          {/* <Link to={`/consultations/${id}/reimbursement`}>
            <Button
              variant="outline"
              icon={<BanknotesIcon className="w-5 h-5" />}
            >
              Gérer le remboursement
            </Button>
          </Link> */}
          <Button
            variant="outline"
            icon={<PrinterIcon className="w-5 h-5" />}
            onClick={handlePrintConsultation}
          >
            Imprimer
          </Button>
          <Link to={`/consultations/${id}/edit`}>
            <Button
              variant="outline"
              icon={<PencilIcon className="w-5 h-5" />}
            >
              Modifier
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
            icon={<TrashIcon className="w-5 h-5" />}
            onClick={() => setShowDeleteModal(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Informations sur la consultation */}
          <Card title="Informations générales">
            <div className="space-y-4">
              <div className="flex items-start">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Date de consultation</div>
                  <div className="text-base">{formatDate(consultation.date)}</div>
                </div>
              </div>

              {patient && (
                <div className="flex items-start">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Patient</div>
                    <div className="text-base">
                      <Link to={`/patients/${patient.id}`} className="text-blue-600 hover:text-blue-800">
                        {patient.name}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {doctor && (
                <div className="flex items-start">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Médecin</div>
                    <div className="text-base">
                      <Link to={`/doctors/${doctor.id}`} className="text-blue-600 hover:text-blue-800">
                        {doctor.name}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* <div className="flex items-start">
                <BanknotesIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Statut de remboursement</div>
                  <div className="text-base mt-1">{getStatusBadge(consultation.reimbursementStatus)}</div>
                </div>
              </div>

              {consultation.reimbursementAmount !== null && (
                <div className="flex items-start">
                  <BanknotesIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Montant remboursé</div>
                    <div className="text-base">{consultation.reimbursementAmount} €</div>
                  </div>
                </div>
              )} */}

              {/* {consultation.reimbursementDate && (
                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Date de remboursement</div>
                    <div className="text-base">{formatDate(consultation.reimbursementDate)}</div>
                  </div>
                </div>
              )} */}
            </div>
          </Card>

          {/* Médicaments prescrits */}
          <Card title="Médicaments prescrits">
            {medicationList.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {medicationList.map(medication => (
                  <li key={medication.id} className="py-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {medication.name} ({medication.dosage})
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {medication.frequency} pendant {medication.duration}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Instructions:</span> {medication.instructions}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 py-2">
                Aucun médicament prescrit lors de cette consultation.
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Notes de consultation */}
          <Card title="Notes">
            <div className="prose max-w-none">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-800 whitespace-pre-line">{consultation.notes}</p>
              </div>
            </div>
          </Card>

          {/* Références vers des spécialistes */}
          <Card title="Références vers des spécialistes">
            {consultation.specialistReferrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spécialiste
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Raison
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultation.specialistReferrals.map(referral => (
                      <tr key={referral.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getSpecialistTypeName(referral)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {referral.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant={referral.isCompleted ? "success" : "warning"}>
                            {referral.isCompleted ? "Complété" : "En attente"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.completionDate ? formatDate(referral.completionDate) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2">
                Aucune référence vers un spécialiste n'a été faite lors de cette consultation.
              </div>
            )}
          </Card>

          {/* Historique des actions */}
          <Card title="Historique">
            <div className="space-y-4">
              {/* Création de la consultation */}
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Consultation créée</div>
                  <div className="text-sm text-gray-500">{formatDate(consultation.date)}</div>
                </div>
              </div>

              {/* Prescription ajoutée (si présente) */}
              {consultation.prescriptions.length > 0 && (
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ClipboardDocumentListIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Prescription créée</div>
                    <div className="text-sm text-gray-500">{formatDate(consultation.date)}</div>
                  </div>
                </div>
              )}

              {/* Statut de remboursement (si présent) */}
              {consultation.reimbursementStatus !== ReimbursementStatus.PENDING && (
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <BanknotesIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  {/* <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      Statut de remboursement: {consultation.reimbursementStatus}
                    </div>
                    <div className="text-sm text-gray-500">
                      {consultation.reimbursementDate ? formatDate(consultation.reimbursementDate) : 'Date inconnue'}
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de confirmation pour la suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
            <div className="mb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Supprimer la consultation</h3>
              <p className="text-sm text-gray-500 mt-1">
                Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                onClick={handleDeleteConsultation}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationDetails;
