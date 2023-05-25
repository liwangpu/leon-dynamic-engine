import { GenerateComponentCode, GenerateComponentId } from '@lowcode-engine/core';
import { IPluginRegister } from '@lowcode-engine/editor';
import { ComponentTypes, GridSystemSection, ITableComponentConfiguration, ITabsComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { buttonGroupTypes, ComponentIndexTitleIncludeGroupTypes, FormInputGroupTypes, selfSlotGroupTypes } from '../../../consts';
import { useComponentConfigGenerator } from '../../../hooks';
import { ComponentTypes as ImageViewerComponentTypes, IImageViewerComponentConfiguration } from '../../../packages/image-viewer';

/**
 * 组件添加副作用注册插件
 * @param options 
 * @returns 
 */
export function ConfigurationAddingEffectPluginRegister(): IPluginRegister {

  return ({ configurationAddingEffect, configuration }) => {
    return {
      init() {
        configurationAddingEffect.registerHandler({ type: ImageViewerComponentTypes.imageViewer }, ({ current }: { current: IImageViewerComponentConfiguration }) => {
          current.imageUrl = 'https://images.pexels.com/photos/4737484/pexels-photo-4737484.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
          return current;
        });

      }
    };
  };
}