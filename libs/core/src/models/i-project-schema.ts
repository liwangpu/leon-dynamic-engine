import { InteractionType } from '../enums';
import { IComponentConfiguration } from './i-component-configuration';

export interface IInteraction {
  type: InteractionType;
  effectedField?: string;
}

export interface IExpression {
  field: string;
  operator: string;
  value: string;
  sub?: Array<IExpression>;
  interactions?: Array<IInteraction>;
}

export interface IProjectSchema extends IComponentConfiguration {
  rules?: Array<IExpression>;
}