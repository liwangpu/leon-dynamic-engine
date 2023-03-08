import React, { memo } from 'react';
import styles from './index.module.less';

export const FormBuilder: React.FC = memo(props => {

  return (
    <div className={styles['builder']}>
      form builder
    </div>
  );
});

FormBuilder.displayName = 'FormBuilder';