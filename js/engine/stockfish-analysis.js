/* =========================================================
   stockfish-analysis.js — Analyse + cache (v1.1.1)
   Ajout : transmission du timeout à Stockfish.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var cache = {};

  function cacheKey(fen, depth) { return fen + '|' + depth; }

  /* Timeout conseillé selon la profondeur (en ms) */
  function timeoutForDepth(depth) {
    if (depth <= 10) return 5000;
    if (depth <= 12) return 8000;
    if (depth <= 15) return 15000;
    if (depth <= 18) return 30000;
    return 60000;
  }

  function formatEvaluation(evaluation) {
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
    } catch (err) { return []; }
  }

  /**
   * Analyse une position FEN.
   * @param {string} fen
   * @param {object} opts
   *   - depth    : profondeur
   *   - useCache : true par défaut
   *   - timeout  : override le timeout automatique
   */
  function analyze(fen, opts) {
    opts = opts || {};
    var useCache = opts.useCache !== false;
    var depth = opts.depth || 15;
    var timeoutMs = opts.timeout || timeoutForDepth(depth);

    var key = cacheKey(fen, depth);
    if (useCache && cache[key]) {
      return Promise.resolve(Object.assign({}, cache[key], { cached: true }));
    }

    return window.APP.Stockfish.analyze(fen, { depth: depth, timeout: timeoutMs })
      .then(function (raw) {
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
          evaluationText: formatEvaluation(raw.evaluation),
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
    timeoutForDepth: timeoutForDepth,
    clearCache: clearCache
  };
})();
