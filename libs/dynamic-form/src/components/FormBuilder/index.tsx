import { Form } from 'antd';
import React, { memo, useCallback, useMemo } from 'react';
import { ISettterContext, ISettterRendererContext, SettterContext, SettterRendererContext } from '../../contexts';
import { IFormMetadata, ISetter, SetterRegistry } from '../../models';
import './index.less';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

export interface IFormBuilderProps {
  metadata: IFormMetadata;
}

const setterRendererCtx: ISettterRendererContext = {
  getFactory() {
    return _SetterRenderer;
  }
};

export const FormBuilder: React.FC<IFormBuilderProps> = memo(props => {

  const [form] = Form.useForm();
  const SetterRenderer = setterRendererCtx.getFactory();
  const children = (props.metadata && props.metadata.children) ? props.metadata.children : [];
  const Children = useMemo(() => {
    return children.map(it => (
      <SetterRenderer config={it as any} key={it.key} />
    ))
  }, [children]);

  const valueChangeObs = useMemo(() => new Subject<any>(), []);
  const handleChange = useCallback(_.debounce(async () => {
    let val = form.getFieldsValue();
    valueChangeObs.next(val);
    console.log(`val:`, val);
    // if (_.isFunction(metadata.onChange)) {
    //   val = await metadata.onChange(val);
    // }
    // onChange(val);
  }, 100), [props.metadata]);

  return (
    <div className='dynamic-form-builder'>
      <SettterRendererContext.Provider value={setterRendererCtx}>
        <Form
          form={form}
          className='dynamic-form-builder'
          layout='vertical'
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