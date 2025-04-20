import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClockIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import usePermissions from '../hooks/usePermissions';

interface NavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, label, icon, isActive, onClick }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${isActive
        ? 'bg-blue-100 text-blue-700'
        : 'hover:bg-gray-100'
      }`}
    onClick={onClick}
  >
    <div className="w-4 h-4 sm:w-5 sm:h-5">{icon}</div>
    <span className="text-sm sm:text-base font-medium">{label}</span>
  </Link>
);

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const permissions = usePermissions();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Obtention du titre de la section en fonction du rôle
  const getSectionTitle = () => {
    if (!user) return "Lomeko Santé";

    switch (user.role) {
      case UserRole.ADMIN:
        return "Administration";
      case UserRole.DOCTOR:
        return "Espace Médecin";
      case UserRole.PATIENT:
        return "Espace Patient";
      case UserRole.SOCIAL_SECURITY_AGENT:
        return "Sécurité Sociale";
      default:
        return "Lomeko Santé";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex flex-1 relative">
        {/* Mobile menu button */}
        <button
          className="md:hidden fixed z-20 bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar - responsive */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            fixed md:static inset-y-0 left-0 z-10
            w-64 border-r bg-white shadow-md md:shadow-sm
            px-3 py-4 sm:py-6 flex flex-col
            transition-transform duration-300 ease-in-out
          `}
        >
          <div className="mb-6 px-4">
            <h1 className="text-lg sm:text-xl font-bold text-blue-700">Lomeko Santé</h1>
            <p className="text-xs sm:text-sm text-gray-500">{getSectionTitle()}</p>
          </div>

          <nav className="flex-1 space-y-1">
            {/* Navigation commune à tous les rôles */}
            <NavItem
              to="/"
              label="Tableau de Bord"
              icon={<HomeIcon />}
              isActive={path === '/'}
              onClick={closeSidebar}
            />

            {/* Navigation conditionnelle en fonction du rôle */}
            {user?.role === UserRole.ADMIN && (
              <>
                {permissions.canViewPatients && (
                  <NavItem
                    to="/patients"
                    label="Patients"
                    icon={<UserGroupIcon />}
                    isActive={path.startsWith('/patients')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewDoctors && (
                  <NavItem
                    to="/doctors"
                    label="Médecins"
                    icon={<UserIcon />}
                    isActive={path.startsWith('/doctors')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewConsultations && (
                  <NavItem
                    to="/consultations"
                    label="Consultations"
                    icon={<ClipboardDocumentListIcon />}
                    isActive={path.startsWith('/consultations')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewPrescriptions && (
                  <NavItem
                    to="/prescriptions"
                    label="Prescriptions"
                    icon={<DocumentTextIcon />}
                    isActive={path.startsWith('/prescriptions')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewReimbursements && (
                  <NavItem
                    to="/reimbursements"
                    label="Remboursements"
                    icon={<ClockIcon />}
                    isActive={path.startsWith('/reimbursements')}
                    onClick={closeSidebar}
                  />
                )}
              </>
            )}

            {user?.role === UserRole.DOCTOR && (
              <>
                {permissions.canViewPatients && (
                  <NavItem
                    to="/doctor/patients"
                    label="Mes Patients"
                    icon={<UserGroupIcon />}
                    isActive={path.startsWith('/doctor/patients')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewConsultations && (
                  <NavItem
                    to="/doctor/consultations"
                    label="Mes Consultations"
                    icon={<ClipboardDocumentListIcon />}
                    isActive={path.startsWith('/doctor/consultations')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewPrescriptions && (
                  <NavItem
                    to="/doctor/prescriptions"
                    label="Mes Prescriptions"
                    icon={<DocumentTextIcon />}
                    isActive={path.startsWith('/doctor/prescriptions')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canRequestPatientAccess && (
                  <NavItem
                    to="/doctor/request-access"
                    label="Demander Accès"
                    icon={<ShieldCheckIcon />}
                    isActive={path.startsWith('/doctor/request-access')}
                    onClick={closeSidebar}
                  />
                )}
                <NavItem
                  to="/doctor/appointments"
                  label="Rendez-vous"
                  icon={<CalendarIcon />}
                  isActive={path.startsWith('/doctor/appointments')}
                  onClick={closeSidebar}
                />
              </>
            )}

            {user?.role === UserRole.PATIENT && (
              <>
                <NavItem
                  to="/patient/profile"
                  label="Mon Profil"
                  icon={<UserIcon />}
                  isActive={path.startsWith('/patient/profile')}
                  onClick={closeSidebar}
                />
                {permissions.canViewConsultations && (
                  <NavItem
                    to="/patient/consultations"
                    label="Mes Consultations"
                    icon={<ClipboardDocumentListIcon />}
                    isActive={path.startsWith('/patient/consultations')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewPrescriptions && (
                  <NavItem
                    to="/patient/prescriptions"
                    label="Mes Prescriptions"
                    icon={<DocumentTextIcon />}
                    isActive={path.startsWith('/patient/prescriptions')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewReimbursements && (
                  <NavItem
                    to="/patient/reimbursements"
                    label="Mes Remboursements"
                    icon={<ClockIcon />}
                    isActive={path.startsWith('/patient/reimbursements')}
                    onClick={closeSidebar}
                  />
                )}
                <NavItem
                  to="/patient/appointments"
                  label="Mes Rendez-vous"
                  icon={<CalendarIcon />}
                  isActive={path.startsWith('/patient/appointments')}
                  onClick={closeSidebar}
                />
                {permissions.canManageChildren && (
                  <NavItem
                    to="/patient/children"
                    label="Mes Enfants"
                    icon={<HeartIcon />}
                    isActive={path.startsWith('/patient/children')}
                    onClick={closeSidebar}
                  />
                )}
              </>
            )}

            {user?.role === UserRole.SOCIAL_SECURITY_AGENT && (
              <>
                {permissions.canViewPatients && (
                  <NavItem
                    to="/agent/patients"
                    label="Patients"
                    icon={<UserGroupIcon />}
                    isActive={path.startsWith('/agent/patients')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewDoctors && (
                  <NavItem
                    to="/agent/doctors"
                    label="Médecins"
                    icon={<UserIcon />}
                    isActive={path.startsWith('/agent/doctors')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canViewConsultations && (
                  <NavItem
                    to="/agent/consultations"
                    label="Consultations"
                    icon={<ClipboardDocumentListIcon />}
                    isActive={path.startsWith('/agent/consultations')}
                    onClick={closeSidebar}
                  />
                )}
                {permissions.canProcessReimbursements && (
                  <NavItem
                    to="/agent/reimbursements"
                    label="Remboursements"
                    icon={<ClockIcon />}
                    isActive={path.startsWith('/agent/reimbursements')}
                    onClick={closeSidebar}
                  />
                )}
              </>
            )}
          </nav>

          <div className="pt-4 mt-4 sm:pt-6 sm:mt-6 border-t">
            <div className="px-4 py-2">
              <div className="text-xs sm:text-sm font-medium">Centre de Lomeko Santé</div>
              <div className="text-xs text-gray-500">Système de Gestion</div>
            </div>
          </div>
        </aside>

        {/* Main content - responsive */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
