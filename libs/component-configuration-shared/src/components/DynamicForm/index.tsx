import { IComponentConfiguration, IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ComponentSetterPanelContext, EditorContext } from '@lowcode-engine/editor';
import * as _ from 'lodash';
import { IFormMetadata, ISetter, ISetterGroup, ISetterTab, SetterType, DynamicForm as DynamicFormManager, isSetterGroup } from '../../models';
import { Button, Empty, Form, Tabs } from 'antd';
import { Subject } from 'rxjs';
import './index.less';
import { ISettterContext, ISettterRendererContext, SettterContext, SettterRendererContext } from '../../contexts';

const recursiveSetter = (item: ISetterGroup | ISetter) => {
  if (isSetterGroup(item)) {
    item.key = `SETTER_RGROUP_${item.title}`;
    if (item.children) {
      for (const cit of item.children) {
        recursiveSetter(cit as any);
      }
    }
  } else {
    item.key = `SETTER_RGROUP_${(item as ISetter).name}`;
  }
};

const generateKeyForSetterMetadata = (metadata: IFormMetadata) => {
  let md = _.cloneDeep(metadata);
  if (md.tabs) {
    for (const tab of md.tabs) {
      tab.key = `TAB_${tab.title}`;
      if (tab.children) {
        for (const item of tab.children) {
          recursiveSetter(item as any);
        }
      }
    }
  }
  return md;
};

const setterRendererCtx: ISettterRendererContext = {
  getFactory() {
    return _SetterRenderer;
  }
};

const DynamicForm: React.FC<IComponentConfigurationPanelProps> = memo(props => {

  const { value, onChange } = props;
  const setterContext = useContext(ComponentSetterPanelContext);
  const editorContext = useContext(EditorContext);
  const [metadata, setMetadata] = useState<IFormMetadata>();

  useEffect(() => {
    (async () => {
      // 先找最精确匹配的设置面板,如果找不到然后逐次降低优先级
      let metaGenerator = DynamicFormManager.instance.getMetadata(setterContext);
      if (!metaGenerator) {
        metaGenerator = DynamicFormManager.instance.getMetadata({ type: setterContext.type, parentType: setterContext.parentType });
      }
      if (!metaGenerator) {
        metaGenerator = DynamicFormManager.instance.getMetadata({ type: setterContext.type, slot: setterContext.slot });
      }
      if (!metaGenerator) {
        metaGenerator = DynamicFormManager.instance.getMetadata({ type: setterContext.type })
      }
      if (!metaGenerator) {
        setMetadata(null);
        return;
      }
      const md = await metaGenerator(editorContext);
      setMetadata(generateKeyForSetterMetadata(md));
    })();
  }, [setterContext]);

  return (
    <div className='component-configuration-panel'>
      <SettterRendererContext.Provider value={setterRendererCtx}>
        {metadata && (
          <ConfigurationForm metadata={metadata} configuration={value} onChange={onChange} />
        )}
        {!metadata && (
          <div className='empty-form-placeholder'>
            <Empty description='没有注册动态表单元数据' />
          </div>
        )}
      </SettterRendererContext.Provider>
    </div>
  );
});

DynamicForm.displayName = 'DynamicForm';

interface IConfigurationFormProp {
  metadata: IFormMetadata;
  configuration: IComponentConfiguration;
  onChange: (conf: IComponentConfiguration) => void;
}

const ConfigurationForm: React.FC<IConfigurationFormProp> = memo(props => {
  const { metadata, configuration, onChange } = props;
  const [form] = Form.useForm();

  const valueChangeObs = useMemo(() => new Subject<IComponentConfiguration>(), []);
  const handleChange = useCallback(_.debounce(async () => {
    let val = form.getFieldsValue();
    valueChangeObs.next(val);
    if (_.isFunction(metadata.onChange)) {
      val = await metadata.onChange(val);
    }
    onChange(val);
  }, 100), [metadata]);

  useEffect(() => {
    if (_.isFunction(metadata.onLoad)) {
      metadata.onLoad(configuration, valueChangeObs);
    }

    return () => {
      if (_.isFunction(metadata.onDestroy)) {
        metadata.onDestroy();
      }
    };
  }, [metadata]);

  const validateForm = async () => {
    try {
      const values = await form.validateFields();
      console.log('Success:', values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Form
      className='editor-configure-form'
      layout='vertical'
      form={form}
      validateTrigger={false}
      initialValues={configuration}
      onValuesChange={handleChange}
    >
      <TabsRenderer tabs={metadata.tabs} />
    </Form>
  );
});

ConfigurationForm.displayName = 'ConfigurationForm';

const TabsRenderer: React.FC<{ tabs: Array<ISetterTab> }> = memo(({ tabs }) => {

  const setterRendererCtx = useContext(SettterRendererContext);
  const SetterRenderer = setterRendererCtx.getFactory();
  const Items = useMemo<Array<any>>(() => {
    if (!tabs) { return []; }
    return tabs.map(t => ({
      key: t.title,
      label: t.title,
      children: (
        <>
          {t.children && (
            t.children.map(it => (
              <SetterRenderer config={it as any} key={it.key} />
            ))
          )}
        </>
      )
    }));
  }, [tabs]);

  return (
    <Tabs
      items={Items}
    />
  );
});

TabsRenderer.displayName = 'TabsRenderer';

const _SetterRenderer: React.FC<{ config: ISetter | ISetterGroup }> = memo(({ config }) => {

  const Setter = useMemo<React.FC | undefined>(() => {
    if (!config || !config.setter) { return; }
    return DynamicFormManager.instance.getSetter(config.setter);
  }, [config]);

  const setterCtx = useMemo<ISettterContext>(() => {
    return {
      config
    };
  }, [config]);

  return (

    <SettterContext.Provider value={setterCtx}>
      {Setter ? (<Setter {...config} />) : (
        <div>{`"${config.setter}" Setter未注册`}</div>
      )}
    </SettterContext.Provider>
  );
});

_SetterRenderer.displayName = 'SetterRenderer';

export default DynamicForm;
