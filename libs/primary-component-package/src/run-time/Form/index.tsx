import { IDynamicComponentProps } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../models';
import styles from './index.module.less';

const Form: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = memo(observer(props => {

  const conf = props.configuration;

  return (
    <div className={styles['form']} data-dynamic-component={conf.id}>
      <p>表单</p>
    </div>
  );
}));

Form.displayName = 'Form';

export default Form;