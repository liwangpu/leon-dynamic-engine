import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { Form, Tabs } from 'antd';
import '../style';
import '../metadatas';
import '../setters';
import { memo, useCallback, useContext, useMemo } from 'react';
import { ISetter, ISetterGroup, ISetterTab, MetadataRegedit, SetterRegedit, SetterType } from '../configureRegedit';
import { ComponentSetterPanelContext } from '@lowcode-engine/editor';

const ConfigurationPanel: React.FC<IComponentConfigurationPanelProps> = memo(props => {

  const conf = props.value;
  const [form] = Form.useForm();
  const setterContext = useContext(ComponentSetterPanelContext);
  const metadata = useMemo(() => {
    // 先找最精确匹配的设置面板,如果找不到然后逐次降低优先级
    let md = MetadataRegedit.getMetadata(setterContext);
    if (!md) {
      md = MetadataRegedit.getMetadata({ type: setterContext.type, parentType: setterContext.parentType });
    }
    if (!md) {
      md = MetadataRegedit.getMetadata({ type: setterContext.type, slot: setterContext.slot });
    }
    if (!md) {
      md = MetadataRegedit.getMetadata({ type: setterContext.type })
    }
    return md;
  }, [setterContext]);

  const onChange = useCallback(() => {
    props.onChange(form.getFieldsValue());
  }, [conf]);

  return (
    <div className='component-configuration-panel'>
      <Form
        className='editor-conf-form'
        layout='vertical'
        form={form}
        initialValues={conf}
        onValuesChange={onChange}
      >
        {metadata && (
          <TabsRenderer tabs={metadata.tabs} />
        )}
      </Form>
    </div>
  );
});

ConfigurationPanel.displayName = 'ConfigurationPanel';

const TabsRenderer: React.FC<{ tabs: Array<ISetterTab> }> = memo(({ tabs }) => {

  const Items = useMemo<Array<any>>(() => {
    if (!tabs) { return []; }
    return tabs.map(t => ({
      key: t.title,
      label: t.title,
      children: (
        <>
          {t.children && (
            t.children.map((it, idx) => (
              <SetterPanelRenderer config={it} key={idx} />
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

const SetterPanelRenderer: React.FC<{ config: ISetter | ISetterGroup }> = memo(({ config }) => {

  const isGroup = config.setter === SetterType.setterGroup;

  const Group = useMemo(() => {
    if (!isGroup) { return null; }
    if (!config.children) { return null; }
    return (
      <div className='configuration-setter-group'>
        <p className='configuration-setter-group__title'>{config.title}</p>
        <div className='configuration-setter-group__content'>
          {config.children.map((c, idx) => (
            <SetterPanelRenderer config={c} key={idx} />
          ))}
        </div>
      </div>
    )
  }, [isGroup]);

  const Item = useMemo(() => {
    if (isGroup) { return null; }
    const Component = SetterRegedit.getSetter(config.setter);
    return (
      <>
        {Component ? <Component {...config} /> : (
          <div>{`没有在Setter Regedit找到类型为${config.setter}的Setter,请检查是否已经注册!`}</div>
        )}
      </>
    );
  }, [isGroup]);

  return (
    <>
      {isGroup ? Group : Item}
    </>
  );
});

SetterPanelRenderer.displayName = 'SetterPanelRenderer';

export default ConfigurationPanel;