import { IMetadataRegister, SharedSetterType } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes, PrimarySetterType } from '../../../enums';

const registerMetadata: IMetadataRegister = register => {

  register({
    type: ComponentTypes.textarea
  }, async () => {

    return {
      children: [
        {
          key: 'tabs',
          setter: SetterType.tabs,
          children: [
            {
              key: 'basic-info',
              setter: SetterType.tabPane,
              label: '属性',
              children: [
                {
                  key: 'basic-info',
                  setter: SetterType.primaryHeading,
                  label: '基础信息',
                  children: [
                    {
                      key: 'type',
                      setter: SharedSetterType.componentType,
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
                  ],
                },
              ]
            },
          ]
        }
      ]
    };
  });

  register({
    type: ComponentTypes.textarea,
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
              setter: SetterType.tabPane,
              label: '属性',
              children: [
                {
                  key: 'basic-info',
                  setter: SetterType.primaryHeading,
                  label: '基础信息',
                  children: [
                    {
                      key: 'type',
                      setter: SharedSetterType.componentType,
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
                      label: '宽度',
                    },
                    {
                      key: 'gridRowSpan',
                      setter: SetterType.number,
                      name: 'gridRowSpan',
                      label: '占行',
                      min: 1,
                      step: 1,
                      precision: 0,
                    }
                  ],
                },
              ]
            },
          ]
        }
      ]
    };
  });

};

export default registerMetadata;