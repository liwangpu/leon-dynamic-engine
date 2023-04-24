import { IComponentDescription, IComponentPackage, IComponentSlotInfo, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '@lowcode-engine/core';
import { ComponentTypes } from './enums';
import { DynamicConfigPanelLoader, pascalFormat } from '@lowcode-engine/component-configuration-shared';
import { ComponentDescriptions, ComponentSlotInfo } from './consts';

const customConfiguration = {
  [ComponentTypes.tableOperatorColumn]: () => import(`./components/Table/configuration/table-operator-column`),
  [ComponentTypes.tab]: () => import(`./components/Tabs/configuration/tab`),
  [ComponentTypes.tableSelectionColumn]: () => import(`./components/Table/configuration/selection-column`),
};

export class ComponentPackage implements IComponentPackage {

  name = 'PrimaryComponentPackage';
  private static _instance: ComponentPackage;
  private constructor() {
    //
  }

  public static get instance(): ComponentPackage {
    if (!this._instance) {
      this._instance = new ComponentPackage();
    }
    return this._instance;
  }

  public queryComponentDescriptions(): Array<IComponentDescription> {
    return ComponentDescriptions;
  }

  public queryComponentSlotInfo(): IComponentSlotInfo {
    return ComponentSlotInfo;
  }

  public async loadComponentRunTimeModule(type: ComponentTypes, platform: string): Promise<IRunTimePackageModule> {
    return import(`./components/${pascalFormat(type)}/run-time`);
  }

  public async loadComponentDesignTimeModule(type: ComponentTypes, platform: string): Promise<IDesignTimePackageModule> {
    return import(`./components/${pascalFormat(type)}/design-time`);
  }

  public async loadComponentConfigurationModule(type: ComponentTypes, platform: string): Promise<IConfigurationPackageModule> {
    return DynamicConfigPanelLoader(
      customConfiguration[type] ? customConfiguration[type] : () => import(`./components/${pascalFormat(type)}/configuration`)
    );
  }

}
