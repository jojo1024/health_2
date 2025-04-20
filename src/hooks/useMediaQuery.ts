import { useState, useEffect } from 'react';

/**
 * Breakpoints standards pour l'application
 */
export const breakpoints = {
  sm: 640,   // Small devices (phones, 640px and up)
  md: 768,   // Medium devices (tablets, 768px and up)
  lg: 1024,  // Large devices (desktops, 1024px and up)
  xl: 1280,  // Extra large devices (large desktops, 1280px and up)
  '2xl': 1536, // 2X large devices (extra large desktops, 1536px and up)
};

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook custom pour gérer les media queries
 * @param query - La requête média à surveiller, soit une chaîne personnalisée, soit une des breakpoints prédéfinies
 * @returns boolean - True si la requête média correspond, false sinon
 *
 * @example
 * // Utilisation avec un breakpoint prédéfini
 * const isMobile = useMediaQuery('sm'); // True si largeur < 640px
 * const isTablet = useMediaQuery('md'); // True si largeur >= 768px
 *
 * // Utilisation avec une requête personnalisée
 * const isPortrait = useMediaQuery('(orientation: portrait)');
 */
const useMediaQuery = (query: Breakpoint | string): boolean => {
  // Construire la requête média
  const mediaQuery = Object.keys(breakpoints).includes(query)
    ? `(max-width: ${breakpoints[query as Breakpoint] - 1}px)`
    : query;

  const [matches, setMatches] = useState<boolean>(() => {
    // Valeur initiale basée sur window.matchMedia si disponible
    if (typeof window !== 'undefined') {
      return window.matchMedia(mediaQuery).matches;
    }
    return false; // Par défaut pour SSR
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const media = window.matchMedia(mediaQuery);

    // Mettre à jour l'état en fonction des changements
    const updateMatches = (): void => {
      setMatches(media.matches);
    };

    // Déclencher une mise à jour initiale
    updateMatches();

    // Ajouter un écouteur pour les changements de taille d'écran
    if (media.addEventListener) {
      media.addEventListener('change', updateMatches);
    } else {
      // Pour la compatibilité avec les anciens navigateurs
      media.addListener(updateMatches);
    }

    // Nettoyage lors du démontage
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', updateMatches);
      } else {
        // Pour la compatibilité avec les anciens navigateurs
        media.removeListener(updateMatches);
      }
    };
  }, [mediaQuery]);

  return matches;
};

/**
 * Hook pour détecter si la vue est mobile (<= breakpoint sm)
 * @returns boolean - True si la largeur d'écran est <= 640px
 */
export const useIsMobile = (): boolean => {
  return useMediaQuery('sm');
};

/**
 * Hook pour détecter si la vue est sur tablette (<= breakpoint md)
 * @returns boolean - True si la largeur d'écran est <= 768px
 */
export const useIsTablet = (): boolean => {
  return useMediaQuery('md');
};

/**
 * Hook pour détecter si la vue est sur desktop (> breakpoint md)
 * @returns boolean - True si la largeur d'écran est > 768px
 */
export const useIsDesktop = (): boolean => {
  const isTablet = useIsTablet();
  return !isTablet;
};

export default useMediaQuery;
