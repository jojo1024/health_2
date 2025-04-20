import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { AuthorizationService } from '../../services/authorizationService';

const RequestAccess = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authorizationId, setAuthorizationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'request' | 'verify'>('request');

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.doctorId) {
      setError("Vous n'êtes pas identifié comme médecin.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await AuthorizationService.requestAuthorization(user.doctorId, phoneNumber);
      if (result.success) {
        setMessage(result.message);
        if (result.authorizationId) {
          setAuthorizationId(result.authorizationId);
          setStep('verify');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la demande d'accès.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizationId) {
      setError("ID d'autorisation manquant.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await AuthorizationService.verifyAuthorizationCode(authorizationId, verificationCode);
      if (result.success) {
        setMessage(result.message);
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la vérification du code.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setVerificationCode('');
    setAuthorizationId(null);
    setError(null);
    setMessage(null);
    setSuccess(false);
    setStep('request');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Demande d'accès aux dossiers patients</h1>

      <Card className="mb-6">
        <h2 className="text-lg font-medium mb-4">
          {step === 'request' ? 'Demander l\'accès à un patient' : 'Vérifier le code d\'autorisation'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-4">
            {message}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
              Autorisation accordée ! Vous pouvez maintenant accéder aux informations du patient.
            </div>
            <Button
              onClick={resetForm}
              className="mt-4"
            >
              Nouvelle demande
            </Button>
          </div>
        ) : (
          step === 'request' ? (
            <form onSubmit={handleRequestAccess}>
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone du patient
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="06 12 34 56 78"
                  pattern="[0-9]{10}"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 10 chiffres sans espaces (ex: 0612345678)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Demande en cours...' : 'Demander l\'accès'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="mb-4">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="1234"
                  pattern="[0-9]{4}"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Entrez le code à 4 chiffres envoyé par SMS au patient
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('request')}
                  className="flex-1"
                  disabled={loading}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Vérification...' : 'Vérifier le code'}
                </Button>
              </div>
            </form>
          )
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-medium mb-4">Information sur le processus</h2>
        <p className="text-gray-700 mb-3">
          Pour respecter la confidentialité des données de santé, vous devez obtenir l'autorisation explicite du patient avant d'accéder à son dossier médical.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Demandez au patient son numéro de téléphone</li>
          <li>Saisissez ce numéro dans le formulaire ci-dessus</li>
          <li>Un code à 4 chiffres sera envoyé par SMS au patient</li>
          <li>Demandez au patient de vous communiquer ce code</li>
          <li>Saisissez le code pour obtenir l'accès au dossier</li>
        </ol>
        <p className="text-gray-700 mt-3">
          L'autorisation reste valide pour toute la durée de la prise en charge du patient, sauf révocation explicite.
        </p>
      </Card>
    </div>
  );
};

export default RequestAccess;
