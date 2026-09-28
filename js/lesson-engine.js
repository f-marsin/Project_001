/* =========================================================
   lesson-engine.js — Moteur d'exécution des leçons et puzzles
   =========================================================
   Gère 3 types de tâches :
     - identify-square : cliquer une case précise
     - move-piece      : déplacer une pièce
     - solve-puzzle    : trouver le coup gagnant (avec Coup d'avant)
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

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

  /* ---------- Démarrage ---------- */
  function startLesson(lid, onRender, onFinish) {
    var def = getTaskBank(lid);
    if (!def) return;

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

    if (p.kind === 'identify-square') {
      B.newGame();
      B.orientation('white');
      B.position('8/8/8/8/8/8/8/8 w - - 0 1', false);
      setTimeout(function () {
        if (window.jQuery) window.jQuery('#board .square-55d63').addClass('clickable');
      }, 100);
    } else if (p.kind === 'move-piece') {
      var g = new Chess(t.fen);
      B.setGame(g);
      B.orientation('white');
      B.position(t.fen, false);
      setTimeout(function () {
        if (window.jQuery) window.jQuery('#board .square-' + t.from).addClass('hl-target');
      }, 100);
    } else if (p.kind === 'solve-puzzle') {
      var g2 = new Chess(t.fen);
      B.setGame(g2);
      var isWhite = t.fen.indexOf(' w ') !== -1;
      B.orientation(isWhite ? 'white' : 'black');
      B.position(t.fen, false);

      /* Coup d'avant : on pose la question de verbalisation */
      if (t.preQuestion && window.APP.PreQuestion) {
        p.locked = true;
        setTimeout(function () {
          window.APP.PreQuestion.handle(t, function () {
            p.locked = false;
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
      if (nextTaskCallback) nextTaskCallback(true);
    } else {
      p.currentTask = p.taskList[p.index];
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
    if (!p || p.finished || p.locked) return 'snapback';

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

      var legalMoves = game.moves({ verbose: true });
      var found = null;
      for (var i = 0; i < legalMoves.length; i++) {
        if (legalMoves[i].from === source && legalMoves[i].to === target) {
          found = legalMoves[i];
          break;
        }
      }
      if (!found) {
        B.flashIllegal(target);
        showFeedback('❌ Coup illégal. Essayez autre chose.', 'ko');
        return 'snapback';
      }

      var playedMove = game.move({ from: source, to: target, promotion: 'q' });
      var playedSan = playedMove.san;

      var norm = function (s) {
        return s
          .replace(/[+#]/g, '')
          .replace(/=Q$/, '')
          .replace(/0-0-0/g, 'O-O-O')
          .replace(/0-0/g, 'O-O');
      };
      var playedNorm = norm(playedSan);
      var solutionNorm = norm(pt.solution);

      if (playedNorm === solutionNorm) {
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
