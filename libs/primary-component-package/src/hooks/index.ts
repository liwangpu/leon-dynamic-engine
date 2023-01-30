import { useContext, useMemo } from 'react';
import { GRID_SYSTEM_SECTION_TOTAL } from '../consts';
import { NavigationBackContext } from '../contexts';
import { IFormItemConfiguration } from '../models';

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
