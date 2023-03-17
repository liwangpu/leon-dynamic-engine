import styles from './index.module.less';
import { FormListContext, FormListItemContext } from '@lowcode-engine/dynamic-form';
import { Button, Form, Input } from 'antd';
import { memo, useContext } from 'react';
import { GenerateComponentId } from '@lowcode-engine/core';
import { CloseOutlined, DownOutlined, HolderOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { ComponentTypes } from '../../enums';

const PlainText: React.FC<{ value?: any; onChange?: (val: any) => void }> = memo(props => {

  return (
    <div className={styles['plain-text']}>
      {props.value}
    </div>
  );
});

PlainText.displayName = 'PlainText';

export const PageChildrenItem: React.FC = memo(props => {

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
        label='名称'
        name={[itemCtx.name, 'title']}
        noStyle={true}
      >
        <Input />
      </Form.Item>

      <div className={styles['item__buttons']}>
        <Button type="text" shape="circle" icon={<CloseOutlined />} size='small' onClick={() => itemCtx.operation.delete()} />
      </div>
    </div>
  );
});

PageChildrenItem.displayName = 'PageChildrenItem';

export const PageChildrenFooter: React.FC = memo(() => {
  const { operation } = useContext(FormListContext);
  const addAction = () => {
    operation.add({
      id: GenerateComponentId(ComponentTypes.block),
      type: ComponentTypes.block,
      title: '测试区块',
      children: [
        {
          id: GenerateComponentId(ComponentTypes.block),
          type: ComponentTypes.block,
          title: '内嵌区块',
          children: [
            {
              id: GenerateComponentId(ComponentTypes.text),
              type: ComponentTypes.text,
              gridColumnSpan: '1/2',
              title: '标题',
            },
          ]
        }
      ],
    });
  };

  return (
    <div className={styles['footer']} onClick={addAction}>
      <span className={styles['footer__title']}>添加组件</span>
      <DownOutlined />
    </div>
  );
});

PageChildrenFooter.displayName = 'PageChildrenFooter';
