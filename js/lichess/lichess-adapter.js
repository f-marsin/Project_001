/* =========================================================
   lichess-adapter.js — Conversion format Lichess → format interne
   =========================================================
   v1.0.6 — Correction robuste :
     - Détection automatique du décalage de half-ply
     - Fallback UCI brut si la conversion SAN échoue
     - Logs de debug détaillés
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* ---------- Extraction du FEN depuis un PGN à un ply donné ---------- */

  function fenAtPly(pgn, targetPly) {
    var tempGame = new Chess();
    try {
      tempGame.load_pgn(pgn);
    } catch (e) {
      window.APP.log('Adaptateur : PGN invalide');
      return null;
    }

    var history = tempGame.history({ verbose: true });
    if (!history || history.length < targetPly) {
      return null;
    }

    var g = new Chess();
    for (var i = 0; i < targetPly; i++) {
      var move = g.move(history[i].san);
      if (!move) return null;
    }
    return g.fen();
  }

  /* ---------- Conversion UCI → SAN ---------- */

  function uciToSan(fen, uciMove) {
    if (!uciMove || uciMove.length < 4) return null;

    var from = uciMove.substring(0, 2);
    var to   = uciMove.substring(2, 4);
    var promotion = uciMove.length > 4 ? uciMove.substring(4, 5) : 'q';

    try {
      var g = new Chess(fen);
      var move = g.move({ from: from, to: to, promotion: promotion });
      if (!move) return null;
      return move.san;
    } catch (err) {
      return null;
    }
  }

  /* ---------- Conversion d'une séquence UCI en SAN ---------- */

  function convertSequence(fen, uciSequence) {
    var result = {
      playerSan: null,
      opponentSan: null,
      fullSan: []
    };
    if (!uciSequence || uciSequence.length === 0) return result;

    var g = new Chess(fen);
    for (var i = 0; i < uciSequence.length; i++) {
      var uci = uciSequence[i];
      var from = uci.substring(0, 2);
      var to   = uci.substring(2, 4);
      var promotion = uci.length > 4 ? uci.substring(4, 5) : 'q';
      var move = g.move({ from: from, to: to, promotion: promotion });
      if (!move) {
        /* Échec à ce coup → on s'arrête mais on garde ce qui a été converti */
        return result;
      }
      result.fullSan.push(move.san);
      if (i === 0) result.playerSan = move.san;
      if (i === 1) result.opponentSan = move.san;
    }
    return result;
  }

  /* ---------- Transformation principale ---------- */

  function adapt(lichessData) {
    if (!lichessData || !lichessData.puzzle || !lichessData.game) {
      return { error: 'Réponse Lichess incomplète' };
    }

    var p = lichessData.puzzle;
    var g = lichessData.game;

    if (!g.pgn) {
      return { error: 'PGN Lichess manquant' };
    }

    if (!p.solution || p.solution.length === 0) {
      return { error: 'Solution Lichess vide' };
    }

    var initialPly = p.initialPly || 0;
    window.APP.log('Adaptateur : initialPly =', initialPly, '| solution[0] =', p.solution[0]);

    /* --- Tentative 1 : FEN au ply exact --- */
    var fen1 = fenAtPly(g.pgn, initialPly);
    if (fen1) {
      var seq1 = convertSequence(fen1, p.solution);
      if (seq1.playerSan) {
        window.APP.log('Adaptateur : conversion OK au ply exact');
        return buildResult(p, fen1, seq1, g);
      }
    }

    /* --- Tentative 2 : FEN au ply - 1 (décalage possible) --- */
    if (initialPly > 0) {
      var fen2 = fenAtPly(g.pgn, initialPly - 1);
      if (fen2) {
        var seq2 = convertSequence(fen2, p.solution);
        if (seq2.playerSan) {
          window.APP.log('Adaptateur : conversion OK au ply -1');
          return buildResult(p, fen2, seq2, g);
        }
      }
    }

    /* --- Tentative 3 : FEN au ply + 1 --- */
    var fen3 = fenAtPly(g.pgn, initialPly + 1);
    if (fen3) {
      var seq3 = convertSequence(fen3, p.solution);
      if (seq3.playerSan) {
        window.APP.log('Adaptateur : conversion OK au ply +1');
        return buildResult(p, fen3, seq3, g);
      }
    }

    /* --- Fallback : on garde la FEN du ply exact mais on utilise
       l'UCI brut comme solution (le moteur comparera via UCI) --- */
    if (fen1) {
      window.APP.log('Adaptateur : FALLBACK — utilisation UCI brute');
      return {
        lichessId: p.id,
        rating: p.rating,
        themes: p.themes || [],
        fen: fen1,
        playerMove: null,               /* pas de SAN */
        playerMoveUci: p.solution[0],   /* on utilisera l'UCI */
        opponentReply: null,
        fullSequence: [],
        rawSolution: p.solution,
        fallbackUci: true
      };
    }

    return { error: 'Aucune position valide trouvée (ply ' + initialPly + ')' };
  }

  function buildResult(p, fen, seq, g) {
    return {
      lichessId: p.id,
      rating: p.rating,
      themes: p.themes || [],
      fen: fen,
      playerMove: seq.playerSan,
      playerMoveUci: p.solution[0],
      opponentReply: seq.opponentSan,
      fullSequence: seq.fullSan,
      rawSolution: p.solution,
      fallbackUci: false
    };
  }

  window.APP.LichessAdapter = {
    adapt: adapt,
    fenAtPly: fenAtPly,
    uciToSan: uciToSan,
    convertSequence: convertSequence
  };
})();
