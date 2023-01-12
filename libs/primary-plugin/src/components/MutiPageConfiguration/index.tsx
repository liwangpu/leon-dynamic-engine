import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { memo, useContext } from 'react';
import React from 'react';

const MutiPageConfiguration: React.FC = memo(observer(() => {

  return (
    <div className={styles['multi-page-configuration']}>

    </div>
  );
}));

MutiPageConfiguration.displayName = 'MutiPageConfiguration';

export default MutiPageConfiguration;