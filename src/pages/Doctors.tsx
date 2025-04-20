import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { doctors } from '../data/mockData';
import { DoctorSpecialty } from '../types';

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const license = doctor.licenseNumber.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(searchTermLower) || license.includes(searchTermLower);
    const matchesSpecialty = specialtyFilter === 'all' ||
                            (specialtyFilter === 'general' && doctor.specialty === DoctorSpecialty.GENERAL) ||
                            (specialtyFilter === 'specialist' && doctor.specialty === DoctorSpecialty.SPECIALIST);

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médecins</h1>
          <p className="text-gray-500 mt-1">Gérez tous les médecins enregistrés</p>
        </div>

        <Link to="/doctors/new">
          <Button icon={<PlusIcon className="w-5 h-5" />}>
            Nouveau Médecin
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher par nom ou numéro de licence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">Toutes spécialités</option>
              <option value="general">Généralistes</option>
              <option value="specialist">Spécialistes</option>
            </select>
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
                  Spécialité
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro de licence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={doctor.specialty === DoctorSpecialty.GENERAL ? 'primary' : 'info'}
                    >
                      {doctor.specialty}
                    </Badge>
                    {doctor.specialistType && (
                      <div className="text-xs text-gray-500 mt-1">
                        {doctor.specialistType}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.licenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{doctor.email}</div>
                    <div>{doctor.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doctor.isAlsoPatient ? (
                      <Badge variant="warning">Également patient</Badge>
                    ) : (
                      <Badge variant="default">Médecin uniquement</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Détails
                      </Link>
                      <Link
                        to={`/doctors/${doctor.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun médecin ne correspond à votre recherche
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

export default Doctors;
