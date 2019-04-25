import WatchJS from 'melanke-watchjs';
import './index.css';

const { watch } = WatchJS;

const hide = element => element.classList.add('hidden');
const show = element => element.classList.remove('hidden');
const showIcon = (element, name) => {
  element.classList = '';
  element.classList.add('fas', name);
};

const app = () => {
  const player = document.querySelector('video');
  const playerOverlay = document.querySelector('.player-overlay');
  const playerControl = document.querySelector('.player-control');
  const playerControlIcon = document.querySelector('.player-control-icon');
  const playerControlMute = document.querySelector('.player-control-mute');
  const playerControlIconMute = document.querySelector('.player-control-icon-mute');
  const playerProgress = document.querySelector('.player-progress');

  player.volume = 0.3;

  const state = {
    playerState: 'loading',
    muted: true,
    currentTime: 0,
  };

  playerOverlay.addEventListener('click', () => {
    if (state.playerState === 'playing') {
      state.playerState = 'paused';
    }
  });

  playerControl.addEventListener('click', () => {
    switch (state.playerState) {
      case ('paused'):
        state.playerState = 'playing';
        break;
      case ('finished'):
        state.playerState = 'playing';
        break;
      default:
    }
  });

  playerControlMute.addEventListener('click', () => {
    state.muted = !state.muted;
  });

  const onVideoReady = () => {
    state.playerState = 'playing';
    player.removeEventListener('canplaythrough', onVideoReady);
  };

  player.addEventListener('canplaythrough', onVideoReady);

  player.addEventListener('ended', () => {
    state.playerState = 'finished';
  });

  player.addEventListener('timeupdate', () => {
    state.currentTime = player.currentTime;
  });

  watch(state, 'playerState', () => {
    console.log(state.playerState);
    switch (state.playerState) {
      case ('paused'):
        show(playerControl);
        showIcon(playerControlIcon, 'fa-play');
        player.pause();
        break;
      case ('playing'):
        hide(playerControl);
        player.play();
        break;
      case ('finished'):
        show(playerControl);
        showIcon(playerControlIcon, 'fa-reply');
        break;
      default:
    }
  });

  watch(state, 'muted', () => {
    if (state.muted) {
      player.muted = true;
      showIcon(playerControlIconMute, 'fa-volume-mute');
    } else {
      player.muted = false;
      showIcon(playerControlIconMute, 'fa-volume-up');
    }
  });

  watch(state, 'currentTime', () => {
    playerProgress.style.width = `${state.currentTime / player.duration * 100}%`;
  });

  if (player.readyState > 3) {
    onVideoReady();
  }
};

app();
