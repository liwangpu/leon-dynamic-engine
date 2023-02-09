import { IDynamicComponentFactory, IDynamicComponentProps } from '@lowcode-engine/core';
import { ComponentType } from 'react';
import DynamicComponent from '../components/DynamicComponent';

export class DynamicComponentFactoryProvider implements IDynamicComponentFactory {

  private static instance: IDynamicComponentFactory;
  protected constructor() { }

  static getInstance(): IDynamicComponentFactory {
    if (!this.instance) {
      this.instance = new DynamicComponentFactoryProvider();
    }
    return this.instance;
  }

  public getDynamicComponentRenderFactory(): ComponentType<IDynamicComponentProps> {
    return DynamicComponent;
  }

}