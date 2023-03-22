import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from './i-component-package';
import * as _ from 'lodash';
import { IComponentMetadata } from './i-component-metadata';

export type IComponentDiscovery = IComponentPackage;

export class ComponentDiscoveryProvider implements IComponentDiscovery {

  protected readonly componentTypePackageMap = new Map<string, IComponentPackage>();
  protected readonly componentDescriptionMap = new Map<string, IComponentDescription>();
  protected readonly componentMetadataMap = new Map<string, IComponentMetadata>();
  protected loadedAllPakageDescriptions = false;
  protected loadedAllPakageMetadatas = false;
  constructor(protected packages: Array<IComponentPackage>) { }

  public async queryComponentDescriptions(): Promise<IComponentDescription[]> {
    if (this.loadedAllPakageDescriptions) {
      return [...this.componentDescriptionMap.values()];
    }
    this.loadedAllPakageDescriptions = true;
    const descriptions: IComponentDescription[] = [];
    if (!this.packages || !this.packages.length) { return descriptions; }
    for (let mk of this.packages) {
      const des = await mk.queryComponentDescriptions();
      des.forEach(d => {
        descriptions.push({ ...d, package: mk.name });
        this.componentDescriptionMap.set(d.type, d);
        this.componentTypePackageMap.set(d.type, mk);
      });
    }
    return descriptions;
  }

  public async loadComponentRunTimeModule(type: string, platform: string): Promise<IRunTimePackageModule> {
    const pck = await this.getComponentPackage(type);
    if (!pck) { return null; }
    return pck.loadComponentRunTimeModule(type, platform);
  }

  public async loadComponentDesignTimeModule(type: string, platform: string): Promise<IDesignTimePackageModule> {
    const pck = await this.getComponentPackage(type);
    if (!pck) { return null; }
    return pck.loadComponentDesignTimeModule(type, platform);
  }

  public async loadComponentConfigurationModule(type: string, platform: string): Promise<IConfigurationPackageModule> {
    const pck = await this.getComponentPackage(type);
    if (!pck) { return null; }
    return pck.loadComponentConfigurationModule(type, platform);
  }

  private async getComponentPackage(type: string): Promise<IComponentPackage> {
    if (!this.packages || !this.packages.length) { return null; }
    if (!this.loadedAllPakageDescriptions) {
      await this.queryComponentDescriptions();
    }

    return this.componentTypePackageMap.get(type);
  }

}