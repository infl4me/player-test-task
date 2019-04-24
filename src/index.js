import WatchJS from 'melanke-watchjs';
import './index.css';

const { watch } = WatchJS;

const hide = element => element.classList.add('hidden');
const show = element => element.classList.remove('hidden');

const app = () => {
  const player = document.querySelector('video');
  const playerOverlay = document.querySelector('.player-overlay');
  const playerControlIcon = document.querySelector('.player-control-icon');
  const playerControl = document.querySelector('.player-control');

  const showIcon = (name) => {
    playerControlIcon.classList = '';
    playerControlIcon.classList.add('fas', name);
  };

  const state = {
    playerState: 'playing',
    muted: false,
  };

  playerOverlay.addEventListener('click', () => {
    state.playerState = 'paused';
  });

  playerControl.addEventListener('click', (e) => {
    e.stopPropagation();
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

  player.addEventListener('ended', () => {
    state.playerState = 'finished';
  });

  watch(state, 'playerState', () => {
    console.log(state.playerState);
    switch (state.playerState) {
      case ('paused'):
        show(playerControl);
        showIcon('fa-play');
        player.pause();
        break;
      case ('playing'):
        hide(playerControl);
        player.play();
        break;
      case ('finished'):
        show(playerControl);
        showIcon('fa-reply');
        break;
      default:
    }
  });
};

app();
