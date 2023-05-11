import React, { useCallback, useContext, useMemo, useState } from 'react';
import styles from './index.module.less';
import { Button, Form, Input, Radio, Select } from 'antd';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { ComponentTypes } from '@lowcode-engine/primary-component-package';
import { StoreContext } from '../../contexts';
import { useParams } from 'react-router-dom';
import { GenerateComponentCode } from '@lowcode-engine/core';
import { getSnapshot } from 'mobx-state-tree';
import { IBusinessModel } from '@lowcode-engine/primary-plugin';
import { PageLayoutType } from '../../enums';
import { usePageSchemaGenerator } from '../../hooks';

interface PageDetailProps {
  pageType: string;
  onConfirm: (val: any) => void;
  onCancel: () => void;
}

interface IFormValue {
  type: string;
  layout: PageLayoutType;
  title: string;
  code: string;
  businessModel: string;
  description: string;
}

const AllLayouts = {
  [PageLayoutType.list]: { layout: PageLayoutType.list, title: '列表' },
  [PageLayoutType.detail]: { layout: PageLayoutType.detail, title: '行编辑表' },
  [PageLayoutType.blank]: { layout: PageLayoutType.blank, title: '空白页' },
  [PageLayoutType.form]: { layout: PageLayoutType.form, title: '表单' },
};

const PageDetail: React.FC<PageDetailProps> = observer(props => {

  const store = useContext(StoreContext);
  const [form] = Form.useForm<{ title: string }>();
  const [step, setStep] = useState(0);
  const { businessModel } = useParams();
  const pageSchemaGenerator = usePageSchemaGenerator();
  const businessModels: Array<IBusinessModel> = useMemo(() => {
    // 防止mst引用被其他地方使用
    const modelsMap = getSnapshot(store.modelStore.models);
    const modelKeys = Object.keys(modelsMap);
    return modelKeys.map(k => modelsMap[k]);
  }, [store.modelStore.models]);
  const formInitialValue = useMemo(() => {
    const code = GenerateComponentCode(props.pageType);
    return {
      businessModel,
      type: props.pageType,
      code,
      title: code,
      layout: PageLayoutType.blank,
    };
  }, [businessModel, props.pageType]);
  const limitedLayouts = useMemo(() => {
    switch (props.pageType) {
      case ComponentTypes.listPage:
        return [PageLayoutType.list, PageLayoutType.blank];
      case ComponentTypes.detailPage:
        return [PageLayoutType.form, PageLayoutType.blank];
      default:
        return [];
    }
  }, [props.pageType]);

  const onSave = useCallback(async () => {
    const formValue: IFormValue = form.getFieldsValue() as any;
    const schema = await pageSchemaGenerator(formValue.type, formValue.businessModel, formValue.layout);
    // 不需要id
    delete schema.id;
    props.onConfirm({ ...schema, title: formValue.title, code: formValue.code, businessModel: formValue.businessModel });
  }, []);

  const BusinessModelSelection = useMemo(() => {
    const options = businessModels.map(b => ({ value: b.id, label: b.name }));
    return (
      <Select
        options={options}
      />
    );
  }, [businessModels]);

  const PageTypeSelection = useMemo(() => {
    const layouts = limitedLayouts.map(t => AllLayouts[t]);
    return (
      <Radio.Group className={styles['page-type-selection']} key="layout">
        {
          layouts.map(t => (
            <Radio.Button value={t.layout} className={styles['page-type-selection__item']} key={t.layout}>
              <div className={styles['page-type-item']}>
                <img className={styles['page-type-item__icon']} src='/assets/images/page.png' />
                <p className={styles['page-type-item__title']}>{t.title}</p>
              </div>
            </Radio.Button>
          ))
        }
      </Radio.Group>
    )
  }, []);

  return (
    <div className={styles['page-detail']}>
      <Form
        form={form}
        name='basic'
        className={styles['form']}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        validateTrigger='onChange'
        initialValues={formInitialValue}
        autoComplete="off"
        onFinish={onSave}
      >

        <Form.Item
          hidden={true}
          noStyle={true}
          name="type"
        >
          <Input key="type" />
        </Form.Item>

        <Form.Item
          hidden={step > 0}
          noStyle={true}
          name="layout"
          rules={[{ required: true, message: '请选择页面类型' }]}
        >
          {PageTypeSelection}
        </Form.Item>

        <Form.Item
          hidden={step < 1}
          label="页面名称"
          name="title"
          rules={[{ required: true, message: '请输入页面名称' }]}
        >
          <Input key="title" />
        </Form.Item>

        <Form.Item
          hidden={step < 1}
          label="编码"
          name="code"
          rules={[{ required: true, message: '请输入页面名编码' }]}
        >
          <Input key="code" />
        </Form.Item>

        <Form.Item
          hidden={step < 1}
          label="主业务对象"
          name="businessModel"
          rules={[{ required: true, message: '请输入页面名编码' }]}
        >
          {BusinessModelSelection}
        </Form.Item>


        <Form.Item
          hidden={step < 1}
          label="页面描述"
          name="description"
        >
          <Input key="description" />
        </Form.Item>

        <Form.Item shouldUpdate className="submit" noStyle={true}>
          {() => (
            <div className={
              classNames(
                styles['operation-item']
              )}>
              <Button onClick={() => props.onCancel()} >取消</Button>
              <Button type="primary" className={
                classNames(
                  {
                    [styles['hidden']]: step > 0
                  }
                )
              }
                disabled={!form.getFieldValue('layout')}
                onClick={() => setStep(1)}>下一步</Button>
              <Button type="primary" className={
                classNames(
                  {
                    [styles['hidden']]: step < 1
                  }
                )
              } onClick={() => setStep(0)}>上一步</Button>
              <Button
                type="primary"
                htmlType="submit"
                className={
                  classNames(
                    {
                      [styles['hidden']]: step < 1
                    }
                  )
                }
              >创建页面</Button>
            </div>
          )}
        </Form.Item>
      </Form>
    </div>
  );
});

PageDetail.displayName = 'PageDetail';

export default PageDetail;
