/* =========================================================
   ui-analysis.js — Vue « Analyse »
   =========================================================
   Rôle : charger une position, lancer une analyse Stockfish,
   afficher l'évaluation et la ligne principale.

   API : window.APP.UIAnalysis.init(), .onEnter()
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var state = {
    loaded: false,
    analyzing: false,
    lastResult: null,
    currentFen: null
  };

  /* ---------- DOM ---------- */

  function contentEl() { return document.getElementById('analysis-content'); }

  /* ---------- Rendu ---------- */

  function render() {
    var el = contentEl();
    if (!el) return;

    var html =
      '<h2>Analyse de position</h2>' +
      '<div class="analysis-form">' +
        '<label for="analysis-fen">Position FEN</label>' +
        '<textarea id="analysis-fen" rows="3" ' +
                  'placeholder="Colle ici une FEN (ex: rnbqkbnr/pppppppp/... w KQkq - 0 1)">' +
          (state.currentFen || '') +
        '</textarea>' +
        '<div class="btn-row">' +
          '<button id="btn-load-fen" type="button">📋 Charger la FEN</button>' +
          '<button id="btn-load-current" type="button">♟ Position actuelle</button>' +
        '</div>' +
        '<div class="btn-row">' +
          '<button id="btn-analyze" type="button" class="primary">🔬 Analyser</button>' +
          '<button id="btn-stop" type="button">⏹ Arrêter</button>' +
        '</div>' +
      '</div>' +
      '<div class="analysis-result" id="analysis-result">' +
        '<p class="text-dim">Charge une position puis lance l\'analyse.</p>' +
      '</div>';

    el.innerHTML = html;
    bindActions();
  }

  function renderResult(result) {
    var el = document.getElementById('analysis-result');
    if (!el) return;

    if (!result) {
      el.innerHTML = '<p class="text-dim">Aucun résultat.</p>';
      return;
    }

    var pvSan = result.pvSan && result.pvSan.length > 0
      ? result.pvSan.slice(0, 6).join(' ')
      : '—';

    var cached = result.cached ? ' <span class="text-dim">(cache)</span>' : '';

    el.innerHTML =
      '<div class="analysis-eval">' +
        '<span class="eval-label">Évaluation</span>' +
        '<span class="eval-value">' + result.evaluationText + '</span>' +
      '</div>' +
      '<div class="analysis-meta">' +
        'Profondeur ' + result.depth + cached +
      '</div>' +
      '<div class="analysis-bestmove">' +
        '<span class="label">Meilleur coup : </span>' +
        '<span class="move">' + (result.bestMoveSan || result.bestMove || '—') + '</span>' +
      '</div>' +
      '<div class="analysis-pv">' +
        '<span class="label">Ligne principale : </span>' +
        '<span class="mono">' + pvSan + '</span>' +
      '</div>';
  }

  function renderLoading() {
    var el = document.getElementById('analysis-result');
    if (!el) return;
    el.innerHTML =
      '<div class="analysis-loading">' +
        '<span class="spinner"></span>' +
        ' Analyse en cours…' +
      '</div>';
  }

  function renderError(msg) {
    var el = document.getElementById('analysis-result');
    if (!el) return;
    el.innerHTML = '<div class="feedback show ko">' + msg + '</div>';
  }

  /* ---------- Actions ---------- */

  function bindActions() {
    var bLoadFen = document.getElementById('btn-load-fen');
    var bLoadCurrent = document.getElementById('btn-load-current');
    var bAnalyze = document.getElementById('btn-analyze');
    var bStop = document.getElementById('btn-stop');

    if (bLoadFen) bLoadFen.addEventListener('click', loadFen);
    if (bLoadCurrent) bLoadCurrent.addEventListener('click', loadCurrentBoard);
    if (bAnalyze) bAnalyze.addEventListener('click', runAnalysis);
    if (bStop) bStop.addEventListener('click', stopAnalysis);
  }

  function loadFen() {
    var el = document.getElementById('analysis-fen');
    if (!el) return;
    var fen = el.value.trim();
    if (!fen) { renderError('FEN vide.'); return; }

    var valid = window.APP.Board.validateFen(fen);
    if (!valid.valid) {
      renderError('FEN invalide : ' + (valid.error || 'inconnue'));
      return;
    }

    state.currentFen = fen;
    window.APP.Board.position(fen, false);
    window.APP.Board.setLessonMode(true);
    renderError('Position chargée. Clique sur Analyser.');
  }

  function loadCurrentBoard() {
    var game = window.APP.Board.getGame();
    var fen = game.fen();
    state.currentFen = fen;
    var el = document.getElementById('analysis-fen');
    if (el) el.value = fen;
    renderError('Position actuelle chargée.');
  }

  function runAnalysis() {
    if (state.analyzing) return;

    var fen = state.currentFen;
    if (!fen) {
      var el = document.getElementById('analysis-fen');
      fen = el ? el.value.trim() : null;
      state.currentFen = fen;
    }
    if (!fen) { renderError('Aucune position à analyser.'); return; }

    var valid = window.APP.Board.validateFen(fen);
    if (!valid.valid) {
      renderError('FEN invalide : ' + (valid.error || 'inconnue'));
      return;
    }

    state.analyzing = true;
    renderLoading();

    window.APP.StockfishAnalysis.analyze(fen, { depth: 15 })
      .then(function (result) {
        state.analyzing = false;
        state.lastResult = result;
        renderResult(result);
      })
      .catch(function (err) {
        state.analyzing = false;
        renderError('Analyse impossible : ' + err.message);
      });
  }

  function stopAnalysis() {
    if (!state.analyzing) return;
    window.APP.Stockfish.stop();
    state.analyzing = false;
    renderError('Analyse arrêtée.');
  }

  /* ---------- Cycle de vie ---------- */

  function init() {
    render();
  }

  function onEnter() {
    /* Rien de spécial pour l'instant */
  }

  window.APP.UIAnalysis = {
    init: init,
    onEnter: onEnter
  };
})();
