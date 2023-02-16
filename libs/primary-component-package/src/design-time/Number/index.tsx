import React from 'react';
import { IDynamicComponentProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import { INumberComponentConfiguration } from '../../models';
import styles from './index.module.less';

const NumberField: React.FC<IDynamicComponentProps<INumberComponentConfiguration>> = observer(props => {

  const conf = props.configuration;

  return (
    <div className={styles['number']}>
      <label className={styles['number__title']}>{conf.title}</label>
      <div className={styles['number__input']}>
        {conf.placeholder || '请输入数字'}
      </div>
    </div>
  );
});

NumberField.displayName = 'NumberField';

export default NumberField;