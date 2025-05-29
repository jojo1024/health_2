import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import lomekoLogo from '/lomeko.png';
const Header = () => {
  const { user, logout } = useAuth();
  const [notificationsCount] = useState(0); // Hardcoded for demo

  const handleLogout = () => {
    logout();
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center">
            <img
              src={lomekoLogo} // <-- remplace ceci par le chemin réel de ton image
              alt="Lomeko Santé"
              className="h-10 sm:h-14 w-auto"
            />
          </Link>


          <div className="flex items-center space-x-1 sm:space-x-3">
            {user && (
              <>
                {/* Help - hide on smallest screens */}
                <button
                  type="button"
                  className="hidden sm:block p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Voir l'aide</span>
                  <QuestionMarkCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                >
                  <span className="sr-only">Voir les notifications</span>
                  <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  {notificationsCount > 0 && (
                    <span className="absolute top-0 right-0  h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs font-medium flex items-center justify-center transform -translate-y-1/4 translate-x-1/4">
                      {notificationsCount}
                    </span>
                  )}
                </button>

                {/* Settings - hide on smallest screens */}
                <button
                  type="button"
                  className="hidden sm:block p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Voir les paramètres</span>
                  <Cog6ToothIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      <div className="flex items-center">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                        </div>
                        <div className="ml-2 hidden md:flex flex-col items-start">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            {user.nomUtilisateur}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 uppercase">
                            {user.typeUtilisateur}
                          </span>
                        </div>
                        <ChevronDownIcon className="ml-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-44 sm:w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              ' px-4 py-2 text-xs sm:text-sm text-gray-700 flex items-center'
                            )}
                          >
                            <UserIcon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
                            Votre Profil
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              ' w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 flex items-center'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
                            Se déconnecter
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            )}

            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
