/* =========================================================
   ui-catalog.js — Catalogue (v1.5.0)
   Ajout : légende explicative des symboles en haut du catalogue.
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
    catalogView: 'list',
    currentLesson: null
  };

  function contentEl() { return document.getElementById('catalog-content'); }

  function render() {
    if (state.catalogView === 'lesson') renderLessonDetail();
    else renderList();
  }

  /* ================= VUE DÉTAIL ================= */

  function renderLessonDetail() {
    var el = contentEl();
    if (!el || !state.currentLesson) return;

    var m = window.APP.findModule(state.currentLesson.moduleId);
    var l = window.APP.findLesson(state.currentLesson.moduleId, state.currentLesson.id);
    if (!m || !l) { state.catalogView = 'list'; renderList(); return; }

    var lt = getLessonDisplayType(l);

    var html =
      '<div class="crumb">' +
        '<a data-catalog-nav="list">Catalogue</a>' +
        '<span class="sep">›</span>' +
        '<span>' + m.id + ' — ' + l.title + '</span>' +
      '</div>' +
      '<button class="back-btn" data-catalog-nav="list" type="button">‹ Catalogue</button>' +
      '<div class="lesson-detail">' +
        '<h3>' + l.title + '</h3>' +
        '<div class="objective"><strong>Objectif :</strong> ' + l.objective + '</div>';

    if (lt === 'interactive' || lt === 'puzzle-live') {
      html +=
        '<button data-action="catalog-start-lesson" type="button" class="back-btn" ' +
                'style="background:var(--accent);color:#fff;border-color:var(--accent);' +
                       'min-width:100%;justify-content:center;padding:12px;">' +
          '▶ Démarrer la leçon' +
        '</button>';
    } else {
      html += '<div class="placeholder">Le contenu de cette leçon sera ajouté dans une étape ultérieure.</div>';
    }
    html += '</div>';

    el.innerHTML = html;
    bindDetailEvents();
  }

  function bindDetailEvents() {
    var el = contentEl();
    if (!el) return;
    el.addEventListener('click', function (e) {
      var navEl = e.target.closest('[data-catalog-nav]');
      if (navEl && navEl.getAttribute('data-catalog-nav') === 'list') { goToList(); return; }

      var actionEl = e.target.closest('[data-action="catalog-start-lesson"]');
      if (actionEl) { startCurrentLesson(); return; }
    });
  }

  function goToList() {
    state.catalogView = 'list';
    state.currentLesson = null;
    render();
  }

  function startCurrentLesson() {
    if (!state.currentLesson) return;
    if (window.APP.LessonEngine) {
      window.APP.LessonEngine.startFromCatalog(state.currentLesson.moduleId, state.currentLesson.id, null);
    }
  }

  /* ================= VUE LISTE ================= */

  function renderList() {
    var el = contentEl();
    if (!el) return;

    var lessons = window.APP.getAllLessons();
    var filtered = applyFilters(lessons);
    var grouped = groupLessons(filtered);

    var html = renderLegend();
    html += renderFilters();
    html += '<div class="catalog-count">' + filtered.length + ' leçon' +
            (filtered.length > 1 ? 's' : '') + ' affichée' +
            (filtered.length > 1 ? 's' : '') + '</div>';

    if (filtered.length === 0) {
      html += '<div class="catalog-empty">Aucune leçon ne correspond à ces filtres.</div>';
    } else {
      var keys = Object.keys(grouped).sort(compareGroupKeys);
      for (var i = 0; i < keys.length; i++) {
        html += '<div class="catalog-theme-title">' + formatGroupTitle(keys[i]) + '</div>';
        var list = grouped[keys[i]];
        for (var j = 0; j < list.length; j++) {
          html += renderLessonRow(list[j]);
        }
      }
    }

    el.innerHTML = html;
    bindListEvents();
  }

  /* ================= LÉGENDE ================= */

  function renderLegend() {
    return '' +
      '<div class="catalog-legend" id="catalog-legend">' +
        '<button class="legend-toggle" type="button" id="legend-toggle">' +
          'ℹ️ Légende des symboles' +
        '</button>' +
        '<div class="legend-content" id="legend-content">' +
          '<div class="legend-row">' +
            '<span class="legend-icon icon-interactive">▶</span>' +
            '<span class="legend-text"><strong>Exercice interactif</strong> — clique ou déplace une pièce (Modules M0 et M1)</span>' +
          '</div>' +
          '<div class="legend-row">' +
            '<span class="legend-icon icon-puzzle">♟</span>' +
            '<span class="legend-text"><strong>Puzzle Lichess</strong> — résous une position tirée d\'une vraie partie (Modules M2 à M9)</span>' +
          '</div>' +
          '<div class="legend-row">' +
            '<span class="legend-icon icon-none">—</span>' +
            '<span class="legend-text"><strong>Théorie</strong> — leçon explicative, contenu à venir</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function bindLegendToggle() {
    var toggle = document.getElementById('legend-toggle');
    var content = document.getElementById('legend-content');
    if (!toggle || !content) return;
    toggle.addEventListener('click', function () {
      content.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  }

  /* ================= FILTRES ================= */

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
    var badge = '';
    var lt = getLessonDisplayType(lesson);
    if (lt === 'interactive') {
      badge = '<span class="lesson-badge-interactive" title="Exercice interactif">▶</span>';
    } else if (lt === 'puzzle-live') {
      badge = '<span class="lesson-badge-puzzle" title="Puzzle Lichess">♟</span>';
    } else {
      badge = '<span class="lesson-badge-none" title="Théorie à venir">—</span>';
    }

    return '' +
      '<div class="catalog-lesson" data-action="catalog-open-lesson" ' +
           'data-module="' + lesson.moduleId + '" data-lesson="' + lesson.id + '">' +
        '<span class="lesson-module-badge">' + lesson.moduleId + '</span>' +
        badge +
        '<span class="lesson-title">' + lesson.title + '</span>' +
        '<span class="lesson-stars">' + starsStr + '</span>' +
      '</div>';
  }

  /* ================= UTILITAIRES ================= */

  function getLessonDisplayType(lesson) {
    if (window.APP.LessonEngine && window.APP.LessonEngine.lessonType) {
      return window.APP.LessonEngine.lessonType(lesson.id);
    }
    return 'coming';
  }

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
      var ia = order.indexOf(a); var ib = order.indexOf(b);
      if (ia === -1) ia = 999; if (ib === -1) ib = 999;
      return ia - ib;
    } else {
      return parseInt(a.replace('stars-', ''), 10) - parseInt(b.replace('stars-', ''), 10);
    }
  }

  function formatGroupTitle(key) {
    if (state.sortBy === 'theme') return THEME_LABELS[key] || key;
    var stars = parseInt(key.replace('stars-', ''), 10);
    var s = '';
    for (var i = 0; i < stars; i++) s += '⭐';
    return 'Difficulté ' + stars + '/5 ' + s;
  }

  /* ================= ÉVÉNEMENTS ================= */

  function bindListEvents() {
    var selTheme = document.getElementById('filter-theme');
    var selStars = document.getElementById('filter-stars');
    var selSort = document.getElementById('filter-sort');
    if (selTheme) selTheme.addEventListener('change', function () { state.filterTheme = this.value; renderList(); });
    if (selStars) selStars.addEventListener('change', function () { state.filterStars = this.value; renderList(); });
    if (selSort) selSort.addEventListener('change', function () { state.sortBy = this.value; renderList(); });

    bindLegendToggle();

    var container = contentEl();
    if (container) {
      container.addEventListener('click', function (e) {
        var el = e.target.closest('[data-action="catalog-open-lesson"]');
        if (!el) return;
        openLessonDetail(el.getAttribute('data-module'), el.getAttribute('data-lesson'));
      });
    }
  }

  function openLessonDetail(moduleId, lessonId) {
    state.currentLesson = { moduleId: moduleId, id: lessonId };
    state.catalogView = 'lesson';
    renderLessonDetail();
  }

  function returnFromLesson() {
    state.catalogView = 'list';
    state.currentLesson = null;
    renderList();
  }

  window.APP.UICatalog = {
    render: render,
    renderList: renderList,
    renderLessonDetail: renderLessonDetail,
    returnFromLesson: returnFromLesson,
    openLessonDetail: openLessonDetail,
    goToList: goToList,
    getState: function () { return state; }
  };
})();
