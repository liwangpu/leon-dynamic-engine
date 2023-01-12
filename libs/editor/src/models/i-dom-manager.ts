export interface IDomManager {

  checkComponentDom(el: HTMLElement): boolean;

  getComponentDom(id: string): HTMLElement | undefined;

  getAllComponentDoms(): HTMLElement[];
  getAllComponentSlotDoms(): HTMLElement[];

  getComponentId(el: HTMLElement): string;
  getComponentMatchedSlotDom(mapKeys: Array<string>): Array<HTMLElement>;
  getSlotDomProperty(el: HTMLElement): string;
  /**
   * 注册组件根节点dom
   * @param id 组件id
   * @param el 根节点dom
   */
  registryComponentDom(id: string, el: HTMLElement): void;
  /**
   * 取消组件根节点dom注册
   * @param id 
   */
  unRegistryComponentDom(id: string): void;

  registryComponentSlotDom(componentType: string, slotProperty: string, el: HTMLElement): void;
  unRegistryComponentSlotDom(el: HTMLElement): void;
}