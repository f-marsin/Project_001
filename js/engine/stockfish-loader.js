/* =========================================================
   stockfish-loader.js — Chargement + communication Stockfish
   =========================================================
   Rôle : charger le Worker Stockfish (WASM via CDN jsdelivr)
   et fournir une API simple basée sur des Promises.

   API exposée : window.APP.Stockfish
     load()                       → Promise (charge le moteur)
     isLoaded()                   → bool
     analyze(fen, opts)           → Promise<{bestMove, evaluation, pv}>
     stop()                       → arrête une analyse en cours

   Protocole : UCI (Universal Chess Interface)
     → "uci"             → moteur répond "uciok"
     → "isready"         → moteur répond "readyok"
     → "position fen X"  → charge une position
     → "go depth N"      → analyse à profondeur N
     → "stop"            → arrête l'analyse
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* URL du moteur WASM sur jsdelivr (version 16) */
  var ENGINE_URL = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish-nnue-16-single.js';

  var worker = null;
  var loaded = false;
  var loading = false;
  var readyResolvers = [];

  /* État d'une analyse en cours */
  var currentAnalysis = null;

  /* ---------- Utilitaires ---------- */

  function log() {
    if (!window.APP.CONFIG || !window.APP.CONFIG.DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[SF]');
    console.log.apply(console, args);
  }

  /* ---------- Réception des messages du Worker ---------- */

  function handleMessage(e) {
    var line = (typeof e === 'string') ? e : (e.data || '');
    if (!line) return;

    log('←', line);

    /* Réponses basiques */
    if (line === 'uciok') {
      /* Le moteur répond à "uci" */
      sendCommand('isready');
      return;
    }
    if (line === 'readyok') {
      /* Le moteur est prêt */
      loaded = true;
      loading = false;
      for (var i = 0; i < readyResolvers.length; i++) {
        readyResolvers[i]();
      }
      readyResolvers = [];
      log('Moteur prêt.');
      return;
    }

    /* Analyse en cours : infos */
    if (currentAnalysis && line.indexOf('info ') === 0) {
      parseInfoLine(line);
      return;
    }

    /* Fin d'analyse : bestmove */
    if (currentAnalysis && line.indexOf('bestmove') === 0) {
      var parts = line.split(' ');
      var bestMove = parts[1] || null;
      currentAnalysis.resolve({
        bestMove: bestMove,
        evaluation: currentAnalysis.evaluation,
        pv: currentAnalysis.pv,
        depth: currentAnalysis.depth
      });
      currentAnalysis = null;
    }
  }

  /* Extraction des infos d'une ligne "info" */
  function parseInfoLine(line) {
    if (!currentAnalysis) return;

    /* Profondeur */
    var dMatch = line.match(/ depth (\d+)/);
    if (dMatch) currentAnalysis.depth = parseInt(dMatch[1], 10);

    /* Évaluation (cp = centipions, mate = mat en N) */
    var cpMatch = line.match(/ score cp (-?\d+)/);
    if (cpMatch) {
      currentAnalysis.evaluation = {
        type: 'cp',
        value: parseInt(cpMatch[1], 10)
      };
    }
    var mateMatch = line.match(/ score mate (-?\d+)/);
    if (mateMatch) {
      currentAnalysis.evaluation = {
        type: 'mate',
        value: parseInt(mateMatch[1], 10)
      };
    }

    /* Ligne principale (pv) */
    var pvMatch = line.match(/ pv (.+)$/);
    if (pvMatch) {
      currentAnalysis.pv = pvMatch[1].split(' ');
    }
  }

  /* ---------- Envoi de commandes ---------- */

  function sendCommand(cmd) {
    if (!worker) return;
    log('→', cmd);
    worker.postMessage(cmd);
  }

  /* ---------- Chargement ---------- */

  function load() {
    if (loaded) return Promise.resolve();
    if (loading) {
      return new Promise(function (resolve) { readyResolvers.push(resolve); });
    }

    loading = true;
    log('Chargement du moteur…');

    return new Promise(function (resolve, reject) {
      readyResolvers.push(resolve);

      try {
        worker = new Worker(ENGINE_URL);
        worker.onmessage = handleMessage;
        worker.onerror = function (err) {
          log('Erreur Worker :', err.message || err);
          loading = false;
          reject(new Error('Erreur Worker Stockfish : ' + (err.message || 'inconnue')));
        };

        /* Init UCI */
        sendCommand('uci');
      } catch (err) {
        loading = false;
        log('Impossible de créer le Worker :', err.message);
        reject(err);
      }
    });
  }

  /* ---------- Analyse ---------- */

  /**
   * Analyse une position FEN.
   * @param {string} fen
   * @param {object} opts - { depth: 15, multiPv: 1 }
   * @returns {Promise<{bestMove, evaluation, pv, depth}>}
   */
  function analyze(fen, opts) {
    opts = opts || {};
    var depth = opts.depth || 15;

    return load().then(function () {
      return new Promise(function (resolve, reject) {
        if (currentAnalysis) {
          /* Une analyse est en cours : on la refuse */
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

        sendCommand('position fen ' + fen);
        sendCommand('go depth ' + depth);

        /* Timeout de sécurité */
        setTimeout(function () {
          if (currentAnalysis) {
            currentAnalysis.reject(new Error('Analyse trop longue (timeout).'));
            currentAnalysis = null;
            sendCommand('stop');
          }
        }, 30000);
      });
    });
  }

  function stop() {
    if (currentAnalysis) {
      currentAnalysis.reject(new Error('Analyse annulée par l\'utilisateur.'));
      currentAnalysis = null;
      sendCommand('stop');
    }
  }

  /* ---------- API publique ---------- */

  window.APP.Stockfish = {
    load: load,
    isLoaded: function () { return loaded; },
    analyze: analyze,
    stop: stop
  };
})();
