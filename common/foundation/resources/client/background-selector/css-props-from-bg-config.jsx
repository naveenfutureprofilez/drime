export function cssPropsFromBgConfig(bgConfig) {
  if (bgConfig) {
    return {
      backgroundImage: bgConfig.backgroundImage,
      backgroundColor: bgConfig.backgroundColor,
      backgroundAttachment: bgConfig.backgroundAttachment,
      backgroundSize: bgConfig.backgroundSize,
      backgroundRepeat: bgConfig.backgroundRepeat,
      backgroundPosition: bgConfig.backgroundPosition,
      color: bgConfig.color
    };
  }
}