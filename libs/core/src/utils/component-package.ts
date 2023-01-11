import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '../models';

interface IRemoteEntryLoader {
  (): Promise<{ ComponentPackage: { new(): IComponentPackage } }>;
}

class ComponentPackage implements IComponentPackage {

  private packageInstance: IComponentPackage;
  public constructor(private loader: IRemoteEntryLoader) {

  }

  async queryComponentDescriptions(): Promise<IComponentDescription[]> {
    const pck = await this.getRemoteModule();
    return pck.queryComponentDescriptions();
  }

  async getComponentDescription(type: string): Promise<IComponentDescription> {
    const pck = await this.getRemoteModule();
    return pck.getComponentDescription(type);
  }

  async loadComponentRunTimeModule(type: string, platform: string): Promise<IRunTimePackageModule> {
    const pck = await this.getRemoteModule();
    return pck.loadComponentRunTimeModule(type, platform);
  }

  async loadComponentDesignTimeModule(type: string, platform: string): Promise<IDesignTimePackageModule> {
    const pck = await this.getRemoteModule();
    return pck.loadComponentDesignTimeModule(type, platform);
  }

  async loadComponentConfigurationModule(type: string, platform: string): Promise<IConfigurationPackageModule> {
    const pck = await this.getRemoteModule();
    return pck.loadComponentConfigurationModule(type, platform);
  }

  private async getRemoteModule(): Promise<IComponentPackage> {
    if (!this.packageInstance) {
      const module = await this.loader();
      this.packageInstance = new module.ComponentPackage();
    }
    return this.packageInstance;
  }
}

export function componentPackageRemoteLoader(load?: IRemoteEntryLoader): IComponentPackage {
  return new ComponentPackage(load);
}