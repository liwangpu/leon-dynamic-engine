import { useContext } from 'react';
import { DynamicComponentFactoryContext } from '../contexts';

export function useDynamicComponentEngine() {
  const componentFactory = useContext(DynamicComponentFactoryContext);
  return {
    hierarchyManager: componentFactory.hierarchyManager,
    getDynamicComponentFactory: componentFactory.getDynamicComponentFactory,
    getDynamicComponentContainerFactory: componentFactory.getDynamicComponentContainerFactory,
  };
}