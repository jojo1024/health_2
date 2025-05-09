export interface IConsultationFormData {
    temperature: string;
    weight: string;
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    heartRate: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    motif: string;
    consultation: string;
    prescription: string;
}
export interface Document {
    id: string;
    type: 'image' | 'pdf';
    preview: string;
    base64: string;
    filename: string;
  }
export const initialFormData: IConsultationFormData = {
    // Constantes vitales
    temperature: '',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',

    // Informations de consultation
    motif: '',  // Obligatoire
    consultation: '',
    prescription: '',
}

export const validateConsultationForm = (
    formData: IConsultationFormData,
    setErrors: (value: React.SetStateAction<{
        [key: string]: string;
    }>) => void,
    documents: Document[]
) => {
    const newErrors: { [key: string]: string } = {};

    // Vérifier le motif (obligatoire)
    if (!formData.motif.trim()) {
        newErrors.motif = "Le motif de consultation est obligatoire";
    }

    // // Vérifier que la consultation est remplie
    // if (!formData.consultation.trim()) {
    //     newErrors.consultation = "Le détail de la consultation est obligatoire";
    // }

    // // Vérifier que l'ordonnance est remplie
    // if (!formData.prescription.trim()) {
    //     newErrors.prescription = "L'ordonnance est obligatoire";
    // }

    // Vérifier qu'au moins un document est téléchargé
    if (documents.length === 0) {
        newErrors.documents = "Au moins un document ou image est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};