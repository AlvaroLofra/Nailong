import React from 'react';
import { Composition } from 'remotion';
import { MainTrailer } from './Main';

export const Root: React.FC = () => {
  return (
    <Composition
      id="NailongTrailer3D"
      component={MainTrailer}
      durationInFrames={732} // 24.4s a 30 fps exactos con el audio TTS
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};
