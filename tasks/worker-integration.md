# Intégration du Cloudflare Worker dans l'application StepRoute

## Contexte

L'application StepRoute utilisait jusqu'à présent openrouteservice directement depuis l'application mobile React Native.

Ce fonctionnement pose un problème de sécurité :
- la clé API openrouteservice ne doit pas être exposée dans l'application
- si la clé est embarquée côté client, elle peut être récupérée
- cela peut entraîner un abus du quota API

Pour résoudre ce problème, un Cloudflare Worker a été créé afin de servir de proxy entre l'application mobile et openrouteservice.

---

## Ce qui a déjà été mis en place

Un Cloudflare Worker existe déjà et remplace l'appel direct à openrouteservice.

Le Worker :
- reçoit une requête HTTP `POST`
- attend un body JSON contenant :
  - `profile`
  - `coordinates`
- appelle openrouteservice côté serveur avec la clé API stockée en secret
- retourne la réponse JSON à l'application

Le secret `ORS_API_KEY` est stocké dans Cloudflare Worker et n'est plus exposé côté client.

### Format attendu par le Worker

Exemple de body JSON :

```json
{
  "profile": "foot-walking",
  "coordinates": [
    [2.3522, 48.8566],
    [2.3622, 48.8666]
  ]
}
````

Important :

* le format des coordonnées est `[longitude, latitude]`
* pas `[latitude, longitude]`

---

## Objectif des modifications dans l'application

Modifier l'application React Native pour :

* ne plus appeler openrouteservice directement
* appeler le Cloudflare Worker à la place
* supprimer toute dépendance à la clé API openrouteservice côté mobile
* conserver le fonctionnement existant de génération et d'affichage de trajet

---

## Ce qu'il faut faire dans l'application

### 1. Identifier le service actuel de génération de trajet

Trouver le ou les fichiers responsables :

* de l'appel HTTP à openrouteservice
* de la construction du payload de routing
* du mapping de la réponse pour l'affichage sur la carte

Ce service doit être mis à jour pour utiliser l'URL du Worker au lieu de l'URL openrouteservice.

---

### 2. Remplacer l'URL openrouteservice par l'URL du Worker

Remplacer l'appel direct à openrouteservice par un appel `POST` vers le Worker.

Utiliser une constante ou une variable de configuration dédiée, par exemple :

```ts
const ROUTE_API_URL = "https://steproute.lois-morvan.workers.dev";
```

Le Worker utilise la route racine `/` pour les requêtes POST.

Le code ne doit plus contenir :

* l'URL openrouteservice directe
* la clé API openrouteservice
* le header `Authorization` côté client

---

### 3. Envoyer le bon payload au Worker

Le body envoyé par l'application doit respecter exactement ce format :

```json
{
  "profile": "foot-walking",
  "coordinates": [
    [longitude1, latitude1],
    [longitude2, latitude2]
  ]
}
```

Si l'application utilise des waypoints, ils doivent être inclus dans `coordinates` dans le bon ordre.

Exemple :

* départ
* waypoint 1
* waypoint 2
* arrivée

---

### 4. Vérifier l'ordre des coordonnées

L'application mobile manipule souvent les coordonnées au format :

* latitude
* longitude

Mais le Worker / openrouteservice attend :

* longitude
* latitude

Il faut donc vérifier tous les points de transformation pour éviter les erreurs de routing.

Créer ou utiliser une fonction utilitaire claire, par exemple :

```ts
function toLngLat(point: { latitude: number; longitude: number }): [number, number] {
  return [point.longitude, point.latitude];
}
```

---

### 5. Conserver le parsing de la réponse

Le Worker retourne la réponse JSON d'openrouteservice.

Il faut donc vérifier que le parsing actuel de la réponse continue de fonctionner.

En particulier :

* géométrie du trajet
* distance totale
* durée éventuelle
* coordonnées pour la polyline sur la map

Si nécessaire, adapter le mapping de la réponse sans changer le comportement visible pour l'utilisateur.

---

### 6. Gérer proprement les erreurs

Ajouter une gestion d'erreur propre si :

* le Worker ne répond pas
* le Worker retourne une erreur `400`
* le Worker retourne une erreur `401`
* le Worker retourne une erreur `429`
* le Worker retourne une erreur `500`

Le comportement attendu côté app :

* ne pas faire crasher l'écran
* afficher un message d'erreur utilisateur simple
* permettre de réessayer

Exemples de messages acceptables :

* "Impossible de générer le trajet."
* "Trop de requêtes, veuillez réessayer dans quelques instants."
* "Une erreur réseau est survenue."

---

### 7. Nettoyer la configuration côté client

Supprimer du code mobile tout ce qui n'est plus nécessaire :

* variable d'environnement ORS côté app
* clé API openrouteservice
* logique spécifique d'authentification ORS côté client

Le client ne doit connaître que l'URL du Worker.

---

### 8. Préparer une configuration propre

Mettre l'URL du Worker dans une configuration claire pour pouvoir la changer facilement plus tard.

Exemples possibles :

* fichier `config.ts`
* constante d'environnement Expo
* fichier dédié aux endpoints API

Le code ne doit pas contenir l'URL du Worker en dur à plusieurs endroits.

---

## Contraintes

Les modifications doivent respecter les contraintes suivantes :

* ne pas refactorer inutilement toute l'application
* modifier uniquement ce qui est nécessaire pour intégrer le Worker
* conserver l'architecture actuelle de l'application autant que possible
* garder un code TypeScript propre et lisible
* ne pas ajouter de dépendances inutiles
* ne pas modifier la logique métier de génération de trajet si ce n'est pas nécessaire

---

## Résultat attendu

À la fin :

* l'application appelle uniquement le Cloudflare Worker
* la clé openrouteservice n'est plus présente dans l'application
* la génération de trajet fonctionne toujours
* le trajet s'affiche correctement sur la carte
* les erreurs réseau sont gérées proprement

---

## Vérifications à effectuer

Vérifier les points suivants :

1. L'application démarre sans erreur
2. La génération d'un trajet fonctionne
3. Le Worker est bien appelé au lieu d'openrouteservice
4. Aucune clé API openrouteservice n'existe encore côté mobile
5. Les coordonnées envoyées sont bien au format `[longitude, latitude]`
6. La carte affiche correctement la route générée
7. Les erreurs HTTP sont bien gérées

---

## Livrables attendus

L'implémentation doit inclure :

* la modification du service de routing
* la mise à jour de la configuration API
* la suppression de l'ancienne logique d'appel direct à openrouteservice
* la gestion d'erreur côté client
* un code final propre et cohérent avec l'existant

---

## Optionnel mais recommandé

Si c'est simple à faire sans sur-ingénierie :

* centraliser les appels réseau liés au routing dans un seul service
* créer un type TypeScript clair pour le payload envoyé au Worker
* créer un type TypeScript clair pour la réponse exploitée par l'application

---

## Instruction importante

Ne pas réécrire toute l'application.

Objectif :
faire une intégration minimale, propre et sûre du Cloudflare Worker dans l'existant.