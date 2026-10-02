/* =========================================================
   ui-nav.js — Navigation du curriculum
   =========================================================
   Rôle : afficher les modules, leurs leçons, le détail d'une leçon.
   États internes :
     - curriculumView : 'modules' | 'lessons' | 'lesson'
     - currentModuleId, currentLessonId
   API : window.APP.UINav.init(), .onEnter(), .render()
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var state = {
    curriculumView: 'modules',
    currentModuleId: null,
    currentLessonId: null
  };

  /* ---------- Utilitaires ---------- */

  function crumbEl() { return document.getElementById('crumb'); }
  function contentEl() { return document.getElementById('curriculum-content'); }

  function typeLabel(t) {
    if (t === 'lesson')       return 'Leçon';
    if (t === 'exercise')     return 'Exercice';
    if (t === 'puzzle')       return 'Puzzle';
    if (t === 'interactive')  return '▶ Jouable';
    if (t === 'puzzle-live')  return '♟ Puzzle';
    if (t === 'coming')       return 'À venir';
    return t;
  }

  /* Détermine le type affiché d'une leçon */
  function lessonDisplayType(lesson) {
    /* À l'Étape 2, aucune leçon n'est encore jouable.
       À l'Étape 3, on branchera : si leçon a un contenu Lichess → 'puzzle-live' */
    if (window.APP.LessonEngine && window.APP.LessonEngine.hasContent
        && window.APP.LessonEngine.hasContent(lesson.id)) {
      return 'puzzle-live';
    }
    return 'coming';
  }

  function diffBars(level) {
    var s = '<span class="diff-bars">';
    for (var i = 1; i <= 5; i++) {
      s += '<span class="' + (i <= level ? 'on' : '') + '"></span>';
    }
    return s + '</span>';
  }

  /* ---------- Rendu du fil d'Ariane ---------- */

  function renderCrumb() {
    var el = crumbEl();
    if (!el) return;

    if (state.curriculumView === 'modules') {
      el.innerHTML = '<span>Parcours</span>';
      return;
    }

    var m = window.APP.findModule(state.currentModuleId);
    if (!m) { el.innerHTML = '<span>Parcours</span>'; return; }

    if (state.curriculumView === 'lessons') {
      el.innerHTML =
        '<a data-nav="modules">Parcours</a>' +
        '<span class="sep">›</span>' +
        '<span>' + m.id + ' — ' + m.title + '</span>';
    } else {
      var l = window.APP.findLesson(state.currentModuleId, state.currentLessonId);
      el.innerHTML =
        '<a data-nav="modules">Parcours</a>' +
        '<span class="sep">›</span>' +
        '<a data-nav="lessons">' + m.id + '</a>' +
        '<span class="sep">›</span>' +
        '<span>' + l.title + '</span>';
    }
  }

  /* ---------- Rendu : liste des modules ---------- */

  function renderModules() {
    var arr = window.APP.CURRICULUM || [];
    var html = '<h2>Modules du parcours</h2>';

    for (var i = 0; i < arr.length; i++) {
      var m = arr[i];
      var unlocked = window.APP.isModuleUnlocked(m);
      var lock = unlocked ? '' : '<span class="module-lock">🔒</span>';

      html +=
        '<div class="module-card' + (unlocked ? '' : ' locked') + '" ' +
             'data-action="open-module" data-module="' + m.id + '">' +
          lock +
          '<div class="module-head">' +
            '<span class="module-id">' + m.id + '</span>' +
            '<span class="module-count">' + m.lessons.length + ' leçons</span>' +
          '</div>' +
          '<div class="module-title">' + m.title + '</div>' +
          '<div class="module-sub">' + m.subtitle + '</div>' +
        '</div>';
    }
    contentEl().innerHTML = html;
  }

  /* ---------- Rendu : liste des leçons d'un module ---------- */

  function renderLessons() {
    var m = window.APP.findModule(state.currentModuleId);
    if (!m) return;

    var html =
      '<button class="back-btn" data-nav="modules">‹ Modules</button>' +
      '<h2>' + m.id + ' — ' + m.title + '</h2>';

    for (var i = 0; i < m.lessons.length; i++) {
      var l = m.lessons[i];
      var lt = lessonDisplayType(l);

      html +=
        '<div class="lesson-row" ' +
             'data-action="open-lesson" ' +
             'data-module="' + m.id + '" ' +
             'data-lesson="' + l.id + '">' +
          '<span class="lesson-num">' + (i + 1) + '</span>' +
          '<div class="lesson-info">' +
            '<div class="lesson-title">' + l.title + '</div>' +
            '<div class="lesson-meta">' +
              '<span class="lesson-type ' + lt + '">' + typeLabel(lt) + '</span>' +
              diffBars(l.difficulty) +
            '</div>' +
          '</div>' +
        '</div>';
    }
    contentEl().innerHTML = html;
  }

  /* ---------- Rendu : détail d'une leçon ---------- */

  function renderLesson() {
    var m = window.APP.findModule(state.currentModuleId);
    var l = window.APP.findLesson(state.currentModuleId, state.currentLessonId);
    if (!m || !l) return;

    var lt = lessonDisplayType(l);

    var html =
      '<button class="back-btn" data-nav="lessons">‹ ' + m.id + '</button>' +
      '<div class="lesson-detail">' +
        '<h3>' + l.title + '</h3>' +
        '<div class="objective"><strong>Objectif :</strong> ' + l.objective + '</div>';

    if (lt === 'interactive' || lt === 'puzzle-live') {
      html +=
        '<button data-action="start-lesson" type="button" ' +
                'class="back-btn" ' +
                'style="background:var(--accent);color:#fff;border-color:var(--accent);' +
                       'min-width:100%;justify-content:center;padding:12px;">' +
          '▶ Démarrer la leçon' +
        '</button>';
    } else {
      html +=
        '<div class="placeholder">' +
          'Le contenu de cette leçon sera ajouté dans une étape ultérieure.' +
        '</div>';
    }

    html += '</div>';
    contentEl().innerHTML = html;
  }

  /* ---------- Rendu global ---------- */

  function render() {
    renderCrumb();
    if (state.curriculumView === 'modules')       renderModules();
    else if (state.curriculumView === 'lessons')  renderLessons();
    else if (state.curriculumView === 'lesson')   renderLesson();
  }

  /* ---------- Navigation ---------- */

  function goToModules() {
    state.curriculumView = 'modules';
    state.currentModuleId = null;
    state.currentLessonId = null;
    render();
  }

  function goToLessons() {
    state.curriculumView = 'lessons';
    state.currentLessonId = null;
    render();
  }

  /* ---------- Clics délégués ---------- */

  function handleClick(e) {
    /* Navigation (fil d'Ariane, bouton retour) */
    var navEl = e.target.closest('[data-nav]');
    if (navEl) {
      var target = navEl.getAttribute('data-nav');
      if (target === 'modules') { goToModules(); return; }
      if (target === 'lessons') { goToLessons(); return; }
    }

    /* Actions */
    var actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    var action = actionEl.getAttribute('data-action');

    if (action === 'open-module') {
      var mid = actionEl.getAttribute('data-module');
      var m = window.APP.findModule(mid);
      if (!window.APP.isModuleUnlocked(m)) return;
      state.currentModuleId = mid;
      state.curriculumView = 'lessons';
      render();
    } else if (action === 'open-lesson') {
      state.currentModuleId = actionEl.getAttribute('data-module');
      state.currentLessonId = actionEl.getAttribute('data-lesson');
      state.curriculumView = 'lesson';
      render();
    } else if (action === 'start-lesson') {
      /* À l'Étape 3, ce bouton lancera le moteur de leçon */
      if (window.APP.LessonEngine) {
        window.APP.LessonEngine.startCurrent();
      }
    }
  }

  /* ---------- Init / onEnter ---------- */

  function init() {
    var el = contentEl();
    if (el) el.addEventListener('click', handleClick);
    render();
  }

  function onEnter() {
    /* Appelé quand on revient à l'onglet Curriculum */
    render();
  }

  /* ---------- API publique ---------- */

  window.APP.UINav = {
    init: init,
    onEnter: onEnter,
    render: render,
    getState: function () { return state; },
    goToModules: goToModules,
    goToLessons: goToLessons
  };
})();
