import { IComponentConfiguration, IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { Form, Tabs } from 'antd';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
// import { ISetter, ISetterGroup, ISetterMetadata, ISetterTab, MetadataRegedit, SetterRegedit, SetterType } from '../configureRegedit';
import { ComponentSetterPanelContext, EditorContext } from '@lowcode-engine/editor';
import * as _ from 'lodash';
import { Subject } from 'rxjs';


const DynamicConfigurationForm: React.FC<IComponentConfigurationPanelProps> = memo(props => {

  const setterContext = useContext(ComponentSetterPanelContext);
  const editorContext = useContext(EditorContext);
  // const metadataRef = useRef<ISetterMetadata>();

  return (
    <div>
      配置面板
    </div>
  );
});

DynamicConfigurationForm.displayName = 'DynamicConfigurationForm';

export default DynamicConfigurationForm;