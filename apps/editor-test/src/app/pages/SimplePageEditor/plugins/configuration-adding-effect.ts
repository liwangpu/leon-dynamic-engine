import { GenerateComponentId } from '@lowcode-engine/core';
import { EditorPluginRegister } from '@lowcode-engine/editor';
import { ComponentTypes, ITabsComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { ComponentTypes as ImageViewerComponentTypes, IImageViewerComponentConfiguration } from '../../../packages/image-viewer';
import { ComponentTypes as VideoPlayerComponentTypes, IVideoPlayerComponentConfiguration } from '../../../packages/video-player';

/**
 * 组件添加副作用注册插件
 * @param options 
 * @returns 
 */
export function ConfigurationAddingEffectPluginRegister(): EditorPluginRegister {

  return ({ configurationAddingEffect }) => {
    return {
      init() {

        configurationAddingEffect.registerHandler({ type: ImageViewerComponentTypes.imageViewer }, ({ current }: { current: IImageViewerComponentConfiguration }) => {
          current.imageUrl = 'https://images.pexels.com/photos/4737484/pexels-photo-4737484.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
          return current;
        });

        configurationAddingEffect.registerHandler({ type: VideoPlayerComponentTypes.videoPlayer }, ({ current }: { current: IVideoPlayerComponentConfiguration }) => {
          current.vedioUrl = 'https://www.runoob.com/try/demo_source/movie.ogg';
          return current;
        });

        configurationAddingEffect.registerHandler({ type: ComponentTypes.tabs }, ({ current }: { current: ITabsComponentConfiguration }) => {
          current.children = [
            {
              id: GenerateComponentId(ComponentTypes.tab),
              type: ComponentTypes.tab,
              title: '页签 1',
              isDefault: true
            },
            {
              id: GenerateComponentId(ComponentTypes.tab),
              type: ComponentTypes.tab,
              title: '页签 2',
            },
            {
              id: GenerateComponentId(ComponentTypes.tab),
              type: ComponentTypes.tab,
              title: '页签 3',
            },
          ];

          current.defaultActiveTab = current.children[0].id;
          current.direction = 'horizontal';
          current.fullHeight = true;
          return current;
        });
      }
    };
  };
}