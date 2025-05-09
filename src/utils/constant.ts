/** Interface pour votre patientData personnalisé */
export interface PatientData {
    idPatient: number;
    numeroPatient: string;
    nomPrenomPatient: string;
    dateNaissancePatient: Date;
    medecin: string;
    ethniePatient: string;
    groupeSanguinPatient: string;
    lieuHabitationPatient: string;
  }
  
  /** Votre jeu de données patientData */
  export const patientData: PatientData[] = [
    {
      idPatient: 1,
      numeroPatient: '20251234',
      nomPrenomPatient: "N'DJABO JOEL EMMANUEL",
      dateNaissancePatient: new Date('2001-06-01'),
      medecin: 'Dr. Yao Paulin',
      ethniePatient: 'Baoulé',
      groupeSanguinPatient: 'O+',
      lieuHabitationPatient: 'Yopougon azito',
    },
    {
      idPatient: 2,
      numeroPatient: '20253212',
      nomPrenomPatient: 'ASSEMIEN DONATIEN',
      dateNaissancePatient: new Date('1999-06-01'),
      medecin: 'Dr. Samuel',
      ethniePatient: 'Attié',
      groupeSanguinPatient: 'A-',
      lieuHabitationPatient: 'Kouamissi campement',
    },
  ];