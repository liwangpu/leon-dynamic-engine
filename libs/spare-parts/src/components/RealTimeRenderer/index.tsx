import styles from './index.module.less';
import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import * as _ from 'lodash';
import { useLocalStorage } from '../../hooks';

export interface IRealTimeRendererRefType {
  setValue: (val: any) => void;
}

export interface IRealTimeRendererProps {
  storageKey: string;
  children?: (val: any) => React.ReactNode;
}

export const RealTimeRenderer: React.MemoExoticComponent<React.ForwardRefExoticComponent<IRealTimeRendererProps & React.RefAttributes<IRealTimeRendererRefType>>> = memo(forwardRef((props, ref) => {

  const container = useRef<HTMLDivElement>();
  const jsoneditor = useRef<any>();
  const { value, setValue } = useLocalStorage(props.storageKey);
  useImperativeHandle(ref, () => ({
    setValue(val: any) {
      jsoneditor.current.update(val);
      setValue(val);
    }
  }));

  useEffect(() => {
    const options = {
      mode: 'code',
      onChangeText: str => {
        try {
          const val = JSON.parse(str);
          setValue(val);
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
    jsoneditor.current.update(value);
  }, [value]);


  return (
    <div className={styles['layout']}>
      <div className={styles['layout__left']}>
        <div className={styles['editor']} ref={container}></div>
      </div>
      <div className={styles['layout__right']}>
        <div className={styles['wrapper']}>
          {props.children ? props.children(value) : null}
        </div>
      </div>
    </div>
  );
}));

RealTimeRenderer.displayName = 'RealTimeRenderer';
