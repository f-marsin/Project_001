/* =========================================================
   curriculum.js — Structure des 10 modules / 55 leçons
   =========================================================
   Rôle : données pures. Aucune logique.
   Décrit la progression pédagogique complète.

   Chaque leçon a :
     - id           : identifiant unique (M0-L1, M4-L3, ...)
     - title        : titre affiché
     - objective    : objectif pédagogique
     - type         : 'lesson' | 'exercise' | 'puzzle'
     - difficulty   : 1 à 5
     - lichessTheme : thème Lichess associé (pour les puzzles)
                      ex: 'fork', 'pin', 'skewer', 'mateIn1', ...
   ========================================================= */

window.APP = window.APP || {};

window.APP.CURRICULUM = [

  /* =========================================================
     M0 — DÉCOUVERTE DE L'ÉCHIQUIER
     ========================================================= */
  {
    id: 'M0',
    title: 'Découverte de l\'échiquier',
    subtitle: 'Plateau, coordonnées, orientation',
    level: 1,
    unlocked: true,
    lessons: [
      { id: 'M0-L1', title: 'Le plateau et ses coordonnées', objective: 'Identifier les 64 cases, colonnes a-h, rangées 1-8.', type: 'exercise', difficulty: 1 },
      { id: 'M0-L2', title: 'Orientation et camp blanc/noir', objective: 'Savoir où se placent les Blancs et les Noirs.', type: 'exercise', difficulty: 1 },
      { id: 'M0-L3', title: 'Nommer une case', objective: 'Nommer instantanément n\'importe quelle case.', type: 'exercise', difficulty: 1 },
      { id: 'M0-L4', title: 'Le vocabulaire de base', objective: 'Rangée, colonne, diagonale, centre, aile roi, aile dame.', type: 'exercise', difficulty: 2 }
    ]
  },

  /* =========================================================
     M1 — LE MOUVEMENT DES PIÈCES
     ========================================================= */
  {
    id: 'M1',
    title: 'Le mouvement des pièces',
    subtitle: 'Une pièce à la fois, en isolation',
    level: 1,
    unlocked: true,
    lessons: [
      { id: 'M1-L1', title: 'Le pion : avancer, capturer', objective: 'Déplacements du pion, capture en diagonale, poussée double.', type: 'exercise', difficulty: 1 },
      { id: 'M1-L2', title: 'La tour : lignes et colonnes', objective: 'Déplacer la tour sur lignes et colonnes, portée infinie.', type: 'exercise', difficulty: 1 },
      { id: 'M1-L3', title: 'Le fou : la diagonale', objective: 'Déplacer le fou uniquement en diagonale.', type: 'exercise', difficulty: 1 },
      { id: 'M1-L4', title: 'La dame : la pièce la plus puissante', objective: 'Combiner lignes, colonnes et diagonales.', type: 'exercise', difficulty: 2 },
      { id: 'M1-L5', title: 'Le cavalier : le saut en L', objective: 'Maîtriser le saut en L et le changement de couleur de case.', type: 'exercise', difficulty: 3 },
      { id: 'M1-L6', title: 'Le roi : un pas à la fois', objective: 'Déplacer le roi d\'une case dans toutes les directions.', type: 'exercise', difficulty: 2 }
    ]
  },

  /* =========================================================
     M2 — ÉCHEC, MAT, PAT, NULLE
     ========================================================= */
  {
    id: 'M2',
    title: 'Échec, mat, pat, nulle',
    subtitle: 'Les notions vitales du jeu',
    level: 2,
    unlocked: true,
    lessons: [
      { id: 'M2-L1', title: 'L\'échec : obligation de réagir', objective: 'Reconnaître un échec et les 3 réponses légales (fuir, bloquer, capturer).', type: 'lesson', difficulty: 2 },
      { id: 'M2-L2', title: 'Sortir d\'un échec', objective: 'Trouver systématiquement la sortie d\'échec.', type: 'exercise', difficulty: 2, lichessTheme: 'defensiveMove' },
      { id: 'M2-L3', title: 'L\'échec et mat', objective: 'Reconnaître un mat : roi en échec sans échappatoire.', type: 'exercise', difficulty: 2, lichessTheme: 'mateIn1' },
      { id: 'M2-L4', title: 'Le pat : match nul involontaire', objective: 'Différencier pat et mat.', type: 'lesson', difficulty: 3 },
      { id: 'M2-L5', title: 'Les autres nulle', objective: 'Matériel insuffisant, triple répétition, règle des 50 coups.', type: 'lesson', difficulty: 3 }
    ]
  },

  /* =========================================================
     M3 — MATS ÉLÉMENTAIRES
     ========================================================= */
  {
    id: 'M3',
    title: 'Mats élémentaires',
    subtitle: 'Convertir un avantage en victoire',
    level: 2,
    unlocked: true,
    lessons: [
      { id: 'M3-L1', title: 'Mat de la dame seule', objective: 'Mater avec Dame + Roi contre Roi seul.', type: 'exercise', difficulty: 3 },
      { id: 'M3-L2', title: 'Mat des deux tours', objective: 'Escalier des tours pour mater.', type: 'exercise', difficulty: 3 },
      { id: 'M3-L3', title: 'Mat de la tour seule', objective: 'Tour + Roi contre Roi, méthode d\'opposition.', type: 'exercise', difficulty: 4 },
      { id: 'M3-L4', title: 'Mat des deux fous', objective: 'Deux Fous + Roi contre Roi, méthode du triangle.', type: 'exercise', difficulty: 5 }
    ]
  },

  /* =========================================================
     M4 — MOTIFS TACTIQUES FONDAMENTAUX
     ========================================================= */
  {
    id: 'M4',
    title: 'Motifs tactiques',
    subtitle: 'Les 8 patterns qui gagnent des pièces',
    level: 3,
    unlocked: true,
    lessons: [
      { id: 'M4-L1', title: 'La fourchette', objective: 'Repérer et exécuter une fourchette (souvent du cavalier).', type: 'puzzle', difficulty: 2, lichessTheme: 'fork' },
      { id: 'M4-L2', title: 'L\'enfilade', objective: 'Attaquer une pièce derrière laquelle se trouve une pièce plus précieuse.', type: 'puzzle', difficulty: 3, lichessTheme: 'skewer' },
      { id: 'M4-L3', title: 'La brochette', objective: 'Différencier brochette et enfilade.', type: 'puzzle', difficulty: 3, lichessTheme: 'skewer' },
      { id: 'M4-L4', title: 'Le clouage', objective: 'Clouer une pièce contre le roi ou une pièce plus précieuse.', type: 'puzzle', difficulty: 3, lichessTheme: 'pin' },
      { id: 'M4-L5', title: 'L\'attaque double', objective: 'Attaquer simultanément deux pièces avec une seule pièce.', type: 'puzzle', difficulty: 2, lichessTheme: 'doubleAttack' },
      { id: 'M4-L6', title: 'L\'attaque à la découverte', objective: 'Découvrir une attaque en déplaçant une pièce qui masquait une autre.', type: 'puzzle', difficulty: 4, lichessTheme: 'discoveredAttack' },
      { id: 'M4-L7', title: 'L\'échec double', objective: 'Donner échec avec deux pièces simultanément.', type: 'puzzle', difficulty: 4, lichessTheme: 'doubleCheck' },
      { id: 'M4-L8', title: 'Le coup intermédiaire', objective: 'Placer un zwischenzug avant une reprise.', type: 'puzzle', difficulty: 5, lichessTheme: 'intermezzo' }
    ]
  },

  /* =========================================================
     M5 — COMBINAISONS À 2-3 COUPS
     ========================================================= */
  {
    id: 'M5',
    title: 'Combinaisons à 2-3 coups',
    subtitle: 'Enchaîner les motifs',
    level: 3,
    unlocked: true,
    lessons: [
      { id: 'M5-L1', title: 'Mat du berger et réfutations', objective: 'Connaître le mat du berger, savoir le jouer et le contrer.', type: 'puzzle', difficulty: 2, lichessTheme: 'mateIn1' },
      { id: 'M5-L2', title: 'Mat à l\'étouffée', objective: 'Reconnaître et exécuter le smothered mate.', type: 'puzzle', difficulty: 3, lichessTheme: 'smotheredMate' },
      { id: 'M5-L3', title: 'Mat du couloir', objective: 'Exploiter la 8e rangée faible.', type: 'puzzle', difficulty: 2, lichessTheme: 'backRankMate' },
      { id: 'M5-L4', title: 'Mat d\'Anastasie', objective: 'Cavalier + tour contre roi coincé.', type: 'puzzle', difficulty: 3, lichessTheme: 'anastasiaMate' },
      { id: 'M5-L5', title: 'Mat arabe', objective: 'Tour + cavalier en coordination.', type: 'puzzle', difficulty: 4, lichessTheme: 'arabianMate' },
      { id: 'M5-L6', title: 'Combinaisons mixtes', objective: 'Combiner plusieurs motifs dans une même combinaison.', type: 'puzzle', difficulty: 4 }
    ]
  },

  /* =========================================================
     M6 — FINALES DE PIONS
     ========================================================= */
  {
    id: 'M6',
    title: 'Finales de pions',
    subtitle: 'La technique pure',
    level: 3,
    unlocked: true,
    lessons: [
      { id: 'M6-L1', title: 'Le pion passé', objective: 'Reconnaître un pion passé et comprendre sa force en finale.', type: 'lesson', difficulty: 3 },
      { id: 'M6-L2', title: 'La règle du carré', objective: 'Savoir si un roi rattrape un pion grâce à la règle du carré.', type: 'exercise', difficulty: 3 },
      { id: 'M6-L3', title: 'L\'opposition', objective: 'Utiliser l\'opposition pour forcer le gain ou la nulle.', type: 'exercise', difficulty: 4 },
      { id: 'M6-L4', title: 'Cases-clés et zugzwang', objective: 'Identifier les cases-clés et exploiter le zugzwang.', type: 'lesson', difficulty: 4 },
      { id: 'M6-L5', title: 'Pions passés protégés', objective: 'Créer un pion passé plus lointain grâce à un pion protégé.', type: 'lesson', difficulty: 5 }
    ]
  },

  /* =========================================================
     M7 — PRINCIPES D'OUVERTURE
     ========================================================= */
  {
    id: 'M7',
    title: 'Principes d\'ouverture',
    subtitle: 'Les règles d\'or du début de partie',
    level: 3,
    unlocked: true,
    lessons: [
      { id: 'M7-L1', title: 'Contrôler le centre', objective: 'Pourquoi les 4 cases centrales sont primordiales.', type: 'lesson', difficulty: 2 },
      { id: 'M7-L2', title: 'Développer ses pièces', objective: 'Sortir cavaliers et fous rapidement.', type: 'lesson', difficulty: 2 },
      { id: 'M7-L3', title: 'Roquer tôt', objective: 'Comprendre l\'importance du roque pour la sécurité du roi.', type: 'lesson', difficulty: 2 },
      { id: 'M7-L4', title: 'Connecter ses tours', objective: 'Coordonner les tours au centre après le développement.', type: 'lesson', difficulty: 3 },
      { id: 'M7-L5', title: 'Erreurs classiques d\'ouverture', objective: 'Éviter les pièges courants.', type: 'lesson', difficulty: 3 }
    ]
  },

  /* =========================================================
     M8 — PLANS DE MILIEU DE JEU
     ========================================================= */
  {
    id: 'M8',
    title: 'Plans de milieu de jeu',
    subtitle: 'Structurer sa pensée stratégique',
    level: 4,
    unlocked: true,
    lessons: [
      { id: 'M8-L1', title: 'Identifier une faiblesse', objective: 'Repérer une case ou un pion faible dans le camp adverse.', type: 'lesson', difficulty: 4 },
      { id: 'M8-L2', title: 'Jouer sur les colonnes ouvertes', objective: 'Doubler les tours sur une colonne ouverte.', type: 'lesson', difficulty: 4 },
      { id: 'M8-L3', title: 'Bon cavalier contre mauvais fou', objective: 'Reconnaître les positions où un cavalier domine un fou.', type: 'lesson', difficulty: 4 },
      { id: 'M8-L4', title: 'Attaque sur l\'aile roi', objective: 'Mener une attaque coordonnée sur l\'aile roi.', type: 'lesson', difficulty: 5 },
      { id: 'M8-L5', title: 'Le sacrifice positionnel', objective: 'Comprendre quand sacrifier du matériel pour un avantage positionnel.', type: 'lesson', difficulty: 5 },
      { id: 'M8-L6', title: 'Passer à la finale favorable', objective: 'Simplifier vers une finale techniquement gagnante.', type: 'lesson', difficulty: 5 }
    ]
  },

  /* =========================================================
     M9 — STRATÉGIE AVANCÉE
     ========================================================= */
  {
    id: 'M9',
    title: 'Stratégie avancée',
    subtitle: 'Franchir un cap',
    level: 5,
    unlocked: true,
    lessons: [
      { id: 'M9-L1', title: 'Les structures de pions', objective: 'Reconnaître Carlsbad, Sicilienne, Française.', type: 'lesson', difficulty: 5 },
      { id: 'M9-L2', title: 'Le pion isolé', objective: 'Jouer avec ou contre un pion isolé.', type: 'lesson', difficulty: 5 },
      { id: 'M9-L3', title: 'Les pions doublés', objective: 'Exploiter ou neutraliser les pions doublés.', type: 'lesson', difficulty: 5 },
      { id: 'M9-L4', title: 'Cases fortes et cases faibles', objective: 'Identifier et exploiter les cases fortes pour ses pièces.', type: 'lesson', difficulty: 5 },
      { id: 'M9-L5', title: 'Le principe des deux faiblesses', objective: 'Créer une seconde faiblesse quand la première ne suffit pas.', type: 'lesson', difficulty: 5 },
      { id: 'M9-L6', title: 'Prophylaxie', objective: 'Anticiper les plans adverses et les empêcher.', type: 'lesson', difficulty: 5 }
    ]
  }

];

/* ---------- Helpers (fonctions pures, sans effet de bord) ---------- */

window.APP.findModule = function (moduleId) {
  var arr = window.APP.CURRICULUM || [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === moduleId) return arr[i];
  }
  return null;
};

window.APP.findLesson = function (moduleId, lessonId) {
  var m = window.APP.findModule(moduleId);
  if (!m) return null;
  for (var i = 0; i < m.lessons.length; i++) {
    if (m.lessons[i].id === lessonId) return m.lessons[i];
  }
  return null;
};

window.APP.isModuleUnlocked = function (module) {
  if (!module) return false;
  if (window.APP.CONFIG && window.APP.CONFIG.DEV_MODE) return true;
  return !!module.unlocked;
};
