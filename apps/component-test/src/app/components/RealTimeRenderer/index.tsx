import styles from './index.module.less';
import React, { useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Renderer } from '@lowcode-engine/renderer';
import { ComponentPackageContext } from '../../contexts';
import { IComponentConfiguration } from '@lowcode-engine/core';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import * as _ from 'lodash';

export interface IRealTimeRendererProps {
  value: IComponentConfiguration;
  onChange: (val: { [key: string]: any }) => void;
}

const RealTimeRenderer: React.FC<IRealTimeRendererProps> = observer(props => {

  const packages = useContext(ComponentPackageContext);
  const container = useRef<HTMLDivElement>();
  const jsoneditor = useRef<any>();
  const latestJson = useRef<any>();

  useEffect(() => {
    const options = {
      mode: 'code',
      onChangeText: str => {
        try {
          latestJson.current = JSON.parse(str);
          props.onChange(latestJson.current);
        } catch (error) {
          //
        }
      }
    };
    jsoneditor.current = new JSONEditor(container.current, options);
    return () => {
      jsoneditor.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (!jsoneditor.current) { return; }
    if (_.isEqual(props.value, latestJson.current)) {
      return;
    }
    jsoneditor.current.update(props.value);
  }, [props.value]);


  return (
    <div className={styles['layout']}>
      <div className={styles['layout__left']}>
        <div className={styles['editor']} ref={container}></div>
      </div>
      <div className={styles['layout__right']}>
        <div className={styles['wrapper']}>
          {/* <Renderer packages={packages} /> */}
        </div>
      </div>
    </div>
  );
});

RealTimeRenderer.displayName = 'RealTimeRenderer';

export default RealTimeRenderer;