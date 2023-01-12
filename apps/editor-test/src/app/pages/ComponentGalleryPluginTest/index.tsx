import React, { memo, useMemo } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';

const ComponentGalleryPluginTest: React.FC = memo(observer(() => {

  return (
    <div className={styles['component-gallery']}>

    </div>
  );
}));

ComponentGalleryPluginTest.displayName = 'ComponentGalleryPluginTest';

export default ComponentGalleryPluginTest;