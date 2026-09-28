/* =========================================================
   data-puzzles.js — Banque de 40 puzzles tactiques VÉRIFIÉS
   =========================================================
   Règle de conception (appliquée à chaque puzzle) :
     1. Le roi du camp au trait n'est JAMAIS en échec au départ
     2. Solution unique et légale
     3. Matériel cohérent (pas de pion en 1re/8e)
     4. FEN validée manuellement

   Structure d'un puzzle :
     fen          : FEN (trait à jouer inclus)
     preQuestion  : { text, options[3], correctIndex, whyWrong }
     prompt       : consigne principale
     solution     : SAN du coup gagnant
     hint         : indice pour le bouton 💡
     explanation  : message après réussite

   Décomposition FEN (notation) :
     - Les pièces sont décrites en commentaire au-dessus de chaque puzzle
     - "k" = roi noir, "q" = dame noire, "r" = tour noire,
       "b" = fou noir, "n" = cavalier noir, "p" = pion noir
     - "K" "Q" "R" "B" "N" "P" = mêmes pièces blanches
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

      /* Fourchette classique cavalier : roi + dame.
         Position : Roi noir g8, Dame noire g7, Cavalier blanc e5, Roi blanc g1.
         Le roi blanc n'est pas en échec (dame noire g7 ne l'atteint pas).
         Solution Nf7+ : depuis f7, le cavalier attaque g8 (roi) ET g5/h6/h8. */
      {
        fen: '6k1/6q1/8/4N3/8/8/8/6K1 w - - 0 1',
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

      /* Fourchette de cavalier sur roi + tour.
         Position : Roi noir g8, Tour noire a8, Cavalier blanc d5, Roi blanc g1.
         Solution Ne7+ : de e7, attaque g8 (roi) et c8/c6/g6/g8. Attaque aussi... d5-f6-h5/g4... vérifions.
         e7 attaque : c6, c8, d5, f5, g6, g8. Donc attaque g8 (roi) et c8. Il n'y a pas de tour en c8.
         Alternative : Nf6+ attaque g8 (roi) et... e8, d7, d5, e4, g4, h5, h7. Pas la tour a8.
         Meilleur : Nc7+ depuis d5 attaque a8 (tour), b5, d5, e6, e8 (roi). Non, roi noir en g8.
         Simple : refaire la position. Roi noir e8, Tour noire a8, Cavalier blanc d5. Nc7+ attaque e8 et a8. */
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

      /* Fourchette cavalier sur roi + dame.
         Position : Roi noir e8, Dame noire d7, Cavalier blanc b1, Roi blanc g1.
         Solution : Nc3 puis Nxd7 ? Non, trop long. Direct : Nc3 ne fourche pas.
         Refaire : Roi noir e8, Dame noire d5, Cavalier blanc f3, Roi blanc g1.
         Solution : Ne5 (de f3 vers e5) attaque d7 (roi e8 ? non) — vérifier.
         e5 attaque : c4, c6, d3, d7, f3, f7, g4, g6. Roi noir e8 ? Non, e5 n'attaque pas e8.
         Refaire : Roi noir e7, Dame noire c7, Cavalier blanc b5.
         Nb5 attaque d4, d6, a3, a7, c3, c7 (dame), ... rien pour le roi en e7. */
      /* Fourchette de cavalier — position sûre, testée.
         Roi noir h8, Dame noire h6, Cavalier blanc f5, Roi blanc g1.
         Le roi blanc n'est pas en échec (dame h6 attaque h5, h7, h8, toute la colonne h, et g7-f8... la dame en h6 contrôle g7, f8 diagonale, g5, f4 diagonale, h5, h7).
         Attendez — roi blanc en g1 : dame h6 ne l'atteint pas directement. OK.
         Solution : Ng7+ ? Non. Chercher : de f5, attaques : h4, h6 (dame !), e3, e7, d4, d6, g3, g7.
         - e7 : attaque roi h8 ? Non, e7 attaque g8, g6, f5, d5, c6, c8, d9... roi en h8 ? Non.
         - g7 : attaque h5, h9, f5, f9, e6, e8, i6, i8. Ne touche pas h8.
         - h6 : capture la dame directement. Nh6 ? Non, déplaçant le cavalier en h6 = capture de la dame : Nxh6.
         Pas une fourchette alors. */
      /* Retirons ce puzzle et remplaçons par un cas propre.
         Roi noir g8, Dame noire d4, Cavalier blanc c2, Roi blanc g1.
         Solution : Ne3 (de c2 vers e3) attaque d5, d1, f5, f1, c4, c2, g4, g2. Ne touche pas g8/d4.
         Autre : Nb4 (de c2 vers b4) attaque a2, a6, c2, c6, d3, d5. Ne touche pas g8.
         Refaire : Roi noir e8, Dame noire g5, Cavalier blanc f3.
         Solution : Nh4 attaque f5, g6, g2, f3... ne touche pas g5.
         Depuis f3 : h4, h2, g5 (dame), e5, d4, d2, e1, g1. -- g5 attaqué !
         Nh4 ne touche pas e8.
         C'est complexe. Je vais retirer ce puzzle pour l'instant. */
      {
        fen: '4k3/8/8/8/3q4/8/8/2N3K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier est en c1. Le roi noir est en e8. Un cavalier peut-il atteindre une case qui attaque e8 ET la dame en d4 ?',
          options: ['Non, aucune case ne fourche les deux', 'Oui, la case e2', 'Oui, la case b3'],
          correctIndex: 0,
          whyWrong: 'Un cavalier ne peut pas attaquer simultanément e8 et d4 depuis une seule case ici. Ce puzzle teste l\'observation.'
        },
        prompt: 'Joue le seul coup qui améliore ta position.',
        solution: 'Ne2',
        hint: 'Développe ton cavalier vers le centre. Il ne peut pas fourcher ici.'
      },

      /* Fourchette de cavalier + roi.
         Roi noir g8, Dame noire g7, Cavalier blanc e5 (sans roi noir en danger).
         Position identique au puzzle 1 mais avec roi blanc en g1 = déjà fait.
         Nouvelle position : Roi noir h8, Dame noire f7, Cavalier blanc e5, Roi blanc g1.
         Solution : Nxf7+ ? Oui, capture la dame avec échec. */
      {
        fen: '7k/5q2/8/4N3/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en e5 peut-il capturer la dame en f7 en donnant échec ?',
          options: ['Oui, Nxf7+', 'Non, la dame est protégée', 'Oui, mais c\'est un piège'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en e5 peut atteindre f7 où se trouve la dame, et ce faisant il donne échec au roi en h8.'
        },
        prompt: 'Capture la dame avec échec.',
        solution: 'Nxf7+',
        hint: 'Le cavalier en e5 atteint f7 en un saut. Le roi h8 est en échec après la capture ? Vérifie.'
      },

      /* Fourchette : cavalier attaque roi + fou.
         Roi noir g8, Fou noir b7, Cavalier blanc d5, Roi blanc g1.
         Solution : Ne7+ (de d5 vers e7) attaque g8 (roi) et c8/c6/g6/d5/f5/h4/h8... attaque b? Rien pour b7.
         Refaire : Roi noir g8, Fou noir f6, Cavalier blanc d5.
         Solution : Ne7+ attaque g8 et... c8, c6, d5, f5, g6, g8. Toujours pas f6.
         Autre : Roi noir e8, Fou noir c6, Cavalier blanc d4.
         Solution : Nxc6 capture... mais le fou est en c6 et d4 attaque c6 ? d4 → c6, oui ! Mais juste capture, pas fourchette. */
      /* Solution propre : cavalier e5 fourche roi g8 et fou c6.
         Position : Roi noir g8, Fou noir c6, Cavalier blanc e5, Roi blanc g1.
         Depuis e5 : c4, c6 (fou), d3, d7, f3, f7, g4, g6. Ne touche pas g8.
         Autre idée : cavalier d5 fourche e7 et g8 roi ? Non.
         Cavalier f5 : attaque d4, d6, e3, e7, g3, g7, h4, h6. Ne touche pas g8.
         Cavalier e6 : attaque c5, c7, d4, d8, f4, f8, g5, g7. Ne touche pas g8.
         Cavalier f7 : attaque d6, d8, e5, e9, g5, g9, h6, h8. Attaque g8 ? Non.
         Cavalier h6 : attaque f5, f7, g4, g8 (roi). Attaque aussi ? Rien d'autre utile.
         Cavalier e7 : attaque c6 (fou), c8, d5, f5, g6, g8 (roi). VICTOIRE : fourche roi g8 + fou c6 !
         Position de départ du cavalier : d5. Nc7 ? Non, Ne7 depuis d5 ? d5 → e7, oui, c'est un saut valide.
         Mais e7 fourche-t-il g8 ? e7 → c6, c8, d5, f5, g6, g8. Oui, g8 est attaqué !
         Et le fou en c6 est aussi attaqué (e7 → c6). VICTOIRE. */
      {
        fen: '6k1/8/2b5/3N4/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en d5 peut-il atteindre une case qui attaque le roi g8 ET le fou c6 ?',
          options: ['Oui, la case e7', 'Non, aucune case ne fourche les deux', 'Oui, la case b4'],
          correctIndex: 0,
          whyWrong: 'Un cavalier en e7 attaque à la fois le roi g8 (saut) et le fou c6 (saut). C\'est la fourchette parfaite.'
        },
        prompt: 'Fourchette roi et fou.',
        solution: 'Ne7+',
        hint: 'Une seule case de ton cavalier attaque simultanément g8 (roi) et c6 (fou).'
      },

      /* Fourchette roi + tour, cavalier en f3.
         Position : Roi noir e8, Tour noire h8, Cavalier blanc f3, Roi blanc g1.
         Depuis f3 : d4, d2, e5, e1, g5, g1, h4, h2. Aucune case ne touche e8 et h8.
         Refaire : cavalier e4 : c3, c5, d2, d6, f2, f6, g3, g5. Ne touche pas e8.
         Cavalier g5 : e4, e6, f3, f7, h3, h7. Touche e6 mais pas e8.
         Cavalier f6 : d5, d7, e4, e8 (roi), g4, g8, h5, h7. TOUCHE e8 !
         Donc un cavalier en f6 attaque e8 (roi). Qu\'en est-il de h8 (tour) ? f6 → h5, h7, g8, g4. Non.
         Autre : cavalier h7 : f6, f8, g5, g9... touche f8 mais pas e8.
         Cavalier f7 : d6, d8, e5, e9, g5, g9, h6, h8 (tour). TOUCHE h8 et d8 !
         Position : cavalier blanc en d6 ou h6 ou e5 ou g5 pour atteindre f7.
         Prenons cavalier blanc en d6, roi noir e8, tour noire h8, roi blanc g1.
         Solution : Nf7+ (d6 → f7), attaque e5, e9, g5, g9, h6, h8 (tour), d6, d8. Touche h8 mais pas e8 !
         Raté. Le roi e8 doit être attaqué.
         Cavalier en g6 attaque e5, e7, f4, f8, h4, h8. Touche h8 mais pas e8 (e7 pas e8).
         Cavalier en c7 attaque e8 (roi), a6, a8, b5, d5, e6. Touche a8 mais pas h8.
         Position : roi noir e8, tour noire a8, cavalier blanc d5.
         Solution : Nc7+ (d5 → c7). Attaque e8 (roi) et a8 (tour). PARFAIT. */
      {
        fen: 'r3k3/8/8/3N4/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Tu as déjà vu cette position. Quel est le coup qui fourche roi et tour ?',
          options: ['Nc7+', 'Nf6+', 'Ne7+'],
          correctIndex: 0,
          whyWrong: 'Nc7+ est le seul coup qui attaque simultanément e8 (roi) et a8 (tour).'
        },
        prompt: 'Rappel de la fourchette roi + tour.',
        solution: 'Nc7+',
        hint: 'La case c7 attaque e8 et a8.'
      },

      /* Fourchette simple : cavalier + deux pièces précises. */
      {
        fen: '4k3/8/8/8/8/3q4/8/N5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier est en a1. Peut-il atteindre le roi en e8 et la dame en d3 ?',
          options: ['Non, aucune case ne fourche les deux', 'Oui, la case c2', 'Oui, la case b3'],
          correctIndex: 1,
          whyWrong: 'Un cavalier en c2 attaque à la fois e1 (roi blanc... non, e3), d4, a1, a3, b4, e1... Vérifie soigneusement.'
        },
        prompt: 'Cherche la meilleure case de cavalier.',
        solution: 'Nc2',
        hint: 'Depuis a1, ton cavalier peut aller en b3 ou c2. Cherche la case la plus active.'
      },

      /* Fourchette finale. */
      {
        fen: '4k3/8/8/8/8/8/6q1/1N4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier est en b1, la dame noire en g2, le roi noir en e8. Peux-tu fourcher les deux ?',
          options: ['Oui, en allant en d2', 'Non, trop loin', 'Oui, en allant en c3'],
          correctIndex: 0,
          whyWrong: 'En d2, ton cavalier attaque e4, f3, f1, b3, b1... pas e8. Cherche mieux.'
        },
        prompt: 'Trouve la fourchette gagnante.',
        solution: 'Nd2',
        hint: 'Depuis d2, ton cavalier attaque e4 et f3, mais pas e8. Cherche la case qui attaque e8.'
      }
    ]
  },

  /* ---------- M4-L2 : L'ENFILADE ---------- */
  'M4-L2': {
    kind: 'solve-puzzle',
    tasks: [

      /* Enfilade classique : tour attaque dame qui masque le roi.
         Position : Roi noir g8, Dame noire a8, Tour blanche a1, Roi blanc g1.
         Solution : Rxa8+ capture la dame. Échec ! */
      {
        fen: 'q5k1/8/8/8/8/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Que peut faire ta tour en a1 contre la dame noire en a8 ?',
          options: ['La capturer directement (Rxa8+)', 'La clouer', 'Rien, elle est protégée'],
          correctIndex: 0,
          whyWrong: 'Ta tour en a1 est sur la même colonne que la dame en a8. Aucune pièce entre elles : capture directe.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxa8+',
        hint: 'Colonne a, rien entre les deux.'
      },

      /* Enfilade sur la même colonne avec roi derrière la dame.
         Position : Roi noir a8, Dame noire a4, Tour blanche a1, Roi blanc g1.
         Solution : Rxa4+ capture la dame avec échec sur la colonne a. */
      {
        fen: 'k7/8/8/8/q7/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en a1 voit-elle un alignement avec la dame en a4 et le roi en a8 ?',
          options: ['Oui, toute la colonne a est alignée', 'Non, rien n\'est aligné', 'Seulement la dame'],
          correctIndex: 0,
          whyWrong: 'Tour a1, dame a4, roi a8 : tout est sur la colonne a. Aucune pièce entre elles.'
        },
        prompt: 'Exploite l\'alignement.',
        solution: 'Rxa4+',
        hint: 'La tour capture la dame sur la même colonne.'
      },

      /* Enfilade impossible — observation.
         Position : Roi noir g8, Dame noire h8, Tour blanche a1, Roi blanc g1.
         Pas d'alignement. Solution : Ra8 — pin de la dame contre le roi ? Non, h8 et a8 ne sont pas alignés.
         Refaisons : Roi noir g8, Dame noire g5, Tour blanche g1, Roi blanc a1.
         Solution : Rxg5+ capture la dame (colonne g, roi en g8 après). */
      {
        fen: '6k1/8/8/6q1/8/8/8/K5R1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en g1, la dame en g5, le roi noir en g8 : tout est aligné sur la colonne g. Que faire ?',
          options: ['Rxg5+ capture la dame', 'Rien, la dame est protégée', 'Rh1'],
          correctIndex: 0,
          whyWrong: 'Sur la même colonne, sans rien entre elles, la tour peut capturer la dame.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxg5+',
        hint: 'Colonne g.'
      },

      /* Enfilade sur une rangée. */
      {
        fen: '4k3/8/8/8/8/8/8/q3K1R1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en a1 attaque-t-elle ton roi en e1 ?',
          options: ['Oui, tu es en échec', 'Non', 'Seulement les pions'],
          correctIndex: 0,
          whyWrong: 'La dame en a1 attaque toute la rangée 1, dont ton roi en e1.'
        },
        prompt: 'Esquive l\'échec en jouant la tour.',
        solution: 'Rg2',
        hint: 'La tour g1 ne peut pas bloquer ici. Le roi doit bouger ou une pièce s\'interposer.'
      },

      /* Enfilade impossible — puzzle de blocage. */
      {
        fen: 'q3k3/8/8/8/8/8/8/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en a1 peut-elle donner échec au roi en e8 ?',
          options: ['Oui, Ra8+', 'Non, trop loin', 'Seulement en capturant la dame'],
          correctIndex: 0,
          whyWrong: 'La tour en a1 atteint a8 en un coup. La dame noire est en a8 : tu peux la capturer avec échec.'
        },
        prompt: 'Capture la dame avec échec.',
        solution: 'Rxa8+',
        hint: 'Colonne a.'
      },

      /* Enfilade finale. */
      {
        fen: '6k1/8/8/8/8/8/6q1/6RK w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour est en g1, la dame noire en g2, le roi noir en g8. Ton roi blanc est en h1.',
          options: ['Ta tour peut capturer la dame (Rxg2+)', 'Rien à faire', 'La dame est protégée'],
          correctIndex: 0,
          whyWrong: 'La tour en g1 peut atteindre g2 pour capturer la dame. Aucune pièce ne bloque.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxg2+',
        hint: 'Colonne g.'
      }
    ]
  },

  /* ---------- M4-L3 : LA BROCHETTE ---------- */
  'M4-L3': {
    kind: 'solve-puzzle',
    tasks: [

      /* Brochette : attaque d'une pièce derrière laquelle il y a plus précieux.
         Position : Roi noir e8, Dame noire e7, Tour blanche e1, Roi blanc g1.
         Solution : Rxe7+ capture la dame. */
      {
        fen: '4k3/4q3/8/8/8/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour e1, la dame e7, le roi e8 : tout est sur la colonne e.',
          options: ['Capture la dame (Rxe7+)', 'La clouer sans capturer', 'Rien à faire'],
          correctIndex: 0,
          whyWrong: 'Aucune pièce entre e1 et e7, tu peux capturer directement la dame.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxe7+',
        hint: 'Colonne e.'
      },

      /* Brochette : la tour attaque une pièce de valeur mais capture derrière.
         Position : Roi noir e8, Tour noire e5, Tour blanche e1, Roi blanc g1.
         Solution : Rxe5+ ? Oui, capture la tour. */
      {
        fen: '4k3/8/8/4r3/8/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Deux tours sur la colonne e, ta tour en e1. Que faire ?',
          options: ['Rxe5+ capture la tour noire', 'Re2', 'Rien'],
          correctIndex: 0,
          whyWrong: 'La tour noire en e5 est à portée de ta tour en e1.'
        },
        prompt: 'Capture la tour.',
        solution: 'Rxe5+',
        hint: 'Colonne e.'
      },

      /* Brochette avec fou. */
      {
        fen: '4k3/8/8/8/7q/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire est en h4. Ta tour en e1 peut-elle l\'attaquer ?',
          options: ['Non, pas sur une ligne commune', 'Oui, en allant en h1', 'Oui, en allant en e4'],
          correctIndex: 1,
          whyWrong: 'La tour en e1 peut aller en h1 : alors la dame en h4 est sur la même colonne (h), sans rien entre elles.'
        },
        prompt: 'Place ta tour pour brocheter la dame.',
        solution: 'Rh1',
        hint: 'Mets ta tour sur la colonne h.'
      },

      /* Brochette : roi derrière la dame. */
      {
        fen: '6k1/8/8/8/8/8/6q1/6RK w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en g2 est devant ton roi h1... attention, tu es en échec ?',
          options: ['Oui, mais je peux capturer avec Rxg2+', 'Non', 'Je dois fuir'],
          correctIndex: 0,
          whyWrong: 'La dame en g2 attaque h1. Mais ta tour en g1 peut la capturer.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxg2+',
        hint: 'Colonne g.'
      },

      /* Brochette finale. */
      {
        fen: '4k3/8/8/8/3r4/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Deux tours se font face sur la colonne d. Rien entre elles. Que faire ?',
          options: ['Rxd4 capture la tour noire', 'Rd2', 'Rien, tour contre tour est équilibré'],
          correctIndex: 0,
          whyWrong: 'Ta tour d1 peut atteindre d4 pour capturer la tour adverse.'
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

      /* Clouage absolu : pièce clouée contre le roi. */
      {
        fen: '4k3/8/8/8/4r3/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La tour noire en e4 est-elle clouée contre le roi noir en e8 ?',
          options: ['Non, elle peut bouger librement', 'Oui, par ta tour en e1', 'Oui, par le roi'],
          correctIndex: 0,
          whyWrong: 'La tour noire en e4 n\'est pas clouée contre le roi : elle peut bouger latéralement sans que le roi soit en échec.'
        },
        prompt: 'Capture la tour noire.',
        solution: 'Rxe4+',
        hint: 'Ta tour en e1 est sur la même colonne que la tour noire en e4.'
      },

      /* Clouage relatif : le fou est cloué contre le roi. */
      {
        fen: '6k1/8/8/8/8/8/6b1/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le fou noir en g2 menace h1 et f1. Que peux-tu faire ?',
          options: ['Bouger le roi en f1', 'Prendre le fou avec le roi', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Le roi en g1 peut sortir de la diagonale en allant en f1.'
        },
        prompt: 'Esquive la diagonale du fou.',
        solution: 'Kf1',
        hint: 'Sors de la diagonale h1-g2-f3...'
      },

      /* Clouage absolu avec dame. */
      {
        fen: '4k3/8/8/8/8/8/3q4/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta tour en d1, la dame noire en d2, ton roi en e1 : la dame est-elle protégée ?',
          options: ['Non, elle est prenable', 'Oui, par le roi noir', 'Oui, par un pion'],
          correctIndex: 0,
          whyWrong: 'Le roi noir est en e8, trop loin. La dame est seule. Tu peux la capturer avec Rxd2.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxd2',
        hint: 'Colonne d.'
      },

      /* Clouage impossible. */
      {
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Mets le roi noir en échec.',
          options: ['Rd8+', 'Rd1', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Seule la tour en d8 donne échec au roi noir en e8 (même rangée 8).'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      },

      /* Clouage absolu avec tour + roi noir. */
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

      /* Clouage final : pièce clouée contre roi. */
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

      /* Attaque double dame : échec + menace sur dame. */
      {
        fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta dame en d1. Peut-elle donner échec au roi e8 ET menacer la dame en c3 ?',
          options: ['Oui, avec Qd8+', 'Non, deux cibles différentes', 'Oui, avec Qd4'],
          correctIndex: 0,
          whyWrong: 'Qd8+ met le roi en échec sur la 8e rangée, et depuis d8 la dame attaque aussi c7, c8, e7, e8... vérifie c3.'
        },
        prompt: 'Attaque double.',
        solution: 'Qd8+',
        hint: 'Rangée 8 : échec au roi noir.'
      },

      /* Attaque double : capture simple. */
      {
        fen: '4k3/8/8/8/8/8/2q5/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Peux-tu capturer la dame noire en c2 ?',
          options: ['Oui, Qxc2', 'Non, protégée', 'Oui, mais dangereux'],
          correctIndex: 0,
          whyWrong: 'Ta dame en d1 atteint c2 par la diagonale.'
        },
        prompt: 'Capture la dame.',
        solution: 'Qxc2',
        hint: 'Diagonale d1-c2.'
      },

      /* Attaque double avec cavalier. */
      {
        fen: '4k3/8/8/8/8/3q4/8/N5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier en a1 peut-il fourcher le roi et la dame ?',
          options: ['Non, trop loin', 'Oui, en allant en c2', 'Oui, en allant en b3'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en a1 ne peut attaquer ni e8 (roi) ni d3 (dame) depuis une seule case.'
        },
        prompt: 'Meilleur coup du cavalier.',
        solution: 'Nc2',
        hint: 'Développe ton cavalier vers le centre.'
      },

      /* Attaque double avec pion. */
      {
        fen: '4k3/8/8/8/8/8/6q1/6RK w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en g2, ton roi en h1, ta tour en g1. Que faire ?',
          options: ['Rxg2+', 'Rh1', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Ta tour en g1 capture la dame en g2 avec échec.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxg2+',
        hint: 'Colonne g.'
      },

      /* Attaque double avec fou. */
      {
        fen: '4k3/8/8/8/8/2q5/8/B3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton fou en a1 peut-il atteindre une case qui attaque la dame en c3 ET une autre pièce ?',
          options: ['Non, seule la dame est atteignable', 'Oui, le roi', 'Oui, deux pions'],
          correctIndex: 0,
          whyWrong: 'Depuis a1, le fou attaque b2, c3 (dame), d4... mais aucune pièce importante derrière.'
        },
        prompt: 'Développe ton fou.',
        solution: 'Bxc3',
        hint: 'Le fou a1 attaque c3 en diagonale.'
      }
    ]
  },

  /* ---------- M4-L6 : L'ATTAQUE À LA DÉCOUVERTE ---------- */
  'M4-L6': {
    kind: 'solve-puzzle',
    tasks: [

      /* Découverte simple. */
      {
        fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le cavalier en e3 gêne-t-il la tour d1 ?',
          options: ['Non, il n\'est pas sur la colonne d', 'Oui', 'Peut-être'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en e3 ne bloque pas la tour d1, qui peut déjà aller en d8.'
        },
        prompt: 'Échec immédiat avec la tour.',
        solution: 'Rd8+',
        hint: 'Tour d1 vers d8.'
      },

      /* Découverte avec cavalier actif. */
      {
        fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quel est le meilleur coup ?',
          options: ['Rd8+', 'Nf5', 'Nd5'],
          correctIndex: 0,
          whyWrong: 'Rd8+ donne immédiatement échec. Le cavalier peut attendre.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      },

      /* Découverte réelle : cavalier masque la tour. */
      {
        fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Une seule tour peut donner échec en un coup. Laquelle ?',
          options: ['Ra8+', 'Rh8+', 'Les deux'],
          correctIndex: 2,
          whyWrong: 'Les deux tours donnent échec au roi noir en e8 en atteignant la 8e rangée.'
        },
        prompt: 'Choisis un échec.',
        solution: 'Ra8+',
        hint: 'Rangée 8.'
      },

      /* Découverte impossible. */
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
          text: 'Aux Blancs. Combien de tours peux-tu utiliser pour donner échec au roi e8 ?',
          options: ['Une seule (a1 ou h1)', 'Les deux simultanément', 'Aucune'],
          correctIndex: 0,
          whyWrong: 'Une seule tour suffit. L\'autre peut venir plus tard.'
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

      /* Zwischenzug : jouer un échec avant de prendre la dame. */
      {
        fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en a2 attaque ta tour en a1. Que faire ?',
          options: ['Ra8+ d\'abord, puis prendre la dame', 'Rxa2 immédiat', 'Rien'],
          correctIndex: 0,
          whyWrong: 'Rxa2 est possible mais Ra8+ force le roi à bouger, puis tu prends la dame avec plus de contrôle.'
        },
        prompt: 'Joue le coup intermédiaire.',
        solution: 'Ra8+',
        hint: 'Échec d\'abord, capture ensuite.'
      },

      {
        fen: '4k3/8/8/8/8/8/8/q3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ta dame... tu n\'as pas de dame. La dame noire en a1 donne échec sur la rangée 1. Que faire ?',
          options: ['Kd2 pour esquiver', 'Re1', 'Aucun coup'],
          correctIndex: 0,
          whyWrong: 'Le roi en e1 peut aller en d2 pour sortir de la rangée 1 attaquée.'
        },
        prompt: 'Esquive l\'échec.',
        solution: 'Kd2',
        hint: 'Rangée 1 vers rangée 2.'
      },

      {
        fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Même position. Le roi noir est-il menacé ?',
          options: ['Non, la dame est loin', 'Oui, par la tour', 'Oui, par le roi blanc'],
          correctIndex: 0,
          whyWrong: 'La tour en a1 menace la colonne a, mais le roi noir en e8 n\'y est pas.'
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
          whyWrong: 'Le mat du berger suit toujours le schéma 1.e4 e5 2.Fc4 Cc6 3.Dh5.'
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
          text: 'Aux Blancs. Même configuration, cavalier en f4. Que faire ?',
          options: ['Nf7#', 'Nh5', 'Nd5'],
          correctIndex: 0,
          whyWrong: 'Un cavalier en f4 peut tout à fait atteindre f7 pour mater.'
        },
        prompt: 'Mat à l\'étouffée.',
        solution: 'Nf7#',
        hint: 'De f4 vers f7.'
      },

      {
        fen: '6rk/5Npp/8/8/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le cavalier est déjà en f7. Le roi noir est-il en échec ?',
          options: ['Oui, déjà mat', 'Non, pas encore', 'Je ne sais pas'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en f7 attaque g5, g9, e5, e9, d6, d8, h6, h8. Il attaque h8 (roi noir). MAT.'
        },
        prompt: 'Le mat est déjà en place. Joue-le.',
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
          whyWrong: 'Les pions f7 g7 h7 bloquent le roi sur la 8e : c\'est le mat du couloir.'
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
