import styles from './index.module.less';
import { IDynamicComponentProps, useDynamicComponentEngine, useEventCenter } from '@lowcode-engine/core';
import React, { memo, useRef } from 'react';
import { IImageViewerComponentConfiguration } from '../../../models';

const VideoPlayer: React.FC<IDynamicComponentProps<IImageViewerComponentConfiguration>> = memo(props => {

  const { title, imageUrl } = props.configuration;
  console.log(`image view conf:`, props.configuration);

  return (
    <div className={styles['image-viewer']}>
      <p className={styles['image-viewer__title']}>{title}</p>
      <div className={styles['image-viewer__image']}>
        {imageUrl && (
          <img src={imageUrl} />
        )}
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;