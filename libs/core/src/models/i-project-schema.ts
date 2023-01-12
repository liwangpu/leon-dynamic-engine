import { InteractionType } from '../enums';
import { IComponentConfiguration } from './i-component-configuration';

export interface IInteraction {
  field: string;
}

export interface ICondition {
  field: string;
  operator: string;
  value: string;
}

export interface IPageRuleBranch {
  conditions: Array<ICondition>;
  results: {
    showFields: Array<IInteraction>;
    readonlyFields: Array<IInteraction>;
    requiredFields: Array<IInteraction>;
  };
}

export interface IPageRule {
  mainFilter: ICondition;
  branches: Array<IPageRuleBranch>;
}

export interface IProjectSchema extends IComponentConfiguration {
  rules?: Array<IPageRule>;
} 