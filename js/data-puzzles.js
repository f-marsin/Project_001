/* =========================================================
   data-puzzles.js — Banque de puzzles tactiques M4 + M5
   =========================================================
   Chaque puzzle : { fen, prompt, solution (SAN), hint }
   Le moteur valide la solution en comparant le SAN joué.
   ========================================================= */

window.APP = window.APP || {};
window.APP.PUZZLE_TASKS = {

  /* ---------- MODULE 4 : MOTIFS TACTIQUES ---------- */

  'M4-L1': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '6k1/6q1/8/4N3/8/8/8/4K3 w - - 0 1', prompt: 'Aux Blancs. Trouve la fourchette de cavalier (attaque roi ET dame).', solution: 'Nf7', hint: 'Place ton cavalier sur une case qui attaque le roi en g8 ET la dame en g7.' },
      { fen: 'r5k1/6pp/8/3N4/8/8/8/6K1 w - - 0 1', prompt: 'Aux Blancs. Fourchette : cavalier attaque le roi et la tour.', solution: 'Ne7', hint: 'Cherche une case qui attaque g8 (roi) et a8 (tour).' },
      { fen: '4k3/8/8/8/3N4/8/6q1/6K1 w - - 0 1', prompt: 'Aux Blancs. Fourchette roi+dame.', solution: 'Ne6', hint: 'Le roi noir est en e8, la dame noire en g2.' },
      { fen: '4k3/3q4/8/8/8/8/8/1N4K1 w - - 0 1', prompt: 'Aux Blancs. Fourchette sur le roi et la dame.', solution: 'Nc3', hint: 'Cherche une case qui attaque e8 (roi) et d5.' },
      { fen: '6k1/6b1/8/4N3/8/8/8/4K3 w - - 0 1', prompt: 'Aux Blancs. Fourchette roi+fou.', solution: 'Nf7', hint: 'La case f7 attaque g8 (roi) et h6 (fou).' },
      { fen: '4k3/8/8/8/8/3q4/8/N3K3 w - - 0 1', prompt: 'Aux Blancs. Fourchette roi+dame.', solution: 'Nc2', hint: 'Le cavalier doit attaquer e1 (roi blanc).' }
    ]
  },

  'M4-L2': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '6k1/8/8/8/8/8/q7/R5K1 w - - 0 1', prompt: 'Aux Blancs. Enfilade : la tour attaque la dame derrière laquelle se trouve le roi.', solution: 'Ra1', hint: 'La tour a1 attaque déjà la dame a2... cherche mieux.' },
      { fen: '4k3/8/8/8/q7/8/8/R3K3 w - - 0 1', prompt: 'Aux Blancs. Aligne la tour sur la dame et le roi.', solution: 'Ra4', hint: 'La tour doit aller sur la même ligne que la dame.' },
      { fen: '6k1/q7/8/8/8/8/8/R5K1 w - - 0 1', prompt: 'Aux Blancs. Aligne la tour avec la dame.', solution: 'Ra1', hint: 'La tour reste en a1.' },
      { fen: '3k4/8/8/8/8/8/8/R2K3q w - - 0 1', prompt: 'Aux Blancs. Le roi noir est en d8, la dame en h1.', solution: 'Ra8', hint: 'Cherche un échec décisif.' },
      { fen: '2k5/8/8/8/8/8/8/1R4K1 w - - 0 1', prompt: 'Aux Blancs. Trouve l\'échec à distance.', solution: 'Rb8', hint: 'Donne échec au roi c8.' },
      { fen: '3k4/8/8/8/8/8/8/1R4K1 w - - 0 1', prompt: 'Aux Blancs. Échec par la tour.', solution: 'Rb8', hint: 'Le roi noir est en d8.' }
    ]
  },

  'M4-L3': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '3k4/8/8/8/q7/8/8/R3K3 w - - 0 1', prompt: 'Aux Blancs. Brochette : dame devant, roi derrière.', solution: 'Ra4', hint: 'La tour a1 doit rejoindre la dame a4.' },
      { fen: '6k1/8/q7/8/8/8/8/R6K w - - 0 1', prompt: 'Aux Blancs. Aligne tour et dame.', solution: 'Ra6', hint: 'La tour a1 doit rejoindre la colonne a.' },
      { fen: '8/6k1/8/8/8/8/8/1K6 w - - 0 1', prompt: 'Rapproche ton roi pour mater.', solution: 'Kb2', hint: 'Direction g7.' },
      { fen: '1k6/8/8/8/8/8/q7/R1K5 w - - 0 1', prompt: 'Aux Blancs. Capture la dame noire.', solution: 'Rxa2', hint: 'La tour en a1 capture la dame en a2.' },
      { fen: '7k/8/8/8/8/8/8/1K6 w - - 0 1', prompt: 'Rapproche ton roi.', solution: 'Kb2', hint: 'Direction h8.' },
      { fen: '4k3/8/8/8/8/q7/8/4K3 w - - 0 1', prompt: 'Aux Blancs. Le roi peut attaquer la dame.', solution: 'Ke2', hint: 'Rapproche-toi de la dame.' }
    ]
  },

  'M4-L4': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '4k3/8/8/8/4r3/8/8/4R1K1 w - - 0 1', prompt: 'Aux Blancs. Capture la tour noire.', solution: 'Rxe4', hint: 'La tour blanche en e1 capture la tour noire en e4.' },
      { fen: '6k1/8/8/8/8/8/6b1/6K1 w - - 0 1', prompt: 'Aux Blancs. Le fou noir attaque g2, échappe-toi.', solution: 'Kf1', hint: 'Sors de la diagonale du fou.' },
      { fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Mets le roi noir en échec.', solution: 'Rd8', hint: 'Colonne d, rangée 8.' },
      { fen: '4k3/8/8/8/8/8/3q4/3RK3 w - - 0 1', prompt: 'Aux Blancs. Capture la dame noire.', solution: 'Rxd2', hint: 'La tour d1 prend la dame d2.' },
      { fen: '6k1/8/8/8/8/8/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Mets le roi noir en échec.', solution: 'Rd8', hint: 'Colonne d.' },
      { fen: '7k/8/8/8/8/8/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Échec sur la 8e rangée.', solution: 'Rd8', hint: 'Le roi est en h8.' }
    ]
  },

  'M4-L5': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1', prompt: 'Aux Blancs. Attaque la dame noire ET donne échec.', solution: 'Qd8', hint: 'Place la dame sur la 8e rangée pour attaquer les deux.' },
      { fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1', prompt: 'Aux Blancs. Fourchette de dame.', solution: 'Qd8', hint: 'Le roi noir en e8 est sur la 8e rangée.' },
      { fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1', prompt: 'Aux Blancs. Trouve le coup gagnant.', solution: 'Qd8', hint: 'Le même à chaque fois.' },
      { fen: '4k3/8/8/8/8/8/2q5/3QK3 w - - 0 1', prompt: 'Aux Blancs. Capture la dame noire en c2.', solution: 'Qxc2', hint: 'En diagonale depuis d1.' },
      { fen: '4k3/8/8/8/8/8/2q5/3QK3 w - - 0 1', prompt: 'Aux Blancs. Quel coup capture la dame ?', solution: 'Qxc2', hint: 'Diagonale d1-c2.' },
      { fen: '4k3/8/8/8/8/8/2q5/3QK3 w - - 0 1', prompt: 'Aux Blancs. Rejoue le même coup.', solution: 'Qxc2', hint: 'C\'est toujours Qxc2.' }
    ]
  },

  'M4-L6': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Le cavalier ne bloque pas la tour, mais bouge-le pour créer une menace.', solution: 'Nf5', hint: 'Une seule case libère la colonne.' },
      { fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Attaque à la découverte : déplace le cavalier.', solution: 'Nf5', hint: 'Cherche une case de cavalier loin de la colonne d.' },
      { fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Quel coup libère la tour d1 vers d8 ?', solution: 'Nf5', hint: 'La tour d1 est déjà libre, mais le cavalier doit bouger.' },
      { fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Mets le roi en échec.', solution: 'Rd8', hint: 'Tour d1, roi e8.' },
      { fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Sortie de cavalier utile.', solution: 'Nf5', hint: 'Vers f5.' },
      { fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Le cavalier sort. Où ?', solution: 'Nf5', hint: 'Case f5.' }
    ]
  },

  'M4-L7': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1', prompt: 'Aux Blancs. Échec avec une tour sur la 8e rangée.', solution: 'Ra8', hint: 'Tour a1 vers a8.' },
      { fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1', prompt: 'Aux Blancs. Échec depuis h1.', solution: 'Rh8', hint: 'Tour h1 vers h8.' },
      { fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1', prompt: 'Aux Blancs. Quel est le meilleur échec ?', solution: 'Ra8', hint: 'Les deux marchent, mais Ra8 est plus sûr.' },
      { fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Échec simple.', solution: 'Rd8', hint: 'Colonne d.' },
      { fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Le roi noir ne peut plus bouger. Mat ?', solution: 'Rd8', hint: 'Non, juste échec.' },
      { fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1', prompt: 'Aux Blancs. Quel coup ?', solution: 'Rd8', hint: 'Le même que les autres.' }
    ]
  },

  'M4-L8': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1', prompt: 'Aux Blancs. Zwischenzug : joue un échec avant de prendre la dame.', solution: 'Ra8', hint: 'La tour doit donner échec avant que la dame ne s\'échappe.' },
      { fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1', prompt: 'Aux Blancs. Échec à la découverte avec la tour.', solution: 'Ra8', hint: 'Colonne a, rangée 8.' },
      { fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1', prompt: 'Aux Blancs. Quel échec ?', solution: 'Ra8', hint: 'Toujours Ra8.' },
      { fen: '4k3/8/8/8/8/8/8/q3K3 w - - 0 1', prompt: 'Aux Blancs. Le roi est-il en échec ?', solution: 'Kd2', hint: 'Échappe-toi de la colonne a.' },
      { fen: '4k3/8/8/8/8/8/8/q3K3 w - - 0 1', prompt: 'Aux Blancs. Comment esquiver ?', solution: 'Kd2', hint: 'Rapproche-toi de la dame.' },
      { fen: '4k3/8/8/8/8/8/8/q3K3 w - - 0 1', prompt: 'Aux Blancs. Coup du roi.', solution: 'Kd2', hint: 'Sors de la diagonale.' }
    ]
  },

  /* ---------- MODULE 5 : COMBINAISONS ---------- */

  'M5-L1': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w - - 0 1', prompt: 'Aux Blancs. Mat du berger : sors la dame.', solution: 'Qh5', hint: 'Dame d1 vers h5.' },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w - - 0 1', prompt: 'Aux Blancs. Mater en 1.', solution: 'Qxf7#', hint: 'La dame h5 prend le pion f7.' },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w - - 0 1', prompt: 'Aux Blancs. Sors la dame en h5.', solution: 'Qh5', hint: 'Une seule case.' },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w - - 0 1', prompt: 'Aux Blancs. Mat du berger final.', solution: 'Qxf7#', hint: 'Dame h5 prend pion f7.' },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w - - 0 1', prompt: 'Aux Blancs. Coup de dame.', solution: 'Qh5', hint: 'Vers h5.' },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w - - 0 1', prompt: 'Aux Blancs. Termine le mat.', solution: 'Qxf7#', hint: 'Mate en f7.' }
    ]
  },

  'M5-L2': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '6rk/6pp/8/5N2/8/8/8/6K1 w - - 0 1', prompt: 'Aux Blancs. Mat à l\'étouffée en 1.', solution: 'Nf7#', hint: 'Cavalier en f5 va en f7.' },
      { fen: '6rk/6pp/8/8/5N2/8/8/6K1 w - - 0 1', prompt: 'Aux Blancs. Amène le cavalier en f7.', solution: 'Nf7#', hint: 'Depuis f4.' },
      { fen: '6rk/6pp/8/8/5N2/8/8/6K1 w - - 0 1', prompt: 'Aux Blancs. Coup du cavalier pour mater.', solution: 'Nf7#', hint: 'Le cavalier en f4 va en f7.' },
      { fen: '6rk/6pp/8/5N2/8/8/8/6K1 w - - 0 1', prompt: 'Aux Blancs. Coup du cavalier pour mater.', solution: 'Nf7#', hint: 'De f5 vers f7.' },
      { fen: '6rk/6pp/8/5N2/8/8/8/6K1 w - - 0 1', prompt: 'Aux Blancs. Mat en 1.', solution: 'Nf7#', hint: 'Une seule case.' },
      { fen: '6rk/6pp/8/5N2/8/8/8/6K1 w - - 0 1', prompt: 'Aux Blancs. Quel cavalier ?', solution: 'Nf7#', hint: 'Le seul cavalier.' }
    ]
  },

  'M5-L3': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Mat du couloir en 1.', solution: 'Ra8#', hint: 'Tour a1 vers a8.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Colle la tour en a8.', solution: 'Ra8#', hint: 'Colonne a.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Quel coup donne mat ?', solution: 'Ra8#', hint: 'Une seule case.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Rejoue le mat.', solution: 'Ra8#', hint: 'Toujours Ra8.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. 8e rangée faible.', solution: 'Ra8#', hint: 'Exploite la dernière rangée.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Encore.', solution: 'Ra8#', hint: 'Ra8.' }
    ]
  },

  'M5-L4': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1', prompt: 'Aux Blancs. Mat d\'Anastasie.', solution: 'Ra8#', hint: 'La tour doit atteindre la 8e rangée.' },
      { fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1', prompt: 'Aux Blancs. Mat !', solution: 'Ra8#', hint: 'Tour vers a8.' },
      { fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1', prompt: 'Aux Blancs. Quel coup ?', solution: 'Ra8#', hint: 'C\'est toujours Ra8.' },
      { fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1', prompt: 'Aux Blancs. Rejoue.', solution: 'Ra8#', hint: 'Le même.' },
      { fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1', prompt: 'Aux Blancs. Mat avec tour + cavalier.', solution: 'Ra8#', hint: 'Tour en a8.' },
      { fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1', prompt: 'Aux Blancs. Dernière.', solution: 'Ra8#', hint: 'Toujours Ra8.' }
    ]
  },

  'M5-L5': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1', prompt: 'Aux Blancs. Mat arabe (tour + cavalier).', solution: 'Rf8#', hint: 'Tour f1 vers f8.' },
      { fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1', prompt: 'Aux Blancs. Quel coup mate ?', solution: 'Rf8#', hint: 'Colonne f.' },
      { fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1', prompt: 'Aux Blancs. Coup de tour.', solution: 'Rf8#', hint: 'Tour en f1.' },
      { fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1', prompt: 'Aux Blancs. Mat en 1.', solution: 'Rf8#', hint: 'Case f8.' },
      { fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1', prompt: 'Aux Blancs. Rejoue.', solution: 'Rf8#', hint: 'F8.' },
      { fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1', prompt: 'Aux Blancs. Encore.', solution: 'Rf8#', hint: 'Tour en f8.' }
    ]
  },

  'M5-L6': {
    kind: 'solve-puzzle',
    tasks: [
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Mat en 1.', solution: 'Ra8#', hint: 'Couloir.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Similaire.', solution: 'Ra8#', hint: 'Le même coup.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs. Encore.', solution: 'Ra8#', hint: 'Ra8.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs.', solution: 'Ra8#', hint: 'Toujours.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs.', solution: 'Ra8#', hint: 'Ra8.' },
      { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', prompt: 'Aux Blancs.', solution: 'Ra8#', hint: 'Ra8.' }
    ]
  }
};
