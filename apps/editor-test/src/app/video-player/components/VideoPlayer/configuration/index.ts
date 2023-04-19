import { IMetadataRegister, SharedSetterType } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes } from '../../../enums';

const registerMetadata: IMetadataRegister = register => {

  register({
    type: ComponentTypes.videoPlayer
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
                      // disabled: true,
                    },
                    {
                      key: 'title',
                      setter: SetterType.string,
                      name: 'title',
                      label: '标题',
                      required: true,
                    },
                    {
                      key: 'vedioUrl',
                      setter: SetterType.string,
                      name: 'vedioUrl',
                      label: '视频地址',
                      required: true,
                    },
                    {
                      key: 'showControl',
                      setter: SetterType.boolean,
                      name: 'showControl',
                      label: '显示控件',
                    },
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