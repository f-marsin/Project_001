/* =========================================================
   config.js — Constantes globales de l'application
   =========================================================
   Pour changer le nom ou l'étape, modifie UNIQUEMENT ici.
   ========================================================= */

window.APP = window.APP || {};

window.APP.CONFIG = {
  NAME: 'Projet_001',
  STEP: 6,
  VERSION: '0.6.0',
  get FULLNAME() {
    return this.NAME + ' — Étape ' + this.STEP;
  }
};

/* Applique immédiatement le titre au document */
if (typeof document !== 'undefined') {
  document.title = window.APP.CONFIG.FULLNAME;
}
