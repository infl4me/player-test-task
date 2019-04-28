import WatchJS from 'melanke-watchjs';
import './index.css';

const { watch } = WatchJS;

const hide = (element) => {
  element.dataset.hidden = 'true';
};

const show = (element) => {
  element.dataset.hidden = 'false';
};

const showIcon = (element, name) => {
  element.classList = '';
  element.classList.add('fas', name);
};

const app = () => {
  const player = document.querySelector('video');
  const playerControl = document.querySelector('.player-control');
  const playerControlPause = document.querySelector('.player-control-pause');
  const playerControlIcon = document.querySelector('.player-control-icon');
  const playerControlMute = document.querySelector('.player-control-mute');
  const playerControlIconMute = document.querySelector('.player-control-icon-mute');
  const playerProgressPlay = document.querySelector('.player-progress-play');
  const playerLoadingBox = document.querySelector('.player-loading-box');
  const playerControlVolume = document.querySelector('.player-control-volume');
  // const playerControlsBar = document.querySelector('.player-controls-bar');
  const playerWrap = document.querySelector('.player-wrap');
  const playerControlTime = document.querySelector('.player-control-time');

  const state = {
    playerState: 'loading',
    muted: true,
    currentTime: 0,
    seekTime: null,
    controlsShown: false,
    volume: 0.2,
    controlsState: {
      shown: false,
      timerId: null,
    },
  };

  const onVideoReady = () => {
    state.playerState = 'playing';
    player.removeEventListener('canplaythrough', onVideoReady);
  };
  player.addEventListener('canplaythrough', onVideoReady);

  playerWrap.addEventListener('mousemove', () => {
    if (state.playerState !== 'playing') return;
    state.controlsState.shown = true;

    clearTimeout(state.controlsState.timerId);

    state.controlsState.timerId = setTimeout(() => {
      if (state.playerState === 'playing') {
        state.controlsState.shown = false;
      }
    }, 3000);
  });

  playerWrap.addEventListener('mouseleave', () => {
    if (state.playerState !== 'playing') return;
    state.controlsState.shown = false;
    clearTimeout(state.controlsState.timerId);
  });

  playerControlPause.addEventListener('click', () => {
    if (state.playerState === 'playing') {
      state.playerState = 'paused';
      state.controlsState.shown = true;
    }
  });

  playerControl.addEventListener('click', () => {
    switch (state.playerState) {
      case ('paused'):
      case ('finished'):
        state.playerState = 'playing';
        state.controlsState.shown = false;
        break;
      default:
    }
  });

  player.addEventListener('ended', () => {
    state.playerState = 'finished';
    state.controlsState.shown = true;
  });

  playerControlMute.addEventListener('click', () => {
    state.muted = !state.muted;
  });

  playerControlVolume.addEventListener('input', (e) => {
    const volume = Number(e.target.value);

    state.muted = volume === 0;
    state.volume = volume;
  });

  player.addEventListener('timeupdate', (e) => {
    state.currentTime = Number(e.target.currentTime);
  });

  playerControlTime.addEventListener('change', (e) => {
    console.log(e.target.value, 'input');
    // const currentTimePercent = Number(e.target.value);
    state.seekTime = Number(e.target.value);
  });

  watch(state, 'playerState', () => {
    switch (state.playerState) {
      case ('paused'):
        show(playerControl);
        showIcon(playerControlIcon, 'fa-play');
        player.pause();
        break;
      case ('playing'):
        hide(playerControl);
        hide(playerLoadingBox);
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
    const currentTimePercent = state.currentTime / player.duration * 100;
    playerProgressPlay.style.transform = `translateX(${currentTimePercent}%)`;
    // playerControlTime.value = currentTimePercent;
  });

  watch(state, 'seekTime', () => {
    const currentTime = state.seekTime * player.duration / 100;
    player.currentTime = currentTime;
  });

  watch(state, 'volume', () => {
    player.volume = state.volume;
  });

  watch(state.controlsState, 'shown', () => {
    console.log(state.controlsState.shown, state.playerState);
    // if (!state.controlsState.shown && state.playerState === 'playing') {
    //   hide(playerWrap);
    //   return;
    // }
    show(playerWrap);
  });

  if (player.readyState > 3) {
    onVideoReady();
  }
};

app();
