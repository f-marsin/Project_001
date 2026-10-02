/* =========================================================
   lichess-adapter.js — Conversion format Lichess → format interne
   =========================================================
   v1.0.5 — CORRECTIF MAJEUR : Lichess renvoie la solution en
   format UCI (ex: "e6a2"), PAS en SAN. On convertit maintenant
   l'UCI en SAN via chess.js avant de la stocker.
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
      window.APP.log('Adaptateur : ply ' + targetPly + ' > longueur historique ' + history.length);
      return null;
    }

    var g = new Chess();
    for (var i = 0; i < targetPly; i++) {
      g.move(history[i].san);
    }
    return g.fen();
  }

  /* ---------- Conversion UCI → SAN ----------
     Lichess renvoie la solution sous forme UCI (ex: "e6a2" ou "e7e8q").
     On la convertit en SAN ("Fxa2", "e8=Q+", ...) pour pouvoir
     la comparer avec le SAN joué par l'élève.
  */
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
      window.APP.log('Adaptateur : conversion UCI→SAN échouée pour', uciMove, err.message);
      return null;
    }
  }

  /* ---------- Conversion d'une séquence UCI en SAN ----------
     La solution Lichess est un tableau alterné :
       [UCI_joueur_1, UCI_adverse_1, UCI_joueur_2, ...]
     On rejoue la séquence depuis la FEN pour obtenir les SAN.
  */
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
        window.APP.log('Adaptateur : impossible de rejouer', uci);
        break;
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

    /* FEN au ply initial */
    var fen = fenAtPly(g.pgn, p.initialPly || 0);
    if (!fen) {
      return { error: 'Impossible d\'extraire le FEN du PGN' };
    }

    /* Solution : liste UCI → on convertit en SAN */
    if (!p.solution || p.solution.length === 0) {
      return { error: 'Solution Lichess vide' };
    }

    var seq = convertSequence(fen, p.solution);
    if (!seq.playerSan) {
      return { error: 'Impossible de convertir la solution UCI en SAN' };
    }

    return {
      lichessId: p.id,
      rating: p.rating,
      themes: p.themes || [],
      fen: fen,
      playerMove: seq.playerSan,          /* ex: "Fxa2" */
      playerMoveUci: p.solution[0],       /* ex: "e6a2" (pour debug) */
      opponentReply: seq.opponentSan,     /* ex: "Rb1" ou null */
      fullSequence: seq.fullSan,
      rawSolution: p.solution             /* UCI brut (debug) */
    };
  }

  window.APP.LichessAdapter = {
    adapt: adapt,
    fenAtPly: fenAtPly,
    uciToSan: uciToSan,
    convertSequence: convertSequence
  };
})();
