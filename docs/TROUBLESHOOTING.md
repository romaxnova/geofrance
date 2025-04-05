# Guide de dépannage

Ce document présente les solutions aux problèmes les plus fréquemment rencontrés lors de l'utilisation de l'application "Carte des Risques Environnementaux - France".

## Problèmes de chargement de la carte

### La carte ne s'affiche pas

**Symptômes** : Page blanche ou conteneur de carte vide.

**Solutions possibles** :
1. **Vérifiez votre connexion Internet** - La carte nécessite le chargement de tuiles OpenStreetMap.
2. **Vérifiez la console du navigateur** - Appuyez sur F12 et consultez les erreurs dans l'onglet "Console".
3. **Problème de CSS** - Assurez-vous que les fichiers CSS sont correctement chargés.
4. **Conflit de bibliothèques** - Vérifiez qu'il n'y a pas de conflit entre différentes versions de Leaflet.

**Correction** :
```javascript
// Vérifiez que l'élément DOM existe
const mapElement = document.getElementById('map');
if (!mapElement) {
    console.error("L'élément #map n'existe pas dans le DOM");
}
```

### Les tuiles de carte ne se chargent pas

**Symptômes** : Grille grise ou messages d'erreur de chargement de tuiles.

**Solutions possibles** :
1. **Problème de CORS** - Les serveurs de tuiles peuvent bloquer les requêtes cross-origin.
2. **Limite de requêtes** - Vous avez peut-être atteint la limite de requêtes du serveur de tuiles.

**Correction** :
```javascript
// Essayez un serveur de tuiles alternatif
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);
```

## Problèmes de recherche d'adresse

### La recherche d'adresse ne fonctionne pas

**Symptômes** : Aucun résultat n'apparaît lors de la saisie d'une adresse.

**Solutions possibles** :
1. **Problème d'API** - L'API BAN peut être temporairement indisponible.
2. **Erreur CORS** - Problème d'accès cross-origin à l'API.
3. **Format de requête incorrect** - La requête envoyée à l'API est mal formatée.

**Correction** :
```javascript
// Vérifiez la disponibilité de l'API
fetch('https://api-adresse.data.gouv.fr/search/?q=test')
    .then(response => {
        if (!response.ok) {
            console.error("L'API BAN n'est pas accessible");
        }
    })
    .catch(error => console.error("Erreur de connexion à l'API BAN:", error));
```

### Les résultats de recherche sont incorrects

**Symptômes** : Les adresses retournées ne correspondent pas à la recherche.

**Solutions possibles** :
1. **Recherche trop vague** - Précisez davantage votre recherche.
2. **Limitation géographique** - L'API BAN ne couvre que la France.

## Problèmes de couche de risque

### La couche de risque ne s'affiche pas

**Symptômes** : Aucune zone colorée n'apparaît après activation de la couche de risque.

**Solutions possibles** :
1. **Problème d'API** - L'API Géorisques peut être temporairement indisponible.
2. **Zone sans risque** - La zone visualisée ne contient peut-être pas de risque d'inondation.
3. **Problème de zoom** - Certaines couches ne sont visibles qu'à certains niveaux de zoom.

**Correction** :
```javascript
// Vérifiez la disponibilité du service WMS
fetch('https://www.georisques.gouv.fr/services/zonages_inondation/mapserver/wms?SERVICE=WMS&REQUEST=GetCapabilities')
    .then(response => {
        if (!response.ok) {
            console.error("Le service WMS Géorisques n'est pas accessible");
        }
    })
    .catch(error => console.error("Erreur de connexion au service WMS:", error));
```

### Les popups d'information ne s'affichent pas

**Symptômes** : Aucune information n'apparaît au clic sur une zone à risque.

**Solutions possibles** :
1. **Événement non capturé** - L'événement de clic n'est pas correctement configuré.
2. **Couche WMS** - Les couches WMS ne supportent pas nativement les popups comme les couches GeoJSON.

## Problèmes de couche Cadastre

### La couche Cadastre ne s'affiche pas

**Symptômes** : Aucune parcelle cadastrale n'apparaît après activation de la couche Cadastre.

**Solutions possibles** :
1. **Problème de service WMS** - Le service WMS de l'IGN peut être temporairement indisponible.
2. **Nom de couche incorrect** - Vérifiez que le nom de la couche WMS est correct (CADASTRALPARCELS.PARCELLAIRE_EXPRESS).
3. **Problème de zoom** - Les parcelles cadastrales ne sont visibles qu'à partir d'un certain niveau de zoom (généralement 15+).

**Correction** :
```javascript
// Vérifiez la disponibilité du service WMS de l'IGN
fetch('https://wxs.ign.fr/essentiels/geoportail/r/wms?SERVICE=WMS&REQUEST=GetCapabilities')
    .then(response => {
        if (!response.ok) {
            console.error("Le service WMS de l'IGN n'est pas accessible");
        }
    })
    .catch(error => console.error("Erreur de connexion au service WMS de l'IGN:", error));
```

### Les parcelles cadastrales sont trop lentes à charger

**Symptômes** : Temps de chargement très long pour la couche Cadastre, surtout à des niveaux de zoom élevés.

**Solutions possibles** :
1. **Réduire l'opacité** - Diminuez l'opacité de la couche pour améliorer les performances de rendu.
2. **Limiter le zoom** - Limitez l'affichage de la couche à certains niveaux de zoom.
3. **Utiliser un style simplifié** - Utilisez le style 'line' au lieu de 'default' pour un rendu plus léger.

## Problèmes de données DVF

### Les marqueurs DVF ne s'affichent pas

**Symptômes** : Aucun marqueur de transaction immobilière n'apparaît après activation de la couche DVF.

**Solutions possibles** :
1. **Problème de chargement des données** - Le fichier GeoJSON peut ne pas être correctement chargé.
2. **Erreur de format** - Le format des données peut être incorrect.
3. **Filtres trop restrictifs** - Les filtres appliqués peuvent exclure toutes les données.

**Correction** :
```javascript
// Vérifiez le chargement des données DVF
fetch('../data/dvf-sample.json')
    .then(response => {
        if (!response.ok) {
            console.error("Le fichier de données DVF n'est pas accessible");
        }
        return response.json();
    })
    .then(data => {
        console.log("Nombre de transactions chargées:", data.features.length);
    })
    .catch(error => console.error("Erreur de chargement des données DVF:", error));
```

### Les filtres DVF ne fonctionnent pas correctement

**Symptômes** : Les filtres par année ou par prix ne filtrent pas correctement les données.

**Solutions possibles** :
1. **Format de date incorrect** - Vérifiez le format des dates dans les données.
2. **Problème de conversion** - Assurez-vous que les valeurs de prix sont bien converties en nombres.
3. **Logique de filtrage** - Vérifiez la logique de filtrage dans le code.

## Problèmes de performance

### L'application est lente

**Symptômes** : Temps de chargement long, interactions lentes avec la carte.

**Solutions possibles** :
1. **Trop de données** - Réduisez la quantité de données chargées simultanément.
2. **Optimisation des images** - Les tuiles de carte peuvent être lentes à charger.
3. **Navigateur obsolète** - Utilisez un navigateur récent avec de meilleures performances JavaScript.

**Correction** :
```javascript
// Réduire la qualité des tuiles pour améliorer les performances
L.tileLayer(TILE_LAYER.url, {
    attribution: TILE_LAYER.attribution,
    maxZoom: MAP_CONFIG.maxZoom,
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);
```

## Problèmes de déploiement

### Erreurs 404 sur les ressources

**Symptômes** : Certains fichiers JavaScript ou CSS ne se chargent pas.

**Solutions possibles** :
1. **Chemins incorrects** - Vérifiez les chemins relatifs dans vos fichiers HTML.
2. **Structure de dossiers** - Assurez-vous que la structure de dossiers sur le serveur correspond à celle du développement.

**Correction** :
- Utilisez des chemins relatifs à la racine du site (commençant par `/`) ou des chemins relatifs au document actuel.

### Problèmes CORS en production

**Symptômes** : Les APIs fonctionnent en local mais pas en production.

**Solutions possibles** :
1. **Configuration du serveur** - Ajoutez les en-têtes CORS appropriés.
2. **Proxy** - Utilisez un proxy côté serveur pour les requêtes API.

## Autres problèmes

Si vous rencontrez d'autres problèmes non listés ici :

1. Consultez la console du navigateur (F12) pour identifier les erreurs JavaScript
2. Vérifiez les requêtes réseau dans l'onglet "Network" des outils de développement
3. Assurez-vous que toutes les dépendances sont correctement chargées
4. Testez l'application dans un autre navigateur pour isoler les problèmes spécifiques au navigateur

Pour tout autre problème, veuillez créer une issue sur le dépôt GitHub du projet.
