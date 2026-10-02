/* =========================================================
   lichess-client.js — Appels API Lichess
   =========================================================
   Rôle : récupérer un puzzle depuis l'API publique Lichess.
   API utilisée : GET /api/puzzle/next?angle={theme}&difficulty={level}

   Retourne un objet PuzzleAndGame :
     {
       game: { pgn, ... },
       puzzle: { id, rating, solution: [SAN, ...], themes: [...], initialPly, ... }
     }

   Note CORS : l'API Lichess renvoie parfois des erreurs CORS
   selon le navigateur. On tente la requête directe, et en cas
   d'échec on utilise un proxy public (allorigins).
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* Proxies publics utilisés en fallback (si CORS bloque) */
  var PROXIES = [
    function (url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); },
    function (url) { return 'https://corsproxy.io/?' + encodeURIComponent(url); }
  ];

  /* ---------- Construction de l'URL Lichess ---------- */

  function buildLichessUrl(theme, difficulty) {
    var base = window.APP.CONFIG.LICHESS_API_BASE + window.APP.CONFIG.LICHESS_PUZZLE_NEXT;
    var params = [];
    if (theme)      params.push('angle=' + encodeURIComponent(theme));
    if (difficulty) params.push('difficulty=' + encodeURIComponent(difficulty));
    return base + (params.length ? '?' + params.join('&') : '');
  }

  /* ---------- Requête avec fallback ---------- */

  function fetchWithTimeout(url, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error('Timeout (' + ms + 'ms)'));
      }, ms);

      fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          clearTimeout(timer);
          if (!response.ok) {
            reject(new Error('HTTP ' + response.status));
            return;
          }
          return response.json().then(resolve, reject);
        })
        .catch(function (err) {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  function fetchPuzzleRaw(theme, difficulty) {
    var directUrl = buildLichessUrl(theme, difficulty);
    window.APP.log('Lichess : requête directe →', directUrl);

    return fetchWithTimeout(directUrl, 8000)
      .then(function (data) {
        window.APP.log('Lichess : réponse directe OK');
        return { data: data, source: 'direct' };
      })
      .catch(function (errDirect) {
        window.APP.log('Lichess : direct échoué →', errDirect.message);
        return tryProxies(theme, difficulty, 0);
      });
  }

  function tryProxies(theme, difficulty, index) {
    if (index >= PROXIES.length) {
      return Promise.reject(new Error('Tous les proxies ont échoué'));
    }
    var directUrl = buildLichessUrl(theme, difficulty);
    var proxyUrl = PROXIES[index](directUrl);
    window.APP.log('Lichess : tentative proxy #' + (index + 1));

    return fetchWithTimeout(proxyUrl, 10000)
      .then(function (data) {
        window.APP.log('Lichess : proxy #' + (index + 1) + ' OK');
        return { data: data, source: 'proxy-' + (index + 1) };
      })
      .catch(function (err) {
        window.APP.log('Lichess : proxy #' + (index + 1) + ' échoué →', err.message);
        return tryProxies(theme, difficulty, index + 1);
      });
  }

  /* ---------- API publique ---------- */

  window.APP.LichessClient = {
    /**
     * Récupère un puzzle Lichess.
     * @param {string} theme - thème Lichess (fork, pin, mateIn1, ...)
     * @param {string} difficulty - easiest | easier | normal | harder | hardest
     * @returns {Promise<{data, source}>}
     */
    fetchPuzzle: function (theme, difficulty) {
      difficulty = difficulty || window.APP.CONFIG.PUZZLE_DIFFICULTY;
      return fetchPuzzleRaw(theme, difficulty);
    }
  };
})();
