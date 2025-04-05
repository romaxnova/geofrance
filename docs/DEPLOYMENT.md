# Guide de déploiement

Ce document explique comment déployer l'application "Carte des Risques Environnementaux - France" sur différentes plateformes.

## Prérequis

Cette application est entièrement statique (HTML, CSS, JavaScript) et ne nécessite pas de serveur backend. Vous aurez besoin de :

- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Un serveur web statique pour le déploiement en production

## Déploiement local pour développement

### Option 1 : Serveur Python simple

Si Python est installé sur votre machine, vous pouvez utiliser le serveur HTTP intégré :

```bash
# Pour Python 3
cd project/public
python3 -m http.server 8000

# Pour Python 2
cd project/public
python -m SimpleHTTPServer 8000
```

Accédez ensuite à l'application via : http://localhost:8000

### Option 2 : Extension Live Server pour VS Code

1. Installez l'extension "Live Server" dans VS Code
2. Ouvrez le fichier `public/index.html`
3. Cliquez sur "Go Live" dans la barre d'état en bas de VS Code
4. L'application s'ouvrira automatiquement dans votre navigateur

### Option 3 : Serveur Node.js

Si Node.js est installé :

```bash
# Installation globale de serve
npm install -g serve

# Lancement du serveur
cd project/public
serve
```

## Déploiement en production

### GitHub Pages

1. Créez un dépôt GitHub pour votre projet
2. Poussez le contenu du dossier `public` à la racine du dépôt ou dans la branche `gh-pages`
3. Activez GitHub Pages dans les paramètres du dépôt
4. Votre application sera disponible à l'adresse : `https://[votre-nom-utilisateur].github.io/[nom-du-depot]`

### Render

1. Créez un compte sur [Render](https://render.com/)
2. Créez un nouveau service "Static Site"
3. Connectez votre dépôt GitHub ou téléversez directement les fichiers
4. Configurez :
   - Build Command : laissez vide (pas de build nécessaire)
   - Publish Directory : `public`
5. Cliquez sur "Create Static Site"
6. Votre application sera disponible à l'URL fournie par Render

### Vercel

1. Créez un compte sur [Vercel](https://vercel.com/)
2. Importez votre projet depuis GitHub ou téléversez les fichiers
3. Configurez :
   - Framework Preset : "Other"
   - Root Directory : `public`
4. Cliquez sur "Deploy"
5. Votre application sera disponible à l'URL fournie par Vercel

## Configuration des APIs

Les APIs utilisées (BAN, Géorisques, IGN Cadastre et DVF) sont publiques et ne nécessitent pas de clé d'API. Cependant, si vous rencontrez des problèmes de CORS, vous pouvez avoir besoin de configurer un proxy.

### Service WMS de l'IGN

Le service WMS de l'IGN pour le Cadastre utilise l'API "Géoservices Essentiels" qui est accessible sans authentification. Si vous souhaitez utiliser d'autres services de l'IGN, vous pourriez avoir besoin d'une clé d'API que vous pouvez obtenir sur le site de l'IGN.

### Données DVF

L'application utilise actuellement un échantillon statique de données DVF au format GeoJSON. Pour une utilisation en production avec des données complètes, vous pourriez vouloir :

1. Télécharger les données DVF complètes depuis data.gouv.fr
2. Convertir les données en GeoJSON
3. Héberger les données sur votre serveur ou utiliser un service comme csvapi

## Mise à jour de l'application

Pour mettre à jour l'application déployée :

1. Modifiez les fichiers source
2. Testez localement
3. Poussez les modifications vers votre dépôt (GitHub Pages) ou redéployez (Render/Vercel)

## Vérification du déploiement

Après le déploiement, vérifiez que :

1. La carte se charge correctement
2. La recherche d'adresse fonctionne
3. La couche de risque peut être activée/désactivée
4. Les popups et infobulles s'affichent correctement

Si vous rencontrez des problèmes, consultez le fichier [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
