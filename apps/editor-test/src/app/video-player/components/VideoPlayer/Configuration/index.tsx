import styles from './index.module.less';
import { Form, Input, Switch, Tabs, TabsProps } from 'antd';
import { memo, useMemo } from 'react';
import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';

const VideoPlayerConfiguration: React.FC<IComponentConfigurationPanelProps> = memo(props => {
  const configuration = props.value;
  const [form] = Form.useForm();

  const items = useMemo(() => {
    const _items: TabsProps['items'] = [
      {
        key: 'basic-info',
        label: `属性`,
        children:
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
        ,
      },
    ];
    return _items;
  }, []);

  return (
    <div className={styles['configure-panel']}>
      <Form
        className={styles['form']}
        form={form}
        layout="vertical"
        initialValues={configuration}
        onValuesChange={val => props.onChange(val)}
      >
        <Tabs items={items} />
      </Form>
    </div >
  );
});

VideoPlayerConfiguration.displayName = 'VideoPlayerConfiguration';

export default VideoPlayerConfiguration;