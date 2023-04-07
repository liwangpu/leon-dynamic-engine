import { IComponentConfiguration } from '@lowcode-engine/core';
import { IEditorContext } from './editor-manager';
import * as _ from 'lodash';


export interface IConfigurationHandlerFilter {
  parentTypeSelector?: string | Array<string>;
  typeSelector?: string | Array<string>;
  slotSelector?: string | Array<string>;
}

export interface IConfigurationAddingHandler {
  (conf: IComponentConfiguration, parentConf?: IComponentConfiguration): Promise<IComponentConfiguration>
}

export interface IConfigurationAddingHandlerManager {
  registerHandler(filter: IConfigurationHandlerFilter, handler: IConfigurationAddingHandler): void;
  handle(current: IComponentConfiguration, parent?: IComponentConfiguration, slotProperty?: string): Promise<IComponentConfiguration>;
}

export class ConfigurationAddingHandlerManager implements IConfigurationAddingHandlerManager {

  private readonly addHandlers = new Map<IConfigurationHandlerFilter, IConfigurationAddingHandler>();
  public constructor(private context: IEditorContext) { }

  public registerHandler(filter: IConfigurationHandlerFilter, handler: IConfigurationAddingHandler): void {
    this.addHandlers.set(filter, handler);
  }

  public async handle(conf: IComponentConfiguration, parentConf?: IComponentConfiguration, slotProperty?: string): Promise<IComponentConfiguration> {
    const matchedHandlers: Array<IConfigurationAddingHandler> = [];
    for (const [filter, handler] of this.addHandlers) {
      let parentTypeMatched = true;
      if (filter.parentTypeSelector && parentConf) {
        if (_.isArray(filter.parentTypeSelector)) {
          parentTypeMatched = (filter.parentTypeSelector as Array<string>).some(t => t === parentConf.type);
        } else {
          parentTypeMatched = (filter.parentTypeSelector as string) === parentConf.type;
        }
      }

      let slotMatched = true;
      if (filter.slotSelector) {
        if (_.isArray(filter.slotSelector)) {
          slotMatched = (filter.slotSelector as Array<string>).some(t => t === slotProperty);
        } else {
          slotMatched = (filter.slotSelector as string) === slotProperty;
        }
      }

      let currentTypeMatched = true;
      if (filter.typeSelector) {
        if (_.isArray(filter.typeSelector)) {
          currentTypeMatched = (filter.typeSelector as Array<string>).some(t => t === conf.type);
        } else {
          currentTypeMatched = (filter.typeSelector as string) === conf.type;
        }
      }

      if (parentTypeMatched && currentTypeMatched) {
        matchedHandlers.push(handler);
      }
    }

    let currentConf: IComponentConfiguration = conf;
    for (const h of matchedHandlers) {
      currentConf = await h(currentConf);
    }
    return currentConf;
  }

}

export interface IConfigurationDeleteHandlerResponse {
  canDelete: boolean;
  message?: string;
}


export interface IConfigurationDeleteHandler {
  (current: IComponentConfiguration, parent?: IComponentConfiguration, slotProperty?: string): Promise<IConfigurationDeleteHandlerResponse | void>
}

export interface IConfigurationAfterDeleteHandler {
  (current: IComponentConfiguration, parent?: IComponentConfiguration, slotProperty?: string): Promise<void>
}

export interface IConfigurationDeleteHandlerManager {
  registerHandler(filter: IConfigurationHandlerFilter, handler?: IConfigurationDeleteHandler, afterDeleteHandler?: IConfigurationAfterDeleteHandler): void;
  getDeleteHandler(filter: IConfigurationHandlerFilter): IConfigurationDeleteHandler;
  getAfterDeleteHandler(filter: IConfigurationHandlerFilter): IConfigurationAfterDeleteHandler;
}

export class ConfigurationDeleteHandlerManager implements IConfigurationDeleteHandlerManager {

  private readonly deleteHandlers = new Map<string, IConfigurationDeleteHandler>();
  private readonly deleteAfterHandlers = new Map<string, IConfigurationAfterDeleteHandler>();
  public constructor(private context: IEditorContext) { }

  public registerHandler(filter: IConfigurationHandlerFilter, handler?: IConfigurationDeleteHandler, afterDeleteHandler?: IConfigurationAfterDeleteHandler): void {
    const key = ConfigurationDeleteHandlerManager.generateFilterKey(filter);
    if (_.isFunction(handler)) {
      this.deleteHandlers.set(key, handler);
    }

    if (_.isFunction(afterDeleteHandler)) {
      this.deleteAfterHandlers.set(key, afterDeleteHandler);
    }
  }

  public getDeleteHandler(filter: IConfigurationHandlerFilter): IConfigurationDeleteHandler {

    const matchedFilters: Array<IConfigurationHandlerFilter> = [
      filter,
      { typeSelector: filter.typeSelector, parentTypeSelector: filter.parentTypeSelector },
      { typeSelector: filter.typeSelector, slotSelector: filter.slotSelector },
      { typeSelector: filter.typeSelector },
    ];

    const getHandler = (f: IConfigurationHandlerFilter) => {
      const key = ConfigurationDeleteHandlerManager.generateFilterKey(f);
      return this.deleteHandlers.get(key);
    };

    let handler: IConfigurationDeleteHandler;
    for (const f of matchedFilters) {
      handler = getHandler(f);
      if (handler) {
        break;
      }
    }

    return handler;
  }

  public getAfterDeleteHandler(filter: IConfigurationHandlerFilter): IConfigurationAfterDeleteHandler {
    const matchedFilters: Array<IConfigurationHandlerFilter> = [
      filter,
      { typeSelector: filter.typeSelector, parentTypeSelector: filter.parentTypeSelector },
      { typeSelector: filter.typeSelector, slotSelector: filter.slotSelector },
      { typeSelector: filter.typeSelector },
    ];

    const getHandler = (f: IConfigurationHandlerFilter) => {
      const key = ConfigurationDeleteHandlerManager.generateFilterKey(f);
      return this.deleteAfterHandlers.get(key);
    };

    let handler: IConfigurationAfterDeleteHandler;
    for (const f of matchedFilters) {
      handler = getHandler(f);
      if (handler) {
        break;
      }
    }

    return handler;
  }

  private static generateFilterKey(filter: IConfigurationHandlerFilter): string {
    return `@typeSelector:${filter.typeSelector}@parentTypeSelector:${filter.parentTypeSelector || null}@slotSelector:${filter.slotSelector || null}`;
  }
}