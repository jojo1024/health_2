export const calculateAge = (dateOfBirth: string | undefined | Date): string => {
    if (!dateOfBirth) return 'Non renseigné';

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return `${age} ans`;
};