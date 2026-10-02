/* =========================================================
   ui-catalog.js — Catalogue des leçons (v1.2.1)
   =========================================================
   Nouveauté :
     - Vue détail interne au catalogue (reste dans le Catalogue)
     - État de navigation indépendant du Parcours
     - Retour au catalogue après consultation
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var THEME_LABELS = {
    'bases': 'Bases',
    'tactics': 'Tactique',
    'endgames': 'Finales',
    'opening': 'Ouverture',
    'middlegame': 'Milieu de jeu',
    'psychology': 'Gestion de partie'
  };

  var state = {
    filterTheme: 'all',
    filterStars: 'all',
    sortBy: 'theme',
    /* Nouveauté : vue interne du catalogue */
    catalogView: 'list',       /* 'list' | 'lesson' */
    currentLesson: null        /* { moduleId, lessonId } */
  };

  function contentEl() { return document.getElementById('catalog-content'); }

  /* ================= RENDU GLOBAL ================= */

  function render() {
    if (state.catalogView === 'lesson') {
      renderLessonDetail();
    } else {
      renderList();
    }
  }

  /* ================= VUE DÉTAIL (dans le catalogue) ================= */

  function renderLessonDetail() {
    var el = contentEl();
    if (!el || !state.currentLesson) return;

    var m = window.APP.findModule(state.currentLesson.moduleId);
    var l = window.APP.findLesson(state.currentLesson.moduleId, state.currentLesson.id);
    if (!m || !l) { state.catalogView = 'list'; renderList(); return; }

    var lt = getLessonDisplayType(l);

    /* Fil d'Ariane interne au catalogue */
    var crumbHtml =
      '<div class="crumb">' +
        '<a data-catalog-nav="list">Catalogue</a>' +
        '<span class="sep">›</span>' +
        '<span>' + m.id + ' — ' + l.title + '</span>' +
      '</div>';

    var backHtml =
      '<button class="back-btn" data-catalog-nav="list" type="button">‹ Catalogue</button>';

    var html = crumbHtml + backHtml;
    html += '<div class="lesson-detail">';
    html += '<h3>' + l.title + '</h3>';
    html += '<div class="objective"><strong>Objectif :</strong> ' + l.objective + '</div>';

    if (lt === 'interactive' || lt === 'puzzle-live') {
      html +=
        '<button data-action="catalog-start-lesson" type="button" ' +
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

    el.innerHTML = html;
    bindDetailEvents();
  }

  function bindDetailEvents() {
    var el = contentEl();
    if (!el) return;

    el.addEventListener('click', function (e) {
      /* Navigation interne au catalogue */
      var navEl = e.target.closest('[data-catalog-nav]');
      if (navEl) {
        var action = navEl.getAttribute('data-catalog-nav');
        if (action === 'list') {
          goToList();
          return;
        }
      }

      /* Démarrer la leçon */
      var actionEl = e.target.closest('[data-action="catalog-start-lesson"]');
      if (actionEl) {
        startCurrentLesson();
        return;
      }
    });
  }

  function goToList() {
    state.catalogView = 'list';
    state.currentLesson = null;
    render();
  }

  function startCurrentLesson() {
    if (!state.currentLesson) return;
    var l = window.APP.findLesson(state.currentLesson.moduleId, state.currentLesson.id);
    if (!l || !l.lichessTheme) return;

    /* On informe le moteur de leçon qu'on vient du catalogue */
    if (window.APP.LessonEngine) {
      window.APP.LessonEngine.startFromCatalog(
        state.currentLesson.moduleId,
        state.currentLesson.id,
        l.lichessTheme
      );
    }
  }

  /* ================= VUE LISTE ================= */

  function renderList() {
    var el = contentEl();
    if (!el) return;

    var lessons = window.APP.getAllLessons();
    var filtered = applyFilters(lessons);
    var grouped = groupLessons(filtered);

    var html = '';

    html += renderFilters();

    html += '<div class="catalog-count">' + filtered.length + ' leçon' +
            (filtered.length > 1 ? 's' : '') + ' affichée' +
            (filtered.length > 1 ? 's' : '') + '</div>';

    if (filtered.length === 0) {
      html += '<div class="catalog-empty">Aucune leçon ne correspond à ces filtres.</div>';
    } else {
      var keys = Object.keys(grouped).sort(compareGroupKeys);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        html += '<div class="catalog-theme-title">' + formatGroupTitle(key) + '</div>';
        var list = grouped[key];
        for (var j = 0; j < list.length; j++) {
          html += renderLessonRow(list[j]);
        }
      }
    }

    el.innerHTML = html;
    bindListEvents();
  }

  function renderFilters() {
    return '' +
      '<div class="catalog-filters">' +
        '<div class="filter-group">' +
          '<label for="filter-theme">Thème</label>' +
          '<select id="filter-theme">' +
            '<option value="all"' + (state.filterTheme === 'all' ? ' selected' : '') + '>Tous les thèmes</option>' +
            '<option value="bases"' + (state.filterTheme === 'bases' ? ' selected' : '') + '>Bases</option>' +
            '<option value="tactics"' + (state.filterTheme === 'tactics' ? ' selected' : '') + '>Tactique</option>' +
            '<option value="endgames"' + (state.filterTheme === 'endgames' ? ' selected' : '') + '>Finales</option>' +
            '<option value="opening"' + (state.filterTheme === 'opening' ? ' selected' : '') + '>Ouverture</option>' +
            '<option value="middlegame"' + (state.filterTheme === 'middlegame' ? ' selected' : '') + '>Milieu de jeu</option>' +
          '</select>' +
        '</div>' +
        '<div class="filter-group">' +
          '<label for="filter-stars">Difficulté</label>' +
          '<select id="filter-stars">' +
            '<option value="all"' + (state.filterStars === 'all' ? ' selected' : '') + '>Toutes</option>' +
            '<option value="1"' + (state.filterStars === '1' ? ' selected' : '') + '>⭐ (facile)</option>' +
            '<option value="2"' + (state.filterStars === '2' ? ' selected' : '') + '>⭐⭐</option>' +
            '<option value="3"' + (state.filterStars === '3' ? ' selected' : '') + '>⭐⭐⭐</option>' +
            '<option value="4"' + (state.filterStars === '4' ? ' selected' : '') + '>⭐⭐⭐⭐</option>' +
            '<option value="5"' + (state.filterStars === '5' ? ' selected' : '') + '>⭐⭐⭐⭐⭐ (difficile)</option>' +
          '</select>' +
        '</div>' +
        '<div class="filter-group">' +
          '<label for="filter-sort">Trier par</label>' +
          '<select id="filter-sort">' +
            '<option value="theme"' + (state.sortBy === 'theme' ? ' selected' : '') + '>Thème</option>' +
            '<option value="stars"' + (state.sortBy === 'stars' ? ' selected' : '') + '>Difficulté</option>' +
          '</select>' +
        '</div>' +
      '</div>';
  }

  function renderLessonRow(lesson) {
    var starsStr = '';
    for (var i = 0; i < lesson.stars; i++) starsStr += '⭐';

    return '' +
      '<div class="catalog-lesson" ' +
           'data-action="catalog-open-lesson" ' +
           'data-module="' + lesson.moduleId + '" ' +
           'data-lesson="' + lesson.id + '">' +
        '<span class="lesson-module-badge">' + lesson.moduleId + '</span>' +
        '<span class="lesson-title">' + lesson.title + '</span>' +
        '<span class="lesson-stars" title="Difficulté ' + lesson.stars + '/5">' + starsStr + '</span>' +
      '</div>';
  }

  /* ================= FILTRES ================= */

  function applyFilters(lessons) {
    return lessons.filter(function (l) {
      if (state.filterTheme !== 'all' && l.theme !== state.filterTheme) return false;
      if (state.filterStars !== 'all' && String(l.stars) !== String(state.filterStars)) return false;
      return true;
    });
  }

  function groupLessons(lessons) {
    var groups = {};
    for (var i = 0; i < lessons.length; i++) {
      var l = lessons[i];
      var key = state.sortBy === 'theme' ? l.theme : ('stars-' + l.stars);
      if (!groups[key]) groups[key] = [];
      groups[key].push(l);
    }
    return groups;
  }

  function compareGroupKeys(a, b) {
    if (state.sortBy === 'theme') {
      var order = ['bases', 'tactics', 'endgames', 'opening', 'middlegame'];
      var ia = order.indexOf(a);
      var ib = order.indexOf(b);
      if (ia === -1) ia = 999;
      if (ib === -1) ib = 999;
      return ia - ib;
    } else {
      var na = parseInt(a.replace('stars-', ''), 10);
      var nb = parseInt(b.replace('stars-', ''), 10);
      return na - nb;
    }
  }

  function formatGroupTitle(key) {
    if (state.sortBy === 'theme') {
      return THEME_LABELS[key] || key;
    } else {
      var stars = parseInt(key.replace('stars-', ''), 10);
      var s = '';
      for (var i = 0; i < stars; i++) s += '⭐';
      return 'Difficulté ' + stars + '/5 ' + s;
    }
  }

  /* ================= UTILITAIRES ================= */

  function getLessonDisplayType(lesson) {
    if (window.APP.LessonEngine && window.APP.LessonEngine.hasContent
        && window.APP.LessonEngine.hasContent(lesson.id)) {
      return 'puzzle-live';
    }
    return 'coming';
  }

  /* ================= ÉVÉNEMENTS ================= */

  function bindListEvents() {
    var selTheme = document.getElementById('filter-theme');
    var selStars = document.getElementById('filter-stars');
    var selSort = document.getElementById('filter-sort');

    if (selTheme) selTheme.addEventListener('change', function () {
      state.filterTheme = this.value;
      renderList();
    });
    if (selStars) selStars.addEventListener('change', function () {
      state.filterStars = this.value;
      renderList();
    });
    if (selSort) selSort.addEventListener('change', function () {
      state.sortBy = this.value;
      renderList();
    });

    var container = contentEl();
    if (container) {
      container.addEventListener('click', function (e) {
        var el = e.target.closest('[data-action="catalog-open-lesson"]');
        if (!el) return;
        var moduleId = el.getAttribute('data-module');
        var lessonId = el.getAttribute('data-lesson');
        openLessonDetail(moduleId, lessonId);
      });
    }
  }

  function openLessonDetail(moduleId, lessonId) {
    state.currentLesson = { moduleId: moduleId, id: lessonId };
    state.catalogView = 'lesson';
    renderLessonDetail();
  }

  /* ================= API PUBLIQUE ================= */

  /* Appelé par le moteur après un exercice : revient au catalogue */
  function returnFromLesson() {
    state.catalogView = 'list';
    state.currentLesson = null;
    renderList();
  }

  /* Vérifie si on est actuellement dans le catalogue */
  function isActive() {
    var el = document.getElementById('learning-catalog');
    return el && el.classList.contains('active');
  }

  window.APP.UICatalog = {
    render: render,
    renderList: renderList,
    renderLessonDetail: renderLessonDetail,
    returnFromLesson: returnFromLesson,
    isActive: isActive,
    openLessonDetail: openLessonDetail,
    goToList: goToList,
    getState: function () { return state; }
  };
})();
