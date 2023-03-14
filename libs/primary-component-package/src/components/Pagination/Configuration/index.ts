import { IMetadataRegister } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes, PrimarySetterType } from '../../../enums';

const registerMetadata: IMetadataRegister = add => {

  add({
    type: ComponentTypes.pagination
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
                  key: 'pageSize',
                  setter: SetterType.number,
                  name: 'pageSize',
                  label: '每页条数',
                  required: true,
                  min: 0,
                  step: 1
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