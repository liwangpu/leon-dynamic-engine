import styles from './index.module.less';
import { Button as AntdButton, Form, Input } from 'antd';
import { memo } from 'react';
import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';

const ButtonConfiguration: React.FC<IComponentConfigurationPanelProps> = memo(observer(props => {
  const configuration = props.value;
  const [form] = Form.useForm();

  return (
    <div className={styles['button-configuration']}>
      <Form
        className={styles['form']}
        form={form}
        layout="vertical"
        initialValues={configuration}
        onValuesChange={val => props.onChange(val)}
      >
        <Form.Item label="标题" name="title">
          <Input placeholder="请输入标题" />
        </Form.Item>
      </Form>
    </div >
  );
}));

export default ButtonConfiguration;
