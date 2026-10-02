/* =========================================================
   ui-catalog.js — Catalogue des leçons (NOUVEAU v1.2.0)
   =========================================================
   Rôle : afficher toutes les leçons du curriculum avec :
     - Filtre par thème
     - Filtre par difficulté
     - Tri par thème ou par difficulté
   Chaque leçon est cliquable et ouvre la vue détail.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* Libellés des thèmes */
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
    sortBy: 'theme'
  };

  function contentEl() { return document.getElementById('catalog-content'); }

  /* ================= RENDU ================= */

  function render() {
    var el = contentEl();
    if (!el) return;

    var lessons = window.APP.getAllLessons();
    var filtered = applyFilters(lessons);
    var grouped = groupLessons(filtered);

    var html = '';

    /* Filtres */
    html += renderFilters();

    /* Compteur */
    html += '<div class="catalog-count">' + filtered.length + ' leçon' +
            (filtered.length > 1 ? 's' : '') + ' affichée' +
            (filtered.length > 1 ? 's' : '') + '</div>';

    /* Liste groupée */
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
    bindEvents();
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

  /* ================= ÉVÉNEMENTS ================= */

  function bindEvents() {
    var selTheme = document.getElementById('filter-theme');
    var selStars = document.getElementById('filter-stars');
    var selSort = document.getElementById('filter-sort');

    if (selTheme) selTheme.addEventListener('change', function () {
      state.filterTheme = this.value;
      render();
    });
    if (selStars) selStars.addEventListener('change', function () {
      state.filterStars = this.value;
      render();
    });
    if (selSort) selSort.addEventListener('change', function () {
      state.sortBy = this.value;
      render();
    });

    /* Clic sur une leçon */
    var container = contentEl();
    if (container) {
      container.addEventListener('click', function (e) {
        var el = e.target.closest('[data-action="catalog-open-lesson"]');
        if (!el) return;
        var moduleId = el.getAttribute('data-module');
        var lessonId = el.getAttribute('data-lesson');
        if (window.APP.UINav) {
          window.APP.UINav.openLessonFromCatalog(moduleId, lessonId);
        }
      });
    }
  }

  /* ================= API ================= */

  window.APP.UICatalog = {
    render: render,
    getState: function () { return state; }
  };
})();
