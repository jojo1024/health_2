import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, ExclamationTriangleIcon, DocumentTextIcon, UserIcon, UserCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
  fetchPrescriptionById,
  selectPrescriptionById,
  selectPrescriptionLoading,
  selectPrescriptionError
} from '../redux/prescriptionSlice';

const PrescriptionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // État local
  const [localLoading, setLocalLoading] = useState(true);

  // Données Redux
  const prescription = useAppSelector((state) => id ? selectPrescriptionById(state, id) : null);
  const loading = useAppSelector(selectPrescriptionLoading);
  const error = useAppSelector(selectPrescriptionError);

  useEffect(() => {
    if (!id) {
      console.error("No prescription ID provided");
      navigate('/prescriptions');
      return;
    }

    // Log pour le débogage
    console.log("Fetching prescription with ID:", id);

    // Récupérer la prescription depuis l'API
    dispatch(fetchPrescriptionById(id))
      .unwrap()
      .then(() => setLocalLoading(false))
      .catch((error) => {
        console.error("Error fetching prescription:", error);
        setLocalLoading(false);
      });
  }, [id, navigate, dispatch]);

  // État de chargement
  if (loading || localLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Chargement des informations...</span>
      </div>
    );
  }

  // État d'erreur - prescription non trouvée
  if (error || !prescription) {
    return (
      <div className="flex flex-col justify-center items-center h-full py-16">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Prescription non trouvée</h2>
          <p className="text-gray-500 mb-6">
            {error || "La prescription recherchée n'existe pas ou a été supprimée."}
          </p>
          <Button
            variant="primary"
            className="w-full"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/prescriptions')}
          >
            Retour à la liste des prescriptions
          </Button>
        </div>
      </div>
    );
  }

  // Récupérer le nom du patient et du médecin à partir des données de la prescription
  const patientName = prescription.patientName || 'Patient inconnu';
  const doctorName = prescription.doctorName || 'Médecin inconnu';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Détails de la Prescription</h1>
          <p className="text-gray-500 mt-1">Informations complètes sur la prescription</p>
        </div>
        <div className="flex space-x-2">
          <Link to={`/prescriptions/${prescription.id}/edit`}>
            <Button variant="outline">Modifier</Button>
          </Link>
          <Button
            variant="outline"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/prescriptions')}
          >
            Retour
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de prescription</p>
                  <p className="text-gray-900">{prescription.date}</p>
                </div>
              </div>

              <div className="flex items-start">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="text-gray-900">{patientName}</p>
                </div>
              </div>

              <div className="flex items-start">
                <UserCircleIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Médecin prescripteur</p>
                  <p className="text-gray-900">{doctorName}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Médicaments prescrits</h2>

            <div className="space-y-4">
              {prescription.medications && prescription.medications.map((medication) => (
                <div key={medication.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{medication.name} ({medication.dosage})</p>
                      <p className="text-sm text-gray-500">{medication.frequency} pendant {medication.duration}</p>
                      <p className="text-sm text-gray-500 mt-1">{medication.instructions}</p>
                    </div>
                  </div>
                </div>
              ))}

              {(!prescription.medications || prescription.medications.length === 0) && (
                <p className="text-sm text-gray-500">Aucun médicament prescrit</p>
              )}
            </div>
          </div>
        </div>

        {prescription.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-700">{prescription.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PrescriptionDetails;
