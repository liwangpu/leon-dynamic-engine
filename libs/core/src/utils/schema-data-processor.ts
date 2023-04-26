import { ComponentDiscoveryProvider, IComponentConfiguration, IComponentDiscovery, IComponentPackage, IProjectSchema } from '../models';
import { IBaseEffectFilter, IBaseEffectParam, EffectHandlerStorage } from './effect-handler-storage';

export type ISchemaDataProcessorFilter = IBaseEffectFilter;

export interface ISchemaDataProcessorParam extends IBaseEffectParam {
  self: SchemaDataProcessor;
  path: Array<IComponentConfiguration>;
  index?: number;
}

export interface ISchemaDataProcessorHandler {
  (param: ISchemaDataProcessorParam): IComponentConfiguration | Promise<IComponentConfiguration>;
}

export class SchemaDataProcessor {

  private readonly temporaryStore = new Map<string, any>();
  private readonly discovery: IComponentDiscovery;
  private readonly handlers = new EffectHandlerStorage<ISchemaDataProcessorHandler, ISchemaDataProcessorFilter>();
  public constructor(protected packages: Array<IComponentPackage>) {
    this.discovery = new ComponentDiscoveryProvider(packages);
  }

  public registerHandler(filter: IBaseEffectFilter, handler: ISchemaDataProcessorHandler) {
    this.handlers.add(filter, handler);
  }

  public getAllHandlers() {
    return this.handlers.getAll();
  }

  public async handle(schema?: IProjectSchema): Promise<any> {
    this.temporaryStore.clear();
    const slotInfoMap = await this.discovery.queryComponentSlotInfo();

    const traverseComponent = async (path: Array<IComponentConfiguration>, current: IComponentConfiguration, parent?: IComponentConfiguration, slotProperty?: string, index?: number) => {
      const slotInfo = slotInfoMap[current.type];
      const handlers = this.handlers.get({
        type: current.type,
        parentType: parent?.type,
        slot: slotProperty
      });

      if (handlers && handlers.length) {
        for (const handler of handlers) {
          current = await handler({ current, parent, slot: slotProperty, self: this, path, index }) as any;
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

  public setTemporaryValue(key: string, val: any) {
    this.temporaryStore.set(key, val);
  }

  public deleteTemporaryValue(key: string) {
    this.temporaryStore.delete(key);
  }

  public getTemporaryValue(key: string): any {
    return this.temporaryStore.get(key);
  }

  public getAllTemporaryValue(): Map<string, any> {
    return this.temporaryStore;
  }

}