/* =========================================================
   ui-tabs.js — Gestion des onglets (v1.2.0)
   Ajout : onglet « Apprentissage » (renommé depuis Curriculum).
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var currentView = 'learning';

  function setActiveTab(viewName) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      if (t.getAttribute('data-view') === viewName) t.classList.add('active');
      else t.classList.remove('active');
    }
  }

  function showView(viewName) {
    var ids = ['view-learning', 'view-freeplay', 'view-analysis', 'view-review'];
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

    if (viewName === 'learning' && window.APP.UINav) {
      window.APP.UINav.onEnter();
    } else if (viewName === 'freeplay' && window.APP.UIFreeplay) {
      window.APP.UIFreeplay.onEnter();
    } else if (viewName === 'analysis' && window.APP.UIAnalysis) {
      window.APP.UIAnalysis.onEnter();
      if (window.APP.Board) window.APP.Board.setLessonMode(false);
    } else if (viewName === 'review' && window.APP.UIGameReview) {
      window.APP.UIGameReview.onEnter();
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
    showView('learning');
    setActiveTab('learning');
  }

  window.APP.UITabs = {
    init: init,
    getCurrentView: function () { return currentView; }
  };
})();
