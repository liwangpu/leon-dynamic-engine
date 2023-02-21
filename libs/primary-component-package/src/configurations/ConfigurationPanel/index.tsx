import { IComponentConfiguration, IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { Form, Tabs } from 'antd';
import '../style';
import '../metadatas';
import '../setters';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ISetter, ISetterGroup, ISetterMetadata, ISetterTab, MetadataRegedit, SetterRegedit, SetterType } from '../configureRegedit';
import { ComponentSetterPanelContext, EditorContext } from '@lowcode-engine/editor';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { SubSink } from 'subsink';

const recursiveSetter = (item: ISetterGroup | ISetter) => {
  if (item.setter === SetterType.setterGroup) {
    item.key = `SETTER_RGROUP_${item.title}`;
    if (item.children) {
      for (const cit of item.children) {
        recursiveSetter(cit);
      }
    }
  } else {
    item.key = `SETTER_RGROUP_${item.name}`;
  }
};

const generateKeyForSetterMetadata = (metadata: ISetterMetadata) => {
  let md = _.cloneDeep(metadata);
  if (md.tabs) {
    for (const tab of md.tabs) {
      tab.key = `TAB_${tab.title}`;
      if (tab.children) {
        for (const item of tab.children) {
          recursiveSetter(item);
        }
      }
    }
  }
  return md;
};

const ConfigurationPanel: React.FC<IComponentConfigurationPanelProps> = memo(props => {

  const { value, onChange } = props;
  const setterContext = useContext(ComponentSetterPanelContext);
  const editorContext = useContext(EditorContext);
  const metadataRef = useRef<ISetterMetadata>();
  const [metadataLoaded, setMetadataLoaded] = useState<boolean>(false);

  useEffect(() => {
    setMetadataLoaded(false);
    (async () => {
      // 先找最精确匹配的设置面板,如果找不到然后逐次降低优先级
      let metaGenerator = MetadataRegedit.getMetadata(setterContext);
      if (!metaGenerator) {
        metaGenerator = MetadataRegedit.getMetadata({ type: setterContext.type, parentType: setterContext.parentType });
      }
      if (!metaGenerator) {
        metaGenerator = MetadataRegedit.getMetadata({ type: setterContext.type, slot: setterContext.slot });
      }
      if (!metaGenerator) {
        metaGenerator = MetadataRegedit.getMetadata({ type: setterContext.type })
      }
      if (!metaGenerator) {
        console.warn(`没有找到类型为${setterContext.type}的metadata配置`);
        return;
      }
      const metadata = await metaGenerator(editorContext);
      metadataRef.current = generateKeyForSetterMetadata(metadata);
      // TODO: 这里渲染周期有点问题,后面需要处理
      setTimeout(() => {
        setMetadataLoaded(true);
      }, 0);
    })();
  }, [setterContext]);

  return (
    <div className='component-configuration-panel'>
      {metadataLoaded && (
        <ConfigurationForm metadata={metadataRef.current} configuration={value} onChange={onChange} />
      )}
    </div>
  );
});

ConfigurationPanel.displayName = 'ConfigurationPanel';

interface IConfigurationFormProp {
  metadata: ISetterMetadata;
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



  return (
    <Form
      className='editor-configure-form'
      layout='vertical'
      form={form}
      initialValues={configuration}
      onValuesChange={handleChange}
    >
      <TabsRenderer tabs={metadata.tabs} />
    </Form>
  );
});

ConfigurationForm.displayName = 'ConfigurationForm';

const TabsRenderer: React.FC<{ tabs: Array<ISetterTab> }> = memo(({ tabs }) => {

  const Items = useMemo<Array<any>>(() => {
    if (!tabs) { return []; }
    return tabs.map(t => ({
      key: t.title,
      label: t.title,
      children: (
        <>
          {t.children && (
            t.children.map(it => (
              <SetterPanelRenderer config={it} key={it.key} />
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
          {config.children.map(c => (
            <SetterPanelRenderer config={c} key={c.key} />
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