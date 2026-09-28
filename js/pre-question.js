/* =========================================================
   pre-question.js — Module « Coup d'avant »
   =========================================================
   Avant chaque puzzle, pose une question de verbalisation.
   L'élève doit répondre correctement pour pouvoir jouer.
   Basé sur la méthode soviétique : verbaliser la menace
   AVANT de calculer.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* État de la question en cours */
  var current = null;

  /* ---------- Affichage d'une question ---------- */
  function show(task, onCorrect) {
    current = {
      task: task,
      pq: task.preQuestion,
      onCorrect: onCorrect
    };

    if (!current.pq) {
      /* Pas de preQuestion : on passe directement */
      if (onCorrect) onCorrect();
      return;
    }

    render();
  }

  /* ---------- Rendu de la question ---------- */
  function render() {
    if (!current) return;
    var pq = current.pq;

    /* On injecte la question en haut du panneau de la leçon */
    var container = document.querySelector('.lesson-play');
    if (!container) return;

    /* Nettoyer une éventuelle question existante */
    var existing = document.getElementById('pre-question-block');
    if (existing) existing.remove();

    var html = '<div id="pre-question-block" class="pre-question-block">';
    html += '<div class="pq-title">🎯 Coup d\'avant</div>';
    html += '<div class="pq-text">' + pq.text + '</div>';
    html += '<div class="pq-options">';
    for (var i = 0; i < pq.options.length; i++) {
      html += '<button class="pq-option" data-option-index="' + i + '" type="button">' + pq.options[i] + '</button>';
    }
    html += '</div>';
    html += '<div class="pq-feedback" id="pq-feedback"></div>';
    html += '</div>';

    /* Insérer en tête du bloc leçon, avant l'instruction */
    var instruction = container.querySelector('.instruction');
    if (instruction) {
      instruction.insertAdjacentHTML('beforebegin', html);
    } else {
      container.insertAdjacentHTML('afterbegin', html);
    }

    /* Bind des clics */
    var buttons = container.querySelectorAll('.pq-option');
    for (var k = 0; k < buttons.length; k++) {
      buttons[k].addEventListener('click', onOptionClick);
    }

    /* Cacher temporairement l'instruction et le feedback d'échecs pendant la question */
    if (instruction) instruction.style.display = 'none';
    var feedback = document.getElementById('lesson-feedback');
    if (feedback) feedback.style.display = 'none';
    var btnRow = container.querySelector('.btn-row');
    if (btnRow) btnRow.style.display = 'none';
  }

  /* ---------- Clic sur une option ---------- */
  function onOptionClick(e) {
    if (!current) return;
    var idx = parseInt(e.currentTarget.getAttribute('data-option-index'), 10);
    var pq = current.pq;
    var fb = document.getElementById('pq-feedback');

    if (idx === pq.correctIndex) {
      /* Bonne réponse */
      fb.className = 'pq-feedback ok';
      fb.textContent = '✅ Bonne analyse ! Tu peux maintenant jouer le coup.';
      /* Désactiver les boutons */
      var buttons = document.querySelectorAll('.pq-option');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
        if (parseInt(buttons[i].getAttribute('data-option-index'), 10) === pq.correctIndex) {
          buttons[i].classList.add('pq-correct');
        }
      }
      /* Après 900ms, on masque la question et on rend la main au moteur */
      setTimeout(function () {
        var block = document.getElementById('pre-question-block');
        if (block) block.remove();
        current = null;
        /* Réafficher l'instruction et le feedback */
        var container = document.querySelector('.lesson-play');
        var instruction = container.querySelector('.instruction');
        if (instruction) instruction.style.display = '';
        var feedback = document.getElementById('lesson-feedback');
        if (feedback) feedback.style.display = '';
        var btnRow = container.querySelector('.btn-row');
        if (btnRow) btnRow.style.display = '';
        /* Appeler le callback */
        // (callback déjà géré plus bas)
      }, 900);
    } else {
      /* Mauvaise réponse */
      e.currentTarget.classList.add('pq-wrong');
      e.currentTarget.disabled = true;
      fb.className = 'pq-feedback ko';
      fb.textContent = '❌ ' + (pq.whyWrong || 'Ce n\'est pas la meilleure analyse. Cherche encore.');
    }
  }

  /* ---------- Gestion complète d'une tâche ---------- */
  function handle(task, onCorrect) {
    /* Si pas de preQuestion : on exécute directement le callback */
    if (!task || !task.preQuestion) {
      if (onCorrect) onCorrect();
      return;
    }
    show(task, onCorrect);
  }

  /* ---------- API publique ---------- */
  window.APP.PreQuestion = {
    handle: handle,
    reset: function () {
      current = null;
      var block = document.getElementById('pre-question-block');
      if (block) block.remove();
    }
  };
})();
