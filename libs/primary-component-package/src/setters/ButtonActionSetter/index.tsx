import styles from './index.module.less';
import { FormListContext, FormListItemContext } from '@lowcode-engine/dynamic-form';
import { Button, Dropdown, Form, MenuProps } from 'antd';
import { memo, useContext } from 'react';
import { GenerateShortId } from '@lowcode-engine/core';
import { CloseOutlined, DownOutlined, HolderOutlined, SettingOutlined } from '@ant-design/icons';
import { faker } from '@faker-js/faker';
import classnames from 'classnames';

const PlainText: React.FC<{ value?: any; onChange?: (val: any) => void }> = memo(props => {

  return (
    <div className={styles['plain-text']}>
      {props.value}
    </div>
  );
});

PlainText.displayName = 'PlainText';

export const ButtonActionItem: React.FC = memo(props => {

  const itemCtx = useContext(FormListItemContext);


  return (
    <div className={styles['item']}>
      <div className={classnames(
        styles['item__drag-handler'],
        'drag-handle'
      )}>
        <HolderOutlined />
      </div>
      <Form.Item
        label='姓名'
        name={[itemCtx.name, 'name']}
        noStyle={true}
      >
        <PlainText />
      </Form.Item>

      <div className={styles['item__buttons']}>
        <Button type="text" shape="circle" icon={<SettingOutlined />} size='small' />
        <Button type="text" shape="circle" icon={<CloseOutlined />} size='small' onClick={() => itemCtx.operation.delete()} />
      </div>
    </div>
  );
});

ButtonActionItem.displayName = 'ButtonActionItem';

export const ButtonActionListFooter: React.FC = memo(props => {
  const { operation } = useContext(FormListContext);
  const addAction = () => {
    operation.add({ id: GenerateShortId(), name: faker.name.fullName(), age: 12 });
  };

  const items: MenuProps['items'] = [
    {
      label: '打开任意Url',
      key: '0',
      onClick: () => {
        addAction();
      },
    },
    {
      label: '执行表格头动作',
      key: '1',
      onClick: () => {
        addAction();
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
