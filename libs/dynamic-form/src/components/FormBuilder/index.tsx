import { Form } from 'antd';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { ISettterContext, ISettterRendererContext, SettterContext, SettterRendererContext } from '../../contexts';
import { IFormMetadata, ISetter, SetterRegistry } from '../../models';
import './index.less';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

export interface IFormBuilderProps<T = { [key: string]: any }> {
  metadata: IFormMetadata;
  value?: T;
  onChange(configuration: T): void;
}

const setterRendererCtx: ISettterRendererContext = {
  getFactory() {
    return _SetterRenderer;
  }
};

export const FormBuilder: React.FC<IFormBuilderProps> = memo(({ metadata, value, onChange }) => {

  const [form] = Form.useForm();
  const SetterRenderer = setterRendererCtx.getFactory();
  const children = (metadata && metadata.children) ? metadata.children : [];
  const Children = useMemo(() => {
    return children.map(it => (
      <SetterRenderer config={it as any} key={it.key} />
    ))
  }, [children]);

  const valueChangeObs = useMemo(() => new Subject<any>(), []);
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
      metadata.onLoad(value, valueChangeObs);
    }

    return () => {
      if (_.isFunction(metadata.onDestroy)) {
        metadata.onDestroy();
      }
    };
  }, [metadata]);

  return (
    <div className='dynamic-form-builder'>
      <SettterRendererContext.Provider value={setterRendererCtx}>
        <Form
          form={form}
          className='dynamic-form-builder'
          layout='vertical'
          initialValues={value}
          validateTrigger={false}
          onValuesChange={handleChange}
        >
          {Children}
        </Form>
      </SettterRendererContext.Provider>
    </div>
  );
});

FormBuilder.displayName = 'FormBuilder';

const _SetterRenderer: React.FC<{ config: ISetter }> = memo(({ config }) => {

  const Setter = useMemo<React.FC | undefined>(() => {
    if (!config || !config.setter) { return; }
    return SetterRegistry.instance.getSetter(config.setter);
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