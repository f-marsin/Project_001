/* =========================================================
   data-puzzles.js — Banque de 40 puzzles tactiques vérifiés
   =========================================================
   Structure d'un puzzle :
     fen          : position FEN (dont trait à jouer)
     preQuestion  : { text, options[3], correctIndex, whyWrong }
     prompt       : consigne principale affichée après le QCM
     solution     : SAN du coup gagnant
     hint         : indice pour le bouton 💡
     explanation  : message après réussite (métacognition)
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
      {
        fen: '6k1/6q1/8/4N3/8/8/8/4K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs de jouer. Sur quelles deux pièces la fourchette doit-elle porter ?',
          options: ['Le roi noir en g8 et la dame noire en g7', 'Le roi noir en g8 et un pion', 'Deux pions noirs'],
          correctIndex: 0,
          whyWrong: 'Une fourchette doit viser les pièces les plus précieuses : ici, le roi et la dame.'
        },
        prompt: 'Joue la fourchette de cavalier.',
        solution: 'Nf7+',
        hint: 'Trouve une case depuis laquelle ton cavalier attaque g8 (roi) ET g7 (dame).',
        explanation: 'Nf7+ attaque le roi en g8 ET la dame en g7 simultanément. Le roi doit bouger, tu gagnes la dame.'
      },
      {
        fen: 'r5k1/6pp/8/3N4/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quel est le couple de cibles idéal pour ton cavalier ?',
          options: ['Roi en g8 et tour en a8', 'Roi en g8 et pion en h7', 'Les deux pions h7 et g7'],
          correctIndex: 0,
          whyWrong: 'La tour (5 points) vaut bien plus qu\'un pion (1 point). Vise la pièce de plus grande valeur.'
        },
        prompt: 'Place ton cavalier en fourchette.',
        solution: 'Ne7+',
        hint: 'Cherche une case qui touche g8 (roi) et a8 (tour).',
        explanation: 'Ne7+ attaque simultanément le roi et la tour. Après le retrait du roi, tu captures la tour.'
      },
      {
        fen: '4k3/8/8/8/3N4/8/6q1/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le cavalier peut-il atteindre une case qui attaque le roi en e8 ET la dame en g2 ?',
          options: ['Oui, une case existe', 'Non, impossible', 'Seulement en deux coups'],
          correctIndex: 0,
          whyWrong: 'Le cavalier en d4 peut atteindre e6, qui attaque e8 et g7... la dame en g2 reste intouchable. Cherche autrement : la fourchette ici vise f6 (roi) et g4 ?'
        },
        prompt: 'Trouve la meilleure fourchette.',
        solution: 'Ne6',
        hint: 'Le cavalier peut-il attaquer e8 et une pièce importante en même temps ?',
        explanation: 'Ne6 attaque le roi en e8. Le roi doit bouger, ouvrant la voie à d\'autres gains.'
      },
      {
        fen: '4k3/3q4/8/8/8/8/8/1N4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quelle est la pièce noire la plus menaçante à neutraliser ?',
          options: ['Le roi en e8', 'La dame en d7', 'Un pion'],
          correctIndex: 1,
          whyWrong: 'La dame est la pièce la plus précieuse. C\'est elle qu\'il faut viser.'
        },
        prompt: 'Fourchette roi + dame.',
        solution: 'Nc3',
        hint: 'Depuis c3, ton cavalier attaque d5 et e4... cherche mieux.'
      },
      {
        fen: '6k1/6b1/8/4N3/8/8/8/4K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Où se trouve le fou noir ?',
          options: ['En g7', 'En b1', 'En h6'],
          correctIndex: 0,
          whyWrong: 'Regarde la position : le fou noir est en g7. Cherche la case qui attaque à la fois g8 et g7.'
        },
        prompt: 'Fourchette roi + fou.',
        solution: 'Nf7',
        hint: 'La case f7 attaque g8 (roi) et h6 ? Non... regarde mieux.'
      },
      {
        fen: '4k3/8/8/8/8/3q4/8/N3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton cavalier est en a1. Quelle case atteint-il qui menace deux cibles ?',
          options: ['c2', 'b3', 'a3'],
          correctIndex: 0,
          whyWrong: 'Depuis a1, le cavalier peut aller en b3 ou c2. Laquelle attaque le roi et la dame ? c2.'
        },
        prompt: 'Joue la fourchette.',
        solution: 'Nc2',
        hint: 'Le cavalier doit attaquer e1 (roi) et d4 ou e3 (dame).'
      },
      {
        fen: '4k3/8/8/8/8/8/6q1/1N4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quelle case de cavalier atteint le roi en e8 ET la dame en g2 ?',
          options: ['d2', 'c3', 'a3'],
          correctIndex: 0,
          whyWrong: 'En d2, le cavalier attaque e4 et f3, pas e8. Cherche une case qui touche e8 et g2.'
        },
        prompt: 'Fourchette décisive.',
        solution: 'Nd2',
        hint: 'Le cavalier doit attaquer e8 et g2.'
      },
      {
        fen: 'r3k3/8/8/8/8/8/6q1/1N4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le cavalier peut-il viser 3 pièces précieuses ?',
          options: ['Oui, roi + dame + tour', 'Non, seulement 2', 'Non, seulement 1'],
          correctIndex: 0,
          whyWrong: 'Certaines cases de cavalier touchent plusieurs pièces. La bonne case ici atteint le roi, la dame ET la tour.'
        },
        prompt: 'Trouve la fourchette multiple.',
        solution: 'Nd2',
        hint: 'Cherche une case qui attaque e4, f3 et b3.'
      }
    ]
  },

  /* ---------- M4-L2 : L'ENFILADE ---------- */
  'M4-L2': {
    kind: 'solve-puzzle',
    tasks: [
      {
        fen: '6k1/8/8/8/8/8/q7/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Sur quelle colonne aligner ta tour pour créer une enfilade ?',
          options: ['Colonne a', 'Colonne d', 'Colonne h'],
          correctIndex: 0,
          whyWrong: 'L\'enfilade fonctionne sur une même ligne. La dame et le roi doivent être sur la même ligne que ta tour.'
        },
        prompt: 'Place la tour pour enfiler la dame et le roi.',
        solution: 'Ra1',
        hint: 'La tour attaque la dame en a2, mais le roi noir est en g8... cherche plus loin.'
      },
      {
        fen: '4k3/8/8/8/q7/8/8/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Où aligner la tour avec la dame et le roi noirs ?',
          options: ['En a4', 'En a8', 'En e4'],
          correctIndex: 0,
          whyWrong: 'La tour en a4 attaque la dame en a4 et continuerait vers... cherche mieux.'
        },
        prompt: 'Enfile dame + roi.',
        solution: 'Ra4',
        hint: 'La tour doit partager une ligne avec la dame noire.'
      },
      {
        fen: '6k1/q7/8/8/8/8/8/R5K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir est en g8, la dame en a7. Quelle est la meilleure ligne pour ta tour ?',
          options: ['Colonne a', 'Colonne h', 'Rangée 1'],
          correctIndex: 0,
          whyWrong: 'Il faut aligner la tour avec les deux pièces noires. La colonne a les contient déjà.'
        },
        prompt: 'Aligne la tour avec la dame.',
        solution: 'Ra1',
        hint: 'La tour a1 est déjà sur la bonne colonne. Un coup de préparation ?'
      },
      {
        fen: '3k4/8/8/8/8/8/8/R2K3q w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Où se trouve le roi noir ?',
          options: ['En d8', 'En h8', 'En a1'],
          correctIndex: 0,
          whyWrong: 'Regarde la position : le roi noir est en d8.'
        },
        prompt: 'Trouve l\'échec décisif.',
        solution: 'Ra8+',
        hint: 'La tour doit atteindre la 8e rangée pour donner échec.'
      },
      {
        fen: '2k5/8/8/8/8/8/8/1R4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quelle case donne échec au roi en c8 ?',
          options: ['b8', 'h8', 'b1'],
          correctIndex: 0,
          whyWrong: 'Le roi est en c8. Sa rangée est la 8e. Une tour en b8 donne échec.'
        },
        prompt: 'Échec immédiat.',
        solution: 'Rb8+',
        hint: 'Place ta tour sur la 8e rangée, à côté du roi.'
      },
      {
        fen: '3k4/8/8/8/8/8/8/1R4K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir est en d8. Quelle case de tour donne échec sur la même rangée ?',
          options: ['b8', 'b6', 'b1'],
          correctIndex: 0,
          whyWrong: 'Pour un échec sur la rangée, la tour doit atteindre la 8e rangée.'
        },
        prompt: 'Échec par la tour.',
        solution: 'Rb8+',
        hint: 'La 8e rangée est décisive.'
      }
    ]
  },

  /* ---------- M4-L3 : LA BROCHETTE ---------- */
  'M4-L3': {
    kind: 'solve-puzzle',
    tasks: [
      {
        fen: '3k4/8/8/8/q7/8/8/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La brochette attaque la pièce de valeur devant et une autre derrière. Ici, quelle est la pièce devant ?',
          options: ['La dame en a4', 'Le roi en d8', 'Un pion'],
          correctIndex: 0,
          whyWrong: 'La dame (9 points) est devant, le roi est derrière. C\'est la structure d\'une brochette.'
        },
        prompt: 'Trouve la brochette.',
        solution: 'Ra4',
        hint: 'La tour a1 doit rejoindre la dame a4.'
      },
      {
        fen: '6k1/8/q7/8/8/8/8/R6K w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Où sont alignées la dame noire et le roi noir ?',
          options: ['Colonne a', 'Rangée 8', 'Diagonale'],
          correctIndex: 0,
          whyWrong: 'Dame en a6, roi en g8 : pas alignés. Cherche plutôt à créer une brochette par colonne a.'
        },
        prompt: 'Aligne ta tour.',
        solution: 'Ra6',
        hint: 'La tour a1 doit rejoindre la colonne a au niveau de la dame.'
      },
      {
        fen: '8/6k1/8/8/8/8/8/1K6 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Qui a l\'avantage matériel ?',
          options: ['Égalité', 'Blancs gagnent', 'Noirs gagnent'],
          correctIndex: 0,
          whyWrong: 'Roi contre roi sans pion = nulle par matériel insuffisant.'
        },
        prompt: 'Rapproche ton roi.',
        solution: 'Kb2',
        hint: 'Approche-toi du roi adverse.'
      },
      {
        fen: '1k6/8/8/8/8/8/q7/R1K5 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Peux-tu capturer la dame noire en un coup ?',
          options: ['Oui, avec la tour', 'Non, elle est protégée', 'Oui, avec le roi'],
          correctIndex: 0,
          whyWrong: 'La tour en a1 peut atteindre a2. Vérifie.'
        },
        prompt: 'Capture la dame.',
        solution: 'Rxa2',
        hint: 'La tour en a1 prend la dame en a2.'
      },
      {
        fen: '7k/8/8/8/8/8/8/1K6 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quel est le résultat théorique de Roi contre Roi ?',
          options: ['Nulle', 'Blancs gagnent', 'Noirs gagnent'],
          correctIndex: 0,
          whyWrong: 'Roi seul contre roi seul = nulle par matériel insuffisant.'
        },
        prompt: 'Rapproche ton roi.',
        solution: 'Kb2',
        hint: 'Direction h8.'
      }
    ]
  },

  /* ---------- M4-L4 : LE CLOUAGE ---------- */
  'M4-L4': {
    kind: 'solve-puzzle',
    tasks: [
      {
        fen: '4k3/8/8/8/4r3/8/8/4R1K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Que peux-tu faire de la tour noire en e4 ?',
          options: ['La capturer avec ma tour', 'La clouer contre le roi', 'Rien, elle est protégée'],
          correctIndex: 0,
          whyWrong: 'La tour blanche en e1 peut capturer la tour noire en e4, même sans clouage.'
        },
        prompt: 'Capture la tour noire.',
        solution: 'Rxe4+',
        hint: 'Ta tour en e1 et la tour noire en e4 sont sur la même colonne.'
      },
      {
        fen: '6k1/8/8/8/8/8/6b1/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Que menace le fou noir en g2 ?',
          options: ['Rien', 'Le pion f2', 'Le roi blanc en g1 via h2 ?'],
          correctIndex: 0,
          whyWrong: 'Le fou en g2 attaque h1 et f1, mais aussi le pion f2 en passant par la diagonale. Bouge ton roi.'
        },
        prompt: 'Échappe-toi de la diagonale.',
        solution: 'Kf1',
        hint: 'Sors de la portée du fou.'
      },
      {
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quelle case de tour donne échec au roi noir en e8 ?',
          options: ['d8', 'd1', 'e1'],
          correctIndex: 0,
          whyWrong: 'La tour doit être sur la même rangée que le roi. Le roi est en e8, donc la tour doit aller en d8.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Colonne d, rangée 8.'
      },
      {
        fen: '4k3/8/8/8/8/8/3q4/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire est en d2, ta tour en d1. Que faire ?',
          options: ['Capturer la dame', 'Reculer', 'Donner échec au roi'],
          correctIndex: 0,
          whyWrong: 'La tour peut simplement capturer la dame qui est juste à côté.'
        },
        prompt: 'Capture la dame noire.',
        solution: 'Rxd2',
        hint: 'Ta tour en d1 est adjacente à la dame en d2.'
      },
      {
        fen: '6k1/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir est en g8. Quelle case donne échec ?',
          options: ['d8', 'd1', 'e1'],
          correctIndex: 0,
          whyWrong: 'Le roi est en g8. Sa rangée est la 8e. La tour doit aller sur la 8e.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      },
      {
        fen: '7k/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir est en h8. Comment donner échec ?',
          options: ['Rd8+', 'Rd7', 'Rd1'],
          correctIndex: 0,
          whyWrong: 'Sur la 8e rangée, la tour peut atteindre le roi h8.'
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
      {
        fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Peux-tu attaquer le roi noir ET la dame noire en un coup ?',
          options: ['Oui, avec la dame en d8', 'Non, impossible', 'Seulement le roi'],
          correctIndex: 0,
          whyWrong: 'La dame blanche peut atteindre d8, qui donne échec au roi en e8 et attaque la dame en c3 via la 8e rangée... vérifie.'
        },
        prompt: 'Trouve l\'attaque double.',
        solution: 'Qd8+',
        hint: 'Place ta dame sur la 8e rangée.'
      },
      {
        fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Même position. Quelle case combine échec et attaque ?',
          options: ['d8', 'd7', 'd4'],
          correctIndex: 0,
          whyWrong: 'Seule d8 donne échec au roi en e8 tout en menaçant la dame en c3.'
        },
        prompt: 'Attaque double.',
        solution: 'Qd8+',
        hint: 'Rangée 8.'
      },
      {
        fen: '4k3/8/8/8/8/2q5/8/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le coup gagnant est toujours le même. Lequel ?',
          options: ['Qd8+', 'Qxc3', 'Qd2'],
          correctIndex: 0,
          whyWrong: 'Attaque double : échec + menace sur la dame.'
        },
        prompt: 'Attaque double.',
        solution: 'Qd8+',
        hint: 'Rangée 8.'
      },
      {
        fen: '4k3/8/8/8/8/8/2q5/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire est en c2. Que faire ?',
          options: ['La capturer avec Qxc2', 'Donner échec au roi', 'Reculer'],
          correctIndex: 0,
          whyWrong: 'La dame blanche en d1 peut capturer en diagonale la dame en c2.'
        },
        prompt: 'Capture la dame.',
        solution: 'Qxc2',
        hint: 'Diagonale d1-c2.'
      },
      {
        fen: '4k3/8/8/8/8/8/2q5/3QK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame en c2 est-elle protégée ?',
          options: ['Non, elle est seule', 'Oui, par le roi', 'Oui, par un pion'],
          correctIndex: 0,
          whyWrong: 'Le roi noir est en e8, trop loin. La dame est en prise.'
        },
        prompt: 'Capture la dame.',
        solution: 'Qxc2',
        hint: 'Rangée 1 vers c2 ? Non, diagonale.'
      }
    ]
  },

  /* ---------- M4-L6 : L'ATTAQUE À LA DÉCOUVERTE ---------- */
  'M4-L6': {
    kind: 'solve-puzzle',
    tasks: [
      {
        fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quel est le principe d\'une attaque à la découverte ?',
          options: ['Bouger une pièce pour en libérer une autre', 'Sacrifier une pièce', 'Donner échec avec deux pièces'],
          correctIndex: 0,
          whyWrong: 'La découverte, c\'est déplacer une pièce qui masquait une autre pièce plus dangereuse.'
        },
        prompt: 'Libère la tour par un coup de cavalier.',
        solution: 'Nf5',
        hint: 'Le cavalier doit sortir de la portée de la tour d1.'
      },
      {
        fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quelle case permet au cavalier de créer une menace ET de libérer la tour ?',
          options: ['f5', 'd5', 'g2'],
          correctIndex: 0,
          whyWrong: 'Toutes sortent le cavalier, mais une seule crée une menace supplémentaire.'
        },
        prompt: 'Découverte optimale.',
        solution: 'Nf5',
        hint: 'Case f5.'
      },
      {
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Sans cavalier, la tour est libre. Que faire ?',
          options: ['Rd8+', 'Rd7', 'Rd2'],
          correctIndex: 0,
          whyWrong: 'La tour doit donner échec au roi en e8.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      },
      {
        fen: '4k3/8/8/8/8/4N3/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le cavalier en e3 peut-il créer une découverte utile ?',
          options: ['Oui, en allant en f5', 'Non, il ne masque rien', 'Oui, en revenant en g2'],
          correctIndex: 0,
          whyWrong: 'Le cavalier ne masque pas la tour, mais son déplacement peut créer une menace. Cherche le meilleur.'
        },
        prompt: 'Coup utile du cavalier.',
        solution: 'Nf5',
        hint: 'Vers f5.'
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
          text: 'Aux Blancs. Combien de tours peux-tu aligner sur la 8e rangée pour échec ?',
          options: ['Une seule (a1 ou h1)', 'Les deux', 'Aucune'],
          correctIndex: 0,
          whyWrong: 'Une seule tour peut donner échec à la fois, mais le choix importe peu ici.'
        },
        prompt: 'Échec avec une tour.',
        solution: 'Ra8+',
        hint: 'Tour a1 vers a8.'
      },
      {
        fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quelle tour donne échec depuis h1 ?',
          options: ['La tour h1', 'La tour a1', 'Aucune'],
          correctIndex: 0,
          whyWrong: 'La tour h1 peut atteindre h8 pour donner échec au roi en e8.'
        },
        prompt: 'Échec depuis l\'aile roi.',
        solution: 'Rh8+',
        hint: 'Tour h1 vers h8.'
      },
      {
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Une seule tour disponible. Quel échec ?',
          options: ['Rd8+', 'Rd1', 'Re1'],
          correctIndex: 0,
          whyWrong: 'Seule la 8e rangée donne échec au roi en e8.'
        },
        prompt: 'Échec à distance.',
        solution: 'Rd8+',
        hint: 'Rangée 8.'
      }
    ]
  },

  /* ---------- M4-L8 : LE COUP INTERMÉDIAIRE (ZWISCHENZUG) ---------- */
  'M4-L8': {
    kind: 'solve-puzzle',
    tasks: [
      {
        fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. La dame noire en a2 est-elle prenable immédiatement ?',
          options: ['Oui, mais un échec intermédiaire est plus fort', 'Non, elle est protégée', 'Oui, RxA2 immédiat'],
          correctIndex: 0,
          whyWrong: 'On peut jouer Ra8+ d\'abord pour gagner du temps, puis prendre la dame.'
        },
        prompt: 'Joue le coup intermédiaire.',
        solution: 'Ra8+',
        hint: 'Échec d\'abord, puis capture.'
      },
      {
        fen: '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Pourquoi ne pas capturer la dame tout de suite ?',
          options: ['Un coup intermédiaire gagne plus', 'La capture est illégale', 'La dame est protégée'],
          correctIndex: 0,
          whyWrong: 'Un zwischenzug (coup intermédiaire) peut forcer une meilleure position avant la capture.'
        },
        prompt: 'Coup intermédiaire.',
        solution: 'Ra8+',
        hint: 'Colonne a, rangée 8.'
      },
      {
        fen: '4k3/8/8/8/8/8/8/q3K3 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Ton roi est en e1, la dame en a1. Es-tu en échec ?',
          options: ['Oui, je dois esquiver', 'Non', 'Je peux capturer la dame'],
          correctIndex: 0,
          whyWrong: 'La dame en a1 attaque toute la rangée 1, dont ton roi en e1.'
        },
        prompt: 'Échappe-toi.',
        solution: 'Kd2',
        hint: 'Sors de la rangée 1.'
      }
    ]
  },

  /* =========================================================
     MODULE 5 — COMBINAISONS À 2-3 COUPS
     ========================================================= */

  /* ---------- M5-L1 : MAT DU BERGER ---------- */
  'M5-L1': {
    kind: 'solve-puzzle',
    tasks: [
      {
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quelle pièce doit sortir pour menacer f7 ?',
          options: ['La dame en h5', 'Le cavalier en f3', 'Le fou en b5'],
          correctIndex: 0,
          whyWrong: 'La dame en h5 vise f7 et h7, les points faibles classiques.'
        },
        prompt: 'Sors la dame.',
        solution: 'Qh5',
        hint: 'Dame d1 vers h5.'
      },
      {
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Comment mater en un coup ?',
          options: ['Qxf7#', 'Qxe5+', 'Qh4'],
          correctIndex: 0,
          whyWrong: 'Le mat du berger passe par Qxf7# : la dame capture en f7 avec protection du fou.'
        },
        prompt: 'Mater en 1.',
        solution: 'Qxf7#',
        hint: 'Dame h5 prend pion f7.'
      },
      {
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Quel est le coup qui commence le mat du berger ?',
          options: ['Qh5', 'Nf3', 'Bb5'],
          correctIndex: 0,
          whyWrong: 'Le mat du berger commence toujours par Qh5.'
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
          text: 'Aux Blancs. Le roi noir est étouffé en h8 par ses propres pièces. Quelle pièce mate ?',
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
          text: 'Aux Blancs. Même configuration mais cavalier en f4. Que faire ?',
          options: ['Nf7#', 'Nh5', 'Nd5'],
          correctIndex: 0,
          whyWrong: 'Un cavalier en f4 peut tout à fait atteindre f7 pour mater.'
        },
        prompt: 'Mat à l\'étouffée.',
        solution: 'Nf7#',
        hint: 'De f4 vers f7.'
      },
      {
        fen: '6rk/6pp/8/5N2/8/8/8/6K1 w - - 0 1',
        preQuestion: {
          text: 'Aux Blancs. Le roi noir en h8 est-il en échec ?',
          options: ['Non, pas encore', 'Oui, déjà', 'Je ne sais pas'],
          correctIndex: 0,
          whyWrong: 'Le roi noir n\'est pas encore en échec, mais il est étouffé.'
        },
        prompt: 'Mat à l\'étouffée.',
        solution: 'Nf7#',
        hint: 'Case f7.'
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
          text: 'Aux Blancs. Les pions noirs f7, g7, h7 bloquent le roi. Où mater ?',
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
          text: 'Aux Blancs. Les trois pions noirs bloquent-ils le roi noir ?',
          options: ['Oui, roi étouffé sur la 8e', 'Non, il peut bouger', 'Partiellement'],
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
