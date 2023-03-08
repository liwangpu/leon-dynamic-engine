import styles from './index.module.less';
import React, { memo, useEffect, useRef } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import * as _ from 'lodash';
import { FormBuilder } from '@lowcode-engine/dynamic-form';

export interface IRealTimeRendererProps {
  value: any;
  onChange?: (val: { [key: string]: any }) => void;
}

const RealTimeRenderer: React.FC<IRealTimeRendererProps> = memo(props => {

  const container = useRef<HTMLDivElement>();
  const jsoneditor = useRef<any>();
  const latestJson = useRef<any>();

  useEffect(() => {
    const options = {
      mode: 'code',
      onChangeText: str => {
        try {
          latestJson.current = JSON.parse(str);
          if (_.isFunction(props.onChange)) {
            props.onChange(latestJson.current);
          }
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
          <FormBuilder />
        </div>
      </div>
    </div>
  );
});

RealTimeRenderer.displayName = 'RealTimeRenderer';

export default RealTimeRenderer;