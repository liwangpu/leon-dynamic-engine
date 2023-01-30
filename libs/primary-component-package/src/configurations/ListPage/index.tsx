import styles from './index.module.less';
import { Form, Input, Tabs } from 'antd';
import React, { memo, useCallback, useEffect } from 'react';
import { IComponentConfigurationPanelProps } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import { ConfigItem } from '@tiangong/editor-shared';

const PageConfiguration: React.FC<IComponentConfigurationPanelProps> = memo(observer(props => {
  const conf = props.value;
  const [form] = Form.useForm();

  const onChange = useCallback(val => {
    props.onChange(val)
  }, []);

  const getFormInitVal = () => {
    // return { ...conf, height: Number.parseInt(conf.height), heightUnit: getSizeUnit(conf.height) };
    return conf;
  };

  const onFormValueChange = val => {
    const formValue = form.getFieldsValue();
    props.onChange({ ...val, height: formValue.height ? `${formValue.height}${formValue.heightUnit || 'px'}` : 'auto' });
  };

  useEffect(() => {
    form.setFieldsValue(props.value);
  }, [props.value]);


  return (
    <div className={styles['page-configuration']}>
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

export default PageConfiguration;
