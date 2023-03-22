import { IMetadataRegister, SharedSetterType } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes } from '../../../enums';

const registerMetadata: IMetadataRegister = register => {

  register({
    type: ComponentTypes.listPage
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
                      required: true,
                    },
                    {
                      key: 'code',
                      setter: SetterType.string,
                      name: 'code',
                      label: '编码',
                    }
                  ],
                },
                // {
                //   key: 't1',
                //   setter: SetterType.primaryHeading,
                //   label: '子组件',
                //   children: [
                //     {
                //       key: 'children',
                //       setter: SetterType.list,
                //       name: 'children',
                //       label: '子组件',
                //       listItem: 'page-children-item',
                //       listFooter: 'page-children-footer',
                //       sortable: true,
                //       dragHandle: '.drag-handle',
                //     }
                //   ]
                // }
              ]
            },
          ]
        }
      ]
    };
  });
};

export default registerMetadata;