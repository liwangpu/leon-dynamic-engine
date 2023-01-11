import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from './i-component-package';

export interface IComponentDiscovery extends IComponentPackage { }

export class ComponentDiscoveryProvider implements IComponentDiscovery {

  protected readonly componentTypePackageMap = new Map<string, IComponentPackage>();
  constructor(protected packages: IComponentPackage[]) { }

  async queryComponentDescriptions(): Promise<IComponentDescription[]> {
    const descriptions: IComponentDescription[] = [];
    if (!this.packages?.length) { return descriptions; }
    for (let mk of this.packages) {
      const des = await mk.queryComponentDescriptions();
      des.forEach(d => {
        descriptions.push({ ...d, package: mk.name });
        this.componentTypePackageMap.set(d.type, mk);
      });
    }
    return descriptions;
  }

  async getComponentDescription(type: string): Promise<IComponentDescription> {
    if (!this.packages?.length) { return null; }
    for (let mk of this.packages) {
      const d = await mk.getComponentDescription(type);
      if (!d) { continue; }
      if (d.type === type) {
        this.componentTypePackageMap.set(d.type, mk);
        return { ...d, package: mk.name };
      }
    }
    return null;
  }

  async loadComponentRunTimeModule(type: string, platform: string): Promise<IRunTimePackageModule> {
    if (!this.packages?.length) { return null; }
    if (!this.componentTypePackageMap.has(type)) {
      await this.getComponentDescription(type);
    }
    const pck = this.componentTypePackageMap.get(type);
    if (!pck) { return null; }
    return pck.loadComponentRunTimeModule(type, platform);
  }

  async loadComponentDesignTimeModule(type: string, platform: string): Promise<IDesignTimePackageModule> {
    if (!this.packages?.length) { return null; }
    if (!this.componentTypePackageMap.has(type)) {
      await this.getComponentDescription(type);
    }
    const pck = this.componentTypePackageMap.get(type);
    if (!pck) { return null; }
    return pck.loadComponentDesignTimeModule(type, platform);
  }

  async loadComponentConfigurationModule(type: string, platform: string): Promise<IConfigurationPackageModule> {
    if (!this.packages?.length) { return null; }
    if (!this.componentTypePackageMap.has(type)) {
      await this.getComponentDescription(type);
    }
    const pck = this.componentTypePackageMap.get(type);
    if (!pck) { return null; }
    return pck.loadComponentConfigurationModule(type, platform);
  }
}