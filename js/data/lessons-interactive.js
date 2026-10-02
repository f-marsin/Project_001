/* =========================================================
   lessons-interactive.js — Exercices M0 + M1 (v1.4.0)
   =========================================================
   Rôle : banque de tâches interactives pour les leçons
   d'initiation (coordonnées, mouvement des pièces).

   Types de tâches :
     - identify-square : cliquer sur une case demandée
     - move-piece      : déplacer une pièce d'une case à l'autre

   Structure d'une leçon :
     window.APP.INTERACTIVE_LESSONS[lessonId] = {
       kind: 'identify-square' | 'move-piece',
       tasks: [ ... ]
     }
   ========================================================= */

window.APP = window.APP || {};

window.APP.INTERACTIVE_LESSONS = {

  /* =========================================================
     MODULE 0 — DÉCOUVERTE DE L'ÉCHIQUIER
     ========================================================= */

  /* ---------- M0-L1 : Le plateau et ses coordonnées ---------- */
  'M0-L1': {
    kind: 'identify-square',
    tasks: [
      { prompt: 'Clique sur la case e4.', target: 'e4' },
      { prompt: 'Clique sur la case d5.', target: 'd5' },
      { prompt: 'Clique sur la case a1.', target: 'a1' },
      { prompt: 'Clique sur la case h8.', target: 'h8' },
      { prompt: 'Clique sur la case c6.', target: 'c6' },
      { prompt: 'Clique sur la case f3.', target: 'f3' },
      { prompt: 'Clique sur la case b7.', target: 'b7' },
      { prompt: 'Clique sur la case g2.', target: 'g2' },
      { prompt: 'Clique sur la case e5.', target: 'e5' },
      { prompt: 'Clique sur la case d4.', target: 'd4' }
    ]
  },

  /* ---------- M0-L2 : Orientation et camp blanc/noir ---------- */
  'M0-L2': {
    kind: 'identify-square',
    tasks: [
      { prompt: 'Où se trouve le coin blanc de droite des Blancs ?', target: 'h1' },
      { prompt: 'Où se trouve le coin gauche des Noirs ?', target: 'a8' },
      { prompt: 'Clique sur une case de la rangée 1 (camp blanc).', target: '1', matchRow: true, targetRow: '1' },
      { prompt: 'Clique sur une case de la rangée 8 (camp noir).', target: '8', matchRow: true, targetRow: '8' },
      { prompt: 'Clique sur une case de la colonne d (colonne de la dame blanche).', target: 'd', matchCol: true, targetCol: 'd' },
      { prompt: 'Clique sur une case de la colonne e (colonne du roi blanc).', target: 'e', matchCol: true, targetCol: 'e' }
    ]
  },

  /* ---------- M0-L3 : Nommer une case ---------- */
  'M0-L3': {
    kind: 'identify-square',
    tasks: [
      { prompt: 'Case e4 ?', target: 'e4' },
      { prompt: 'Case b2 ?', target: 'b2' },
      { prompt: 'Case g7 ?', target: 'g7' },
      { prompt: 'Case a5 ?', target: 'a5' },
      { prompt: 'Case f6 ?', target: 'f6' },
      { prompt: 'Case h3 ?', target: 'h3' },
      { prompt: 'Case c8 ?', target: 'c8' },
      { prompt: 'Case d1 ?', target: 'd1' },
      { prompt: 'Case e5 ?', target: 'e5' },
      { prompt: 'Case b4 ?', target: 'b4' }
    ]
  },

  /* ---------- M0-L4 : Le vocabulaire de base ---------- */
  'M0-L4': {
    kind: 'identify-square',
    tasks: [
      { prompt: 'Case au centre, colonne e, rangée 4 ?', target: 'e4' },
      { prompt: 'Case au centre, colonne d, rangée 5 ?', target: 'd5' },
      { prompt: 'Case sur la diagonale a1-h8, colonne e ?', target: 'e5' },
      { prompt: '2e case de la diagonale a1-h8 ?', target: 'b2' },
      { prompt: 'Case juste devant le roi blanc en début de partie ?', target: 'e2' },
      { prompt: 'Case juste devant le roi noir en début de partie ?', target: 'e7' }
    ]
  },

  /* =========================================================
     MODULE 1 — MOUVEMENT DES PIÈCES
     ========================================================= */

  /* ---------- M1-L1 : Le pion ---------- */
  'M1-L1': {
    kind: 'move-piece',
    tasks: [
      { fen: '8/8/8/8/8/8/4P3/8 w - - 0 1', prompt: 'Avance le pion e2 d\'une case.', from: 'e2', to: 'e3' },
      { fen: '8/8/8/8/8/8/4P3/8 w - - 0 1', prompt: 'Fais la poussée double du pion e2.', from: 'e2', to: 'e4' },
      { fen: '8/8/8/8/8/4P3/8/8 w - - 0 1', prompt: 'Avance le pion e3 vers e4.', from: 'e3', to: 'e4' },
      { fen: '8/8/8/4p3/3P4/8/8/8 w - - 0 1', prompt: 'Capture le pion noir en e5.', from: 'd4', to: 'e5' },
      { fen: '8/8/8/3p4/4P3/8/8/8 w - - 0 1', prompt: 'Capture le pion noir en d5.', from: 'e4', to: 'd5' },
      { fen: '8/8/8/8/8/8/7P/8 w - - 0 1', prompt: 'Fais avancer le pion h2 de deux cases.', from: 'h2', to: 'h4' }
    ]
  },

  /* ---------- M1-L2 : La tour ---------- */
  'M1-L2': {
    kind: 'move-piece',
    tasks: [
      { fen: '8/8/8/8/8/8/8/R7 w - - 0 1', prompt: 'Déplace la tour de a1 à a8.', from: 'a1', to: 'a8' },
      { fen: '8/8/8/8/8/8/8/R7 w - - 0 1', prompt: 'Déplace la tour de a1 à h1.', from: 'a1', to: 'h1' },
      { fen: '8/8/8/8/8/8/8/4R3 w - - 0 1', prompt: 'Déplace la tour de e1 à e5.', from: 'e1', to: 'e5' },
      { fen: '8/8/8/8/8/8/8/4R3 w - - 0 1', prompt: 'Déplace la tour de e1 à a1.', from: 'e1', to: 'a1' },
      { fen: '8/8/8/8/3R4/8/8/8 w - - 0 1', prompt: 'Déplace la tour de d4 à d8.', from: 'd4', to: 'd8' },
      { fen: '8/8/8/8/3R4/8/8/8 w - - 0 1', prompt: 'Déplace la tour de d4 à h4.', from: 'd4', to: 'h4' }
    ]
  },

  /* ---------- M1-L3 : Le fou ---------- */
  'M1-L3': {
    kind: 'move-piece',
    tasks: [
      { fen: '8/8/8/8/8/8/8/2B5 w - - 0 1', prompt: 'Déplace le fou de c1 à h6.', from: 'c1', to: 'h6' },
      { fen: '8/8/8/8/8/8/8/2B5 w - - 0 1', prompt: 'Déplace le fou de c1 à a3.', from: 'c1', to: 'a3' },
      { fen: '8/8/8/8/8/8/8/5B2 w - - 0 1', prompt: 'Déplace le fou de f1 à b5.', from: 'f1', to: 'b5' },
      { fen: '8/8/8/8/8/8/8/5B2 w - - 0 1', prompt: 'Déplace le fou de f1 à h3.', from: 'f1', to: 'h3' },
      { fen: '8/8/8/8/4B3/8/8/8 w - - 0 1', prompt: 'Déplace le fou de e4 à h7.', from: 'e4', to: 'h7' },
      { fen: '8/8/8/8/4B3/8/8/8 w - - 0 1', prompt: 'Déplace le fou de e4 à b1.', from: 'e4', to: 'b1' }
    ]
  },

  /* ---------- M1-L4 : La dame ---------- */
  'M1-L4': {
    kind: 'move-piece',
    tasks: [
      { fen: '8/8/8/8/8/8/8/3Q4 w - - 0 1', prompt: 'Déplace la dame de d1 à d8.', from: 'd1', to: 'd8' },
      { fen: '8/8/8/8/8/8/8/3Q4 w - - 0 1', prompt: 'Déplace la dame de d1 à h5.', from: 'd1', to: 'h5' },
      { fen: '8/8/8/8/8/8/8/3Q4 w - - 0 1', prompt: 'Déplace la dame de d1 à a4.', from: 'd1', to: 'a4' },
      { fen: '8/8/8/8/8/8/8/3Q4 w - - 0 1', prompt: 'Déplace la dame de d1 à h1.', from: 'd1', to: 'h1' },
      { fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1', prompt: 'Déplace la dame de d4 à a7.', from: 'd4', to: 'a7' },
      { fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1', prompt: 'Déplace la dame de d4 à d8.', from: 'd4', to: 'd8' }
    ]
  },

  /* ---------- M1-L5 : Le cavalier ---------- */
  'M1-L5': {
    kind: 'move-piece',
    tasks: [
      { fen: '8/8/8/8/8/8/8/1N6 w - - 0 1', prompt: 'Saute de b1 à c3.', from: 'b1', to: 'c3' },
      { fen: '8/8/8/8/8/8/8/1N6 w - - 0 1', prompt: 'Saute de b1 à a3.', from: 'b1', to: 'a3' },
      { fen: '8/8/8/8/8/8/8/6N1 w - - 0 1', prompt: 'Saute de g1 à f3.', from: 'g1', to: 'f3' },
      { fen: '8/8/8/8/8/8/8/6N1 w - - 0 1', prompt: 'Saute de g1 à h3.', from: 'g1', to: 'h3' },
      { fen: '8/8/8/8/3N4/8/8/8 w - - 0 1', prompt: 'Saute de d4 à e6.', from: 'd4', to: 'e6' },
      { fen: '8/8/8/8/3N4/8/8/8 w - - 0 1', prompt: 'Saute de d4 à f5.', from: 'd4', to: 'f5' }
    ]
  },

  /* ---------- M1-L6 : Le roi ---------- */
  'M1-L6': {
    kind: 'move-piece',
    tasks: [
      { fen: '8/8/8/8/8/8/8/4K3 w - - 0 1', prompt: 'Déplace le roi de e1 à e2.', from: 'e1', to: 'e2' },
      { fen: '8/8/8/8/8/8/8/4K3 w - - 0 1', prompt: 'Déplace le roi de e1 à d2.', from: 'e1', to: 'd2' },
      { fen: '8/8/8/8/8/8/8/4K3 w - - 0 1', prompt: 'Déplace le roi de e1 à f1.', from: 'e1', to: 'f1' },
      { fen: '8/8/8/8/4K3/8/8/8 w - - 0 1', prompt: 'Déplace le roi de e4 à e5.', from: 'e4', to: 'e5' },
      { fen: '8/8/8/8/4K3/8/8/8 w - - 0 1', prompt: 'Déplace le roi de e4 à d4.', from: 'e4', to: 'd4' },
      { fen: '8/8/8/8/4K3/8/8/8 w - - 0 1', prompt: 'Déplace le roi de e4 à f5.', from: 'e4', to: 'f5' }
    ]
  }
};
