import styles from './index.module.less';
import React, { memo } from 'react';

const EditorPluginDojo: React.FC<any> = memo(props => {

  return (
    <div className={styles['dojo']}>
      {props.children}
    </div>
  );
});

EditorPluginDojo.displayName = 'EditorPluginDojo';

export default EditorPluginDojo;