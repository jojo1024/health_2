import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import { patients, doctors } from '../data/mockData';

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [error, setError] = useState('');

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const ssn = patient.socialSecurityNumber.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    return fullName.includes(searchTermLower) || ssn.includes(searchTermLower);
  });

  const getDoctorName = (doctorId) => {
    if (!doctorId) return 'Non assigné';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  const openDetailsDialog = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentStep(1);
    setShowDialog(true);
    setPhoneNumber('');
    setEnteredCode('');
    setError('');
  };

  const closeDialog = () => {
    setShowDialog(false);
    setCurrentStep(1);
    setPhoneNumber('');
    setEnteredCode('');
    setError('');
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!phoneNumber || phoneNumber.length < 10) {
        setError('Veuillez entrer un numéro de téléphone valide');
        return;
      }

      // Génère un code aléatoire à 4 chiffres
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(code);
      setCurrentStep(2);
      setError('');
    } else if (currentStep === 2) {
      if (enteredCode === generatedCode) {
        setCurrentStep(3);
        setError('');
        window.location.href = `/patients/${selectedPatientId}`
      } else {
        setError('Code incorrect, veuillez réessayer');
      }
    }
  };

  // Simulation de l'envoi d'un SMS
  useEffect(() => {
    if (currentStep === 2 && generatedCode) {
      console.log(`Code de vérification envoyé au ${phoneNumber}: ${generatedCode}`);
    }
  }, [currentStep, generatedCode, phoneNumber]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">Gérez tous les patients enregistrés</p>
        </div>

        <Link to="/patients/new">
          <Button icon={<PlusIcon className="w-5 h-5" />}>
            Nouveau Patient
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher par nom ou numéro de Lomeko Santé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
                  Date de naissance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin traitant
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
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.socialSecurityNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(patient.dateOfBirth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getDoctorName(patient.primaryDoctorId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{patient.email}</div>
                    {/* <div>{patient.phoneNumber}</div> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openDetailsDialog(patient.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium px-2 py-1 rounded hover:bg-blue-50 inline-flex items-center"
                        title="Voir les détails"
                      >
                        <EyeIcon className="w-5 h-5 mr-1" />
                        D
                      </button>
                      <Link
                        to={`/consultations/new?patientId=${patient.id}`}
                        className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                        title="Nouvelle consultation"
                      >
                        +
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun patient ne correspond à votre recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Boîte de dialogue d'authentification */}
      {showDialog && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {currentStep === 1 && "Vérification d'identité"}
                    {currentStep === 2 && "Saisie du code de vérification"}
                    {/* {currentStep === 3 && "Accès accordé"} */}
                  </h3>
                  <button
                    onClick={closeDialog}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  {currentStep === 1 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        Pour accéder aux détails du patient, veuillez entrer votre numéro de téléphone pour recevoir un code de vérification.
                      </p>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Numéro de téléphone
                      </label>
                      {/* <div className="mt-1">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="+33 6 12 34 56 78"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />

                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          autoComplete="tel"
                          required
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="06 12 34 56 78"
                          value={phoneNumber}
                       
                        />
                      </div> */}

                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          autoComplete="tel"
                          required
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="06 12 34 56 78"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        Un code de vérification à 4 chiffres a été envoyé au {phoneNumber}. Veuillez le saisir ci-dessous.
                      </p>
                      <div className="mt-1">
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                          Code de vérification
                        </label>
                        <input
                          type="text"
                          name="code"
                          id="code"
                          maxLength={4}
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="1234"
                          value={enteredCode}
                          onChange={(e) => setEnteredCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Pour cette démo, le code est: {generatedCode}
                      </p>
                    </div>
                  )}

                  {/* {currentStep === 3 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        Authentification réussie ! Vous pouvez maintenant accéder aux détails du patient.
                      </p>
                    </div>
                  )} */}

                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {currentStep === 1 ? "Envoyer le code" : "Vérifier"}
                </button>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;