import styles from './index.module.less';
import { FormListContext, FormListItemContext } from '@lowcode-engine/dynamic-form';
import { Button, Dropdown, Form, MenuProps, Modal, ModalFuncProps } from 'antd';
import { memo, useContext } from 'react';
import { EventActionType, GenerateShortId, IEventAction } from '@lowcode-engine/core';
import { CloseOutlined, DownOutlined, HolderOutlined, SettingOutlined } from '@ant-design/icons';
import { faker } from '@faker-js/faker';
import classnames from 'classnames';

const OpenUrlModalConfig: ModalFuncProps = {
  // title: 'Use Hook!',
  icon: null,
  className: styles['setting-modal'],
  width: '540px',
  content: (
    <div className={classnames(
      styles['modal'],
      styles['modal--open-url'],
    )}>
      lo
    </div>
  ),
};

const EventActionSetter: React.FC<{ value?: IEventAction; onChange?: (val: any) => void }> = memo(({ value, onChange }) => {
  const itemCtx = useContext(FormListItemContext);
  const [modal, contextHolder] = Modal.useModal();
  console.log(`v:`, value);

  const onSetting = () => {

    switch (value.type) {
      case EventActionType.openUrl:
        modal.info(OpenUrlModalConfig);
        break;
      default:
        break;
    }
  };

  return (
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
  );
});

EventActionSetter.displayName = 'EventActionSetter';

export const ButtonActionItem: React.FC = memo(() => {
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

ButtonActionItem.displayName = 'ButtonActionItem';

export const ButtonActionListFooter: React.FC = memo(() => {
  const { operation } = useContext(FormListContext);
  const addAction = () => {
    operation.add({ id: GenerateShortId(), name: faker.name.fullName(), age: 12 });
  };

  const items: MenuProps['items'] = [
    {
      label: '打开Url',
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
