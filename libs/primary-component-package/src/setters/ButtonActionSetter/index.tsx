import styles from './index.module.less';
import { FormBuilder, FormListContext, FormListItemContext, IFormMetadata, SetterType, useSetterName } from '@lowcode-engine/dynamic-form';
import { Button, Dropdown, Form, MenuProps, Modal, ModalFuncProps } from 'antd';
import { memo, useContext } from 'react';
import { EventActionType, GenerateShortId, IEventAction } from '@lowcode-engine/core';
import { CloseOutlined, DownOutlined, HolderOutlined, SettingOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import React from 'react';
import { SharedSetterType } from '@lowcode-engine/component-configuration-shared';

const EventActionContext = React.createContext<IEventAction>(null);

const ActionSettingModal: React.FC<{ onChange: (val: any) => void; wrapperFlag: string; metadata: IFormMetadata }> = memo(props => {
  return (
    <div className={classnames(
      styles['modal'],
      styles[`modal--${props.wrapperFlag}`],
    )}>
      <EventActionContext.Consumer>
        {
          (v) => (
            <FormBuilder metadata={props.metadata} value={v} onChange={props.onChange} />
          )
        }
      </EventActionContext.Consumer>
    </div>
  );
});

ActionSettingModal.displayName = 'OpenUrlSetting';

const openUrlForm: IFormMetadata = {
  children: [
    {
      key: 'grid-layout',
      setter: SetterType.gridLayout,
      children: [
        {
          key: 'title',
          setter: SetterType.string,
          name: 'title',
          label: '动作名称',
          gridColumnSpan: '1/2',
        },
        {
          key: 'params',
          setter: SetterType.group,
          name: 'params',
          children: [
            {
              key: 'url',
              setter: SetterType.string,
              name: 'url',
              label: '链接',
              gridColumnSpan: '1/2',
            },
            {
              key: 'target',
              setter: SetterType.select,
              name: 'target',
              label: '打开方式',
              gridColumnSpan: '1/2',
              data: [
                { value: '_blank', label: '新Tab' },
                { value: '_self', label: '当前页面' },
              ]
            },
          ]
        }
      ]
    },
  ]
};

const executeComponentActionForm: IFormMetadata = {
  children: [
    {
      key: 'grid-layout',
      setter: SetterType.gridLayout,
      children: [
        {
          key: 'title',
          setter: SetterType.string,
          name: 'title',
          label: '动作名称',
          required: true,
          gridColumnSpan: '1/2',
        },
        {
          key: 'params',
          setter: SetterType.group,
          name: 'params',
          children: [
            {
              key: 'component',
              setter: SharedSetterType.component,
              name: 'component',
              label: '组件',
              gridColumnSpan: '1/2',
              required: true,
            },
            {
              key: 'action',
              setter: SharedSetterType.componentAction,
              name: 'action',
              label: '操作',
              required: true,
              gridColumnSpan: '1/2',
            },
          ]
        }
      ]
    }
  ]
};

const EventActionSetter: React.FC<{ value?: IEventAction; onChange?: (val: any) => void }> = memo(({ value, onChange }) => {
  const itemCtx = useContext(FormListItemContext);
  const [modal, contextHolder] = Modal.useModal();

  const onSetting = () => {
    let currentValue: any;
    let modalConf: ModalFuncProps;

    const commonModalProps: Partial<ModalFuncProps> = {
      icon: null,
      className: styles['setting-modal'],
      okText: '保存',
      cancelText: '取消',
      onOk() {
        save();
      },
    };

    const save = () => {
      onChange({ ...value, ...currentValue });
    };

    const formChange = (val: any) => {
      currentValue = val;
    };

    switch (value.type) {
      case EventActionType.openUrl:
        modalConf = {
          ...commonModalProps,
          title: '打开链接',
          width: '540px',
          content: (
            <ActionSettingModal metadata={openUrlForm} wrapperFlag='open-url' onChange={formChange} />
          ),
        };
        break;
      case EventActionType.executeComponentAction:
        modalConf = {
          ...commonModalProps,
          title: '执行组件动作',
          width: '540px',
          content: (
            <ActionSettingModal metadata={executeComponentActionForm} wrapperFlag='execute-action' onChange={formChange} />
          ),
        };
        break;
      default:
        break;
    }
    if (modalConf) {
      modal.confirm(modalConf);
    }
  };

  return (
    <EventActionContext.Provider value={value}>
      <div className={styles['item']}>
        <div className={classnames(
          styles['item__drag-handler'],
          'drag-handle'
        )}>
          <HolderOutlined />
        </div>
        <p className={styles['item__title']}>{value.title}</p>
        {contextHolder}
        <div className={styles['item__buttons']}>
          <Button type="text" shape="circle" icon={<SettingOutlined />} size='small' onClick={onSetting} />
          <Button type="text" shape="circle" icon={<CloseOutlined />} size='small' onClick={() => itemCtx.operation.delete()} />
        </div>
      </div>
    </EventActionContext.Provider>
  );
});

EventActionSetter.displayName = 'EventActionSetter';

export const ButtonActionListItem: React.FC = memo(() => {
  const itemCtx = useContext(FormListItemContext);
  const name = useSetterName();
  // console.log(`list item path:`, name);
  return (
    <Form.Item
      name={[itemCtx.name]}
      noStyle={true}
    >
      <EventActionSetter />
    </Form.Item>
  );
});

ButtonActionListItem.displayName = 'ButtonActionListItem';

export const ButtonActionListFooter: React.FC = memo(() => {
  const { operation } = useContext(FormListContext);

  const items: MenuProps['items'] = [
    {
      label: '打开链接',
      key: '0',
      onClick: () => {
        operation.add({ id: GenerateShortId(), type: EventActionType.openUrl, title: '打开百度', params: { url: 'https://www.baidu.com/', target: '_blank' } });
      },
    },
    {
      label: '执行组件动作',
      key: '1',
      onClick: () => {
        operation.add({ id: GenerateShortId(), type: EventActionType.executeComponentAction, title: '执行组件动作', params: { component: null } });
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} >
      <div className={styles['footer']} >
        <span className={styles['footer__title']}>新建动作</span>
        <DownOutlined />
      </div>
    </Dropdown>
  );
});

ButtonActionListFooter.displayName = 'ButtonActionListFooter';
