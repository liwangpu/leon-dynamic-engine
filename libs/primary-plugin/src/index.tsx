import { IPlugin, IPluginRegister, PluginRegisterContext, SkeletonAreaEnum } from '@tiangong/editor';
import ComponentGallery, { ComponentGroup } from './components/ComponentGallery';
import { AppstoreOutlined, DeploymentUnitOutlined, PartitionOutlined } from '@ant-design/icons';
import ModelGallery, { IModelFieldNode } from './components/ModelGallery';
import MutiPageConfiguration from './components/MutiPageConfiguration';
import { IComponentConfiguration } from '@tiangong/core';

export function ModelGalleryPluginRegister(modelLoader: () => Promise<Array<IModelFieldNode>>, configurationTransfer: (key: string) => Promise<IComponentConfiguration>): IPluginRegister {
  return (function _ModelGalleryPluginRegister({ skeleton, event }) {
    return {
      init: async () => {
        const fieldNodes = await modelLoader();
        skeleton.add({
          title: '模型面板',
          area: SkeletonAreaEnum.leftArea,
          icon: <DeploymentUnitOutlined />,
          content: <ModelGallery event={event} fieldNodes={fieldNodes} configurationTransfer={configurationTransfer} />
        });
      },
      destroy: async () => {
        skeleton.remove('模型面板');
      }
    };
  });
}

export function ComponentGalleryPluginRegister(componentGroups: Array<{ title: string, components: Array<string> }> = []): IPluginRegister {
  return (function _ComponentGalleryPluginRegister({ componentDiscovery, skeleton, event }) {
    return {
      init: async () => {
        const des = await componentDiscovery.queryComponentDescriptions();

        const groups: Array<ComponentGroup> = componentGroups.map(g => ({
          title: g.title,
          components: g.components.map(t => des.find(x => x.type === t)).filter(x => x)
        })) as any;

        skeleton.add({
          title: '组件库面板',
          area: SkeletonAreaEnum.leftArea,
          icon: <AppstoreOutlined />,
          content: <ComponentGallery groups={groups} event={event} />
        });
      },
      destroy: async () => {
        skeleton.remove('组件库面板');
      },
    };
  });
}

export type { IModelFieldNode };
export { ComponentGallery, ModelGallery };