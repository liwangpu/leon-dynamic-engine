import React, { memo } from 'react';
import styles from './index.module.less';

const FormBuilder: React.FC = memo(props => {

  return (
    <div className={styles['builder']}>
      
    </div>
  );
});

FormBuilder.displayName = 'FormBuilder';