import { IComponentConfiguration, ISlotPropertyDefinition } from '@lowcode-engine/core';
import { IEditorContext } from './editor-manager';

export interface ISlotManager {
  checkSlotSingleton(componentType: string, slotProperty: string): boolean;
  getSlotProperties(componentType: string): Array<string>;
  getAllSlotProperties(): { [componentType: string]: Array<string> };
  getAllSlotSingletonMap(): { [componentAndSlotProperty: string]: boolean };
  getMatchedSlotProperties(componentType: string): Array<string>;
  registerMap(map: { [componentType: string]: ISlotPropertyDefinition }): void;
  registerAddingVerification(componentType: string, verifiedFn: (conf: IComponentConfiguration) => Promise<IComponentConfiguration>): void;
}

export class SlotManager implements ISlotManager {

  private readonly slotPropertyMap = new Map<string, Array<string>>();
  private readonly addingVerficationMap = new Map<string, (conf: IComponentConfiguration) => Promise<IComponentConfiguration>>();
  private readonly allSlotMap = new Map<string, ISlotPropertyDefinition>();
  private readonly componentMatchedSlotPropertyMap = new Map<string, Array<string>>();
  private readonly slotPropertySingletonMap = new Map<string, boolean>();
  public constructor(protected context: IEditorContext) { }

  public checkSlotSingleton(componentType: string, slotProperty: string): boolean {
    const key = `${componentType}@${slotProperty}`;
    return this.slotPropertySingletonMap.get(key);
  }

  public getAllSlotSingletonMap(): { [componentAndSlotProperty: string]: boolean; } {
    return Object.fromEntries(this.slotPropertySingletonMap);
  }

  public getAllSlotProperties(): { [componentType: string]: string[]; } {
    const map = {};
    this.slotPropertyMap.forEach((properties, componentType) => {
      map[componentType] = properties;
    });
    return map;
  }

  public getSlotProperties(componentType: string): string[] {
    return this.slotPropertyMap.get(componentType) || [];
  }

  public getMatchedSlotProperties(componentType: string): Array<string> {
    if (this.componentMatchedSlotPropertyMap.has(componentType)) {
      return this.componentMatchedSlotPropertyMap.get(componentType);
    }
    const slotProperties: Array<string> = [];
    if (!this.allSlotMap) { return slotProperties; }
    this.allSlotMap.forEach((definition, type) => {
      const properties = Object.keys(definition);
      for (let property of properties) {
        const propertyMatch = definition[property] || {};
        const accepts = propertyMatch.accepts || [];
        const rejects = propertyMatch.rejects || [];
        if (rejects.some(t => t === componentType)) { continue; }
        let match: boolean = true;
        if (accepts.length) {
          match = accepts.some(t => t === componentType);
        }
        if (match) {
          slotProperties.push(`${type}@${property}`);
        }
      }
    });
    this.componentMatchedSlotPropertyMap.set(componentType, slotProperties);
    return slotProperties;
  }

  public registerMap(map: { [componentType: string]: ISlotPropertyDefinition }): void {
    if (!map) { return; }
    const componentTypes = Object.keys(map);
    for (let componentType of componentTypes) {
      let definition = map[componentType];
      if (!definition) { continue; }
      // 因为对于设计器来说,slot起作用的主要是accepts,rejects,singleton
      // 而对于组件包定义来说,主要是singleton,所以这里进行合并
      if (this.allSlotMap.has(componentType)) {
        definition = { ...this.allSlotMap.get(componentType), ...definition };
      }
      this.allSlotMap.set(componentType, definition);
      const properties = Object.keys(definition);
      this.slotPropertyMap.set(componentType, properties || []);
      properties.forEach(p => {
        const key = `${componentType}@${p}`;
        const singleton = definition[p] ? definition[p].singleton : false;
        if (singleton) {
          this.slotPropertySingletonMap.set(key, singleton);
        }
      });
    }
  }

  public registerAddingVerification(componentType: string, verifiedFn: (conf: IComponentConfiguration) => Promise<IComponentConfiguration>): void {
    this.addingVerficationMap.set(componentType, verifiedFn);
  }

}