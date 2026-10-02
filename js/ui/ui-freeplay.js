/* =========================================================
   ui-freeplay.js — Mode Partie libre
   =========================================================
   Rôle : gérer les coups libres, l'historique, les boutons.
   Écoute les événements de l'échiquier via window.APP.Board.
   API : window.APP.UIFreeplay.init(), .onEnter()
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* ---------- Éléments DOM ---------- */
  function statusEl()   { return document.getElementById('status'); }
  function historyEl()  { return document.getElementById('history'); }
  function turnDot()    { return document.getElementById('turn-dot'); }
  function turnLabel()  { return document.getElementById('turn-label'); }
  function overlay()    { return document.getElementById('overlay'); }
  function modalTitle() { return document.getElementById('modal-title'); }
  function modalText()  { return document.getElementById('modal-text'); }

  /* ---------- Affichage ---------- */

  function setStatus(msg, kind) {
    var el = statusEl();
    if (!el) return;
    el.className = 'status' + (kind ? ' ' + kind : '');
    el.textContent = msg;
  }

  function updateTurnIndicator() {
    var game = window.APP.Board.getGame();
    var dot = turnDot();
    var label = turnLabel();
    if (!dot || !label) return;

    if (game.game_over()) {
      dot.classList.remove('black');
      label.classList.remove('check', 'mate', 'draw');
      if (game.in_checkmate()) {
        label.classList.add('mate');
        label.textContent = 'Échec et mat';
      } else if (game.in_stalemate()) {
        label.classList.add('draw');
        label.textContent = 'Pat — match nul';
      } else {
        label.classList.add('draw');
        label.textContent = 'Partie nulle';
      }
      return;
    }

    label.classList.remove('check', 'mate', 'draw');
    if (game.turn() === 'w') {
      dot.classList.remove('black');
      label.textContent = 'Aux Blancs de jouer';
    } else {
      dot.classList.add('black');
      label.textContent = 'Aux Noirs de jouer';
    }
    if (game.in_check()) {
      label.classList.add('check');
      label.textContent += ' — ÉCHEC !';
    }
  }

  function updateHistory() {
    var el = historyEl();
    if (!el) return;
    var game = window.APP.Board.getGame();
    var hist = game.history();

    if (hist.length === 0) {
      el.innerHTML = '<div class="history-empty">Aucun coup joué.</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < hist.length; i += 2) {
      var n = (i / 2) + 1;
      var w = hist[i] || '';
      var b = hist[i + 1] || '';
      html +=
        '<div class="history-row">' +
          '<div class="num">' + n + '.</div>' +
          '<div class="san-w">' + (w || '—') + '</div>' +
          '<div class="san-b">' + (b || '—') + '</div>' +
        '</div>';
    }
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  }

  /* ---------- Modale ---------- */

  function showModal(title, text) {
    var mt = modalTitle();
    var mText = modalText();
    var ov = overlay();
    if (!mt || !mText || !ov) return;
    mt.textContent = title;
    mText.textContent = text;
    ov.classList.add('show');
  }

  /* ---------- Callback onSnapEnd ---------- */

  function onMovePlayed() {
    var game = window.APP.Board.getGame();
    window.APP.Board.position(game.fen(), false);
    window.APP.Board.applyLastMoveHighlight();
    updateTurnIndicator();
    updateHistory();

    var hist = game.history({ verbose: true });
    var last = hist.length > 0 ? hist[hist.length - 1] : null;

    if (!last) return;
    var san = last.san;

    if (game.in_checkmate()) {
      setStatus('Échec et mat ! ' + san, 'error');
      showModal('Échec et mat', last.color === 'w' ? 'Les Blancs gagnent.' : 'Les Noirs gagnent.');
    } else if (game.in_stalemate()) {
      setStatus('Pat — nulle après ' + san, 'warn');
      showModal('Pat', 'Match nul.');
    } else if (game.insufficient_material()) {
      setStatus('Nulle — matériel insuffisant (' + san + ')', 'warn');
      showModal('Nulle', 'Matériel insuffisant pour mater.');
    } else if (game.in_draw()) {
      setStatus('Nulle (' + san + ')', 'warn');
      showModal('Nulle', 'Position nulle.');
    } else if (game.in_check()) {
      setStatus('Échec au roi ' + (game.turn() === 'w' ? 'blanc' : 'noir') + ' après ' + san, 'warn');
    } else {
      setStatus(
        'Coup joué : ' + san + '. ' +
        (game.turn() === 'w' ? 'Aux Blancs.' : 'Aux Noirs.'),
        'ok'
      );
    }
  }

  /* ---------- Boutons ---------- */

  function btnReset() {
    var B = window.APP.Board;
    B.newGame();
    B.clearLastMove();
    B.clearHighlights();
    B.position('start', false);
    B.orientation('white');
    updateTurnIndicator();
    updateHistory();
    setStatus('Nouvelle partie. Position initiale. Aux Blancs.', 'ok');
  }

  function btnFlip() {
    window.APP.Board.flip();
  }

  /* ---------- Init ---------- */

  function bindButtons() {
    var bReset = document.getElementById('btn-reset');
    var bFlip  = document.getElementById('btn-flip');
    var bClose = document.getElementById('modal-close');
    var ov     = overlay();

    if (bReset) bReset.addEventListener('click', btnReset);
    if (bFlip)  bFlip.addEventListener('click', btnFlip);
    if (bClose) bClose.addEventListener('click', function () {
      if (ov) ov.classList.remove('show');
    });
    if (ov) ov.addEventListener('click', function (e) {
      if (e.target === ov) ov.classList.remove('show');
    });
  }

  function init() {
    bindButtons();
    updateTurnIndicator();
    updateHistory();
    setStatus('Position initiale. Aux Blancs.', 'ok');

    /* On enregistre notre callback sur le Board */
    if (window.APP.Board) {
      window.APP.Board.setOnSnapEndHandler(onMovePlayed);
    }
  }

  function onEnter() {
    /* Retour à l'onglet Partie libre : refresh affichage */
    updateTurnIndicator();
    updateHistory();
  }

  /* ---------- API ---------- */

  window.APP.UIFreeplay = {
    init: init,
    onEnter: onEnter,
    updateTurnIndicator: updateTurnIndicator,
    updateHistory: updateHistory,
    setStatus: setStatus
  };
})();
