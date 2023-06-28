import { ComponentDiscoveryProvider, IComponentConfiguration, IComponentDiscovery, IComponentPackage, IComponentSlotInfo, IProjectSchema } from '../models';
import { IBaseEffectFilter, IBaseEffectParam, EffectHandlerStorage, IBaseEffectPlacement } from './effect-handler-storage';
import * as _ from 'lodash';

interface IComponentHierarchyNode {
  id: string;
  type: string;
  parentId?: string;
  slotProperty?: string;
  slotIndex?: number;
  slots?: { [slotProperty: string]: Array<string> };
}

interface ISchemaAnalysisResult {
  configurations: Map<string, IComponentConfiguration>;
  trees: Map<string, IComponentHierarchyNode>;
  rootId: string;
}

export interface ISchemaDataProcessorConfigurationManager {
  getComponent(id: string): IComponentConfiguration;
  getParentComponent(id: string): IComponentConfiguration;
  getRootComponent(): IComponentConfiguration;
}

export type ISchemaDataProcessorFilter = IBaseEffectFilter;

export interface ISchemaDataProcessorParam<VariableType = any> extends IBaseEffectParam {
  path: Array<IComponentConfiguration>;
  /**
   * 处理管道中的中间变量
   */
  variables?: VariableType;
}

export interface ISchemaDataProcessorHandler<VariableType> {
  (param: ISchemaDataProcessorParam<VariableType>, configurationManager: ISchemaDataProcessorConfigurationManager): IComponentConfiguration | Promise<IComponentConfiguration>;
}

export interface ISchemaDataProcessorVariableHandler<VariableType> {
  (): VariableType | Promise<VariableType>;
}

export class SchemaDataProcessor<VariableType = any> {

  private readonly discovery: IComponentDiscovery;
  private readonly handlers = new EffectHandlerStorage<ISchemaDataProcessorHandler<VariableType>, ISchemaDataProcessorFilter>();
  public constructor(protected packages: Array<IComponentPackage>) {
    this.discovery = new ComponentDiscoveryProvider(packages);
  }

  public registerHandler(filter: IBaseEffectFilter, handler: ISchemaDataProcessorHandler<VariableType>) {
    this.handlers.add(filter, handler);
  }

  public async handle(schema: IProjectSchema, variableInitialize?: () => VariableType, postHandle?: (variables: VariableType) => void): Promise<IProjectSchema> {
    if (!schema) { return; }
    const slotInfoMap = await this.discovery.queryComponentSlotInfo();
    let variables: VariableType;
    if (_.isFunction(variableInitialize)) {
      variables = variableInitialize();
    }

    const { configurations, trees, rootId } = SchemaDataProcessor.analyseSchema(schema, slotInfoMap);
    const configurationManager: ISchemaDataProcessorConfigurationManager = {
      getComponent(id) {
        if (!id) { return null; }

        return configurations.get(id);
      },
      getParentComponent(id) {
        if (!id) { return null; }
        const current = trees.get(id);
        if (!current || !current.parentId) { return null; }
        return configurations.get(current.parentId);
      },
      getRootComponent() {
        return configurations.get(rootId);
      }
    };

    const traverseComponent = async (path: Array<IComponentConfiguration>, current: IComponentConfiguration, parent?: IComponentConfiguration, slotProperty?: string, placement: IBaseEffectPlacement = {}) => {
      const slotInfo = slotInfoMap[current.type];
      const handlers = this.handlers.get({
        current,
        parent,
        slot: slotProperty,
        ...placement
      });

      if (handlers && handlers.length) {
        for (const handler of handlers) {
          current = await handler({ current, parent, slot: slotProperty, variables, path, ...placement }, configurationManager) as any;
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
          const count = i;
          while (i--) {
            let subConf = children[i];
            const even = (i + 1) % 2 === 0;
            const placement: IBaseEffectPlacement = { index: i, count, last: i === count - 1, first: i === 0, even, odd: !even };
            subConf = await traverseComponent([...path], subConf, current, slot, placement);
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

    const result = await traverseComponent([], schema);
    if (_.isFunction(postHandle)) {
      postHandle(variables);
    }

    return result;
  }

  private static analyseSchema(schema: IProjectSchema, slotInfoMap: IComponentSlotInfo): ISchemaAnalysisResult {
    const componentConfMap = new Map<string, IComponentConfiguration>();
    const treeNodeMap = new Map<string, IComponentHierarchyNode>();
    const traverseComponent = (conf: IComponentConfiguration, parentId?: string, slotProperty?: string, slotIndex?: number) => {
      /**
       * 这里遍历项目的schema,主要做以下几件事
       *  生成扁平组件树节点
       *  记录下组件配置节点的引用
       */
      const treeNode: IComponentHierarchyNode = {
        id: conf.id,
        type: conf.type,
        parentId,
        slotProperty,
        slotIndex,
        slots: {}
      };
      componentConfMap.set(conf.id, conf);
      const slotInfo = slotInfoMap[conf.type];

      if (slotInfo) {
        for (const slot in slotInfo) {
          const definition = slotInfo[slot];
          if (!conf[slot]) { continue; }
          const children: Array<IComponentConfiguration> = definition.singleton ? [conf[slot]] : conf[slot];
          children.forEach((c, idx) => {
            traverseComponent(c, conf.id, slot, idx);
          });
          treeNode.slots[slot] = children.map(c => c.id);
        }
      }

      treeNodeMap.set(treeNode.id, treeNode);
    };

    if (schema) {
      traverseComponent(schema);
    }

    return {
      configurations: componentConfMap,
      trees: treeNodeMap,
      rootId: schema.id,
    };
  }
}