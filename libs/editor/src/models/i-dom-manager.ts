export interface IDomManager {

  checkComponentHost(el: HTMLElement): boolean;

  getComponentHost(id: string): HTMLElement | undefined;

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
}