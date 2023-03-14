import { IPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGallery, ComponentGroup } from './components/ComponentGallery';
import { DeploymentUnitOutlined, AppstoreFilled, CodeFilled } from '@ant-design/icons';
import { IConfigurationTransfer, IModelLoader, ModelGallery } from './components/ModelGallery';
import SchemaViewer from './components/SchemaViewer';
import ComponentToolBar, { IComponentToolBarMap } from './components/ComponentToolBar';
import { INotification } from './models';
import * as _ from 'lodash';

export function ModelGalleryPluginRegister(mainModelId: string, modelLoader: IModelLoader, configurationTransfer: IConfigurationTransfer): IPluginRegister {
  return (function _ModelGalleryPluginRegister({ skeleton, event }) {
    const skeletonKey = 'MODEL_GALLERY_PLUGIN';
    return {
      init: async () => {
        const notification: INotification = (topic, data) => {
          event.emit(topic, data);
        };
        skeleton.add({
          key: skeletonKey,
          title: '模型',
          area: SkeletonAreaEnum.leftArea,
          icon: <DeploymentUnitOutlined />,
          content: <ModelGallery mainModelId={mainModelId} modelLoader={modelLoader} configurationTransfer={configurationTransfer} notification={notification} />
        });
      },
      destroy: async () => {
        skeleton.remove(skeletonKey);
      }
    };
  });
}

export function ComponentGalleryPluginRegister(componentGroups: Array<{ title: string, components: Array<string> }> = []): IPluginRegister {
  return (function _ComponentGalleryPluginRegister({ componentDiscovery, skeleton, event }) {
    const skeletonKey = 'COMPONENT_GALLER_PLUGIN';
    return {
      init: async () => {
        const notification: INotification = (topic, data) => {
          event.emit(topic, data);
        };
        const des = await componentDiscovery.queryComponentDescriptions();

        const groups: Array<ComponentGroup> = componentGroups.map(g => ({
          title: g.title,
          components: g.components.map(t => des.find(x => x.type === t)).filter(x => x)
        })) as any;

        skeleton.add({
          key: skeletonKey,
          title: '组件',
          area: SkeletonAreaEnum.leftArea,
          icon: <AppstoreFilled />,
          content: <ComponentGallery groups={groups} notification={notification} />
        });
      },
      destroy: async () => {
        skeleton.remove(skeletonKey);
      },
    };
  });
}

export function SchemaViewerPluginRegister(): IPluginRegister {
  return (function _SchemaViewerPluginRegister({ skeleton, project, event }) {
    const skeletonKey = 'PAGE_SCHEMA_PLUGIN';
    return {
      init: async () => {
        skeleton.add({
          key: skeletonKey,
          title: '元数据',
          area: SkeletonAreaEnum.leftArea,
          icon: <CodeFilled />,
          content: <SchemaViewer project={project}/>
        });
      },
      destroy: async () => {
        skeleton.remove(skeletonKey);
      }
    };
  });
}

export function ComponentToolBarRegister(toolBarMap?: IComponentToolBarMap): IPluginRegister {
  return function _ContextMenuRegister({ skeleton, store }) {
    const skeletonKey = 'COMPONENT_TOOLBAR_PLUGIN';
    return {
      init: async () => {
        skeleton.add({
          key: skeletonKey,
          area: SkeletonAreaEnum.toolbar,
          content: <ComponentToolBar store={store} toolBarMap={toolBarMap || {}} />
        });
      },
      destroy: async () => {
        skeleton.remove(skeletonKey);
      }
    };
  }
}

export * from './components/ComponentGallery';
export * from './components/ModelGallery'
export * from './enums';