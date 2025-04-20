# Backend - API de Gestion Médicale

Ce backend fournit une API REST pour l'application de gestion médicale. Il est conçu pour se connecter à une base de données MySQL et offrir des points d'accès pour gérer les prescriptions, patients, médecins et consultations.

## Prérequis

- Node.js (v16+) ou Bun (v1+)
- MySQL (v8+)

## Configuration

1. Assurez-vous que MySQL est installé et fonctionne sur votre machine
2. Créez un utilisateur MySQL avec les privilèges appropriés
3. Configurez les variables d'environnement dans le fichier `.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=healthcare_db
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

## Installation

```bash
# Aller dans le répertoire du backend
cd backend

# Installer les dépendances
bun install

# Initialiser la base de données (tables)
bun run node database/initDatabase.js

# Ajouter des données de test (optionnel)
bun run node database/seedData.js
```

## Démarrage du serveur

```bash
# Démarrer le serveur en mode développement
bun run dev

# Ou utiliser le script de démarrage depuis la racine du projet
cd ..
./start-backend.sh
```

Le serveur sera accessible à l'adresse http://localhost:5000

## Points d'accès API

### Prescriptions

- `GET /api/prescriptions` - Récupérer toutes les prescriptions
- `GET /api/prescriptions/:id` - Récupérer une prescription par son ID
- `GET /api/prescriptions/patient/:patientId` - Récupérer les prescriptions d'un patient
- `POST /api/prescriptions` - Créer une nouvelle prescription
- `PUT /api/prescriptions/:id` - Mettre à jour une prescription
- `DELETE /api/prescriptions/:id` - Supprimer une prescription

## Connexion avec le frontend

Le frontend est configuré pour se connecter à l'API à l'adresse `http://localhost:5000/api`. Si vous modifiez le port ou l'adresse du serveur backend, vous devrez également mettre à jour la configuration dans le fichier `src/services/api.ts` du frontend.

## Structure du projet

```
backend/
│
├── config/               # Configuration (base de données)
├── controllers/          # Contrôleurs pour chaque ressource
├── database/             # Scripts d'initialisation et données d'exemple
├── middleware/           # Middleware Express (auth, validation, etc.)
├── models/               # Modèles pour interagir avec la base de données
├── routes/               # Définition des routes API
├── .env                  # Variables d'environnement
├── package.json          # Dépendances et scripts
└── server.js            # Point d'entrée principal
```

## Dépendances principales

- Express.js - Framework web
- MySQL2 - Pilote MySQL avec support des promesses
- Cors - Middleware pour gérer les requêtes CORS
- Bcryptjs - Hachage des mots de passe
- JSONWebToken - Authentification basée sur les tokens
- UUID - Génération d'identifiants uniques
