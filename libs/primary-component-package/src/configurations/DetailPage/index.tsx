import styles from './index.module.less';
import { Form, Input } from 'antd';
import React, { memo, useCallback } from 'react';
import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';

const PageConfiguration: React.FC<IComponentConfigurationPanelProps> = memo(observer((props) => {
  const configuration = props.value;
  const [form] = Form.useForm();

  const onChange = useCallback(val => {
    props.onChange(val)
  }, []);

  return (
    <div className={styles['page-configuration']}>
      <Form
        className={styles['form']}
        form={form}
        layout="vertical"
        initialValues={configuration}
        onValuesChange={onChange}
      >
        <Form.Item label="标题" name="title">
          <Input placeholder="请输入标题" />
        </Form.Item>
      </Form>
    </div >
  );
}));

export default PageConfiguration;
