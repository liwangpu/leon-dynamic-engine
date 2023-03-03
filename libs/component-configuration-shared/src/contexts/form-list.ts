import { IComponentPackage } from '@lowcode-engine/core';
import { FormListFieldData, FormListOperation } from 'antd';
import React from 'react';

export interface IFormListContext {
  fields: Array<FormListFieldData>;
  operation: FormListOperation;
}

export const FormListContext = React.createContext<IFormListContext>(null);

export interface IFormListItemContext extends FormListFieldData {
  operation: {
    // add: (defaultValue?: any, insertIndex?: number) => void;
    delete: () => void;
  };
}

export const FormListItemContext = React.createContext<IFormListItemContext>(null);