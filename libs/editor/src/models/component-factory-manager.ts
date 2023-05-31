import { IComponentConfiguration, IDynamicComponentContainerProps, IDynamicComponentContainerRendererRef, IDynamicComponentFactory, IDynamicComponentProps } from '@lowcode-engine/core';
import { DynamicComponent, DynamicComponentContainer } from '../components/DynamicComponent';
import { IEditorContext } from './editor-manager';

export class ComponentFactoryManager implements IDynamicComponentFactory {

  public constructor(protected context: IEditorContext) { }

  public getDynamicComponentFactory(): React.ComponentType<IDynamicComponentProps<IComponentConfiguration>> {
    return DynamicComponent;
  }

  public getDynamicComponentContainerFactory(): React.ForwardRefExoticComponent<IDynamicComponentContainerProps & React.RefAttributes<IDynamicComponentContainerRendererRef>> {
    return DynamicComponentContainer;
  }

}
