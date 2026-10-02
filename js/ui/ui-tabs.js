/* =========================================================
   ui-tabs.js — Gestion des onglets (v1.0.9)
   =========================================================
   Ajout de l'onglet « Analyse ».
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var currentView = 'curriculum';

  function setActiveTab(viewName) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      if (t.getAttribute('data-view') === viewName) t.classList.add('active');
      else t.classList.remove('active');
    }
  }

  function showView(viewName) {
    var ids = ['view-curriculum', 'view-freeplay', 'view-analysis'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.classList.toggle('active', ids[i] === 'view-' + viewName);
    }
  }

  function onTabClick(e) {
    var viewName = this.getAttribute('data-view');
    if (!viewName) return;

    currentView = viewName;
    setActiveTab(viewName);
    showView(viewName);

    if (viewName === 'curriculum' && window.APP.UINav) {
      window.APP.UINav.onEnter();
    } else if (viewName === 'freeplay' && window.APP.UIFreeplay) {
      window.APP.UIFreeplay.onEnter();
    } else if (viewName === 'analysis' && window.APP.UIAnalysis) {
      window.APP.UIAnalysis.onEnter();
      /* Sortir du mode leçon pour permettre l'analyse libre */
      if (window.APP.Board) window.APP.Board.setLessonMode(false);
    }

    setTimeout(function () {
      if (window.APP.Board) window.APP.Board.resize();
    }, 50);
  }

  function init() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', onTabClick);
    }
    showView('curriculum');
    setActiveTab('curriculum');
  }

  window.APP.UITabs = {
    init: init,
    getCurrentView: function () { return currentView; }
  };
})();
