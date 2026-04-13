import { useStore } from './store/useStore';

export type Language = 'en' | 'fr';

export const translations = {
  en: {
    tabs: {
      home: 'Home',
      history: 'History',
      favorites: 'Favorites',
      settings: 'Settings',
    },
    favorites: {
      title: 'Favorites',
      empty: 'No favorites yet',
    },
    home: {
      subtitle: 'Turn your steps into a route',
      stepCount: 'Step count',
      stepPlaceholder: 'e.g. 10000',
      routeType: 'Route type',
      routeTypes: {
        loop: 'Loop',
        'round-trip': 'Round trip',
        'one-way': 'One way',
      },
      startingPoint: 'Starting point',
      useLocation: '📍 Use my location',
      locationActive: '✓ Current location',
      or: 'or',
      searchAddress: 'Search an address...',
      errors: {
        invalidSteps: 'Enter a valid step count (minimum 100)',
        noStart: 'Please set a starting point',
        locationFailed: 'Unable to get location',
        addressNotFound: 'Address not found',
        generationFailed: 'An error occurred during generation',
      },
      optimizing: (n: number, max: number) => `Optimizing route… (${n}/${max})`,
      generate: 'Generate route',
    },
    history: {
      title: 'History',
      empty: 'No routes generated yet',
      steps: 'steps',
      locale: 'en-US',
      routeTypes: {
        loop: 'Loop',
        'round-trip': 'Round trip',
        'one-way': 'One way',
      } as Record<string, string>,
    },
    map: {
      regenerate: 'Regenerate',
      exportGPX: 'Export GPX',
      newRoute: '← New route',
      myRoute: 'My route',
      recenter: 'Recenter on route',
    },
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      theme: 'Theme',
      themes: {
        system: 'System',
        light: 'Light',
        dark: 'Dark',
      },
      profile: 'Profile',
      height: 'Height',
      strideLength: 'Calculated stride length',
      strideHint: (km: string) =>
        `Automatically calculated from your height (height × 0.413). For 10,000 steps → ~${km} km.`,
      language: 'Language',
      languages: {
        en: 'English',
        fr: 'Français',
      },
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: April 2025',
      sections: [
        {
          heading: 'Overview',
          body: 'StepRoute generates walking routes from a step count target. We are committed to protecting your privacy. This policy explains what data is collected and how it is used.',
        },
        {
          heading: 'Data collected on your device',
          body: 'Your height (used to calculate stride length) and route history (last 20 routes) are stored locally on your device using AsyncStorage. This data never leaves your device.',
        },
        {
          heading: 'Location data',
          body: 'StepRoute requests your GPS location only when you tap "Use my location" to set a starting point for route generation. Location data is used solely to generate the route and is never stored on our servers.',
        },
        {
          heading: 'Route generation',
          body: 'Route requests are sent to a Cloudflare Worker proxy (steproute.lois-morvan.workers.dev) which forwards them to OpenRouteService. Only the route coordinates are transmitted — no personal data is included in these requests.',
        },
        {
          heading: 'Address search',
          body: 'Address suggestions are provided by Nominatim (OpenStreetMap Foundation). Search queries are sent to their public API. Please refer to the OpenStreetMap privacy policy for details.',
        },
        {
          heading: 'No accounts or analytics',
          body: 'StepRoute does not require an account, does not collect personal identifiers, and does not use any analytics or advertising services.',
        },
        {
          heading: 'Data deletion',
          body: 'All locally stored data (height, route history) can be deleted at any time by uninstalling the application.',
        },
        {
          heading: 'Contact',
          body: 'For any privacy-related questions, contact: lois.morvan.pro@gmail.com',
        },
      ],
    },
  },
  fr: {
    tabs: {
      home: 'Accueil',
      history: 'Historique',
      favorites: 'Favoris',
      settings: 'Paramètres',
    },
    favorites: {
      title: 'Favoris',
      empty: 'Aucun favori pour l\'instant',
    },
    home: {
      subtitle: 'Transformez vos pas en parcours',
      stepCount: 'Nombre de pas',
      stepPlaceholder: 'ex. 10000',
      routeType: 'Type de parcours',
      routeTypes: {
        loop: 'Boucle',
        'round-trip': 'Aller-retour',
        'one-way': 'Aller simple',
      },
      startingPoint: 'Point de départ',
      useLocation: '📍 Utiliser ma position',
      locationActive: '✓ Position actuelle',
      or: 'ou',
      searchAddress: 'Rechercher une adresse...',
      errors: {
        invalidSteps: 'Entrez un nombre de pas valide (minimum 100)',
        noStart: 'Veuillez définir un point de départ',
        locationFailed: 'Impossible de récupérer la position',
        addressNotFound: 'Adresse introuvable',
        generationFailed: 'Une erreur est survenue lors de la génération',
      },
      optimizing: (n: number, max: number) => `Optimisation du parcours… (${n}/${max})`,
      generate: 'Générer le parcours',
    },
    history: {
      title: 'Historique',
      empty: "Aucun parcours généré pour l'instant",
      steps: 'pas',
      locale: 'fr-FR',
      routeTypes: {
        loop: 'Boucle',
        'round-trip': 'Aller-retour',
        'one-way': 'Aller simple',
      } as Record<string, string>,
    },
    map: {
      regenerate: 'Regénérer',
      exportGPX: 'Exporter GPX',
      newRoute: '← Nouveau parcours',
      myRoute: 'Mon parcours',
      recenter: 'Recentrer sur le parcours',
    },
    settings: {
      title: 'Paramètres',
      appearance: 'Apparence',
      theme: 'Thème',
      themes: {
        system: 'Système',
        light: 'Clair',
        dark: 'Sombre',
      },
      profile: 'Profil',
      height: 'Taille',
      strideLength: 'Longueur de foulée calculée',
      strideHint: (km: string) =>
        `Calculée automatiquement depuis ta taille (taille × 0.413). Pour 10 000 pas → ~${km} km.`,
      language: 'Langue',
      languages: {
        en: 'English',
        fr: 'Français',
      },
      legal: 'Mentions légales',
      privacyPolicy: 'Politique de confidentialité',
    },
    privacy: {
      title: 'Politique de confidentialité',
      lastUpdated: 'Dernière mise à jour : avril 2025',
      sections: [
        {
          heading: 'Vue d\'ensemble',
          body: 'StepRoute génère des parcours de marche à partir d\'un objectif de pas. Nous nous engageons à protéger votre vie privée. Cette politique explique quelles données sont collectées et comment elles sont utilisées.',
        },
        {
          heading: 'Données stockées sur votre appareil',
          body: 'Votre taille (utilisée pour calculer la longueur de foulée) et l\'historique des parcours (20 derniers) sont stockés localement sur votre appareil via AsyncStorage. Ces données ne quittent jamais votre appareil.',
        },
        {
          heading: 'Données de localisation',
          body: 'StepRoute accède à votre position GPS uniquement lorsque vous appuyez sur « Utiliser ma position » pour définir le point de départ d\'un parcours. La position n\'est utilisée que pour générer l\'itinéraire et n\'est jamais stockée sur nos serveurs.',
        },
        {
          heading: 'Génération des parcours',
          body: 'Les requêtes de génération sont envoyées à un proxy Cloudflare Worker (steproute.lois-morvan.workers.dev) qui les transmet à OpenRouteService. Seules les coordonnées du parcours sont transmises — aucune donnée personnelle n\'est incluse.',
        },
        {
          heading: 'Recherche d\'adresse',
          body: 'Les suggestions d\'adresses sont fournies par Nominatim (OpenStreetMap Foundation). Les requêtes de recherche sont envoyées à leur API publique. Consultez la politique de confidentialité d\'OpenStreetMap pour plus de détails.',
        },
        {
          heading: 'Pas de compte ni d\'analytics',
          body: 'StepRoute ne nécessite pas de compte, ne collecte pas d\'identifiants personnels et n\'utilise aucun service d\'analytics ou de publicité.',
        },
        {
          heading: 'Suppression des données',
          body: 'Toutes les données stockées localement (taille, historique) peuvent être supprimées à tout moment en désinstallant l\'application.',
        },
        {
          heading: 'Contact',
          body: 'Pour toute question relative à la confidentialité : lois.morvan.pro@gmail.com',
        },
      ],
    },
  },
} as const;

export function useTranslation() {
  const language = useStore((s) => s.language);
  return translations[language];
}
