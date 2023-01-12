/**
 * 数字输入框
 * @author Goku<xu.pan01@going-link.com>
 * @date:2022-12-09
 */
import React, { memo } from 'react';
import { IDynamicComponentProps } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import { INumberComponentConfiguration } from '../../models';
import styles from './index.module.less';

const NumberField: React.FC<IDynamicComponentProps<INumberComponentConfiguration>> = memo(observer(props => {

  const conf = props.configuration;

  return (
    <div className={styles['number']} data-dynamic-component={conf.id}>
      <label className={styles['number__title']}>{conf.title}</label>
      <div className={styles['number__input']}>
        {conf.placeholder || '请输入数字'}
      </div>
    </div>
  );
}));

NumberField.displayName = 'NumberField';

export default NumberField;