# Carte des Risques Environnementaux - France

## Présentation

Cette application web permet de visualiser les risques environnementaux et les données immobilières en France métropolitaine sur une carte interactive. Elle offre les fonctionnalités suivantes :

- Carte interactive basée sur Leaflet avec des tuiles OpenStreetMap
- Recherche d'adresse avec autocomplétion via l'API BAN (Base Adresse Nationale)
- Visualisation des zones à risque d'inondation via l'API Géorisques
- Affichage des parcelles cadastrales via le service WMS de l'IGN
- Visualisation des transactions immobilières (DVF) avec filtrage par année et prix
- Interface utilisateur intuitive pour activer/désactiver les différentes couches

## Fonctionnalités

### Carte de base
- Centrée sur la France métropolitaine
- Zoom et déplacement fluides
- Tuiles OpenStreetMap pour un affichage détaillé

### Recherche d'adresse
- Recherche d'adresse avec autocomplétion
- Centrage automatique de la carte sur l'adresse sélectionnée
- Affichage d'un marqueur à l'emplacement de l'adresse

### Couche de risque d'inondation
- Visualisation des zones inondables en France
- Activation/désactivation via une case à cocher
- Légende explicative
- Informations détaillées sur le risque

### Couche Cadastre
- Affichage des parcelles cadastrales via le service WMS de l'IGN
- Activation/désactivation via une case à cocher
- Rendu optimisé pour ne pas surcharger la carte
- Source officielle des données cadastrales françaises

### Données de Valeurs Foncières (DVF)
- Visualisation des transactions immobilières récentes
- Marqueurs interactifs avec informations détaillées (prix, surface, date)
- Filtrage par année (2019-2023)
- Filtrage par fourchette de prix
- Calcul automatique du prix au m²

## Architecture technique

L'application est construite selon une architecture modulaire :

- `index.html` : Point d'entrée de l'application
- `css/` : Styles CSS pour l'interface utilisateur
  - `style.css` : Styles de base
  - `layer-controls.css` : Styles spécifiques aux contrôles de couches
- `data/` : Données statiques
  - `dvf-sample.json` : Échantillon de données DVF au format GeoJSON
- `src/` : Code source JavaScript
  - `app.js` : Orchestration des différentes fonctionnalités
  - `config.js` : Configuration de l'application et URLs des APIs
  - `layers/` : Modules pour chaque couche de la carte
    - `leaflet-base.js` : Initialisation de la carte Leaflet
    - `ban-search.js` : Recherche d'adresse via l'API BAN
    - `georisques-layer.js` : Couche de risque d'inondation
    - `cadastre-layer.js` : Couche cadastrale via WMS de l'IGN
    - `dvf-layer.js` : Couche des données de valeurs foncières
  - `utils/` : Utilitaires
    - `log.js` : Fonctions de journalisation
    - `fetch-utils.js` : Fonctions pour les appels API

## Technologies utilisées

- HTML5 / CSS3 / JavaScript (ES6)
- Leaflet.js pour la cartographie
- APIs publiques françaises :
  - API Adresse (BAN) pour la recherche d'adresse
  - API Géorisques pour les données de risque d'inondation
  - Service WMS de l'IGN pour les données cadastrales
  - Données DVF (Demandes de Valeurs Foncières) pour les transactions immobilières

## Installation et déploiement

Voir le fichier [DEPLOYMENT.md](./docs/DEPLOYMENT.md) pour les instructions détaillées d'installation et de déploiement.

## Résolution des problèmes courants

Voir le fichier [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) pour des solutions aux problèmes fréquemment rencontrés.

## Évolutions futures

Cette application est conçue pour être modulaire et extensible. Les évolutions prévues incluent :

- Intégration de la couche Cadastre via l'API WMS de l'IGN
- Visualisation des données DVF (Demandes de Valeurs Foncières)
- Ajout des données DPE (Diagnostic de Performance Énergétique)

## Licence

Ce projet est distribué sous licence open source.

## Contact

Pour toute question ou suggestion concernant cette application, veuillez nous contacter.
