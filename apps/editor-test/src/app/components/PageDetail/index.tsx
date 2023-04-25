import React, { useCallback, useContext, useMemo, useState } from 'react';
import styles from './index.module.less';
import { Button, Form, Input, Radio, Select } from 'antd';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { ComponentTypes, TableFeature, TableSelectionMode } from '@lowcode-engine/primary-component-package';
import { StoreContext } from '../../contexts';
import { useParams } from 'react-router-dom';
import { GenerateComponentId, GenerateNestedComponentId, IComponentConfiguration } from '@lowcode-engine/core';
import { getSnapshot } from 'mobx-state-tree';
import { IBusinessModel } from '@lowcode-engine/primary-plugin';

enum LayoutType {
  list = 'List',
  detail = 'detail',
  blank = 'blank',
  form = 'form'
}

interface PageDetailProps {
  pageType: string;
  onConfirm: (val: any) => void;
  onCancel: () => void;
}

interface IFormValue {
  type: string;
  layout: LayoutType;
  title: string;
  code: string;
  businessModel: string;
  description: string;
}

const AllLayouts = {
  [LayoutType.list]: { layout: LayoutType.list, title: '列表' },
  [LayoutType.detail]: { layout: LayoutType.detail, title: '行编辑表' },
  [LayoutType.blank]: { layout: LayoutType.blank, title: '空白页' },
  [LayoutType.form]: { layout: LayoutType.form, title: '表单' },
};

const PageDetail: React.FC<PageDetailProps> = observer(props => {

  const store = useContext(StoreContext);
  const [form] = Form.useForm<{ title: string }>();
  const [step, setStep] = useState(0);
  const { businessModel } = useParams();
  const businessModels: Array<IBusinessModel> = useMemo(() => {
    // 防止mst引用被其他地方使用
    const modelsMap = getSnapshot(store.modelStore.models);
    const modelKeys = Object.keys(modelsMap);
    return modelKeys.map(k => modelsMap[k]);
  }, [store.modelStore.models]);
  const limitedLayouts = useMemo(() => {
    switch (props.pageType) {
      case ComponentTypes.listPage:
        return [LayoutType.list, LayoutType.blank];
      case ComponentTypes.detailPage:
        return [LayoutType.form, LayoutType.blank];
      default:
        return [];
    }
  }, [props.pageType]);

  const onSave = useCallback(async () => {
    const formValue: IFormValue = form.getFieldsValue() as any;
    const configuration = await generatePageConfiguration(formValue, businessModels);
    props.onConfirm(configuration);
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
        initialValues={{ businessModel, type: props.pageType }}
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

async function generatePageConfiguration(formValue: IFormValue, models: Array<IBusinessModel>): Promise<Partial<IComponentConfiguration>> {
  const conf: Partial<IComponentConfiguration> = {
    ...formValue,
    width: '100%',
    height: '100%',
    children: []
  };
  const businessModel = models.find(b => b.id === formValue.businessModel);
  delete conf['layout'];
  switch (formValue.layout) {
    case LayoutType.list:
      // eslint-disable-next-line no-case-declarations
      const tableId = GenerateComponentId(ComponentTypes.table);
      conf.children = [
        {
          id: tableId,
          type: ComponentTypes.table,
          title: '列表',
          features: [
            TableFeature.selectionColumn,
            TableFeature.operationColumn,
            TableFeature.pagination,
          ],
          columns: businessModel.fields.map(f => ({
            id: GenerateComponentId(ComponentTypes.text),
            type: ComponentTypes.text,
            title: f.name
          })),
          selectionColumn: {
            id: GenerateNestedComponentId(tableId, ComponentTypes.tableSelectionColumn),
            type: ComponentTypes.tableSelectionColumn,
            selectionMode: TableSelectionMode.multiple,
          },
          operatorColumn: {
            id: GenerateNestedComponentId(tableId, ComponentTypes.tableOperatorColumn),
            type: ComponentTypes.tableOperatorColumn,
            visible: true,
            tileButtonCount: 3,
            title: '操作列',
          },
          pagination: {
            id: GenerateNestedComponentId(tableId, ComponentTypes.pagination),
            type: ComponentTypes.pagination,
            title: '分页器',
            pageSize: 20,
          },
        }
      ];
      break;
    case LayoutType.form:
      conf.children = [
        {
          id: GenerateComponentId(ComponentTypes.block),
          type: ComponentTypes.block,
          title: '基础信息',
          children: businessModel.fields.map(f => ({
            id: GenerateComponentId(ComponentTypes.text),
            type: ComponentTypes.text,
            title: f.name
          }))
        }
      ];
      break;
    default:
      break;
  }
  return conf;
}
