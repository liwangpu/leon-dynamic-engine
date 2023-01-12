import React, { memo, useMemo } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';

const ModelGalleryPluginTest: React.FC = memo(observer(() => {

  return (
    <div className={styles['model-gallery']}>

    </div>
  );
}));

ModelGalleryPluginTest.displayName = 'ModelGalleryPluginTest';

export default ModelGalleryPluginTest;