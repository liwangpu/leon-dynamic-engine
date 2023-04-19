import { EventTopicEnum } from '../enums';
import { IEditorContext } from './editor-manager';
import * as _ from 'lodash';

export interface IDomManager {

  checkComponentHost(el: HTMLElement): boolean;
  getComponentHost(id: string): HTMLElement | undefined;
  getComponentRootDom(id: string): HTMLElement | undefined;
  getAllComponentHosts(): HTMLElement[];
  getAllComponentSlotHosts(): HTMLElement[];
  getComponentId(el: HTMLElement): string;
  getComponentMatchedSlotHost(mapKeys: Array<string>): Array<HTMLElement>;
  getSlotDomProperty(el: HTMLElement): string;
  /**
   * 注册组件根节点dom
   * @param id 组件id
   * @param el 根节点dom
   */
  registryComponentHost(id: string, el: HTMLElement): void;
  /**
   * 取消组件根节点dom注册
   * @param id 
   */
  unregisterComponentHost(id: string): void;

  registryComponentSlotHost(componentType: string, slotProperty: string, el: HTMLElement): void;
  unregisterComponentSlotHost(el: HTMLElement): void;

  registryComponentRoot(id: string, el: HTMLElement): void;
  unregisterComponentRoot(id: string): void;
}

export class DomManager implements IDomManager {

  public constructor(protected context: IEditorContext) { }
  private readonly id2RootDomMap = new Map<string, HTMLElement>();
  private readonly rootDom2IdMap = new Map<HTMLElement, string>();
  private readonly componentSlotProperty2DomMap = new Map<string, Array<HTMLElement>>();
  private readonly componentSlotDom2PropertyMap = new Map<HTMLElement, string>();
  private readonly componentRootDomMap = new Map<string, HTMLElement>();
  private allDoms: Array<HTMLElement> = [];

  public checkComponentHost(el: HTMLElement): boolean {
    return this.rootDom2IdMap.has(el);
  }

  public getComponentHost(id: string): HTMLElement | null {
    if (!id) { return null; }
    return this.id2RootDomMap.get(id);
  }

  public getAllComponentHosts(): Array<HTMLElement> {
    return this.allDoms;
  }

  public getComponentId(el: HTMLElement): string {
    return this.rootDom2IdMap.get(el);
  }

  public getComponentMatchedSlotHost(mapKeys: Array<string>): Array<HTMLElement> {
    const doms: Array<HTMLElement> = [];
    if (!mapKeys?.length) { return doms; }
    mapKeys.forEach(key => {
      const arr = this.componentSlotProperty2DomMap.get(key);
      if (!arr?.length) { return; }
      arr.forEach(d => doms.push(d));
    });
    return doms;
  }

  public getSlotDomProperty(el: HTMLElement): string {
    return this.componentSlotDom2PropertyMap.get(el);
  }

  public getAllComponentSlotHosts(): Array<HTMLElement> {
    if (!this.componentSlotDom2PropertyMap.size) { return []; }
    return [...this.componentSlotDom2PropertyMap.keys()];
  }

  public getComponentRootDom(id: string): HTMLElement {
    return this.componentRootDomMap.get(id);
  }

  public registryComponentHost(id: string, el: HTMLElement): void {
    this.id2RootDomMap.set(id, el);
    this.rootDom2IdMap.set(el, id);
    this.allDoms = Array.from(this.id2RootDomMap.values());
    this.context.event.emit(EventTopicEnum.componentDomInit, id);
  }

  public unregisterComponentHost(id: string): void {
    this.context.event.emit(EventTopicEnum.componentDomDestroy, id);
    const el = this.id2RootDomMap.get(id);
    this.rootDom2IdMap.delete(el);
    this.id2RootDomMap.delete(id);
    this.allDoms = Array.from(this.id2RootDomMap.values());
  }

  public registryComponentSlotHost(componentType: string, slotProperty: string, el: HTMLElement): void {
    const mapKey = `${componentType}@${slotProperty}`;
    const mapDoms = this.componentSlotProperty2DomMap.get(mapKey) || [];
    if (mapDoms.some(d => d === el)) { return; }
    mapDoms.push(el);
    this.componentSlotDom2PropertyMap.set(el, mapKey);
    this.componentSlotProperty2DomMap.set(mapKey, mapDoms);
  }

  public unregisterComponentSlotHost(el: HTMLElement): void {
    const mapKey = this.componentSlotDom2PropertyMap.get(el);
    const mapDoms = this.componentSlotProperty2DomMap.get(mapKey) || [];
    _.remove(mapDoms, d => d === el);
    this.componentSlotProperty2DomMap.set(mapKey, mapDoms);
  }

  public registryComponentRoot(id: string, el: HTMLElement): void {
    this.componentRootDomMap.set(id, el);
  }

  public unregisterComponentRoot(id: string): void {
    this.componentRootDomMap.delete(id);
  }

}