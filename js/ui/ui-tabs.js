/* =========================================================
   ui-tabs.js — Gestion des onglets Curriculum / Partie libre
   =========================================================
   Rôle : basculer entre les vues et notifier les autres modules.
   API : window.APP.UITabs.init()
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var currentView = 'curriculum';

  function setActiveTab(viewName) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      if (t.getAttribute('data-view') === viewName) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    }
  }

  function showView(viewName) {
    var vc = document.getElementById('view-curriculum');
    var vf = document.getElementById('view-freeplay');
    if (vc) vc.classList.toggle('active', viewName === 'curriculum');
    if (vf) vf.classList.toggle('active', viewName === 'freeplay');
  }

  function onTabClick(e) {
    var viewName = this.getAttribute('data-view');
    if (!viewName) return;

    currentView = viewName;
    setActiveTab(viewName);
    showView(viewName);

    /* Notifie les autres modules */
    if (viewName === 'curriculum' && window.APP.UINav) {
      window.APP.UINav.onEnter();
    } else if (viewName === 'freeplay' && window.APP.UIFreeplay) {
      window.APP.UIFreeplay.onEnter();
    }

    /* Resize échiquier après changement d'onglet */
    setTimeout(function () {
      if (window.APP.Board) window.APP.Board.resize();
    }, 50);
  }

  function init() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', onTabClick);
    }
    /* Vue initiale */
    showView('curriculum');
    setActiveTab('curriculum');
  }

  window.APP.UITabs = {
    init: init,
    getCurrentView: function () { return currentView; },
    switchTo: function (viewName) {
      var fakeEvent = { target: { getAttribute: function () { return viewName; } } };
      onTabClick.call(fakeEvent.target);
    }
  };
})();
