/* =========================================================
   stockfish-game-review.js — Analyse d'une partie (v1.1.1)
   Ajout : gestion de timeout global dynamique + annulation
   propre de l'analyse en cours.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var MAX_GLOBAL_TIMEOUT_MS = 30 * 60 * 1000; /* plafond : 30 minutes */
  var cancelled = false;

  function evalToCp(evaluation) {
    if (!evaluation) return 0;
    if (evaluation.type === 'cp') return evaluation.value;
    if (evaluation.type === 'mate') {
      var sign = evaluation.value > 0 ? 1 : -1;
      return sign * 100000;
    }
    return 0;
  }

  function calculateLoss(evalBefore, evalAfter, turn) {
    var cpBefore = evalToCp(evalBefore);
    var cpAfter = evalToCp(evalAfter);
    if (turn === 'w') return cpBefore - cpAfter;
    return cpAfter - cpBefore;
  }

  function classifyMove(lossCp, isBest) {
    if (isBest) return 'best';
    if (lossCp <= 0) return 'best';
    if (lossCp < 50) return 'good';
    if (lossCp < 100) return 'inaccuracy';
    if (lossCp < 300) return 'mistake';
    return 'blunder';
  }

  function classificationLabel(cls) {
    if (cls === 'best') return '🌟 Excellent';
    if (cls === 'good') return '✅ Bon';
    if (cls === 'inaccuracy') return '⚠️ Imprécision';
    if (cls === 'mistake') return '❌ Erreur';
    if (cls === 'blunder') return '❌❌ Gaffe';
    return '—';
  }

  function classificationEmoji(cls) {
    if (cls === 'best') return '🌟';
    if (cls === 'good') return '✅';
    if (cls === 'inaccuracy') return '⚠️';
    if (cls === 'mistake') return '❌';
    if (cls === 'blunder') return '❌❌';
    return '';
  }

  /**
   * Analyse une partie PGN.
   * @param {string} pgn
   * @param {object} opts - { depth }
   * @param {function} onProgress - callback(current, total, info)
   */
  function analyze(pgn, opts, onProgress) {
    opts = opts || {};
    var depth = opts.depth || 12;
    var timeoutPerPosition = window.APP.StockfishAnalysis.timeoutForDepth(depth);

    cancelled = false;

    var tempGame = new Chess();
    try {
      tempGame.load_pgn(pgn);
    } catch (err) {
      return Promise.reject(new Error('PGN invalide : ' + err.message));
    }

    var history = tempGame.history({ verbose: true });
    if (!history || history.length === 0) {
      return Promise.reject(new Error('Aucun coup trouvé dans le PGN.'));
    }

    var totalMoves = history.length;

    /* Timeout global = nb coups × 2 positions × timeoutPos × marge 1.5
       plafonné à MAX_GLOBAL_TIMEOUT_MS */
    var globalTimeout = Math.min(
      totalMoves * 2 * timeoutPerPosition * 1.5,
      MAX_GLOBAL_TIMEOUT_MS
    );

    window.APP.log('Revue : ' + totalMoves + ' coups à analyser.');
    window.APP.log('Revue : timeout par position = ' + Math.round(timeoutPerPosition / 1000) + 's.');
    window.APP.log('Revue : timeout global = ' + Math.round(globalTimeout / 1000) + 's.');

    /* Positions successives */
    var positions = [];
    var g = new Chess();
    positions.push({ fen: g.fen(), turn: g.turn() });
    for (var i = 0; i < history.length; i++) {
      var m = g.move(history[i].san);
      if (!m) return Promise.reject(new Error('Impossible de rejouer ' + history[i].san));
      positions.push({ fen: g.fen(), turn: g.turn() });
    }

    var moves = [];
    var startTime = Date.now();

    function analyzeNext(i) {
      /* Vérifie l'annulation */
      if (cancelled) {
        return Promise.reject(new Error('Analyse annulée.'));
      }

      /* Vérifie le timeout global */
      var elapsed = Date.now() - startTime;
      if (elapsed > globalTimeout) {
        return Promise.reject(new Error(
          'Timeout global atteint (' + Math.round(globalTimeout / 1000) + 's). ' +
          'Réduis la profondeur ou analyse une partie plus courte.'
        ));
      }

      if (i >= totalMoves) {
        return Promise.resolve(buildResult(moves, depth));
      }

      var before = positions[i];
      var after = positions[i + 1];
      var moveColor = history[i].color;

      if (onProgress) onProgress(i + 1, totalMoves, before.san || '');

      return window.APP.StockfishAnalysis.analyze(before.fen, { depth: depth })
        .then(function (analysisBefore) {
          return window.APP.StockfishAnalysis.analyze(after.fen, { depth: depth })
            .then(function (analysisAfter) {
              var lossCp = calculateLoss(
                analysisBefore.evaluation,
                analysisAfter.evaluation,
                moveColor
              );

              var playedSan = history[i].san;
              var bestSan = analysisBefore.bestMoveSan;
              var isBest = false;
              if (bestSan && playedSan) {
                var norm = function (s) {
                  return String(s).replace(/[+#!?]/g, '').replace(/\s+/g, '');
                };
                isBest = norm(playedSan) === norm(bestSan);
              }

              var classification = classifyMove(lossCp, isBest);

              moves.push({
                index: i,
                moveNumber: Math.floor(i / 2) + 1,
                color: moveColor,
                san: playedSan,
                fen: before.fen,
                fenAfter: after.fen,
                evalBefore: analysisBefore.evaluation,
                evalBeforeText: analysisBefore.evaluationText,
                evalAfter: analysisAfter.evaluation,
                evalAfterText: analysisAfter.evaluationText,
                bestMoveSan: bestSan,
                bestMove: analysisBefore.bestMove,
                pvSan: analysisBefore.pvSan || [],
                lossCp: Math.round(lossCp),
                classification: classification,
                label: classificationLabel(classification),
                emoji: classificationEmoji(classification)
              });

              return analyzeNext(i + 1);
            });
        });
    }

    return analyzeNext(0);
  }

  function buildResult(moves, depth) {
    var summary = {
      totalMoves: moves.length,
      best: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      depth: depth
    };

    for (var i = 0; i < moves.length; i++) {
      var cls = moves[i].classification;
      if (cls === 'best') summary.best++;
      else if (cls === 'good') summary.good++;
      else if (cls === 'inaccuracy') summary.inaccuracy++;
      else if (cls === 'mistake') summary.mistake++;
      else if (cls === 'blunder') summary.blunder++;
    }

    var errors = moves.filter(function (m) {
      return m.classification === 'mistake' || m.classification === 'blunder';
    });

    return { summary: summary, moves: moves, errors: errors };
  }

  function cancel() {
    cancelled = true;
    if (window.APP.Stockfish) window.APP.Stockfish.stop();
  }

  window.APP.GameReview = {
    analyze: analyze,
    cancel: cancel,
    classificationLabel: classificationLabel,
    classificationEmoji: classificationEmoji
  };
})();
