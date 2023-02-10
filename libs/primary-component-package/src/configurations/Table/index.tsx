import styles from './index.module.less';
import { Form, Input } from 'antd';
import { memo } from 'react';
import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import { ConfigItem } from '@lowcode-engine/component-configuration-shared';

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
        <ConfigItem title="标题">
          <Form.Item name="title" noStyle={true}>
            <Input placeholder="请输入标题" />
          </Form.Item>
        </ConfigItem>

        <ConfigItem title="编码">
          <Form.Item name="code" noStyle={true}>
            <Input placeholder="请输入编码" />
          </Form.Item>
        </ConfigItem>
      </Form>
    </div >
  );
}));

export default ButtonConfiguration;
