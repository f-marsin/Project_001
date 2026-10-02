/* =========================================================
   ui-profile.js — Vue Profil (v1.3.0)
   =========================================================
   Rôle : afficher le profil utilisateur, statistiques,
   progression et bouton de réinitialisation.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  function contentEl() { return document.getElementById('profile-content'); }

  /* ================= RENDU ================= */

  function render() {
    var el = contentEl();
    if (!el) return;

    var p = window.APP.UserProfile.get();
    var globalStats = window.APP.UserProfile.getGlobalStats();
    var completion = window.APP.UserProfile.getCompletionRate();
    var themeStats = window.APP.UserProfile.getThemeStats();

    var html = '';

    /* En-tête : utilisateur */
    html += '<div class="profile-header">';
    html += '  <div class="profile-avatar">👤</div>';
    html += '  <div class="profile-identity">';
    html += '    <div class="profile-name">Utilisateur local</div>';
    html += '    <div class="profile-id mono">' + p.userId + '</div>';
    html += '    <div class="profile-date text-dim">Créé le ' + p.createdAt + '</div>';
    html += '  </div>';
    html += '</div>';

    /* Note connexion future */
    html += '<div class="profile-note">';
    html += '  <span class="note-icon">🔒</span> ';
    html += '  <span class="text-dim">Tes données sont stockées localement sur cet appareil. ';
    html += '  La connexion multi-appareil arrivera dans une prochaine version.</span>';
    html += '</div>';

    /* Stats globales */
    html += '<h2>Statistiques globales</h2>';
    html += '<div class="profile-stats-grid">';
    html += renderStatCard('📊', globalStats.attempts, 'Tentatives');
    html += renderStatCard('✅', globalStats.correct, 'Réussites');
    html += renderStatCard('🎯', globalStats.successRate + ' %', 'Taux de réussite');
    html += renderStatCard('⏱️', globalStats.timeSpentMin + ' min', 'Temps total');
    html += '</div>';

    /* Progression */
    html += '<h2>Progression</h2>';
    html += '<div class="profile-progress">';
    html += '  <div class="progress-bar-container">';
    html += '    <div class="progress-bar-fill" style="width:' + completion.percent + '%"></div>';
    html += '  </div>';
    html += '  <div class="progress-legend">';
    html += '    <span><span class="dot mastered"></span>' + completion.mastered + ' maîtrisées</span>';
    html += '    <span><span class="dot inprogress"></span>' + completion.inProgress + ' en cours</span>';
    html += '    <span><span class="dot notstarted"></span>' + completion.notStarted + ' non commencées</span>';
    html += '  </div>';
    html += '  <div class="progress-percent">' + completion.percent + ' % du parcours complété</div>';
    html += '</div>';

    /* Statistiques par thème */
    html += '<h2>Détail par thème</h2>';
    html += '<div class="profile-themes">';
    for (var i = 0; i < themeStats.length; i++) {
      var t = themeStats[i];
      html += renderThemeRow(t);
    }
    html += '</div>';

    /* Bouton reset */
    html += '<div class="profile-actions">';
    html += '  <button id="btn-reset-profile" type="button" class="danger-btn">🗑 Réinitialiser le profil</button>';
    html += '</div>';

    el.innerHTML = html;
    bindActions();
  }

  function renderStatCard(icon, value, label) {
    return '' +
      '<div class="stat-card">' +
        '<div class="stat-icon">' + icon + '</div>' +
        '<div class="stat-value">' + value + '</div>' +
        '<div class="stat-label">' + label + '</div>' +
      '</div>';
  }

  function renderThemeRow(t) {
    /* Barre de progression horizontale */
    return '' +
      '<div class="theme-row">' +
        '<div class="theme-name">' + t.label + '</div>' +
        '<div class="theme-bar">' +
          '<div class="theme-bar-fill" style="width:' + t.rate + '%"></div>' +
        '</div>' +
        '<div class="theme-meta">' +
          '<span class="theme-rate">' + t.rate + ' %</span>' +
          '<span class="theme-count text-dim">(' + t.correct + '/' + t.attempts + ')</span>' +
        '</div>' +
      '</div>';
  }

  /* ================= ACTIONS ================= */

  function bindActions() {
    var btnReset = document.getElementById('btn-reset-profile');
    if (btnReset) btnReset.addEventListener('click', confirmReset);
  }

  function confirmReset() {
    if (!window.confirm('Es-tu sûr de vouloir réinitialiser tout ton profil ?\n\n' +
                        'Cela supprimera :\n' +
                        '- Tes statistiques\n' +
                        '- Ta progression dans les leçons\n' +
                        '- Ton historique de tentatives\n\n' +
                        'Cette action est irréversible.')) {
      return;
    }
    window.APP.UserProfile.reset();
    render();
  }

  /* ================= API ================= */

  function init() { render(); }
  function onEnter() { render(); }

  window.APP.UIProfile = {
    init: init,
    onEnter: onEnter,
    render: render
  };
})();
