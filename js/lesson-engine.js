/* =========================================================
   lesson-engine.js — Moteur d'exécution des leçons et puzzles
   =========================================================
   v0.6.2 — Debug + synchronisation forcée FEN + validation
   robuste du SAN + fallback from/to.

   Gère 3 types de tâches :
     - identify-square : cliquer une case précise
     - move-piece      : déplacer une pièce
     - solve-puzzle    : trouver le coup gagnant (avec Coup d'avant)

   LOGS CONSOLE :
     Toutes les actions importantes sont loguées pour faciliter
     le debug : [Engine] ...
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var DEBUG = true;  /* Passe à false pour désactiver les logs */

  function log() {
    if (!DEBUG || !window.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[Engine]');
    console.log.apply(console, args);
  }

  var state = { play: null };

  /* ---------- Utilitaires ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function getTaskBank(lid) {
    var banks = [
      (window.APP && window.APP.LESSON_TASKS) ? window.APP.LESSON_TASKS[lid] : null,
      (window.APP && window.APP.PUZZLE_TASKS) ? window.APP.PUZZLE_TASKS[lid] : null
    ];
    for (var i = 0; i < banks.length; i++) if (banks[i]) return banks[i];
    return null;
  }

  function showFeedback(msg, kind) {
    var el = document.getElementById('lesson-feedback');
    if (!el) return;
    el.className = 'feedback show ' + kind;
    el.textContent = msg;
  }

  /* Normalisation robuste du SAN :
     - retire +, #, !, ?
     - retire les espaces et caractères invisibles
     - normalise la casse du roque (O-O)
     - retire le =Q de promotion
  */
  function normSan(s) {
    if (!s) return '';
    return String(s)
      .replace(/\s+/g, '')
      .replace(/[+#!?]/g, '')
      .replace(/=Q$/i, '')
      .replace(/0-0-0/g, 'O-O-O')
      .replace(/0-0/g, 'O-O');
  }

  /* ---------- Démarrage ---------- */
  function startLesson(lid, onRender, onFinish) {
    var def = getTaskBank(lid);
    if (!def) {
      log('startLesson: aucune banque trouvée pour', lid);
      return;
    }

    var picked = shuffle(def.tasks).slice(0, 5);

    state.play = {
      kind: def.kind,
      taskList: picked,
      index: 0,
      currentTask: picked[0],
      errors: 0,
      finished: false,
      locked: false
    };

    log('Démarrage leçon', lid, '| kind=' + def.kind, '| ' + picked.length + ' tâches tirées');
    log('Tâche 1 :', picked[0]);

    window.APP.Board.setLessonMode(true);
    if (onRender) onRender();
    applyLessonTask();
  }

  /* ---------- Configuration de l'échiquier ---------- */
  function applyLessonTask() {
    var p = state.play;
    if (!p || p.finished) return;

    var t = p.currentTask;
    var B = window.APP.Board;
    B.clearHighlights();

    log('--- Nouvelle tâche ---');
    log('Type :', p.kind);
    log('Prompt :', t.prompt);

    if (p.kind === 'identify-square') {
      B.newGame();
      B.orientation('white');
      B.position('8/8/8/8/8/8/8/8 w - - 0 1', false);
      log('Position vide, cible =', t.target);
      setTimeout(function () {
        if (window.jQuery) window.jQuery('#board .square-55d63').addClass('clickable');
      }, 100);

    } else if (p.kind === 'move-piece') {
      var g = new Chess(t.fen);
      B.setGame(g);
      B.orientation('white');
      B.position(g.fen(), false);  /* On affiche la FEN du game, pas la FEN brute */
      log('FEN fournie  :', t.fen);
      log('FEN chargée  :', g.fen());
      log('Coup attendu :', t.from, '→', t.to);
      setTimeout(function () {
        if (window.jQuery) window.jQuery('#board .square-' + t.from).addClass('hl-target');
      }, 100);

    } else if (p.kind === 'solve-puzzle') {
      var g2 = new Chess(t.fen);
      B.setGame(g2);
      var isWhite = t.fen.indexOf(' w ') !== -1;
      B.orientation(isWhite ? 'white' : 'black');
      B.position(g2.fen(), false);  /* SYNCHRONISATION FORCÉE */
      log('FEN fournie  :', t.fen);
      log('FEN chargée  :', g2.fen());
      log('Trait        :', g2.turn() === 'w' ? 'Blancs' : 'Noirs');
      log('En échec ?   :', g2.in_check());
      log('Solution SAN :', t.solution);
      log('Coups légaux :', g2.moves().join(', '));

      /* Coup d'avant : on pose la question de verbalisation */
      if (t.preQuestion && window.APP.PreQuestion) {
        p.locked = true;
        setTimeout(function () {
          window.APP.PreQuestion.handle(t, function () {
            p.locked = false;
            log('Coup d\'avant validé, jeu autorisé.');
          });
        }, 150);
      }
    }
  }

  /* ---------- identify-square ---------- */
  function checkIdentifySquare(square) {
    var p = state.play;
    if (!p || p.locked || p.finished) return;
    p.locked = true;

    var t = p.currentTask;
    var ok = false;
    if (t.matchRow)      ok = square.charAt(1) === t.targetRow;
    else if (t.matchCol) ok = square.charAt(0) === t.targetCol;
    else                 ok = square === t.target;

    var $ = window.jQuery;
    if (ok) {
      $('#board .square-' + square).addClass('hl-good');
      showFeedback('✅ Bravo ! ' + square + ' est la bonne case.', 'ok');
      setTimeout(nextTask, 900);
    } else {
      p.errors++;
      $('#board .square-' + square).addClass('hl-bad');
      setTimeout(function () { $('#board .square-' + square).removeClass('hl-bad'); }, 700);
      var hint = '';
      if (t.matchRow) hint = 'La bonne réponse est sur la rangée ' + t.targetRow + '.';
      else if (t.matchCol) hint = 'La bonne réponse est sur la colonne ' + t.targetCol + '.';
      else hint = 'La bonne case est ' + t.target + '.';
      showFeedback('❌ Raté. ' + hint, 'ko');
      setTimeout(function () { if (state.play) state.play.locked = false; }, 800);
    }
  }

  /* ---------- Passage à la tâche suivante ---------- */
  var nextTaskCallback = null;
  function nextTask() {
    var p = state.play;
    if (!p) return;
    p.locked = true;
    p.index++;
    if (p.index >= p.taskList.length) {
      p.finished = true;
      p.locked = false;
      window.APP.Board.setLessonMode(false);
      log('Leçon terminée. Erreurs :', p.errors);
      if (nextTaskCallback) nextTaskCallback(true);
    } else {
      p.currentTask = p.taskList[p.index];
      log('Tâche suivante :', p.index + 1, '/', p.taskList.length);
      if (nextTaskCallback) nextTaskCallback(false);
      applyLessonTask();
      setTimeout(function () { if (state.play) state.play.locked = false; }, 150);
    }
  }

  /* ---------- Skip / Hint ---------- */
  function skipTask() {
    var p = state.play;
    if (!p || p.locked || p.finished) return;
    p.locked = true;
    p.errors++;
    var ans = p.currentTask.solution || p.currentTask.to || p.currentTask.target;
    showFeedback('⏭ Tâche passée. Réponse : ' + ans, 'ko');
    setTimeout(nextTask, 800);
  }

  function hintTask() {
    var p = state.play;
    if (!p || p.finished) return;
    var t = p.currentTask;
    var hint = t.hint || 'Regarde les pièces qui peuvent attaquer plusieurs cibles en même temps.';
    showFeedback('💡 ' + hint, 'hint');
  }

  /* ---------- onDrop custom ---------- */
  function handleDrop(source, target) {
    var p = state.play;
    log('onDrop:', source, '→', target, '| locked=' + (p ? p.locked : 'n/a'));

    if (!p || p.finished || p.locked) {
      log('onDrop refusé (état invalide ou verrouillé)');
      return 'snapback';
    }

    var B = window.APP.Board;
    var game = B.getGame();
    var $ = window.jQuery;

    /* ----- move-piece ----- */
    if (p.kind === 'move-piece') {
      var t = p.currentTask;
      if (source === t.from && target === t.to) {
        p.locked = true;
        var move = game.move({ from: source, to: target, promotion: 'q' });
        B.position(game.fen(), false);
        $('#board .square-' + target).addClass('hl-good');
        showFeedback('✅ Coup correct ! ' + (move ? move.san : ''), 'ok');
        setTimeout(function () {
          $('#board .square-' + target).removeClass('hl-good');
          nextTask();
        }, 900);
        return;
      } else {
        p.errors++;
        B.flashIllegal(target);
        showFeedback('❌ Pas le bon coup. Indice : la pièce doit aller en ' + t.to + '.', 'ko');
        return 'snapback';
      }
    }

    /* ----- solve-puzzle ----- */
    if (p.kind === 'solve-puzzle') {
      var pt = p.currentTask;

      /* 1. Le coup est-il légal ? */
      var legalMoves = game.moves({ verbose: true });
      var found = null;
      for (var i = 0; i < legalMoves.length; i++) {
        if (legalMoves[i].from === source && legalMoves[i].to === target) {
          found = legalMoves[i];
          break;
        }
      }
      log('Coup légal ?', !!found);
      if (!found) {
        log('ATTENTION : coup illégal. Coups légaux disponibles :', legalMoves.map(function (m) { return m.from + m.to; }).join(', '));
        B.flashIllegal(target);
        showFeedback('❌ Coup illégal. Essayez autre chose.', 'ko');
        return 'snapback';
      }

      /* 2. On joue le coup sur une copie temporaire pour voir son SAN */
      var playedMove = game.move({ from: source, to: target, promotion: 'q' });
      var playedSan = playedMove.san;

      /* 3. Comparaison SAN normalisée */
      var playedNorm = normSan(playedSan);
      var solutionNorm = normSan(pt.solution);

      log('Coup joué    :', playedSan, '→ normalisé:', playedNorm);
      log('Solution SAN :', pt.solution, '→ normalisé:', solutionNorm);
      log('Match ?', playedNorm === solutionNorm);

      /* 4. Fallback : si le SAN ne matche pas, on vérifie le from/to attendu */
      var solutionMatchesByMove = false;
      if (playedNorm !== solutionNorm) {
        /* On rejoue la solution attendue pour connaître son from/to */
        var testGame = new Chess(pt.fen);
        try {
          var solutionMove = testGame.move(pt.solution);
          if (solutionMove && solutionMove.from === source && solutionMove.to === target) {
            solutionMatchesByMove = true;
            log('Fallback from/to MATCH :', solutionMove.from, '→', solutionMove.to);
          } else if (solutionMove) {
            log('Fallback from/to NE MATCH PAS. Attendu :', solutionMove.from, '→', solutionMove.to);
          }
        } catch (err) {
          log('Erreur fallback:', err.message);
        }
      }

      if (playedNorm === solutionNorm || solutionMatchesByMove) {
        /* Bonne réponse */
        p.locked = true;
        B.position(game.fen(), false);
        $('#board .square-' + target).addClass('hl-good');
        var expl = pt.explanation ? ' ' + pt.explanation : '';
        showFeedback('✅ Bravo ! ' + playedSan + ' est le coup gagnant.' + expl, 'ok');
        setTimeout(function () {
          $('#board .square-' + target).removeClass('hl-good');
          nextTask();
        }, 1400);
        return;
      }

      /* Mauvais coup (mais légal) */
      p.errors++;
      game.undo();
      B.position(game.fen(), false);
      B.flashIllegal(target);
      var hint = pt.hint || 'Cherche un coup qui crée une menace immédiate.';
      showFeedback('❌ Ce coup est légal mais ne gagne pas. ' + hint, 'ko');
      return 'snapback';
    }

    return 'snapback';
  }

  /* ---------- API publique ---------- */
  window.APP.LessonEngine = {
    startLesson: function (lid, onRender, onFinish) {
      nextTaskCallback = onFinish;
      startLesson(lid, onRender, onFinish);
      window.APP.Board.setOnDropHandler(handleDrop);
    },
    getState: function () { return state; },
    checkIdentifySquare: checkIdentifySquare,
    skipTask: skipTask,
    hintTask: hintTask,
    isFinished: function () { return state.play ? state.play.finished : false; },
    reset: function () {
      state.play = null;
      nextTaskCallback = null;
      if (window.APP.PreQuestion) window.APP.PreQuestion.reset();
    }
  };
})();
