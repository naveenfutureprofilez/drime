/**
 * @see https://developers.google.com/youtube/iframe_api_reference#Playback_controls
 */
export let YoutubeCommand = /*#__PURE__*/function (YoutubeCommand) {
  YoutubeCommand["Play"] = "playVideo";
  YoutubeCommand["Pause"] = "pauseVideo";
  YoutubeCommand["Stop"] = "stopVideo";
  YoutubeCommand["Seek"] = "seekTo";
  YoutubeCommand["Cue"] = "cueVideoById";
  YoutubeCommand["CueAndPlay"] = "loadVideoById";
  YoutubeCommand["Mute"] = "mute";
  YoutubeCommand["Unmute"] = "unMute";
  YoutubeCommand["SetVolume"] = "setVolume";
  YoutubeCommand["SetPlaybackRate"] = "setPlaybackRate";
  YoutubeCommand["SetPlaybackQuality"] = "setPlaybackQuality";
  return YoutubeCommand;
}({});
/**
 * @see https://developers.google.com/youtube/iframe_api_reference#onStateChange
 */
export let YouTubePlayerState = /*#__PURE__*/function (YouTubePlayerState) {
  YouTubePlayerState[YouTubePlayerState["Unstarted"] = -1] = "Unstarted";
  YouTubePlayerState[YouTubePlayerState["Ended"] = 0] = "Ended";
  YouTubePlayerState[YouTubePlayerState["Playing"] = 1] = "Playing";
  YouTubePlayerState[YouTubePlayerState["Paused"] = 2] = "Paused";
  YouTubePlayerState[YouTubePlayerState["Buffering"] = 3] = "Buffering";
  YouTubePlayerState[YouTubePlayerState["Cued"] = 5] = "Cued";
  return YouTubePlayerState;
}({});
export let YouTubePlaybackQuality = /*#__PURE__*/function (YouTubePlaybackQuality) {
  YouTubePlaybackQuality["Unknown"] = "unknown";
  YouTubePlaybackQuality["Tiny"] = "tiny";
  YouTubePlaybackQuality["Small"] = "small";
  YouTubePlaybackQuality["Medium"] = "medium";
  YouTubePlaybackQuality["Large"] = "large";
  YouTubePlaybackQuality["Hd720"] = "hd720";
  YouTubePlaybackQuality["Hd1080"] = "hd1080";
  YouTubePlaybackQuality["Highres"] = "highres";
  YouTubePlaybackQuality["Max"] = "max";
  return YouTubePlaybackQuality;
}({});