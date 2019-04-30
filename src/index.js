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
  const playerProgressBar = document.querySelector('.player-progress-bar');
  const playerWrap = document.querySelector('.player-wrap');
  const playerControlTime = document.querySelector('.player-control-time');
  const playerProgressThumb = document.querySelector('.player-progress-thumb');
  const sheet = window.document.styleSheets[0];

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
    seekTime: null,
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

  playerProgressBar.addEventListener('click', (e) => {
    const pos = (e.pageX - e.target.offsetLeft) / e.target.offsetWidth;
    // video.currentTime = pos * video.duration;

    console.log(pos, 'pos');
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
    const currentTimePercent = Number(e.target.currentTime) / player.duration * 100;
    state.currentTime = currentTimePercent;
  });

  playerControlTime.addEventListener('input', (e) => {
    state.timeState = 'seeking';
    state.currentTime = Number(e.target.value);
  });

  playerControlTime.addEventListener('change', () => {
    setTimeout(() => {
      state.timeState = 'normal';
    }, 0);
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

  const style = `.player-control-time::-webkit-slider-thumb {
position: absolute;
transform: translate(-50%, -50%);
width: 12px;
height: 12px;
border-radius: 50%;
background-color: #fff;
}`;
  const ruleId = sheet.insertRule(style);
  const playerTimeThumbStyles = sheet.rules[ruleId].style;

  watch(state, 'currentTime', () => {
    // const currentTimePercent = state.currentTime / player.duration * 100;
    // playerProgressPlay.style.transform = `translateX(${currentTimePercent}%)`;
    // playerProgressPlay.style.width = `${state.currentTime}%`;
    console.log('WATCHER CURRENT TIME', '<<<>>>', state.timeState, '<<<>>>', state.currentTime);
    switch (state.timeState) {
      case ('normal'):
        playerProgressPlay.style.width = `${state.currentTime}%`;
        playerTimeThumbStyles.left = `${state.currentTime}%`;
        break;
      case ('seeking'): {
        const currentTime = state.currentTime * player.duration / 100;
        player.currentTime = currentTime;
        playerControlTime.value = state.currentTime;
        playerProgressPlay.style.width = `${state.currentTime}%`;
        playerTimeThumbStyles.left = `${state.currentTime}%`;
        break;
      }
      default:
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
