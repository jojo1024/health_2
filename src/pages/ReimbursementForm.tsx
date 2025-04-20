import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import { consultations, patients, doctors } from '../data/mockData';
import { Consultation, ReimbursementStatus } from '../types';

const ReimbursementForm = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<{ name: string; id: string } | null>(null);
  const [doctor, setDoctor] = useState<{ name: string; id: string } | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!consultationId) {
      navigate('/consultations');
      return;
    }

    setLoading(true);

    // Simuler un délai de chargement
    setTimeout(() => {
      const foundConsultation = consultations.find(c => c.id === consultationId);

      if (foundConsultation) {
        setConsultation(foundConsultation);

        // Initialiser le formulaire avec les données existantes
        setFormData({
          status: foundConsultation.reimbursementStatus,
          amount: foundConsultation.reimbursementAmount?.toString() || '',
          date: foundConsultation.reimbursementDate || new Date().toISOString().split('T')[0],
          notes: ''
        });

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
      } else {
        console.error(`Consultation with ID ${consultationId} not found`);
        navigate('/consultations');
        return;
      }

      setLoading(false);
    }, 300);
  }, [consultationId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitSuccess(false);
    setSubmitError('');

    // Validation de base
    if (formData.status === '') {
      setSubmitError('Veuillez sélectionner un statut de remboursement');
      return;
    }

    // Si le statut est "Remboursé" ou "Approuvé", le montant est requis
    if ((formData.status === ReimbursementStatus.COMPLETED ||
         formData.status === ReimbursementStatus.APPROVED ||
         formData.status === ReimbursementStatus.PARTIAL) &&
        !formData.amount) {
      setSubmitError('Le montant est requis pour ce statut');
      return;
    }

    // Dans une application réelle, nous ferions un appel API ici
    // Pour la démo, nous simulons une mise à jour réussie

    // Simuler un délai de traitement
    setLoading(true);
    setTimeout(() => {
      if (consultation) {
        // Mise à jour des données de la consultation avec les nouvelles informations de remboursement
        const updatedConsultation: Consultation = {
          ...consultation,
          reimbursementStatus: formData.status as ReimbursementStatus,
          reimbursementAmount: formData.amount ? parseFloat(formData.amount) : null,
          reimbursementDate: formData.status === ReimbursementStatus.COMPLETED ? formData.date : null
        };

        // Dans une application réelle, ces modifications seraient sauvegardées dans la base de données
        console.log('Remboursement mis à jour:', updatedConsultation);

        // Mise à jour de l'état local pour refléter les changements
        setConsultation(updatedConsultation);
        setSubmitSuccess(true);

        // Rediriger vers les détails de la consultation après quelques secondes
        setTimeout(() => {
          navigate(`/consultations/${consultationId}`);
        }, 1500);
      }
      setLoading(false);
    }, 800);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Chargement des informations de remboursement...</span>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-medium text-gray-900">Consultation non trouvée</h2>
        <p className="text-gray-500 mt-2 mb-4">
          La consultation que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Button
          onClick={() => navigate('/consultations')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Retour à la liste des consultations
        </Button>
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
            onClick={() => navigate(`/consultations/${consultationId}`)}
          >
            Retour à la consultation
          </Button>
          <div>
            {/* <h1 className="text-2xl font-bold text-gray-900">
              Gestion du remboursement
            </h1> */}
            <p className="text-gray-500 mt-1">
              Consultation du {formatDate(consultation.date)}
            </p>
          </div>
        </div>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Remboursement mis à jour avec succès</h3>
              <p className="text-sm text-green-700 mt-1">
                Vous allez être redirigé vers la page de détails de la consultation.
              </p>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur lors de la mise à jour</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card title="Informations">
            <div className="space-y-4">
              {patient && (
                <div className="flex items-start">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Patient</div>
                    <div className="text-base">{patient.name}</div>
                  </div>
                </div>
              )}

              {doctor && (
                <div className="flex items-start">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Médecin</div>
                    <div className="text-base">{doctor.name}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Date de consultation</div>
                  <div className="text-base">{formatDate(consultation.date)}</div>
                </div>
              </div>

              <div className="flex items-start">
                <BanknotesIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Statut actuel</div>
                  <div className="text-base">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      consultation.reimbursementStatus === ReimbursementStatus.COMPLETED
                        ? 'bg-green-100 text-green-800'
                        : consultation.reimbursementStatus === ReimbursementStatus.APPROVED
                        ? 'bg-blue-100 text-blue-800'
                        : consultation.reimbursementStatus === ReimbursementStatus.PENDING
                        ? 'bg-yellow-100 text-yellow-800'
                        : consultation.reimbursementStatus === ReimbursementStatus.REJECTED
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {consultation.reimbursementStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card title="Formulaire de remboursement">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Statut de remboursement *
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Sélectionner un statut</option>
                  <option value={ReimbursementStatus.PENDING}>En attente</option>
                  <option value={ReimbursementStatus.APPROVED}>Approuvé</option>
                  <option value={ReimbursementStatus.REJECTED}>Rejeté</option>
                  <option value={ReimbursementStatus.PARTIAL}>Partiellement remboursé</option>
                  <option value={ReimbursementStatus.COMPLETED}>Remboursé</option>
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Montant du remboursement (€)
                  {(formData.status === ReimbursementStatus.COMPLETED ||
                    formData.status === ReimbursementStatus.APPROVED ||
                    formData.status === ReimbursementStatus.PARTIAL) && ' *'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    required={formData.status === ReimbursementStatus.COMPLETED ||
                             formData.status === ReimbursementStatus.APPROVED ||
                             formData.status === ReimbursementStatus.PARTIAL}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">€</span>
                  </div>
                </div>
              </div>

              {formData.status === ReimbursementStatus.COMPLETED && (
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date de remboursement *
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes supplémentaires
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Informations complémentaires concernant le remboursement..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/consultations/${consultationId}`)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Traitement en cours...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReimbursementForm;
