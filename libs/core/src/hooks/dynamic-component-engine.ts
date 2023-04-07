import { useContext } from 'react';
import { DynamicComponentFactoryContext } from '../contexts';

export function useDynamicComponentEngine() {
  const componentFactory = useContext(DynamicComponentFactoryContext);
  return {
    getDynamicComponentRenderFactory: componentFactory.getDynamicComponentRenderFactory,
    getDynamicComponentContainerRenderFactory: componentFactory.getDynamicComponentContainerRenderFactory,
  };
}