import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UserIcon
} from '@heroicons/react/24/outline';

import Card from '../components/Card';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Dashboard = () => {

  

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
            <p className="text-lg sm:text-2xl font-bold">0</p>
          </div>
        </Card>

        <Card className="flex items-center p-2 sm:p-4">
          <div className="mr-2 sm:mr-4 p-2 sm:p-3 rounded-full bg-green-100">
            <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Médecins</p>
            <p className="text-lg sm:text-2xl font-bold">0</p>
          </div>
        </Card>

        <Card className="flex items-center p-2 sm:p-4">
          <div className="mr-2 sm:mr-4 p-2 sm:p-3 rounded-full bg-purple-100">
            <ClipboardDocumentListIcon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Consultations</p>
            <p className="text-lg sm:text-2xl font-bold">0</p>
          </div>
        </Card>

        <Card className="flex items-center p-2 sm:p-4">
          <div className="mr-2 sm:mr-4 p-2 sm:p-3 rounded-full bg-yellow-100">
            <ClockIcon className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Remb.</p>
            <p className="text-lg sm:text-2xl font-bold">0</p>
          </div>
        </Card>
      </div>


      {/* Quick links and info - responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Actions rapides">
          <div className="space-y-2 sm:space-y-4">
            <a
              href="/patients"
              className="block p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-xs sm:text-sm font-medium">Inscrire un nouveau patient</span>
              </div>
            </a>
            <a
              href="/consultations"
              className="block p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-xs sm:text-sm font-medium">Enregistrer une consultation</span>
              </div>
            </a>
            <a
              href="/doctors"
              className="block p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-blue-600">
                <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-xs sm:text-sm font-medium">Inscrire un nouveau medecin</span>
              </div>
            </a>
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
      
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;