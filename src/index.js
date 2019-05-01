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
  const playerProgressBar = document.querySelector('.player-progress-bar');
  const playerWrap = document.querySelector('.player-wrap');
  const playerProgressThumb = document.querySelector('.player-progress-thumb');

  const state = {
    playerState: 'loading',
    muted: true,
    volume: 0.2,
    controlsState: {
      shown: false,
      timerId: null,
    },
    timeState: 'normal',
    currentTime: 0,
    skipAheadPosX: 0,
  };

  const hideControlsWithTimeout = () => {
    clearTimeout(state.controlsState.timerId);

    state.controlsState.timerId = setTimeout(() => {
      if (state.playerState === 'playing' && state.timeState !== 'seeking') {
        state.controlsState.shown = false;
      }
    }, 3000);
  };

  const onVideoReady = () => {
    state.playerState = 'playing';
    player.removeEventListener('canplaythrough', onVideoReady);
  };
  player.addEventListener('canplaythrough', onVideoReady);

  playerWrap.addEventListener('mousemove', () => {
    if (state.playerState !== 'playing') {
      return;
    }
    state.controlsState.shown = true;
    hideControlsWithTimeout();
  });

  playerWrap.addEventListener('mouseleave', () => {
    if (state.playerState !== 'playing' || state.timeState === 'seeking') {
      return;
    }
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
    if (state.timeState !== 'normal') {
      return;
    }
    state.currentTime = Number(e.target.currentTime);
  });

  const onSliderDrag = type => (e) => {
    state.timeState = 'seeking';

    const onThumbDrag = (event) => {
      if (type === 'mouse') {
        state.skipAheadPosX = event.pageX;
      }
      if (type === 'touch') {
        state.skipAheadPosX = event.touches[0].pageX;
      }
    };

    onThumbDrag(e);

    const moveEventType = type === 'mouse' ? 'mousemove' : 'touchmove';
    document.addEventListener(moveEventType, onThumbDrag);

    const endEventType = type === 'mouse' ? 'onmouseup' : 'ontouchend';
    document[endEventType] = () => {
      document.removeEventListener(moveEventType, onThumbDrag);
      state.timeState = 'normal';
      hideControlsWithTimeout();
      document[endEventType] = null;
    };
  };

  playerProgressBar.addEventListener('mousedown', onSliderDrag('mouse'));
  playerProgressBar.addEventListener('touchstart', onSliderDrag('touch'));

  watch(state, 'currentTime', () => {
    if (state.timeState !== 'normal') {
      return;
    }
    const currentTimePercent = state.currentTime / player.duration * 100;
    const thumbOffset = playerProgressBar.offsetWidth * currentTimePercent / 100;
    playerProgressThumb.style.transform = `translateX(${thumbOffset}px)`;
    playerProgressPlay.style.transform = `scaleX(${currentTimePercent / 100})`;
  });

  watch(state, 'skipAheadPosX', () => {
    if (state.timeState !== 'seeking') {
      return;
    }
    const x = state.skipAheadPosX - playerProgressBar.offsetLeft;
    let thumbNormalizedX = x;
    if (x > playerProgressBar.offsetWidth) {
      thumbNormalizedX = playerProgressBar.offsetWidth;
    } else if (x < 0) {
      thumbNormalizedX = 0;
    }
    playerProgressThumb.style.transform = `translateX(${thumbNormalizedX}px)`;
    playerProgressPlay.style.transform = `scaleX(${thumbNormalizedX / playerProgressBar.offsetWidth})`;
    const pointXPercent = thumbNormalizedX / playerProgressBar.offsetWidth * 100;
    player.currentTime = (pointXPercent) * player.duration / 100;
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

  watch(state, 'volume', () => {
    player.volume = state.volume;
  });

  watch(state.controlsState, 'shown', () => {
    console.log(state.controlsState.shown, state.playerState);
    if (!state.controlsState.shown && state.playerState === 'playing') {
      hide(playerWrap);
      return;
    }
    show(playerWrap);
  });

  if (player.readyState > 3) {
    onVideoReady();
  }
};

app();
