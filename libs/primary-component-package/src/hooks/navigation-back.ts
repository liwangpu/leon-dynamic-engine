import { useContext } from 'react';
import { NavigationBackContext } from '../contexts';

export function useNavigationBack() {
  const navigationBack = useContext(NavigationBackContext);
  const getGoBackContent = navigationBack && typeof navigationBack.getGoBackContent === 'function' ? navigationBack.getGoBackContent : null;
  return {
    getGoBackContent: () => {
      if (!getGoBackContent) { return null; }
      return getGoBackContent();
    }
  };
}