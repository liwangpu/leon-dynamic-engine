import { ComponentDiscoveryProvider, IComponentConfiguration, IComponentDiscovery, IComponentPackage, IProjectSchema } from '../models';
import { IBaseEffectFilter, IBaseEffectParam, EffectHandlerStorage } from './effect-handler-storage';
import * as _ from 'lodash';

export type ISchemaDataProcessorFilter = IBaseEffectFilter;

export interface ISchemaDataProcessorParam<Variable = any> extends IBaseEffectParam {
  path: Array<IComponentConfiguration>;
  index?: number;
  /**
   * 处理管道中的中间变量
   */
  variables?: Variable;
}

export interface ISchemaDataProcessorHandler<Variable> {
  (param: ISchemaDataProcessorParam<Variable>): IComponentConfiguration | Promise<IComponentConfiguration>;
}

export interface ISchemaDataProcessorVariableHandler<Variable> {
  (): Variable | Promise<Variable>;
}

export class SchemaDataProcessor<Variable = any> {

  private readonly discovery: IComponentDiscovery;
  private readonly handlers = new EffectHandlerStorage<ISchemaDataProcessorHandler<Variable>, ISchemaDataProcessorFilter>();
  private variableHandler: ISchemaDataProcessorVariableHandler<Variable>;
  private variables: Variable;
  public constructor(protected packages: Array<IComponentPackage>) {
    this.discovery = new ComponentDiscoveryProvider(packages);
  }

  public registerHandlerVariables(handler: ISchemaDataProcessorVariableHandler<Variable>): void {
    this.variableHandler = handler;
  }

  public registerHandler(filter: IBaseEffectFilter, handler: ISchemaDataProcessorHandler<Variable>) {
    this.handlers.add(filter, handler);
  }

  public getAllHandlers() {
    return this.handlers.getAll();
  }

  public async handle(schema?: IProjectSchema): Promise<IProjectSchema> {
    const slotInfoMap = await this.discovery.queryComponentSlotInfo();
    if (_.isFunction(this.variableHandler)) {
      this.variables = await this.variableHandler();
    }

    const traverseComponent = async (path: Array<IComponentConfiguration>, current: IComponentConfiguration, parent?: IComponentConfiguration, slotProperty?: string, index?: number) => {
      const slotInfo = slotInfoMap[current.type];
      const handlers = this.handlers.get({
        type: current.type,
        parentType: parent?.type,
        slot: slotProperty
      });

      if (handlers && handlers.length) {
        for (const handler of handlers) {
          current = await handler({ current, parent, slot: slotProperty, variables: this.variables, path, index }) as any;
          if (!current) {
            return null;
          }
        }
      }

      path.push(current);

      if (slotInfo) {
        for (const slot in slotInfo) {
          const definition = slotInfo[slot];
          if (!current[slot]) { continue; }
          const children: Array<IComponentConfiguration> = definition.singleton ? [current[slot]] : current[slot];
          let i = children.length;
          while (i--) {
            let subConf = children[i];
            subConf = await traverseComponent([...path], subConf, current, slot, i);
            if (!subConf) {
              children.splice(i, 1);
            }
          }

          if (definition.singleton) {
            if (children[0]) {
              current[slot] = children[0];
            } else {
              delete current[slot];
            }

          } else {
            current[slot] = children;
          }
        }
      }

      return current;
    };
    return traverseComponent([], schema);
  }

  public getVariables(): Variable {
    return this.variables;
  }

  public clearVariables(): void {
    this.variables = null;
  }

}