#!/bin/bash

# Aller dans le répertoire du backend
cd backend

# Installer les dépendances
echo "Installation des dépendances..."
bun install

# Initialiser la base de données
echo "Initialisation de la base de données..."
bun run node database/initDatabase.js

# Ajouter des données d'exemple
echo "Ajout de données d'exemple..."
bun run node database/seedData.js

# Démarrer le serveur
echo "Démarrage du serveur..."
bun run dev
