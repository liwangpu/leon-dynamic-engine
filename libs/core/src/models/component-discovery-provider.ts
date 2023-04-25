import { IComponentDescription, IComponentPackage, IComponentSlotInfo, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from './i-component-package';
import * as _ from 'lodash';
import { IProjectSchema } from './i-project-schema';
import { IComponentConfiguration } from './i-component-configuration';
import { IComponentHierarchyNode } from '../contexts';

export interface ISchemaAnalysisResult {
  configurations: Map<string, IComponentConfiguration>;
  trees: Map<string, IComponentHierarchyNode>;
  rootId: string;
}

export interface IComponentDiscovery extends IComponentPackage {
  analyseSchema(schema: IProjectSchema): Promise<ISchemaAnalysisResult>;
}

export class ComponentDiscoveryProvider implements IComponentDiscovery {

  public readonly name = 'ComponentDiscoveryProvider';
  protected readonly componentTypePackageMap = new Map<string, IComponentPackage>();
  protected loadedAllPakageDescriptions = false;
  constructor(protected packages: Array<IComponentPackage>) { }

  public queryComponentDescriptions(): Promise<Array<IComponentDescription>> {
    return this.shareAndCacheConcurrentRequest('queryComponentDescriptions', async () => {
      const descriptions: IComponentDescription[] = [];
      if (!this.packages || !this.packages.length) {
        return descriptions;
      }
      for (let mk of this.packages) {
        const des = await mk.queryComponentDescriptions();
        des.forEach(d => {
          descriptions.push({ ...d, package: mk.name });
          this.componentTypePackageMap.set(d.type, mk);
        });
      }
      this.loadedAllPakageDescriptions = true;
      return descriptions;
    });
  }

  public async queryComponentSlotInfo(): Promise<IComponentSlotInfo> {
    return this.shareAndCacheConcurrentRequest('queryComponentSlotInfo', async () => {
      const slotInfo: IComponentSlotInfo = {};
      if (!this.packages || !this.packages.length) {
        return slotInfo;
      }

      for (let mk of this.packages) {
        if (_.isFunction(mk.queryComponentSlotInfo)) {
          const info = await mk.queryComponentSlotInfo();
          if (!info) { continue; }
          for (const componentType in info) {
            slotInfo[componentType] = info[componentType];
          }
        }
      }

      return slotInfo;
    });
  }

  public async loadComponentRunTimeModule(type: string): Promise<IRunTimePackageModule> {
    return this.loadModuleFromPackage(type, pck => pck.loadComponentRunTimeModule, arguments);
  }

  public async loadComponentDesignTimeModule(type: string): Promise<IDesignTimePackageModule> {
    return this.loadModuleFromPackage(type, pck => pck.loadComponentDesignTimeModule, arguments);
  }

  public async loadComponentConfigurationModule(type: string): Promise<IConfigurationPackageModule> {
    return this.loadModuleFromPackage(type, pck => pck.loadComponentConfigurationModule, arguments);
  }

  public async analyseSchema(schema: IProjectSchema): Promise<ISchemaAnalysisResult> {
    const slotInfoMap = await this.queryComponentSlotInfo();
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

  private async shareAndCacheConcurrentRequest(requestName: string, requestFn: (...args: Array<any>) => Promise<any>): Promise<any> {
    let requestStatusKey = `doing_query_status_of_${requestName}`;
    let requestKey = `doing_query_of_${requestName}`;
    let hasDoRequestKey = `has_do_query_of_${requestName}`;
    let requestResultKey = `query_result_of_${requestName}`;

    // 如果有缓存结果,使用缓存
    if (this[hasDoRequestKey]) {
      return this[requestResultKey];
    }

    // 如果有已经发起的请求,共享请求结果
    if (this[requestStatusKey] === true) {
      return this[requestKey];
    }
    this[requestStatusKey] = true;
    this[requestKey] = requestFn();

    const result = await this[requestKey];
    this[requestStatusKey] = false;
    this[requestKey] = null;
    this[hasDoRequestKey] = true;
    this[requestResultKey] = result;
    return result;
  }

  private async loadModuleFromPackage(type: string, loadModuleFn: (pck: IComponentPackage) => Function, args: IArguments): Promise<any> {
    if (!this.packages || !this.packages.length) { return null; }
    if (!this.loadedAllPakageDescriptions) {
      await this.queryComponentDescriptions();
    }

    const pck = this.componentTypePackageMap.get(type);
    if (!pck) { return null; }

    const loader = loadModuleFn(pck);
    return loader(...args);
  }

}