import { IPluginRegister } from '@lowcode-engine/editor';
import { ComponentTypes } from '@lowcode-engine/primary-component-package';
import { ComponentTypes as VideoPlayerComponentTypes, IVideoPlayerComponentConfiguration } from '../../../packages/video-player';

export function ConfigurationSelectorPluginRegister(): IPluginRegister {

  return ({ configuration }) => {
    return {
      init() {
        // configuration.registerConfigurationSelector({
        //   type: ComponentTypes.listPage
        // }, (editor, conf) => {
        //   const tree = editor.store.treeStore.trees.get(conf.id);
        //   const childrenIds = tree.slots.get('children');
        //   if (childrenIds?.length) {
        //     const children = [];
        //     childrenIds.forEach(id => {
        //       let sc = editor.store.configurationStore.configurations.get(id);
        //       // let c = sc.toData(true);
        //       children.push({ id: sc.id, type: sc.type, title: sc.title });
        //     });
        //     conf['children'] = children;
        //   }
        //   return conf;
        // });
      }
    };
  };
}