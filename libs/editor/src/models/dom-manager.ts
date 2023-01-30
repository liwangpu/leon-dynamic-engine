import { EventTopicEnum } from '../enums';
import { IDomManager } from './i-dom-manager';
import { IEditorContext } from './i-editor-context';
import * as _ from 'lodash';

export class DomManager implements IDomManager {

  public constructor(private context: IEditorContext) { }

  private readonly id2RootDomMap = new Map<string, HTMLElement>();
  private readonly rootDom2IdMap = new Map<HTMLElement, string>();
  private readonly componentSlotProperty2DomMap = new Map<string, Array<HTMLElement>>();
  private readonly componentSlotDom2PropertyMap = new Map<HTMLElement, string>();
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

}