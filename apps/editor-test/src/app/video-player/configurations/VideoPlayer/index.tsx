import styles from './index.module.less';
import { Form, Input, Switch, Tabs } from 'antd';
import { memo } from 'react';
import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';

const VideoPlayerConfiguration: React.FC<IComponentConfigurationPanelProps> = memo(props => {
  const configuration = props.value;
  const [form] = Form.useForm();
  return (
    <div className={styles['configure-panel']}>
      <Form
        className={styles['form']}
        form={form}
        layout="vertical"
        initialValues={configuration}
        onValuesChange={val => props.onChange(val)}
      >
        <Tabs defaultActiveKey="1" items={[
          {
            key: 'basic-info',
            label: '属性',
            children: [
              (
                <>
                  <Form.Item label="标题" name="title">
                    <Input placeholder="请输入标题" />
                  </Form.Item>

                  <Form.Item label="视频地址" name="vedioUrl">
                    <Input placeholder="请输入视频地址" />
                  </Form.Item>

                  <Form.Item label="显示控件" name="showControl" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </>
              )
            ]
          }
        ]} />
      </Form>
    </div >
  );
});

VideoPlayerConfiguration.displayName = 'VideoPlayerConfiguration';

export default VideoPlayerConfiguration;