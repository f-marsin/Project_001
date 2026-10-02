/* =========================================================
   lichess-adapter.js — Conversion format Lichess → format interne
   =========================================================
   Rôle : transformer la réponse brute de l'API Lichess en
   objet exploitable par le moteur de leçon.

   Réponse Lichess (puzzle) :
     {
       game: { pgn, clock, ... },
       puzzle: {
         id, rating, plays, solution: ["SAN1", "SAN2", ...],
         themes: ["fork", "short"],
         initialPly: N,
         ...
       }
     }

   Le PGN contient la partie d'origine. Le puzzle commence au
   coup N (initialPly). Le FEN à jouer est extrait du PGN à
   ce coup précis. La solution est une liste de SAN alternée
   (coup joueur, réponse adverse, coup joueur, ...).
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

    /* Remonter au ply voulu :
       chess.js 0.10.x n'a pas de méthode directe pour charger
       un PGN jusqu'à un ply. On rejoue la partie depuis le début. */
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

  /* ---------- Analyse de la solution Lichess ---------- */

  /**
   * La solution Lichess est une liste alternée :
   *   [coup_joueur_1, reponse_adverse_1, coup_joueur_2, ...]
   * Si la liste contient 1 élément → mat/combinaison en 1 coup
   * Si la liste contient 2 éléments → 1 coup joueur + 1 réponse adverse
   *                                  (l'adversaire joue "automatiquement")
   *
   * On veut : le premier coup joueur + les réponses adverses automatiques
   */
  function parseSolution(solutionArray) {
    if (!solutionArray || solutionArray.length === 0) return null;
    return {
      playerMove: solutionArray[0],
      opponentReply: solutionArray.length >= 2 ? solutionArray[1] : null,
      fullSequence: solutionArray
    };
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

    /* Solution */
    var sol = parseSolution(p.solution);
    if (!sol) {
      return { error: 'Solution Lichess vide' };
    }

    return {
      lichessId: p.id,
      rating: p.rating,
      themes: p.themes || [],
      fen: fen,
      playerMove: sol.playerMove,
      opponentReply: sol.opponentReply,
      fullSequence: sol.fullSequence
    };
  }

  window.APP.LichessAdapter = {
    adapt: adapt,
    fenAtPly: fenAtPly
  };
})();
