import { Form } from 'antd';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { FormInstanceContext, FormNamePathContext, ISettterContext, ISettterRendererContext, SettterContext, SettterRendererContext } from '../../contexts';
import { IFormMetadata, ISetter, SetterRegistry } from '../../models';
import './index.less';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { GRID_SYSTEM_SECTION_TOTAL } from '../../consts';
import { SetterType } from '../../enums';

const VIRTUAL_SETTERS = new Set<string>([
  SetterType.group
]);

export interface IFormBuilderProps<T = { [key: string]: any }> {
  metadata: IFormMetadata;
  value?: T;
  onChange?(configuration: T): void;
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

  const handleChange = useCallback(async () => {
    let val = form.getFieldsValue();
    valueChangeObs.next(val);
    if (_.isFunction(metadata.onChange)) {
      val = await metadata.onChange(val);
    }
    if (_.isFunction(onChange)) {
      onChange(val);
    }
  }, [metadata]);

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

  useEffect(() => {
    form.setFieldsValue(value);
    valueChangeObs.next(value);
  }, [value]);

  return (
    <div className='dynamic-form-builder'>
      <FormInstanceContext.Provider value={form}>
        <FormNamePathContext.Provider value={null}>
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
        </FormNamePathContext.Provider>
      </FormInstanceContext.Provider>
    </div>
  );
});

FormBuilder.displayName = 'FormBuilder';

const _SetterRenderer: React.FC<{ config: ISetter }> = memo(({ config }) => {

  const Setter = useMemo<React.FC | undefined>(() => {
    if (!config || !config.setter) { return; }
    return SetterRegistry.instance.getSetter(config.setter);
  }, [config]);

  const style = useMemo(() => {
    const _style: { [key: string]: any } = {};
    let sec = GRID_SYSTEM_SECTION_TOTAL;
    if (config.gridColumnSpan) {
      try {
        const fn = new Function(`return ${config.gridColumnSpan}`);
        sec = fn() * GRID_SYSTEM_SECTION_TOTAL;
      } catch (err) {
        console.error(`gridColumnStart转化失败,数值信息为${config.gridColumnSpan}`);
      }
    }
    _style['gridColumnStart'] = `span ${sec}`;

    return _style;
  }, []);

  const setterCtx = useMemo<ISettterContext>(() => {
    return {
      config
    };
  }, [config]);

  return (
    <SettterContext.Provider value={setterCtx}>
      {Setter &&
        VIRTUAL_SETTERS.has(config.setter) ? (<Setter {...config} />) : (
        <div className='form-builder-setter-wrapper' style={style}>
          <Setter {...config} />
        </div>
      )
      }

      {!Setter && (
        <div>{`"${config.setter}" Setter未注册`}</div>
      )}
    </SettterContext.Provider>
  );
});

_SetterRenderer.displayName = 'SetterRenderer';