/* =========================================================
   stockfish-loader.js — Chargement Stockfish (v1.1.1)
   Ajout : timeout paramétrable par appel à analyze().
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var ENGINE_URL = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

  /* Timeout par défaut (ms) si non spécifié */
  var DEFAULT_ANALYSIS_TIMEOUT = 15000;

  var worker = null;
  var loaded = false;
  var loading = false;
  var readyResolvers = [];
  var currentAnalysis = null;
  var usingBlobWorker = false;

  function log() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[SF]');
    if (window.console) console.log.apply(console, args);
  }

  function logError() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[SF]');
    if (window.console) console.error.apply(console, args);
  }

  function handleMessage(e) {
    var line = (typeof e === 'string') ? e : (e.data || '');
    if (!line) return;

    if (line.indexOf('uciok') !== -1) {
      sendCommand('isready');
      return;
    }
    if (line.indexOf('readyok') !== -1) {
      loaded = true;
      loading = false;
      for (var i = 0; i < readyResolvers.length; i++) readyResolvers[i]();
      readyResolvers = [];
      return;
    }

    if (currentAnalysis && line.indexOf('info ') === 0) {
      parseInfoLine(line);
      return;
    }

    if (currentAnalysis && line.indexOf('bestmove') === 0) {
      var parts = line.split(' ');
      var bestMove = parts[1] || null;

      /* Annule le timeout propre à cette analyse */
      if (currentAnalysis.timer) clearTimeout(currentAnalysis.timer);

      currentAnalysis.resolve({
        bestMove: bestMove,
        evaluation: currentAnalysis.evaluation,
        pv: currentAnalysis.pv,
        depth: currentAnalysis.depth
      });
      currentAnalysis = null;
    }
  }

  function handleError(e) {
    var msg = (e && (e.message || e.type)) || 'inconnue';
    logError('Erreur Worker :', msg);
    loading = false;

    if (usingBlobWorker) {
      usingBlobWorker = false;
      createWorkerDirect(function () {});
    }
  }

  function parseInfoLine(line) {
    if (!currentAnalysis) return;

    var dMatch = line.match(/ depth (\d+)/);
    if (dMatch) currentAnalysis.depth = parseInt(dMatch[1], 10);

    var cpMatch = line.match(/ score cp (-?\d+)/);
    if (cpMatch) currentAnalysis.evaluation = { type: 'cp', value: parseInt(cpMatch[1], 10) };

    var mateMatch = line.match(/ score mate (-?\d+)/);
    if (mateMatch) currentAnalysis.evaluation = { type: 'mate', value: parseInt(mateMatch[1], 10) };

    var pvMatch = line.match(/ pv (.+)$/);
    if (pvMatch) currentAnalysis.pv = pvMatch[1].split(' ');
  }

  function sendCommand(cmd) {
    if (!worker) return;
    worker.postMessage(cmd);
  }

  function createWorkerBlob(callback) {
    fetch(ENGINE_URL)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (code) {
        var blob = new Blob([code], { type: 'application/javascript' });
        var blobUrl = URL.createObjectURL(blob);
        try {
          worker = new Worker(blobUrl);
          worker.onmessage = handleMessage;
          worker.onerror = handleError;
          usingBlobWorker = true;
          callback(null);
        } catch (err) { callback(err); }
      })
      .catch(function (err) { callback(err); });
  }

  function createWorkerDirect(callback) {
    try {
      worker = new Worker(ENGINE_URL);
      worker.onmessage = handleMessage;
      worker.onerror = handleError;
      usingBlobWorker = false;
      callback(null);
    } catch (err) { callback(err); }
  }

  function createWorker(callback) {
    createWorkerBlob(function (err) {
      if (err) createWorkerDirect(callback);
      else callback(null);
    });
  }

  function load() {
    if (loaded) return Promise.resolve();
    if (loading) {
      return new Promise(function (resolve, reject) {
        readyResolvers.push(resolve);
        setTimeout(function () {
          if (!loaded) reject(new Error('Timeout de chargement du moteur (30s)'));
        }, 30000);
      });
    }

    loading = true;

    return new Promise(function (resolve, reject) {
      var resolved = false;
      var timer = setTimeout(function () {
        if (!resolved) { resolved = true; loading = false; reject(new Error('Timeout : le moteur n\'a pas répondu (30s)')); }
      }, 30000);

      readyResolvers.push(function () {
        if (!resolved) { resolved = true; clearTimeout(timer); resolve(); }
      });

      createWorker(function (err) {
        if (err) {
          if (!resolved) { resolved = true; clearTimeout(timer); loading = false; reject(new Error('Création Worker impossible : ' + err.message)); }
          return;
        }
        sendCommand('uci');
      });
    });
  }

  /**
   * Analyse une position FEN.
   * @param {string} fen
   * @param {object} opts
   *   - depth   : profondeur (défaut 15)
   *   - timeout : timeout en ms (défaut 15000)
   */
  function analyze(fen, opts) {
    opts = opts || {};
    var depth = opts.depth || 15;
    var timeoutMs = opts.timeout || DEFAULT_ANALYSIS_TIMEOUT;

    return load().then(function () {
      return new Promise(function (resolve, reject) {
        if (currentAnalysis) {
          reject(new Error('Une analyse est déjà en cours.'));
          return;
        }

        currentAnalysis = {
          resolve: resolve,
          reject: reject,
          evaluation: null,
          pv: null,
          depth: 0,
          timer: null
        };

        sendCommand('position fen ' + fen);
        sendCommand('go depth ' + depth);

        /* Timer propre à cette analyse */
        currentAnalysis.timer = setTimeout(function () {
          if (currentAnalysis) {
            currentAnalysis.reject(new Error('Analyse trop longue (timeout ' + Math.round(timeoutMs / 1000) + 's).'));
            currentAnalysis = null;
            sendCommand('stop');
          }
        }, timeoutMs);
      });
    });
  }

  function stop() {
    if (currentAnalysis) {
      if (currentAnalysis.timer) clearTimeout(currentAnalysis.timer);
      currentAnalysis.reject(new Error('Analyse annulée.'));
      currentAnalysis = null;
      sendCommand('stop');
    }
  }

  window.APP.Stockfish = {
    load: load,
    isLoaded: function () { return loaded; },
    analyze: analyze,
    stop: stop
  };
})();
