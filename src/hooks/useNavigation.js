/*
============================================================================
FILE: src/hooks/useNavigation.js
============================================================================
PURPOSE:
  Custom hook for navigation management in EagleAI application.
  Provides a consistent interface for navigation between routes.

FEATURES:
  - Current route detection
  - Navigation functions
  - Route validation
  - Navigation history
  - Scroll position management
  - Deep linking support

USAGE:
  const { currentRoute, navigate, isActive } = useNavigation();
============================================================================
*/

import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

// Route configuration mapping
const ROUTE_CONFIG = {
  '/dashboard': { id: 'dashboard', label: 'Dashboard', icon: 'Home' },
  '/career': { id: 'career', label: 'Career', icon: 'TrendingUp' },
  '/mentorship': { id: 'mentorship', label: 'Mentorship', icon: 'Users' },
  '/projects': { id: 'projects', label: 'Projects', icon: 'Briefcase' },
  '/roadmap': { id: 'roadmap', label: 'Roadmap', icon: 'Brain' },
  '/skills': { id: 'skills', label: 'Skills', icon: 'Code' },
  '/resume': { id: 'resume', label: 'Resume Review', icon: 'FileText' }
};

// Valid routes for navigation
const VALID_ROUTES = Object.keys(ROUTE_CONFIG);

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current route information
  const currentRoute = useMemo(() => {
    const pathname = location.pathname;
    const routeConfig = ROUTE_CONFIG[pathname];
    
    return {
      path: pathname,
      id: routeConfig?.id || 'unknown',
      label: routeConfig?.label || 'Unknown',
      icon: routeConfig?.icon || 'HelpCircle',
      isHome: pathname === '/dashboard' || pathname === '/',
      isNotFound: !routeConfig
    };
  }, [location.pathname]);

  // Navigation function with validation
  const navigateTo = useCallback((route, options = {}) => {
    // Validate route
    if (!VALID_ROUTES.includes(route)) {
      console.warn(`Invalid route: ${route}. Available routes:`, VALID_ROUTES);
      return false;
    }

    // Navigate to route
    navigate(route, {
      replace: false,
      state: { from: currentRoute.path, timestamp: Date.now() },
      ...options
    });

    // Scroll to top after navigation
    if (options.scrollToTop !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return true;
  }, [navigate, currentRoute.path]);

  // Check if a route is currently active
  const isActive = useCallback((route) => {
    return currentRoute.path === route || 
           (route === '/dashboard' && currentRoute.path === '/');
  }, [currentRoute.path]);

  // Navigate to previous route
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Navigate to home/dashboard
  const goHome = useCallback(() => {
    navigateTo('/dashboard');
  }, [navigateTo]);

  // Get all available routes
  const availableRoutes = useMemo(() => {
    return Object.entries(ROUTE_CONFIG).map(([path, config]) => ({
      path,
      ...config,
      isActive: isActive(path)
    }));
  }, [isActive]);

  // Navigation history (basic implementation)
  const navigationHistory = useMemo(() => {
    const state = location.state;
    return state ? [state.from, currentRoute.path] : [currentRoute.path];
  }, [location.state, currentRoute.path]);

  // Get route by ID (for backward compatibility)
  const getRouteById = useCallback((id) => {
    const routeEntry = Object.entries(ROUTE_CONFIG).find(([, config]) => config.id === id);
    return routeEntry ? routeEntry[0] : null;
  }, []);

  // Navigate by route ID
  const navigateById = useCallback((id, options = {}) => {
    const route = getRouteById(id);
    if (route) {
      return navigateTo(route, options);
    }
    console.warn(`Route ID not found: ${id}`);
    return false;
  }, [getRouteById, navigateTo]);

  return {
    // Current route information
    currentRoute,
    currentPath: currentRoute.path,
    currentId: currentRoute.id,
    currentLabel: currentRoute.label,
    currentIcon: currentRoute.icon,
    isHome: currentRoute.isHome,
    isNotFound: currentRoute.isNotFound,

    // Navigation functions
    navigate: navigateTo,
    navigateById,
    goBack,
    goHome,

    // Route utilities
    isActive,
    availableRoutes,
    navigationHistory,
    getRouteById,

    // Route validation
    isValidRoute: (route) => VALID_ROUTES.includes(route),
    validRoutes: VALID_ROUTES
  };
};

export default useNavigation;
