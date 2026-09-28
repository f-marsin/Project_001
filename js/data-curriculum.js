/* =========================================================
   data-curriculum.js — Structure des 10 modules / 55 leçons
   =========================================================
   Ne contient QUE des données. Aucune logique.
   Pour ajouter/retirer une leçon : éditer ici.

   MODE DEV :
     - DEV_MODE = true  → tous les modules sont ouverts (test)
     - DEV_MODE = false → déverrouillage progressif (production)

   Le déverrouillage progressif réel sera branché à l'Étape 7
   (sauvegarde de progression). Pour l'instant, en DEV_MODE,
   tous les modules sont accessibles pour permettre le test.
   ========================================================= */

window.APP = window.APP || {};

/* Drapeau de mode développement — passer à false pour la prod */
window.APP.DEV_MODE = true;

window.APP.CURRICULUM = [
  { id:'M0', title:'Découverte de l\'échiquier', subtitle:'Plateau, coordonnées, orientation', level:1, unlocked:true,
    lessons: [
      { id:'M0-L1', title:'Le plateau et ses coordonnées', objective:'Identifier les 64 cases, les colonnes a-h et les rangées 1-8.', type:'exercise', difficulty:1 },
      { id:'M0-L2', title:'Orientation et camp blanc/noir', objective:'Savoir où se placent les Blancs et les Noirs.', type:'exercise', difficulty:1 },
      { id:'M0-L3', title:'Nommer une case', objective:'Nommer instantanément n\'importe quelle case.', type:'exercise', difficulty:1 },
      { id:'M0-L4', title:'Le vocabulaire de base', objective:'Rangée, colonne, diagonale, centre.', type:'exercise', difficulty:2 }
    ]
  },
  { id:'M1', title:'Le mouvement des pièces', subtitle:'Une pièce à la fois', level:1, unlocked:true,
    lessons: [
      { id:'M1-L1', title:'Le pion : avancer, capturer', objective:'Maîtriser les déplacements du pion, la capture en diagonale.', type:'exercise', difficulty:1 },
      { id:'M1-L2', title:'La tour : lignes et colonnes', objective:'Déplacer la tour sur lignes et colonnes.', type:'exercise', difficulty:1 },
      { id:'M1-L3', title:'Le fou : la diagonale', objective:'Déplacer le fou uniquement en diagonale.', type:'exercise', difficulty:1 },
      { id:'M1-L4', title:'La dame : la pièce la plus puissante', objective:'Combiner lignes, colonnes et diagonales.', type:'exercise', difficulty:2 },
      { id:'M1-L5', title:'Le cavalier : le saut en L', objective:'Maîtriser le saut en L.', type:'exercise', difficulty:3 },
      { id:'M1-L6', title:'Le roi : un pas à la fois', objective:'Déplacer le roi d\'une case.', type:'exercise', difficulty:2 }
    ]
  },
  { id:'M2', title:'Échec, mat, pat, nulle', subtitle:'Les notions vitales', level:2, unlocked:true,
    lessons: [
      { id:'M2-L1', title:'L\'échec', objective:'Les 3 réponses à un échec.', type:'lesson', difficulty:2 },
      { id:'M2-L2', title:'Sortir d\'un échec', objective:'Fuite, blocage ou capture.', type:'exercise', difficulty:2 },
      { id:'M2-L3', title:'L\'échec et mat', objective:'Aucune échappatoire.', type:'exercise', difficulty:2 },
      { id:'M2-L4', title:'Le pat', objective:'Différencier pat et mat.', type:'lesson', difficulty:3 },
      { id:'M2-L5', title:'Les autres nulle', objective:'Matériel, répétition, 50 coups.', type:'lesson', difficulty:3 }
    ]
  },
  { id:'M3', title:'Mats élémentaires', subtitle:'Convertir un avantage', level:2, unlocked:true,
    lessons: [
      { id:'M3-L1', title:'Mat de la dame seule', objective:'Dame + Roi vs Roi.', type:'exercise', difficulty:3 },
      { id:'M3-L2', title:'Mat des deux tours', objective:'Escalier des tours.', type:'exercise', difficulty:3 },
      { id:'M3-L3', title:'Mat de la tour seule', objective:'Tour + Roi vs Roi.', type:'exercise', difficulty:4 },
      { id:'M3-L4', title:'Mat des deux fous', objective:'Deux Fous + Roi vs Roi.', type:'exercise', difficulty:5 }
    ]
  },
  { id:'M4', title:'Motifs tactiques', subtitle:'Les 8 patterns', level:3, unlocked:true,
    lessons: [
      { id:'M4-L1', title:'La fourchette', objective:'Attaquer deux pièces.', type:'puzzle', difficulty:2 },
      { id:'M4-L2', title:'L\'enfilade', objective:'Attaquer derrière.', type:'puzzle', difficulty:3 },
      { id:'M4-L3', title:'La brochette', objective:'Valeur devant.', type:'puzzle', difficulty:3 },
      { id:'M4-L4', title:'Le clouage', objective:'Clouer contre le roi.', type:'puzzle', difficulty:3 },
      { id:'M4-L5', title:'L\'attaque double', objective:'Attaquer deux pièces.', type:'puzzle', difficulty:2 },
      { id:'M4-L6', title:'L\'attaque à la découverte', objective:'Découvrir en déplaçant.', type:'puzzle', difficulty:4 },
      { id:'M4-L7', title:'L\'échec double', objective:'Deux échecs simultanés.', type:'puzzle', difficulty:4 },
      { id:'M4-L8', title:'Le coup intermédiaire', objective:'Zwischenzug.', type:'puzzle', difficulty:5 }
    ]
  },
  { id:'M5', title:'Combinaisons à 2-3 coups', subtitle:'Enchaîner', level:3, unlocked:true,
    lessons: [
      { id:'M5-L1', title:'Mat du berger', objective:'Jouer et contrer.', type:'puzzle', difficulty:2 },
      { id:'M5-L2', title:'Mat à l\'étouffée', objective:'Smothered mate.', type:'puzzle', difficulty:3 },
      { id:'M5-L3', title:'Mat du couloir', objective:'8e rangée faible.', type:'puzzle', difficulty:2 },
      { id:'M5-L4', title:'Mat d\'Anastasie', objective:'Cavalier + tour.', type:'puzzle', difficulty:3 },
      { id:'M5-L5', title:'Mat arabe', objective:'Tour + cavalier.', type:'puzzle', difficulty:4 },
      { id:'M5-L6', title:'Combinaisons mixtes', objective:'Combiner.', type:'puzzle', difficulty:4 }
    ]
  },
  { id:'M6', title:'Finales de pions', subtitle:'La technique pure', level:3, unlocked:true,
    lessons: [
      { id:'M6-L1', title:'Le pion passé', objective:'Sa force.', type:'lesson', difficulty:3 },
      { id:'M6-L2', title:'La règle du carré', objective:'Rattraper un pion.', type:'exercise', difficulty:3 },
      { id:'M6-L3', title:'L\'opposition', objective:'Forcer gain ou nulle.', type:'exercise', difficulty:4 },
      { id:'M6-L4', title:'Cases-clés et zugzwang', objective:'Zugzwang.', type:'lesson', difficulty:4 },
      { id:'M6-L5', title:'Pions passés protégés', objective:'Créer un pion passé.', type:'lesson', difficulty:5 }
    ]
  },
  { id:'M7', title:'Principes d\'ouverture', subtitle:'Les règles d\'or', level:3, unlocked:true,
    lessons: [
      { id:'M7-L1', title:'Contrôler le centre', objective:'4 cases centrales.', type:'lesson', difficulty:2 },
      { id:'M7-L2', title:'Développer ses pièces', objective:'Sortir rapidement.', type:'lesson', difficulty:2 },
      { id:'M7-L3', title:'Roquer tôt', objective:'Sécurité du roi.', type:'lesson', difficulty:2 },
      { id:'M7-L4', title:'Connecter ses tours', objective:'Après roque.', type:'lesson', difficulty:3 },
      { id:'M7-L5', title:'Erreurs classiques', objective:'Éviter les pièges.', type:'lesson', difficulty:3 }
    ]
  },
  { id:'M8', title:'Plans de milieu de jeu', subtitle:'Stratégie', level:4, unlocked:true,
    lessons: [
      { id:'M8-L1', title:'Identifier une faiblesse', objective:'Repérer.', type:'lesson', difficulty:4 },
      { id:'M8-L2', title:'Colonnes ouvertes', objective:'Doubler les tours.', type:'lesson', difficulty:4 },
      { id:'M8-L3', title:'Cavalier vs mauvais fou', objective:'Reconnaître.', type:'lesson', difficulty:4 },
      { id:'M8-L4', title:'Attaque sur l\'aile roi', objective:'Coordonner.', type:'lesson', difficulty:5 },
      { id:'M8-L5', title:'Sacrifice positionnel', objective:'Quand sacrifier.', type:'lesson', difficulty:5 },
      { id:'M8-L6', title:'Passer à la finale', objective:'Simplifier.', type:'lesson', difficulty:5 }
    ]
  },
  { id:'M9', title:'Stratégie avancée', subtitle:'Franchir un cap', level:5, unlocked:true,
    lessons: [
      { id:'M9-L1', title:'Structures de pions', objective:'Reconnaître.', type:'lesson', difficulty:5 },
      { id:'M9-L2', title:'Le pion isolé', objective:'Jouer avec/contre.', type:'lesson', difficulty:5 },
      { id:'M9-L3', title:'Les pions doublés', objective:'Exploiter.', type:'lesson', difficulty:5 },
      { id:'M9-L4', title:'Cases fortes et faibles', objective:'Identifier.', type:'lesson', difficulty:5 },
      { id:'M9-L5', title:'Principe des deux faiblesses', objective:'Créer la seconde.', type:'lesson', difficulty:5 },
      { id:'M9-L6', title:'Prophylaxie', objective:'Anticiper.', type:'lesson', difficulty:5 }
    ]
  }
];
