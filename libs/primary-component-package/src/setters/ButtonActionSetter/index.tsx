import styles from './index.module.less';
import { FormBuilder, FormListContext, FormListItemContext, IFormMetadata, SetterType } from '@lowcode-engine/dynamic-form';
import { Button, Dropdown, Form, MenuProps, Modal, ModalFuncProps } from 'antd';
import { memo, useContext } from 'react';
import { EventActionType, GenerateShortId, IEventAction } from '@lowcode-engine/core';
import { CloseOutlined, DownOutlined, HolderOutlined, SettingOutlined } from '@ant-design/icons';
import { faker } from '@faker-js/faker';
import classnames from 'classnames';
import React from 'react';

export const EventActionContext = React.createContext<IEventAction>(null);

const OpenUrlForm: IFormMetadata = {
  children: [
    {
      key: 'grid-layout',
      setter: SetterType.gridLayout,
      children: [
        {
          key: 'title',
          setter: SetterType.string,
          name: 'title',
          label: '标题',
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

const OpenUrlSetting: React.FC<{ onChange: (val: any) => void }> = memo(({ onChange }) => {

  return (
    <div className={classnames(
      styles['modal'],
      styles['modal--open-url'],
    )}>
      <EventActionContext.Consumer>
        {
          (v) => (
            <FormBuilder metadata={OpenUrlForm} value={v} onChange={onChange} />
          )
        }
      </EventActionContext.Consumer>

    </div>
  );
});

OpenUrlSetting.displayName = 'OpenUrlSetting';

const EventActionSetter: React.FC<{ value?: IEventAction; onChange?: (val: any) => void }> = memo(({ value, onChange }) => {
  const itemCtx = useContext(FormListItemContext);
  const [modal, contextHolder] = Modal.useModal();

  const onSetting = () => {
    let currentValue: any;
    switch (value.type) {
      case EventActionType.openUrl:
        const OpenUrlModalConfig: ModalFuncProps = {
          title: '打开链接',
          icon: null,
          className: styles['setting-modal'],
          width: '540px',
          okText: '保存',
          onOk() {
            onChange({ ...value, ...currentValue });
          },
          content: (
            <OpenUrlSetting onChange={val => {
              currentValue = val;
            }} />
          ),
        };
        modal.info(OpenUrlModalConfig);
        break;
      default:
        break;
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
  const addAction = () => {
    operation.add({ id: GenerateShortId(), name: faker.name.fullName(), age: 12 });
  };

  const items: MenuProps['items'] = [
    {
      label: '打开链接',
      key: '0',
      onClick: () => {
        operation.add({ id: GenerateShortId(), type: EventActionType.openUrl, title: '打开百度', params: { url: 'https://www.baidu.com/', target: '_blank' } });
      },
    },
    // {
    //   label: '执行表格头动作',
    //   key: '1',
    //   onClick: () => {
    //     addAction();
    //   },
    // },
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
