const checkVideo = (props) => {
  cy.get('video')
    .should(($el) => {
      Object.entries(props)
        .forEach(([key, value]) => expect($el).to.have.prop(key, value));
    });
};

const checkPlayerControl = (name) => {
  cy.get('.player-control')
    .should('be.visible')
    .find('.fas')
    .should('have.class', name);
};

const checkPlayerControlMute = (name) => {
  cy.get('.player-control-mute')
    .find('.fas')
    .should('have.class', name);
};

const fastSeek = (timePercent) => {
  cy.get('video')
    .then(([el]) => {
      const { duration } = el;
      el.currentTime = duration * (timePercent / 100);
    });
};

const checkProgressBar = () => {
  cy.get('video')
    .then(([video]) => {
      const { currentTime, duration } = video;
      const currentTimePercent = (currentTime / duration * 100).toFixed(3);
      cy.get('.player-progress-play')
        .should(($el) => {
          const regexp = /[0-9]+\.?[0-9]*/;
          const stringifiedWidth = ($el[0].style.transform).match(regexp);
          const width = Number(stringifiedWidth).toFixed(3);
          expect(width).to.be.equal((currentTimePercent / 100).toFixed(3));
        });
    });
};

describe('test', () => {
  beforeEach(() => {
    const local = 'http://localhost:8080/';
    // const prod = 'http://test-player.surge.sh/';
    cy.visit(local);
  });

  it('check player', () => {
    context('play control', () => {
      checkVideo({ paused: false, muted: true });

      cy.get('.player-control')
        .should('not.be.visible');

      cy.get('.player-control-pause')
        .click();

      checkPlayerControl('fa-play');
    });


    context('mute control', () => {
      checkPlayerControlMute('fa-volume-mute');
      cy.get('.player-control-mute')
        .click({ force: true });
      checkPlayerControlMute('fa-volume-up');
    });


    context('replay control', () => {
      checkVideo({ paused: true, muted: false });

      cy.get('.player-control')
        .click()
        .should('not.be.visible');

      fastSeek(100);

      checkVideo({ ended: true });
      checkPlayerControl('fa-reply');

      cy.get('.player-control')
        .click()
        .should('not.be.visible');

      checkVideo({ paused: false });
    });


    context('progress bar', () => {
      cy.get('.player-control-pause')
        .click();

      fastSeek(0);
      checkProgressBar();

      fastSeek(37.178);
      checkProgressBar();

      fastSeek(68.788);
      checkProgressBar();

      fastSeek(100);
      checkProgressBar();
    });
  });
});
