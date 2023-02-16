import { IDynamicComponentProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../models';
import styles from './index.module.less';

const Text: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = observer(props => {

  const conf = props.configuration;
  return (
    <div className={styles['text']}>
      <label className={styles['text__title']}>{conf.title}</label>
      <div className={styles['text__input']}>
        {conf.placeholder || '请输入文本'}
      </div>
    </div>
  );
});

Text.displayName = 'Text';

export default Text;