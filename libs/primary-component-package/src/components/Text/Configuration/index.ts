import { IMetadataRegister } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes, PrimarySetterType, TableSlot } from '../../../enums';

const registerMetadata: IMetadataRegister = add => {

  add({
    type: ComponentTypes.text
  }, async () => {

    return {
      children: [
        {
          key: 'tabs',
          setter: SetterType.tabs,
          children: [
            {
              key: 'basic-info',
              title: '属性',
              children: [
                {
                  key: 'type',
                  setter: PrimarySetterType.componentType,
                  name: 'type',
                  label: '组件类型',
                  disabled: true,
                },
                {
                  key: 'title',
                  setter: SetterType.string,
                  name: 'title',
                  label: '标题',
                },
                {
                  key: 'code',
                  setter: SetterType.string,
                  name: 'code',
                  label: '编码',
                }
              ]
            },
          ]
        }
      ]
    };
  });

  add({
    type: ComponentTypes.text,
    parentType: ComponentTypes.block,
  }, async () => {

    return {
      children: [
        {
          key: 'tabs',
          setter: SetterType.tabs,
          children: [
            {
              key: 'basic-info',
              title: '属性',
              children: [
                {
                  key: 'type',
                  setter: PrimarySetterType.componentType,
                  name: 'type',
                  label: '组件类型',
                  disabled: true,
                },
                {
                  key: 'title',
                  setter: SetterType.string,
                  name: 'title',
                  label: '标题',
                },
                {
                  key: 'code',
                  setter: SetterType.string,
                  name: 'code',
                  label: '编码',
                },
                {
                  key: 'gridColumnSpan',
                  setter: PrimarySetterType.gridColumnSpan,
                  name: 'gridColumnSpan',
                  label: '大小',
                }
              ]
            },
          ]
        }
      ]
    };
  });

};

export default registerMetadata;