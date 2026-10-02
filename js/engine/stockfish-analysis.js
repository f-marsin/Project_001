/* =========================================================
   stockfish-analysis.js — Analyse + cache (v1.0.12)
   Correction : le cache inclut la profondeur dans sa clé.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* Cache : { "fen|depth": { bestMove, evaluation, pv, depth } } */
  var cache = {};

  function cacheKey(fen, depth) {
    return fen + '|' + depth;
  }

  function formatEvaluation(evaluation, turn) {
    if (!evaluation) return '—';

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

  function analyze(fen, opts) {
    opts = opts || {};
    var useCache = opts.useCache !== false;
    var depth = opts.depth || 15;

    var key = cacheKey(fen, depth);
    if (useCache && cache[key]) {
      return Promise.resolve(Object.assign({}, cache[key], { cached: true }));
    }

    return window.APP.Stockfish.analyze(fen, { depth: depth })
      .then(function (raw) {
        var turn = fen.indexOf(' b ') !== -1 ? 'b' : 'w';

        var bestMoveSan = null;
        if (raw.bestMove && raw.bestMove.length >= 4) {
          var bestSan = uciPvToSan(fen, [raw.bestMove]);
          bestMoveSan = bestSan.length > 0 ? bestSan[0] : raw.bestMove;
        }

        var pvSan = uciPvToSan(fen, raw.pv || []);

        var result = {
          fen: fen,
          bestMove: raw.bestMove,
          bestMoveSan: bestMoveSan,
          evaluation: raw.evaluation,
          evaluationText: formatEvaluation(raw.evaluation, turn),
          pv: raw.pv || [],
          pvSan: pvSan,
          depth: raw.depth || depth,
          cached: false
        };

        if (useCache) cache[key] = result;
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
