/* =========================================================
   stockfish-loader.js — Chargement Stockfish (v1.0.10)
   =========================================================
   Corrections :
     - URL vers stockfish.js stable
     - Création d'un Blob Worker pour Firefox (cross-origin)
     - Logs détaillés
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* URL testée de stockfish.js (version stable) */
  var ENGINE_URL = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

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

  /* ---------- Réception des messages ---------- */

  function handleMessage(e) {
    var line = (typeof e === 'string') ? e : (e.data || '');
    if (!line) return;

    if (line.indexOf('uciok') !== -1) {
      log('uciok reçu, envoi isready');
      sendCommand('isready');
      return;
    }
    if (line.indexOf('readyok') !== -1) {
      log('readyok reçu, moteur prêt');
      loaded = true;
      loading = false;
      for (var i = 0; i < readyResolvers.length; i++) {
        readyResolvers[i]();
      }
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
      log('bestmove reçu :', bestMove);
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

    /* Si on utilisait BlobWorker et que ça échoue, on tente l'autre méthode */
    if (usingBlobWorker) {
      log('Re-essai avec Worker direct…');
      usingBlobWorker = false;
      createWorker(function (err) {
        if (err) {
          /* Échec total */
          var resolvers = readyResolvers;
          readyResolvers = [];
          for (var i = 0; i < resolvers.length; i++) {
            /* On ne peut pas reject via le resolver (c'est un resolve), donc on rejette via une promesse wrapper */
          }
        }
      });
    }
  }

  function parseInfoLine(line) {
    if (!currentAnalysis) return;

    var dMatch = line.match(/ depth (\d+)/);
    if (dMatch) currentAnalysis.depth = parseInt(dMatch[1], 10);

    var cpMatch = line.match(/ score cp (-?\d+)/);
    if (cpMatch) {
      currentAnalysis.evaluation = { type: 'cp', value: parseInt(cpMatch[1], 10) };
    }
    var mateMatch = line.match(/ score mate (-?\d+)/);
    if (mateMatch) {
      currentAnalysis.evaluation = { type: 'mate', value: parseInt(mateMatch[1], 10) };
    }

    var pvMatch = line.match(/ pv (.+)$/);
    if (pvMatch) {
      currentAnalysis.pv = pvMatch[1].split(' ');
    }
  }

  function sendCommand(cmd) {
    if (!worker) return;
    worker.postMessage(cmd);
  }

  /* ---------- Création du Worker ---------- */

  function createWorkerBlob(callback) {
    /* Récupère le script via fetch puis crée un Blob Worker
       (contourne les restrictions cross-origin Firefox) */
    log('Chargement du script via fetch…');
    fetch(ENGINE_URL)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (code) {
        log('Script récupéré (' + code.length + ' octets), création du Blob Worker…');
        var blob = new Blob([code], { type: 'application/javascript' });
        var blobUrl = URL.createObjectURL(blob);
        try {
          worker = new Worker(blobUrl);
          worker.onmessage = handleMessage;
          worker.onerror = handleError;
          usingBlobWorker = true;
          log('Blob Worker créé avec succès');
          callback(null);
        } catch (err) {
          logError('Impossible de créer le Blob Worker :', err.message);
          callback(err);
        }
      })
      .catch(function (err) {
        logError('Fetch échoué :', err.message);
        callback(err);
      });
  }

  function createWorkerDirect(callback) {
    try {
      worker = new Worker(ENGINE_URL);
      worker.onmessage = handleMessage;
      worker.onerror = handleError;
      usingBlobWorker = false;
      log('Worker direct créé');
      callback(null);
    } catch (err) {
      logError('Impossible de créer le Worker direct :', err.message);
      callback(err);
    }
  }

  function createWorker(callback) {
    /* Essayer le Blob Worker d'abord (plus compatible) */
    createWorkerBlob(function (err) {
      if (err) {
        log('Blob Worker échoué, tentative Worker direct…');
        createWorkerDirect(callback);
      } else {
        callback(null);
      }
    });
  }

  /* ---------- Chargement ---------- */

  function load() {
    if (loaded) return Promise.resolve();
    if (loading) {
      return new Promise(function (resolve, reject) {
        readyResolvers.push(resolve);
        /* Timeout global */
        setTimeout(function () {
          if (!loaded) reject(new Error('Timeout de chargement du moteur (30s)'));
        }, 30000);
      });
    }

    loading = true;
    log('Démarrage du chargement Stockfish…');

    return new Promise(function (resolve, reject) {
      var resolved = false;
      var timer = setTimeout(function () {
        if (!resolved) {
          resolved = true;
          loading = false;
          reject(new Error('Timeout : le moteur n\'a pas répondu (30s)'));
        }
      }, 30000);

      readyResolvers.push(function () {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve();
        }
      });

      createWorker(function (err) {
        if (err) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            loading = false;
            reject(new Error('Création Worker impossible : ' + err.message));
          }
          return;
        }
        log('Envoi de "uci" au moteur…');
        sendCommand('uci');
      });
    });
  }

  /* ---------- Analyse ---------- */

  function analyze(fen, opts) {
    opts = opts || {};
    var depth = opts.depth || 15;

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
          depth: 0
        };

        log('Analyse FEN :', fen, '| profondeur :', depth);
        sendCommand('position fen ' + fen);
        sendCommand('go depth ' + depth);

        setTimeout(function () {
          if (currentAnalysis) {
            currentAnalysis.reject(new Error('Analyse trop longue (timeout 30s).'));
            currentAnalysis = null;
            sendCommand('stop');
          }
        }, 30000);
      });
    });
  }

  function stop() {
    if (currentAnalysis) {
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
