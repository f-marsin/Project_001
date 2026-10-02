/* =========================================================
   stockfish-analysis.js — API d'analyse haut niveau + cache
   =========================================================
   Rôle : envelopper window.APP.Stockfish avec :
     - Mise en forme de l'évaluation (+1.5, mat en 5…)
     - Cache des positions déjà analysées
     - Conversion UCI → SAN pour la ligne principale
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* Cache : { fen: { bestMove, evaluation, pv, depth } } */
  var cache = {};

  /* ---------- Formatage de l'évaluation ---------- */

  /**
   * Convertit une évaluation brute en texte lisible.
   * Ex : { type: 'cp', value: 150 } → "+1.50"
   *      { type: 'mate', value: 3 } → "#3"
   *      { type: 'mate', value: -2 } → "#-2"
   */
  function formatEvaluation(evaluation, turn) {
    if (!evaluation) return '—';

    var prefix = '';
    if (turn === 'b') {
      /* Stockfish évalue toujours du point de vue des Blancs.
         On inverse si c'est aux Noirs de jouer pour afficher
         du point de vue du camp au trait. */
      prefix = '';
    }

    if (evaluation.type === 'mate') {
      var v = evaluation.value;
      if (v > 0) return '#' + v;
      if (v < 0) return '#-' + Math.abs(v);
      return '#0';
    }

    if (evaluation.type === 'cp') {
      var cp = evaluation.value / 100;
      var sign = cp > 0 ? '+' : '';
      return sign + cp.toFixed(2);
    }

    return '—';
  }

  /* ---------- Conversion UCI → SAN pour une ligne ---------- */

  function uciPvToSan(fen, uciPv) {
    if (!uciPv || uciPv.length === 0) return [];
    try {
      var g = new Chess(fen);
      var sanPv = [];
      for (var i = 0; i < uciPv.length; i++) {
        var uci = uciPv[i];
        var from = uci.substring(0, 2);
        var to   = uci.substring(2, 4);
        var promotion = uci.length > 4 ? uci.substring(4, 5) : 'q';
        var move = g.move({ from: from, to: to, promotion: promotion });
        if (!move) break;
        sanPv.push(move.san);
      }
      return sanPv;
    } catch (err) {
      return [];
    }
  }

  /* ---------- Analyse avec cache ---------- */

  /**
   * Analyse une position FEN (avec cache).
   * @param {string} fen
   * @param {object} opts - { depth: 15, useCache: true }
   * @returns {Promise<{bestMove, bestMoveSan, evaluation, evaluationText, pv, pvSan, depth, cached}>}
   */
  function analyze(fen, opts) {
    opts = opts || {};
    var useCache = opts.useCache !== false;
    var depth = opts.depth || 15;

    if (useCache && cache[fen]) {
      return Promise.resolve(Object.assign({}, cache[fen], { cached: true }));
    }

    return window.APP.Stockfish.analyze(fen, { depth: depth })
      .then(function (raw) {
        var turn = fen.indexOf(' b ') !== -1 ? 'b' : 'w';

        /* Conversion bestMove UCI → SAN */
        var bestMoveSan = null;
        if (raw.bestMove && raw.bestMove.length >= 4) {
          var bestSan = uciPvToSan(fen, [raw.bestMove]);
          bestMoveSan = bestSan.length > 0 ? bestSan[0] : raw.bestMove;
        }

        /* Conversion PV */
        var pvSan = uciPvToSan(fen, raw.pv || []);

        var result = {
          fen: fen,
          bestMove: raw.bestMove,
          bestMoveSan: bestMoveSan,
          evaluation: raw.evaluation,
          evaluationText: formatEvaluation(raw.evaluation, turn),
          pv: raw.pv || [],
          pvSan: pvSan,
          depth: raw.depth,
          cached: false
        };

        if (useCache) cache[fen] = result;
        return result;
      });
  }

  function clearCache() { cache = {}; }

  window.APP.StockfishAnalysis = {
    analyze: analyze,
    formatEvaluation: formatEvaluation,
    uciPvToSan: uciPvToSan,
    clearCache: clearCache
  };
})();
