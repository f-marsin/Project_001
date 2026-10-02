/* =========================================================
   ui-game-review.js — Vue Revue (v1.1.1)
   Ajout : affichage du temps écoulé pendant l'analyse.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var state = {
    analyzing: false,
    progress: { current: 0, total: 0 },
    result: null,
    currentMoveIndex: null,
    depth: 12,
    pgn: '',
    startTime: null,
    timerHandle: null
  };

  function contentEl() { return document.getElementById('game-review-content'); }

  function render() {
    if (!state.result && !state.analyzing) renderForm();
    else if (state.analyzing) renderProgress();
    else renderResult();
  }

  function renderForm() {
    var el = contentEl();
    if (!el) return;

    el.innerHTML =
      '<h2>Revue de partie</h2>' +
      '<div class="analysis-form">' +
        '<label for="review-pgn">Colle ton PGN (depuis Lichess, Chess.com…)</label>' +
        '<textarea id="review-pgn" rows="6" ' +
                  'placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 ...">' +
          (state.pgn || '') +
        '</textarea>' +
        '<label for="review-depth">Profondeur d\'analyse</label>' +
        '<select id="review-depth">' +
          '<option value="10"' + (state.depth === 10 ? ' selected' : '') + '>10 (rapide, ~0.5s/coup)</option>' +
          '<option value="12"' + (state.depth === 12 ? ' selected' : '') + '>12 (recommandé, ~1s/coup)</option>' +
          '<option value="15"' + (state.depth === 15 ? ' selected' : '') + '>15 (précis, ~2s/coup)</option>' +
          '<option value="18"' + (state.depth === 18 ? ' selected' : '') + '>18 (très précis, ~4s/coup)</option>' +
        '</select>' +
        '<div class="btn-row" style="margin-top:12px;">' +
          '<button id="btn-start-review" type="button" class="primary">🔬 Analyser la partie</button>' +
        '</div>' +
      '</div>' +
      '<div class="analysis-result" id="review-result">' +
        '<p class="text-dim">Colle un PGN puis lance l\'analyse.</p>' +
      '</div>';

    bindForm();
  }

  function renderProgress() {
    var el = contentEl();
    if (!el) return;

    var pct = state.progress.total > 0
      ? Math.round((state.progress.current / state.progress.total) * 100)
      : 0;

    var elapsed = state.startTime
      ? Math.round((Date.now() - state.startTime) / 1000)
      : 0;

    /* Estimation du temps restant */
    var etaText = '';
    if (state.progress.current > 0 && state.progress.total > 0) {
      var avgPerMove = elapsed / state.progress.current;
      var remaining = Math.round((state.progress.total - state.progress.current) * avgPerMove);
      if (remaining > 0) {
        var min = Math.floor(remaining / 60);
        var sec = remaining % 60;
        etaText = ' — reste ~' + (min > 0 ? min + ' min ' : '') + sec + ' s';
      }
    }

    el.innerHTML =
      '<h2>Analyse en cours…</h2>' +
      '<div class="analysis-form">' +
        '<div class="review-progress-bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        '<p class="text-dim" style="margin-top:8px;">' +
          'Coup ' + state.progress.current + ' / ' + state.progress.total + ' — ' + pct + '%' +
          '<br>Temps écoulé : ' + elapsed + ' s' + etaText +
        '</p>' +
        '<div class="btn-row">' +
          '<button id="btn-cancel-review" type="button">⏹ Annuler</button>' +
        '</div>' +
      '</div>';

    var bCancel = document.getElementById('btn-cancel-review');
    if (bCancel) bCancel.addEventListener('click', cancelReview);
  }

  function renderResult() {
    var el = contentEl();
    if (!el || !state.result) return;

    var s = state.result.summary;
    var moves = state.result.moves;

    var html =
      '<h2>Résultat de la revue</h2>' +
      '<div class="review-summary">' +
        '<div class="summary-row">' +
          '<span class="sum-item best">🌟 ' + s.best + ' excellents</span>' +
          '<span class="sum-item good">✅ ' + s.good + ' bons</span>' +
        '</div>' +
        '<div class="summary-row">' +
          '<span class="sum-item inaccuracy">⚠️ ' + s.inaccuracy + ' imprécisions</span>' +
          '<span class="sum-item mistake">❌ ' + s.mistake + ' erreurs</span>' +
        '</div>' +
        '<div class="summary-row">' +
          '<span class="sum-item blunder">❌❌ ' + s.blunder + ' gaffes</span>' +
          '<span class="sum-item dim">Profondeur ' + s.depth + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="btn-row">' +
        '<button id="btn-new-review" type="button">🔄 Nouvelle analyse</button>' +
      '</div>' +
      '<h2 style="margin-top:20px;">Coups</h2>' +
      '<div class="review-moves" id="review-moves">';

    for (var i = 0; i < moves.length; i++) {
      var m = moves[i];
      var side = m.color === 'w' ? 'san-w' : 'san-b';
      var numLabel = m.color === 'w' ? m.moveNumber + '.' : m.moveNumber + '…';

      html +=
        '<div class="review-move ' + m.classification + '" ' +
             'data-move-index="' + i + '">' +
          '<span class="move-num">' + numLabel + '</span>' +
          '<span class="move-san ' + side + '">' + m.san + '</span>' +
          '<span class="move-emoji">' + m.emoji + '</span>' +
          '<span class="move-label">' + m.label + '</span>' +
        '</div>';
    }

    html += '</div>';
    html += '<div id="review-detail-container"></div>';

    el.innerHTML = html;

    var bNew = document.getElementById('btn-new-review');
    if (bNew) bNew.addEventListener('click', resetReview);

    var container = document.getElementById('review-moves');
    if (container) container.addEventListener('click', onMoveClick);
  }

  function bindForm() {
    var bStart = document.getElementById('btn-start-review');
    if (bStart) bStart.addEventListener('click', startReview);
  }

  function startTimer() {
    stopTimer();
    state.startTime = Date.now();
    state.timerHandle = setInterval(function () {
      if (state.analyzing) renderProgress();
    }, 1000);
  }

  function stopTimer() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function startReview() {
    var pgnEl = document.getElementById('review-pgn');
    var depthEl = document.getElementById('review-depth');
    if (!pgnEl) return;

    var pgn = pgnEl.value.trim();
    if (!pgn) { alert('Colle un PGN d\'abord.'); return; }

    var depth = depthEl ? parseInt(depthEl.value, 10) : 12;

    window.APP.StockfishAnalysis.clearCache();

    state.pgn = pgn;
    state.depth = depth;
    state.analyzing = true;
    state.progress = { current: 0, total: 0 };
    state.result = null;

    render();
    startTimer();

    window.APP.GameReview.analyze(pgn, { depth: depth }, function (current, total) {
      state.progress.current = current;
      state.progress.total = total;
      if (state.analyzing) renderProgress();
    })
      .then(function (result) {
        state.analyzing = false;
        state.result = result;
        stopTimer();
        render();
      })
      .catch(function (err) {
        state.analyzing = false;
        stopTimer();
        alert('Erreur d\'analyse : ' + err.message);
        render();
      });
  }

  function cancelReview() {
    state.analyzing = false;
    stopTimer();
    window.APP.GameReview.cancel();
    render();
  }

  function resetReview() {
    state.result = null;
    state.currentMoveIndex = null;
    stopTimer();
    window.APP.StockfishAnalysis.clearCache();
    render();
  }

  function onMoveClick(e) {
    var el = e.target.closest('[data-move-index]');
    if (!el || !state.result) return;

    var idx = parseInt(el.getAttribute('data-move-index'), 10);
    var move = state.result.moves[idx];
    if (!move) return;

    state.currentMoveIndex = idx;

    window.APP.Board.setLessonMode(true);
    window.APP.Board.position(move.fenAfter, false);

    var fromTo = extractFromTo(move.fen, move.san);
    if (fromTo) {
      window.APP.Board.highlightSquares(fromTo.from, fromTo.to);
    } else {
      window.APP.Board.clearHighlights();
    }

    var all = document.querySelectorAll('.review-move');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
    el.classList.add('selected');

    showMoveDetail(move);
  }

  function extractFromTo(fen, san) {
    if (!fen || !san) return null;
    try {
      var g = new Chess(fen);
      var move = g.move(san);
      if (!move) return null;
      return { from: move.from, to: move.to };
    } catch (err) { return null; }
  }

  function showMoveDetail(move) {
    var container = document.getElementById('review-detail-container');
    if (!container) return;

    container.innerHTML =
      '<div class="review-detail" id="review-detail">' +
        '<div class="detail-title">' + move.emoji + ' Coup ' + move.moveNumber +
          (move.color === 'w' ? ' Blancs' : ' Noirs') + ' : ' + move.san + '</div>' +
        '<div class="detail-row"><strong>Meilleur coup :</strong> ' +
          (move.bestMoveSan || move.bestMove || '—') + '</div>' +
        '<div class="detail-row"><strong>Évaluation avant :</strong> ' + move.evalBeforeText + '</div>' +
        '<div class="detail-row"><strong>Évaluation après :</strong> ' + move.evalAfterText + '</div>' +
        '<div class="detail-row"><strong>Perte :</strong> ' +
          (move.lossCp > 0 ? '+' + (move.lossCp / 100).toFixed(2) : '0.00') + '</div>' +
        '<div class="detail-row"><strong>Ligne principale :</strong> ' +
          (move.pvSan && move.pvSan.length ? move.pvSan.slice(0, 6).join(' ') : '—') + '</div>' +
      '</div>';
  }

  function init() { render(); }
  function onEnter() {}

  window.APP.UIGameReview = { init: init, onEnter: onEnter };
})();
