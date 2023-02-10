import styles from './index.module.less';
import { Form, Input, Tabs } from 'antd';
import { memo, useCallback } from 'react';
import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import { BlockItemSize, ConfigItem, ComponentContextSelector } from '@lowcode-engine/component-configuration-shared';
import { ComponentTypes } from '../../enums';

const ButtonConfiguration: React.FC<IComponentConfigurationPanelProps> = memo(observer(props => {
  const conf = props.value;
  const [form] = Form.useForm();

  const onChange = useCallback(val => {
    props.onChange(val)
  }, []);

  const getFormInitVal = () => {
    // return { ...conf, height: Number.parseInt(conf.height), heightUnit: getSizeUnit(conf.height) };
    return conf;
  };

  return (
    <div className={styles['button-configuration']}>
      <Form
        className={styles['form']}
        form={form}
        initialValues={getFormInitVal()}
        onValuesChange={onChange}
      >
        <Tabs
          defaultActiveKey="property"
          items={[
            {
              label: `属性`,
              key: 'property',
              children: (
                <div className={styles['component']}>
                  <ConfigItem title="标题">
                    <Form.Item name="title" noStyle={true}>
                      <Input placeholder="请输入标题" />
                    </Form.Item>
                  </ConfigItem>

                  <ComponentContextSelector parent={ComponentTypes.block}>
                    <ConfigItem title="宽度">
                      <Form.Item name="gridColumnSpan" noStyle={true}>
                        <BlockItemSize />
                      </Form.Item>
                    </ConfigItem>
                  </ComponentContextSelector>

                  <ComponentContextSelector parent={ComponentTypes.table} slotProperty='columns'>
                    <ConfigItem title="111111">
                      测试测试
                    </ConfigItem>
                  </ComponentContextSelector>
                </div>
              ),
            },
            {
              label: `样式`,
              key: 'style',
              children: null,
            },
          ]}
        />
      </Form>
    </div >
  );
}));

export default ButtonConfiguration;
