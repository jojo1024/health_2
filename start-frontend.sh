#!/bin/bash

# Aller dans le répertoire du projet
cd healthcare-management-app

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  bun install
fi

# Démarrer le serveur de développement
echo "Démarrage du frontend..."
bun run dev
