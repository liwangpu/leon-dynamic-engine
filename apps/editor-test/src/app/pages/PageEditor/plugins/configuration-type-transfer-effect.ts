import { EditorPluginRegister } from '@lowcode-engine/editor';
import { ComponentTypes as VideoPlayerComponentTypes, IVideoPlayerComponentConfiguration } from '../../../packages/video-player';

export function ConfigurationTypeTransferEffectPluginRegister(): EditorPluginRegister {

  return ({ configurationTypeTransferEffect }) => {
    return {
      init() {
        // configurationTypeTransferEffect.registerHandler({ destType: VideoPlayerComponentTypes.videoPlayer }, ({ current }: { current: IVideoPlayerComponentConfiguration }) => {
        //   current.vedioUrl = 'https://www.runoob.com/try/demo_source/movie.ogg';
        //   return current;
        // });
      }
    };
  };
}