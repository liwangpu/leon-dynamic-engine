import styles from './index.module.less';
import React, { ComponentType, memo, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { ComponentSetterPanelContext, ISetterPanelContext } from '@lowcode-engine/editor';
import { DynamicForm } from '@lowcode-engine/component-configuration-shared';
import { IComponentConfiguration, IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { CommonSlot, ComponentTypes } from '@lowcode-engine/primary-component-package';
import registerMetadata from './metadata-register';
import registerSetter from './setters';

registerMetadata();
registerSetter();

const commonConfig: IComponentConfiguration = {
  id: 'com-1',
  code: 'code1',
  title: '我是标题',
  type: ComponentTypes.button,
  cus1: '自定义属性1',
  users: [
    {
      id: 'a1',
      name: 'Leon',
      age: 18
    },
    {
      id: 'a2',
      name: 'Bob',
      age: 19
    },
    {
      id: 'a3',
      name: 'Hellen',
      age: 17
    },
    {
      id: 'a4',
      name: 'Jim',
      age: 11
    },
  ],
  teacher: {
    name: '李老师',
    age: 32,
    info: {
      remark: '我是备注信息',
    }
  }
};
const buttonInPageContext: ISetterPanelContext = { type: ComponentTypes.button, parentType: ComponentTypes.listPage, slot: CommonSlot.children };
const blockInPageContext: ISetterPanelContext = { type: ComponentTypes.block, parentType: ComponentTypes.listPage, slot: CommonSlot.children };
const customInPageContext: ISetterPanelContext = { type: 'custom-component', parentType: ComponentTypes.listPage, slot: CommonSlot.children };

const DynamicFormTest: React.FC = memo(() => {

  const [context, setContext] = useState<ISetterPanelContext>(blockInPageContext);
  const [conf, setConf] = useState<IComponentConfiguration>(commonConfig);


  const toggleButtonConfigure = () => {
    setContext(buttonInPageContext);
  };
  const toggleCustomConfigure = () => {
    setContext(customInPageContext);
  };

  const toggleBlockConfigure = () => {
    setContext(blockInPageContext);
  };

  const validateForm = () => { };

  const onChange = (val: IComponentConfiguration) => {
    console.log(`conf change:`, val);
    setConf(val);
  };

  return (
    <div className={styles['page']}>
      <div className={styles['page__left']}>


        <div className={styles['panel']}>
          <p className={styles['panel__title']}>模拟激活组件</p>
          <div className={styles['panel__content']}>
            <Button onClick={toggleButtonConfigure}>按钮</Button>
            <Button onClick={toggleBlockConfigure}>区块</Button>
            <Button onClick={toggleCustomConfigure}>自定义组件</Button>
          </div>
        </div>
        {/* <div className={styles['panel']}>
          <p className={styles['panel__title']}>触发表单行为</p>
          <div className={styles['panel__content']}>
            <Button onClick={validateForm}>校验</Button>
          </div>
        </div> */}
      </div>
      <div className={styles['page__right']}>
        <ComponentSetterPanelContext.Provider value={context}>
          <DyFormWrapper conf={conf} onChange={onChange} />
        </ComponentSetterPanelContext.Provider>
      </div>
    </div >
  );
});

DynamicFormTest.displayName = 'DynamicFormTest';

export default DynamicFormTest;

const DyFormWrapper: React.FC<{ conf: IComponentConfiguration, onChange: (c: IComponentConfiguration) => void }> = memo(props => {
  const [formLoaded, setFormLoaded] = useState<boolean>();
  const Component = useRef<ComponentType<IComponentConfigurationPanelProps>>(null);

  useEffect(() => {
    (async () => {
      setTimeout(async () => {
        const module = await DynamicForm.instance.loadForm();
        if (module && module.default) {
          Component.current = module.default;
          setFormLoaded(true);
        }
      }, 0);
    })();

    return () => {
      setFormLoaded(false);
    };
  }, []);

  return (
    <>
      {formLoaded && <Component.current value={props.conf} onChange={props.onChange} />}
    </>
  );
});

DyFormWrapper.displayName = 'DyFormWrapper';