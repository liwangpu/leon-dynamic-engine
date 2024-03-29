import styles from './index.module.less';
import { IDynamicComponentProps, useDynamicComponentEngine, useEventCenter } from '@lowcode-engine/core';
import React, { memo, useRef } from 'react';
import { IVideoPlayerComponentConfiguration } from '../../../models';

const VideoPlayer: React.FC<IDynamicComponentProps<IVideoPlayerComponentConfiguration>> = memo(props => {

  const { id, title, vedioUrl, showControl } = props.configuration;
  const { registerAction } = useEventCenter(props.configuration);
  const videoPlayerRef = useRef<any>();

  // const { hierarchyManager } = useDynamicComponentEngine();
  // const parent = hierarchyManager.getParent(id);
  // console.log(`video parent:`, parent);

  registerAction('start', async () => {

  });

  return (
    <div className={styles['video-player']}>
      <p>{title}</p>
      {vedioUrl && (
        <video className={styles['video-player__video']} src={vedioUrl} controls={showControl} ref={videoPlayerRef} muted >
          您的浏览器不支持 video 标签。
        </video>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;