import { IComponentConfiguration } from '@lowcode-engine/core';
import { IEditorContext } from './editor-manager';
import * as _ from 'lodash';

export interface IConfigurationAddingHandlerFilter {
  parentTypeSelector?: string | Array<string>;
  typeSelector?: string | Array<string>;
}

export interface IConfigurationAddingHandler {
  (conf: IComponentConfiguration, parentConf?: IComponentConfiguration): Promise<IComponentConfiguration>
}

export interface IConfigurationAddingHandlerManager {
  registerHandler(filter: IConfigurationAddingHandlerFilter, handler: IConfigurationAddingHandler): void;
  handle(conf: IComponentConfiguration, parentConf?: IComponentConfiguration): Promise<IComponentConfiguration>;
}

export class ConfigurationAddingHandlerManager implements IConfigurationAddingHandlerManager {

  private readonly addHandlers = new Map<IConfigurationAddingHandlerFilter, IConfigurationAddingHandler>();
  public constructor(private context: IEditorContext) { }

  public registerHandler(filter: IConfigurationAddingHandlerFilter, handler: IConfigurationAddingHandler): void {
    this.addHandlers.set(filter, handler);
  }

  public async handle(conf: IComponentConfiguration, parentConf?: IComponentConfiguration): Promise<IComponentConfiguration> {
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
