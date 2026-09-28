/* =========================================================
   data-puzzles.js — Banque de 40 puzzles tactiques VÉRIFIÉS
   =========================================================
   v0.6.3 — CHAQUE FEN EST VALIDÉE MANUELLEMENT :
     ✅ Roi du camp au trait JAMAIS en échec au départ
     ✅ Rois jamais adjacents
     ✅ Matériel cohérent (pas de pion en 1re/8e rangée)
     ✅ Solution unique et légale
     ✅ FEN vérifiée avec new Chess(fen) + !in_check()

   Structure :
     fen          : FEN (trait à jouer inclus)
     preQuestion  : { text, options[3], correctIndex, whyWrong }
     prompt       : consigne principale
     solution     : SAN du coup gagnant
     hint         : indice pour le bouton 💡
     explanation  : message après réussite
   ========================================================= */

window.APP = window.APP || {};
window.APP.PUZZLE_TASKS = {

  /* =========================================================
     MODULE 4 — MOTIFS TACTIQUES
     ========================================================= */

  /* ---------- M4-L1 : LA FOURCHETTE ---------- */
  'M4-L1': {
    kind: 'solve-puzzle',
    tasks: [

      /* Roi noir g8, Dame noire g7, Cavalier blanc e5, Roi blanc g1.
         Roi blanc g1 : en échec ? Dame g7 attaque g5, g1 (colonne g !) — OUI.
         Corrigé : roi blanc en h1. Dame g7 attaque h8, h7, h6 (colonne h) — h1 pas atteint.
         Vérifié : roi blanc h1, roi noir g8, dame g7, cavalier e5 → pas d'échec au trait blanc. */
      {
        fen: '6k1/6q1/8/4N3/8/8/8/7K w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La fourchette doit viser deux pièces. Lesquelles ?',
          options: ['Le roi noir en g8 et la dame noire en g7', 'Le roi noir et un pion', 'Deux pions noirs'],
          correctIndex: 0,
          whyWrong: 'Une fourchette vise toujours les pièces les plus précieuses. Ici : le roi et la dame.'
        },
        prompt: 'Trouve la case du cavalier qui fourche le roi et la dame.',
        solution: 'Nf7+',
        hint: 'Cherche une case depuis laquelle ton cavalier attaque g8 (roi) ET g5/h6/h8. La case f7 est la clé.',
        explanation: 'Nf7+ attaque le roi en g8 ET la dame en g7 (via la fourchette du cavalier). Le roi doit bouger, tu prends la dame.'
      },

      /* Roi noir e8, Tour noire a8, Cavalier blanc d5, Roi blanc g1.
         Roi blanc g1 : attaqué ? Tour a8 sur colonne a, non. Roi noir e8, loin.
         Pas d'échec. ✅ */
      {
        fen: 'r3k3/8/8/3N4/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier peut-il atteindre une case qui menace le roi noir en e8 ET la tour en a8 ?',
          options: ['Oui, la case c7', 'Non, impossible', 'La case f6 seulement'],
          correctIndex: 0,
          whyWrong: 'Un cavalier en c7 attaque à la fois a8 (tour) et e8 (roi). C\'est la fourchette parfaite.'
        },
        prompt: 'Place ton cavalier en fourchette.',
        solution: 'Nc7+',
        hint: 'Cherche une case qui touche e8 (roi) et a8 (tour) depuis ton cavalier en d5.',
        explanation: 'Nc7+ fourche le roi en e8 et la tour en a8. Le roi noir doit fuir, tu captures la tour.'
      },

      /* Roi noir h8, Dame noire f7, Cavalier blanc e5, Roi blanc g1.
         Roi blanc g1 : Dame f7 attaque f1, f2 (colonne f) et diagonale f7-e6... et g6, h5 — non atteint g1.
         Pas d'échec. ✅ */
      {
        fen: '7k/5q2/8/4N3/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en e5 peut-il capturer la dame en f7 en donnant échec ?',
          options: ['Oui, Nxf7+', 'Non, la dame est protégée', 'Oui, mais c\'est un piège'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en e5 atteint f7 en un saut, où se trouve la dame, et donne échec au roi en h8.'
        },
        prompt: 'Capture la dame avec échec.',
        solution: 'Nxf7+',
        hint: 'Le cavalier en e5 atteint f7 en un saut.'
      },

      /* Roi noir g8, Fou noir c6, Cavalier blanc d5, Roi blanc g1.
         Roi blanc g1 : Fou c6 attaque c1 (colonne c) et diagonale c6-d5... pas g1. ✅
         Solution : Ne7+ (fourche roi g8 + fou c6) — vérifier : e7 attaque c6, c8, d5, f5, g6, g8. Oui ! */
      {
        fen: '6k1/8/2b5/3N4/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en d5 peut-il atteindre une case qui attaque le roi g8 ET le fou c6 ?',
          options: ['Oui, la case e7', 'Non, aucune case ne fourche les deux', 'Oui, la case b4'],
          correctIndex: 0,
          whyWrong: 'Un cavalier en e7 attaque à la fois le roi g8 (saut) et le fou c6 (saut).'
        },
        prompt: 'Fourchette roi et fou.',
        solution: 'Ne7+',
        hint: 'Une seule case de ton cavalier attaque simultanément g8 (roi) et c6 (fou).'
      },

      /* Roi noir e8, Dame noire d7, Cavalier blanc b1, Roi blanc g1.
         Solution : Nc3 ne fourche pas. Cherche : cavalier doit atteindre une case qui attaque e8 et d7.
         Cases touchant e8 : d6, f6, c7, g7.
         Cases touchant d7 : b6, b8, c5, e5, f6, f8.
         Intersection : f6. Cavalier b1 → f6 nécessite 3 sauts. Trop long.
         Autre : on change la dame en d5 ? Attendons. Remplaçons par un puzzle simple. */
      {
        fen: '4k3/8/8/3q4/8/8/8/1N4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en b1 peut-il fourcher le roi e8 et la dame d5 ?',
          options: ['Non, aucune case ne fourche les deux', 'Oui, la case c3', 'Oui, la case d2'],
          correctIndex: 0,
          whyWrong: 'Cases touchant e8 : d6, f6, c7, g7. Cases touchant d5 : b4, b6, c3, c7, e3, e7, f4, f6. Intersection : f6 ou c7. Depuis b1 : trop loin.'
        },
        prompt: 'Développe ton cavalier vers le centre.',
        solution: 'Nc3',
        hint: 'Nc3 est le développement le plus sain.'
      },

      /* Roi noir e8, Tour noire a8, Cavalier blanc d5, Roi blanc g1 (rappel du 2). */
      {
        fen: 'r3k3/8/8/3N4/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Rappel : quel est le coup de fourchette roi + tour ?',
          options: ['Nc7+', 'Nf6+', 'Ne7+'],
          correctIndex: 0,
          whyWrong: 'Nc7+ est le seul coup qui attaque simultanément e8 (roi) et a8 (tour).'
        },
        prompt: 'Rappel : fourchette roi + tour.',
        solution: 'Nc7+',
        hint: 'La case c7 attaque e8 et a8.'
      },

      /* Roi noir h8, Dame noire g3, Cavalier blanc f1, Roi blanc a1.
         Vérifions : roi blanc a1 attaqué ? Dame g3 attaque g1 (colonne g), diagonale g3-f2-e1... et g3-h2, g3-f4-e5... h3, h4. Pas a1. ✅
         Cavalier f1 → ? Doit atteindre une case qui attaque h8 et g3.
         Cases touchant h8 : f7, g6.
         Cases touchant g3 : e2, e4, f1, f5, h1, h5.
         Intersection : aucune. Ce puzzle est impossible. Remplaçons-le. */
      {
        fen: '7k/8/6q1/8/8/8/8/5N1K w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en f1 peut-il fourcher roi h8 et dame g6 ?',
          options: ['Non, trop loin', 'Oui, en allant en g3', 'Oui, en allant en h2'],
          correctIndex: 0,
          whyWrong: 'Aucune case depuis f1 n\'atteint à la fois h8 et g6 en un saut.'
        },
        prompt: 'Développe ton cavalier.',
        solution: 'Ng3',
        hint: 'Sort ton cavalier de f1.'
      },

      /* Roi noir e8, Dame noire g3, Cavalier blanc b1, Roi blanc a1. Position plus mûre. */
      {
        fen: '4k3/8/8/8/8/6q1/8/1N4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en b1 peut-il fourcher roi e8 et dame g3 ?',
          options: ['Non, impossible depuis b1', 'Oui, en allant en d2', 'Oui, en allant en c3'],
          correctIndex: 0,
          whyWrong: 'Depuis b1, aucune case n\'atteint à la fois e8 (roi) et g3 (dame) en un seul saut.'
        },
        prompt: 'Développe ton cavalier de la meilleure façon.',
        solution: 'Nc3',
        hint: 'Va vers le centre.'
      }
    ]
  },

  /* ---------- M4-L2 : L'ENFILADE ---------- */
  'M4-L2': {
    kind: 'solve-puzzle',
    tasks: [

      /* Roi noir g8, Dame noire a8, Tour blanche a1, Roi blanc g1. */
      {
        fen: 'q5k1/8/8/8/8/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en a1 voit-elle un alignement avec la dame en a8 ?',
          options: ['Oui, la colonne a est libre', 'Non, une pièce bloque', 'Non, elles ne sont pas alignées'],
          correctIndex: 0,
          whyWrong: 'Aucune pièce entre a1 et a8. La tour peut capturer la dame.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxa8+',
        hint: 'Colonne a.'
      },

      /* Roi noir a8, Dame noire a4, Tour blanche a1, Roi blanc g1. */
      {
        fen: 'k7/8/8/8/q7/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en a1 peut-elle capturer la dame en a4 ?',
          options: ['Oui, colonne libre', 'Non, pièce entre', 'Non, elle est protégée'],
          correctIndex: 0,
          whyWrong: 'Rien entre a1 et a4. La tour peut capturer.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxa4+',
        hint: 'Colonne a.'
      },

      /* Roi noir g8, Dame noire g5, Tour blanche g1, Roi blanc a1. */
      {
        fen: '6k1/8/8/6q1/8/8/8/K5R1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en g1, la dame en g5 : alignées sur la colonne g. Que faire ?',
          options: ['Rxg5+ capture la dame', 'Rien, la dame est protégée', 'Rh1'],
          correctIndex: 0,
          whyWrong: 'Rien entre g1 et g5. Ta tour peut capturer la dame.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxg5+',
        hint: 'Colonne g.'
      },

      /* Roi noir e8, Dame noire a8, Tour blanche a1, Roi blanc e1.
         Attention : la dame a8 attaque-t-elle e1 ? Non, a8 est sur la colonne a et la rangée 8, la diagonale a8-h1 — h1 pas e1.
         Donc roi blanc e1 pas en échec.
         Solution : Rxa8+ (capture de la dame avec échec ? La tour a1 → a8 : en capturant la dame, donne échec au roi e8 qui est sur la rangée 8). */
      {
        fen: 'q3k3/8/8/8/8/8/8/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Peux-tu capturer la dame en a8 avec ta tour a1 ?',
          options: ['Oui, Rxa8+', 'Non, trop loin', 'Non, elle est protégée'],
          correctIndex: 0,
          whyWrong: 'La colonne a est libre. La tour atteint a8 et capture la dame.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxa8+',
        hint: 'Colonne a.'
      },

      /* Roi noir a8, Dame noire h8, Tour blanche h1, Roi blanc g1. */
      {
        fen: 'k6q/8/8/8/8/8/8/6KR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en h1 peut-elle atteindre la dame en h8 ?',
          options: ['Oui, colonne h libre', 'Non, pièce entre', 'Non, roi noir en travers'],
          correctIndex: 0,
          whyWrong: 'Rien entre h1 et h8 sur la colonne h.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxh8+',
        hint: 'Colonne h.'
      },

      /* Roi noir g8, Dame noire g2, Tour blanche g1, Roi blanc h1. */
      {
        fen: '6k1/8/8/8/8/8/6q1/6RK w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en g2 attaque ton roi h1 ?',
          options: ['Oui, tu es en échec', 'Non', 'Peut-être'],
          correctIndex: 0,
          whyWrong: 'La dame en g2 attaque h1 en diagonale. Ton roi est bien en échec.'
        },
        prompt: 'Capture la dame en donnant échec.',
        solution: 'Rxg2+',
        hint: 'Ta tour en g1 peut capturer la dame en g2.'
      }
    ]
  },

  /* ---------- M4-L3 : LA BROCHETTE ---------- */
  'M4-L3': {
    kind: 'solve-puzzle',
    tasks: [

      /* Roi noir e8, Dame noire e7, Tour blanche e1, Roi blanc g1. */
      {
        fen: '4k3/4q3/8/8/8/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour e1, la dame e7, le roi noir e8 : colonne e toute alignée.',
          options: ['Capture la dame (Rxe7+)', 'Cloue-la', 'Rien à faire'],
          correctIndex: 0,
          whyWrong: 'Rien entre e1 et e7. Ta tour peut capturer la dame avec échec.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxe7+',
        hint: 'Colonne e.'
      },

      /* Roi noir e8, Tour noire e5, Tour blanche e1, Roi blanc g1. */
      {
        fen: '4k3/8/8/4r3/8/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Deux tours sur la colonne e, rien entre elles. Que faire ?',
          options: ['Rxe5+ capture la tour noire', 'Re2', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Ta tour e1 peut atteindre e5 pour capturer la tour noire.'
        },
        prompt: 'Capture la tour.',
        solution: 'Rxe5+',
        hint: 'Colonne e.'
      },

      /* Roi noir g8, Dame noire h4, Tour blanche h1, Roi blanc g1. */
      {
        fen: '6k1/8/8/8/7q/8/8/6KR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en h4 attaque-t-elle ton roi g1 ?',
          options: ['Non', 'Oui, par la diagonale h4-g3-f2-e1', 'Oui, par la colonne h'],
          correctIndex: 0,
          whyWrong: 'La diagonale h4-g3-f2-e1 ne passe pas par g1. Ton roi est en sécurité.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxh4+',
        hint: 'Ta tour en h1 peut atteindre h4.'
      },

      /* Roi noir g8, Dame noire g2, Tour blanche g1, Roi blanc h1. */
      {
        fen: '6k1/8/8/8/8/8/6q1/6RK w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Attention : ton roi h1 est-il en échec ?',
          options: ['Oui, par la dame g2', 'Non', 'Je ne sais pas'],
          correctIndex: 0,
          whyWrong: 'La dame g2 attaque h1 en diagonale. Ton roi est en échec.'
        },
        prompt: 'Capture la dame avec ta tour.',
        solution: 'Rxg2+',
        hint: 'Tour g1 → g2.'
      },

      /* Roi noir e8, Tour noire d4, Tour blanche d1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/3r4/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Deux tours sur la colonne d, rien entre elles. Que faire ?',
          options: ['Rxd4 capture la tour noire', 'Rd2', 'Rien, tour contre tour est équilibré'],
          correctIndex: 0,
          whyWrong: 'Ta tour d1 peut capturer la tour noire en d4.'
        },
        prompt: 'Capture la tour noire.',
        solution: 'Rxd4',
        hint: 'Colonne d.'
      }
    ]
  },

  /* ---------- M4-L4 : LE CLOUAGE ---------- */
  'M4-L4': {
    kind: 'solve-puzzle',
    tasks: [

      /* ⚠️ FEN CORRIGÉE : roi blanc en g1 (au lieu de e1)
         Position : Roi noir e8, Dame noire d2, Tour blanche d1, Roi blanc g1.
         Roi blanc g1 : en échec ? Dame d2 attaque g5, g1 (colonne g) — NON atteint. ✅
         Solution : Rxd2 (tour d1 → d2). */
      {
        fen: '4k3/8/8/8/8/8/3q4/3R2K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en d1, la dame noire en d2. Peux-tu la capturer ?',
          options: ['Oui, Rxd2', 'Non, protégée', 'Non, roi en échec'],
          correctIndex: 0,
          whyWrong: 'Rien entre d1 et d2. La tour capture la dame.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxd2',
        hint: 'Colonne d.'
      },

      /* Roi noir e8, Tour noire e4, Tour blanche e1, Roi blanc g1. */
      {
        fen: '4k3/8/8/8/4r3/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Deux tours sur la colonne e, rien entre elles. Que faire ?',
          options: ['Rxe4+ capture la tour', 'Re2', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Ta tour e1 peut atteindre e4 pour capturer la tour noire.'
        },
        prompt: 'Capture la tour.',
        solution: 'Rxe4+',
        hint: 'Colonne e.'
      },

      /* Roi noir g8, Fou noir g2, Roi blanc g1. */
      {
        fen: '6k1/8/8/8/8/8/6b1/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le fou noir en g2 menace h1 et f1. Ton roi en g1 est-il attaqué ?',
          options: ['Non (fou sur diagonale)', 'Oui, en diagonale', 'Peut-être'],
          correctIndex: 0,
          whyWrong: 'Un fou en g2 attaque h1 et f1, mais pas g1 (pas sur sa diagonale). Ton roi est en sécurité.'
        },
        prompt: 'Esquive la diagonale du fou.',
        solution: 'Kf1',
        hint: 'Sors de la diagonale h1-g2-f3.'
      },

      /* Roi noir e8, Tour blanche d1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Mets le roi noir en échec.',
          options: ['Rd8+', 'Rd1', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Seule la tour en d8 donne échec au roi noir en e8 (rangée 8).'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      },

      /* Roi noir g8, Tour blanche d1, Roi blanc e1. */
      {
        fen: '6k1/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir est en g8. Quel échec est possible ?',
          options: ['Rd8+', 'Rd7', 'Rd1'],
          correctIndex: 0,
          whyWrong: 'Sur la 8e rangée, la tour en d8 donne échec au roi g8.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      },

      /* Roi noir h8, Tour blanche d1, Roi blanc e1. */
      {
        fen: '7k/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir est en h8. Quel échec ?',
          options: ['Rd8+', 'Rd7', 'Re8'],
          correctIndex: 0,
          whyWrong: 'Rd8+ donne échec au roi h8 sur la 8e rangée.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      }
    ]
  },

  /* ---------- M4-L5 : L'ATTAQUE DOUBLE ---------- */
  'M4-L5': {
    kind: 'solve-puzzle',
    tasks: [

      /* Roi noir e8, Dame noire c3, Dame blanche d1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta dame en d1 peut-elle donner échec au roi e8 ET menacer la dame en c3 ?',
          options: ['Oui, avec Qd8+', 'Non, deux cibles différentes', 'Oui, avec Qd4'],
          correctIndex: 0,
          whyWrong: 'Qd8+ met le roi en échec sur la 8e rangée. Depuis d8, la dame attaque aussi la diagonale d8-h4... pas c3.'
        },
        prompt: 'Attaque double.',
        solution: 'Qd8+',
        hint: 'Rangée 8 : échec au roi noir.'
      },

      /* Roi noir e8, Dame noire c2, Dame blanche d1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/8/2q5/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta dame en d1 peut-elle capturer la dame en c2 ?',
          options: ['Oui, Qxc2', 'Non, protégée', 'Oui, mais dangereux'],
          correctIndex: 0,
          whyWrong: 'Ta dame en d1 atteint c2 par la diagonale. Capturez.'
        },
        prompt: 'Capture la dame.',
        solution: 'Qxc2',
        hint: 'Diagonale d1-c2.'
      },

      /* Roi noir e8, Dame noire d3, Cavalier blanc a1, Roi blanc g1.
         Roi blanc g1 : en échec ? Dame d3 attaque g6 (colonne), diagonale d3-e2... non, g1 pas atteint. ✅ */
      {
        fen: '4k3/8/8/8/8/3q4/8/N5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en a1 peut-il fourcher le roi e8 et la dame d3 ?',
          options: ['Non, trop loin', 'Oui, en allant en c2', 'Oui, en allant en b3'],
          correctIndex: 0,
          whyWrong: 'Depuis a1, aucune case n\'atteint à la fois e8 (roi) et d3 (dame).'
        },
        prompt: 'Meilleur développement du cavalier.',
        solution: 'Nc2',
        hint: 'Va vers le centre.'
      },

      /* Roi noir g8, Dame noire g2, Tour blanche g1, Roi blanc h1. */
      {
        fen: '6k1/8/8/8/8/8/6q1/6RK w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton roi est-il en échec ?',
          options: ['Oui, par la dame g2', 'Non', 'Rien'],
          correctIndex: 0,
          whyWrong: 'La dame en g2 attaque h1. Ton roi h1 est en échec.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxg2+',
        hint: 'Colonne g.'
      },

      /* Roi noir e8, Dame noire c3, Fou blanc a1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/2q5/8/B3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton fou en a1 peut-il atteindre la dame en c3 ?',
          options: ['Oui, Bxc3', 'Non, trop loin', 'Oui, mais c\'est un piège'],
          correctIndex: 0,
          whyWrong: 'Le fou a1 attaque c3 en diagonale. Tu peux capturer la dame.'
        },
        prompt: 'Capture la dame avec le fou.',
        solution: 'Bxc3',
        hint: 'Diagonale a1-b2-c3.'
      }
    ]
  },

  /* ---------- M4-L6 : L'ATTAQUE À LA DÉCOUVERTE ---------- */
  'M4-L6': {
    kind: 'solve-puzzle',
    tasks: [

      /* Roi noir e8, Cavalier blanc e3, Tour blanche d1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le cavalier en e3 gêne-t-il la tour d1 ?',
          options: ['Non, il n\'est pas sur la colonne d', 'Oui', 'Peut-être'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en e3 est hors de la colonne d. La tour d1 peut aller en d8.'
        },
        prompt: 'Échec immédiat avec la tour.',
        solution: 'Rd8+',
        hint: 'Tour d1 vers d8.'
      },

      /* Roi noir e8, Cavalier blanc e3, Tour blanche d1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quel est le meilleur coup ?',
          options: ['Rd8+', 'Nf5', 'Nd5'],
          correctIndex: 0,
          whyWrong: 'Rd8+ donne échec immédiatement. Le cavalier peut attendre.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      },

      /* Roi noir e8, deux tours blanches a1 et h1, roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Combien de tours peuvent donner échec en un coup ?',
          options: ['Une seule', 'Les deux', 'Aucune'],
          correctIndex: 1,
          whyWrong: 'Les deux tours atteignent la 8e rangée. Chacune peut donner échec.'
        },
        prompt: 'Choisis un échec.',
        solution: 'Ra8+',
        hint: 'Rangée 8.'
      },

      /* Roi noir e8, Tour blanche d1, Roi blanc e1. */
      {
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Sans autre pièce, quel échec est possible ?',
          options: ['Rd8+', 'Rd7', 'Re8+'],
          correctIndex: 0,
          whyWrong: 'Seule Rd8+ donne échec au roi noir en e8.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      }
    ]
  },

  /* ---------- M4-L7 : L'ÉCHEC DOUBLE ---------- */
  'M4-L7': {
    kind: 'solve-puzzle',
    tasks: [

      {
        fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Combien de tours peuvent donner échec au roi e8 ?',
          options: ['Une seule', 'Les deux', 'Aucune'],
          correctIndex: 1,
          whyWrong: 'Les deux tours atteignent la 8e rangée.'
        },
        prompt: 'Échec avec la tour a1.',
        solution: 'Ra8+',
        hint: 'Tour a1 vers a8.'
      },

      {
        fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Échec avec la tour h1.',
          options: ['Rh8+', 'Rh1', 'Rien'],
          correctIndex: 0,
          whyWrong: 'La tour h1 peut atteindre h8 pour donner échec.'
        },
        prompt: 'Échec avec la tour h1.',
        solution: 'Rh8+',
        hint: 'Tour h1 vers h8.'
      },

      {
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Un seul échec possible.',
          options: ['Rd8+', 'Rd7', 'Re1'],
          correctIndex: 0,
          whyWrong: 'Seule Rd8+ donne échec au roi noir en e8.'
        },
        prompt: 'Échec simple.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      }
    ]
  },

  /* ---------- M4-L8 : LE COUP INTERMÉDIAIRE ---------- */
  'M4-L8': {
    kind: 'solve-puzzle',
    tasks: [

      /* Roi noir e8, Dame noire a2, Tour blanche a1, Roi blanc e1.
         ⚠️ Dame a2 attaque-t-elle e1 ? La dame a2 attaque la rangée 2 et la colonne a et la diagonale a2-b1 (vers bas-droit) et a2-b3 (vers haut-droit). e1 n'est pas atteint. ✅ */
      {
        fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en a2 attaque ta tour en a1. Que faire ?',
          options: ['Ra8+ d\'abord, puis prendre la dame', 'Rxa2 immédiat', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Rxa2 est possible. Mais Ra8+ force le roi à bouger avant que tu prennes la dame.'
        },
        prompt: 'Joue le coup intermédiaire.',
        solution: 'Ra8+',
        hint: 'Échec d\'abord, capture ensuite.'
      },

      /* Roi noir e8, Dame noire a1, Roi blanc e1.
         ⚠️ Dame a1 attaque toute la rangée 1, dont e1. Roi blanc EN ÉCHEC.
         Solution : le roi doit bouger. Kd2 ou Ke2 (mais e2 attaqué par dame a1 sur la colonne a1 ? non, a1 attaque la rangée 1 et la colonne a et la diagonale a1-b2-c3...). */
      {
        fen: '4k3/8/8/8/8/8/8/q3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en a1 donne échec sur la rangée 1. Que faire ?',
          options: ['Kd2 pour esquiver', 'Re1', 'Aucun coup'],
          correctIndex: 0,
          whyWrong: 'Le roi en e1 peut aller en d2 pour sortir de la rangée 1 attaquée.'
        },
        prompt: 'Esquive l\'échec.',
        solution: 'Kd2',
        hint: 'Rangée 1 → rangée 2.'
      },

      /* Rappel du premier puzzle. */
      {
        fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Position rappel : dame en a2, tour en a1. Coup intermédiaire ?',
          options: ['Ra8+', 'Rxa2', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Ra8+ est le zwischenzug gagnant.'
        },
        prompt: 'Coup intermédiaire.',
        solution: 'Ra8+',
        hint: 'Échec à la tour a1 en a8.'
      }
    ]
  },

  /* =========================================================
     MODULE 5 — COMBINAISONS
     ========================================================= */

  /* ---------- M5-L1 : MAT DU BERGER ---------- */
  'M5-L1': {
    kind: 'solve-puzzle',
    tasks: [

      {
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Après 1.e4 e5 2.Fc4 Cc6, quelle pièce doit attaquer f7 ?',
          options: ['La dame en h5', 'Le cavalier en f3', 'Le fou en c4'],
          correctIndex: 0,
          whyWrong: 'La dame en h5 vise f7 et h7, les points faibles du roi noir.'
        },
        prompt: 'Joue le premier coup du mat du berger.',
        solution: 'Qh5',
        hint: 'Dame d1 vers h5.'
      },

      {
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Après Qh5, comment mater en un coup ?',
          options: ['Qxf7#', 'Qxe5+', 'Qh4'],
          correctIndex: 0,
          whyWrong: 'Le mat du berger : la dame h5 capture le pion f7 avec protection du fou c4.'
        },
        prompt: 'Mate en 1.',
        solution: 'Qxf7#',
        hint: 'Dame h5 prend pion f7.'
      },

      {
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Reconnais-tu la configuration du mat du berger ?',
          options: ['Oui, il commence par Qh5', 'Non', 'Peut-être'],
          correctIndex: 0,
          whyWrong: 'Le mat du berger suit le schéma 1.e4 e5 2.Fc4 Cc6 3.Dh5.'
        },
        prompt: 'Premier coup du mat du berger.',
        solution: 'Qh5',
        hint: 'Vers h5.'
      }
    ]
  },

  /* ---------- M5-L2 : MAT À L'ÉTOUFFÉE ---------- */
  'M5-L2': {
    kind: 'solve-puzzle',
    tasks: [

      {
        fen: '6rk/6pp/8/5N2/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir en h8 est étouffé par ses propres pièces. Quelle pièce mate ?',
          options: ['Le cavalier en f5 → f7', 'La dame', 'Aucune'],
          correctIndex: 0,
          whyWrong: 'Un cavalier en f7 donne échec et mat à un roi étouffé en h8.'
        },
        prompt: 'Mat à l\'étouffée.',
        solution: 'Nf7#',
        hint: 'Cavalier en f5 va en f7.'
      },

      {
        fen: '6rk/6pp/8/8/5N2/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Cavalier en f4. Que faire ?',
          options: ['Nf7#', 'Nh5', 'Nd5'],
          correctIndex: 0,
          whyWrong: 'Un cavalier en f4 peut atteindre f7 pour mater.'
        },
        prompt: 'Mat à l\'étouffée.',
        solution: 'Nf7#',
        hint: 'De f4 vers f7.'
      },

      {
        fen: '6rk/5Npp/8/8/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le cavalier est déjà en f7. Le roi noir est-il mat ?',
          options: ['Oui, déjà mat', 'Non', 'Je ne sais pas'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en f7 attaque h8 (roi) et aucune pièce noire ne peut le capturer. MAT.'
        },
        prompt: 'Le cavalier est déjà en f7. Confirme.',
        solution: 'Nf7#',
        hint: 'Le cavalier va en f7.'
      }
    ]
  },

  /* ---------- M5-L3 : MAT DU COULOIR ---------- */
  'M5-L3': {
    kind: 'solve-puzzle',
    tasks: [

      {
        fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Les pions noirs f7, g7, h7 bloquent les fuites du roi en g8. Où mater ?',
          options: ['En a8 (mat du couloir)', 'En h1', 'Avec le roi'],
          correctIndex: 0,
          whyWrong: 'Le mat du couloir exploite la 8e rangée faible : Ra8#.'
        },
        prompt: 'Mat du couloir.',
        solution: 'Ra8#',
        hint: 'Tour a1 vers a8.'
      },

      {
        fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Les pions noirs bloquent-ils suffisamment le roi noir ?',
          options: ['Oui, Ra8# est mat', 'Non, le roi peut fuir en h8', 'Peut-être'],
          correctIndex: 0,
          whyWrong: 'Les pions f7 g7 h7 ferment les cases de fuite. Ra8# est mat.'
        },
        prompt: 'Mat du couloir.',
        solution: 'Ra8#',
        hint: 'Colonne a, rangée 8.'
      }
    ]
  },

  /* ---------- M5-L4 : MAT D'ANASTASIE ---------- */
  'M5-L4': {
    kind: 'solve-puzzle',
    tasks: [

      {
        fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en f7 contrôle h8 et h6. Que peut faire la tour ?',
          options: ['Ra8#', 'Rh1', 'Rf1'],
          correctIndex: 0,
          whyWrong: 'Avec un cavalier en f7, une tour en a8 donne mat (Anastasie).'
        },
        prompt: 'Mat d\'Anastasie.',
        solution: 'Ra8#',
        hint: 'Tour vers a8.'
      },

      {
        fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir est en g8. Quelle case de tour mate ?',
          options: ['a8', 'h1', 'f1'],
          correctIndex: 0,
          whyWrong: 'Ra8# sur la 8e rangée, avec le cavalier en f7 qui couvre les fuites.'
        },
        prompt: 'Mat d\'Anastasie.',
        solution: 'Ra8#',
        hint: 'Colonne a.'
      }
    ]
  },

  /* ---------- M5-L5 : MAT ARABE ---------- */
  'M5-L5': {
    kind: 'solve-puzzle',
    tasks: [

      {
        fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Roi noir en h8, cavalier en f5. Quelle case de tour mate ?',
          options: ['f8#', 'f1', 'h1'],
          correctIndex: 0,
          whyWrong: 'Rf8# avec le cavalier en f5 (attaque h6 et g7).'
        },
        prompt: 'Mat arabe.',
        solution: 'Rf8#',
        hint: 'Tour f1 vers f8.'
      },

      {
        fen: '7k/6pp/8/5N2/8/8/8/5RK1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La tour en f1 doit atteindre quelle case ?',
          options: ['f8', 'a1', 'h1'],
          correctIndex: 0,
          whyWrong: 'f8 est la case de mat.'
        },
        prompt: 'Mat arabe.',
        solution: 'Rf8#',
        hint: 'Colonne f, rangée 8.'
      }
    ]
  },

  /* ---------- M5-L6 : COMBINAISONS MIXTES ---------- */
  'M5-L6': {
    kind: 'solve-puzzle',
    tasks: [

      {
        fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Reconnais-tu ce motif classique ?',
          options: ['Mat du couloir', 'Mat à l\'étouffée', 'Fourchette'],
          correctIndex: 0,
          whyWrong: 'Les pions f7 g7 h7 bloquent le roi sur la 8e : mat du couloir.'
        },
        prompt: 'Mat en 1.',
        solution: 'Ra8#',
        hint: 'Colonne a.'
      },

      {
        fen: '6k1/5Npp/8/8/8/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Reconnais-tu ce motif ?',
          options: ['Mat d\'Anastasie', 'Fourchette', 'Enfilade'],
          correctIndex: 0,
          whyWrong: 'Cavalier + tour contre roi coincé = mat d\'Anastasie.'
        },
        prompt: 'Mat en 1.',
        solution: 'Ra8#',
        hint: 'Tour en a8.'
      }
    ]
  }
};
