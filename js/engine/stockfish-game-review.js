/* =========================================================
   stockfish-game-review.js — Analyse d'une partie complète
   =========================================================
   Rôle : prendre un PGN, rejouer chaque coup, analyser chaque
   position avec Stockfish, et détecter les erreurs / imprécisions.

   Classification (inspirée Lichess) :
     - 🌟 Brillant  : coup meilleur que le 1er choix Stockfish (rare)
     - ✅ Bon       : perte ≤ 0.5 pion
     - ⚠️ Imprécision: perte entre 0.5 et 1.0
     - ❌ Erreur    : perte entre 1.0 et 3.0
     - ❌❌ Blunder  : perte > 3.0

   API : window.APP.GameReview
     analyze(pgn, opts, onProgress) → Promise<{ moves, summary, errors }>
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* ---------- Utilitaires ---------- */

  /* Convertit une évaluation (cp ou mate) en centipions signés.
     Pour comparaison on veut un nombre : +X = avantage Blancs. */
  function evalToCp(evaluation) {
    if (!evaluation) return 0;
    if (evaluation.type === 'cp') return evaluation.value;
    if (evaluation.type === 'mate') {
      /* Mat : on retourne une valeur extrême, signée par le camp */
      var sign = evaluation.value > 0 ? 1 : -1;
      return sign * 100000;
    }
    return 0;
  }

  /* Perte entre deux évaluations (en centipions).
     Les évaluations sont toujours du point de vue des Blancs.
     On regarde la perte du point de vue du camp qui a joué. */
  function calculateLoss(evalBefore, evalAfter, turn) {
    var cpBefore = evalToCp(evalBefore);
    var cpAfter = evalToCp(evalAfter);

    /* Si c'est aux Blancs de jouer : on veut que cpAfter ≥ cpBefore.
       Si c'est aux Noirs : on veut que cpAfter ≤ cpBefore. */
    var loss;
    if (turn === 'w') {
      loss = cpBefore - cpAfter; /* positif = perte */
    } else {
      loss = cpAfter - cpBefore; /* positif = perte */
    }
    return loss;
  }

  /* Classifie un coup selon la perte (en centipions) */
  function classifyMove(lossCp, isBestMove) {
    if (isBestMove) return 'best';
    if (lossCp <= 0) return 'best';        /* gain ou neutre */
    if (lossCp < 50) return 'good';         /* < 0.5 pion */
    if (lossCp < 100) return 'inaccuracy';  /* 0.5 à 1.0 */
    if (lossCp < 300) return 'mistake';     /* 1.0 à 3.0 */
    return 'blunder';                        /* > 3.0 */
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

  /* ---------- Analyse complète ---------- */

  /**
   * Analyse une partie PGN.
   * @param {string} pgn - Le PGN de la partie
   * @param {object} opts - { depth: 12 }
   * @param {function} onProgress - callback(current, total, info)
   * @returns {Promise<{summary, moves, errors}>}
   */
  function analyze(pgn, opts, onProgress) {
    opts = opts || {};
    var depth = opts.depth || 12;

    /* Charge le PGN dans une partie temporaire */
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

    /* On rejoue la partie depuis le début en gardant les FEN avant chaque coup */
    var positions = [];
    var g = new Chess();
    positions.push({ fen: g.fen(), turn: g.turn(), moveIndex: -1, san: null });
    for (var i = 0; i < history.length; i++) {
      var m = g.move(history[i].san);
      if (!m) {
        return Promise.reject(new Error('Impossible de rejouer le coup ' + history[i].san));
      }
      positions.push({
        fen: g.fen(),
        turn: g.turn(),       /* camp qui doit jouer APRÈS ce coup */
        moveIndex: i,
        san: m.san,
        color: m.color
      });
    }

    var totalMoves = history.length;
    var moves = [];

    /* Analyse séquentielle : on lance les analyses une par une */
    function analyzeNext(i) {
      if (i >= totalMoves) {
        /* Terminé : on construit le résumé */
        return Promise.resolve(buildResult(moves, history, depth));
      }

      var before = positions[i];         /* position AVANT le coup i */
      var after = positions[i + 1];      /* position APRÈS le coup i */
      var moveColor = history[i].color;  /* 'w' ou 'b' */

      if (onProgress) onProgress(i + 1, totalMoves, before.san || '');

      /* Analyse AVANT (ce que le joueur avait à disposition) */
      return window.APP.StockfishAnalysis.analyze(before.fen, { depth: depth })
        .then(function (analysisBefore) {
          /* Analyse APRÈS (ce que le joueur a obtenu) */
          return window.APP.StockfishAnalysis.analyze(after.fen, { depth: depth })
            .then(function (analysisAfter) {
              /* Perte */
              var lossCp = calculateLoss(
                analysisBefore.evaluation,
                analysisAfter.evaluation,
                moveColor
              );

              /* Le coup joué est-il le meilleur ? */
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

  /* ---------- Construction du résumé ---------- */

  function buildResult(moves, history, depth) {
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

    /* Erreurs graves uniquement (pour navigation rapide) */
    var errors = moves.filter(function (m) {
      return m.classification === 'mistake' || m.classification === 'blunder';
    });

    return {
      summary: summary,
      moves: moves,
      errors: errors
    };
  }

  window.APP.GameReview = {
    analyze: analyze,
    classificationLabel: classificationLabel,
    classificationEmoji: classificationEmoji
  };
})();
