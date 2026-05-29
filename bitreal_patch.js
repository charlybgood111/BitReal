/**
 * BitReal — Patch d'interactivité v1.2
 * Ajouter cette ligne avant </body> dans BitReal_maquettes_mobile.html :
 *   <script src="bitreal_patch.js"></script>
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     UTILITAIRE : navigation entre screens
  ────────────────────────────────────────── */
  function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.remove('active');
    });
    var target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      target.scrollTop = 0;
    }
    document.querySelectorAll('.nav-tab').forEach(function (tab) {
      tab.classList.remove('active');
      if (tab.getAttribute('onclick') && tab.getAttribute('onclick').includes(screenId)) {
        tab.classList.add('active');
      }
    });
  }

  /* ──────────────────────────────────────────
     PAGE 1 — Boas-vindas → Dashboard
  ────────────────────────────────────────── */
  function initPage1() {
    var screen = document.getElementById('screen-onboard');
    if (!screen) return;
    screen.querySelectorAll('button, .btn-green, .btn-outline').forEach(function (btn) {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        goToScreen('screen-dashboard');
      });
    });
  }

  /* ──────────────────────────────────────────
     PAGE 2 — Dashboard
     Arredondamento → page 3 / Recorrente → page 4
  ────────────────────────────────────────── */
  function initPage2() {
    var screen = document.getElementById('screen-dashboard');
    if (!screen) return;
    screen.querySelectorAll('.plan-card').forEach(function (card) {
      var text = card.textContent.toLowerCase();
      var dest = text.includes('arredondamento') ? 'screen-arrondi'
               : text.includes('recorrente')     ? 'screen-dca'
               : null;
      if (!dest) return;
      card.style.cursor = 'pointer';
      card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
      card.addEventListener('click', function () { goToScreen(dest); });
      card.addEventListener('mouseenter', function () {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
      card.addEventListener('touchstart', function () {
        card.style.transform = 'scale(0.97)';
      }, { passive: true });
      card.addEventListener('touchend', function () {
        card.style.transform = '';
      });
    });
  }

  /* ──────────────────────────────────────────
     PAGE 3 — Arredondamento
     Toggle ON/OFF + chips x1 x2 x5 x10
  ────────────────────────────────────────── */
  function initPage3() {
    var screen = document.getElementById('screen-arrondi');
    if (!screen) return;

    injectToggleCSS();

    var toggle      = screen.querySelector('.toggle-wrap');
    var multSection = screen.querySelector('.mult-section');
    var isOn        = true;

    if (toggle) {
      toggle.classList.add('is-on');
      toggle.addEventListener('click', function () {
        isOn = !isOn;
        toggle.classList.toggle('is-on',  isOn);
        toggle.classList.toggle('is-off', !isOn);
        if (multSection) multSection.classList.toggle('mult-section-disabled', !isOn);
      });
    }

    screen.querySelectorAll('.mult-chip').forEach(function (chip) {
      chip.style.cursor = 'pointer';
      chip.addEventListener('click', function () {
        screen.querySelectorAll('.mult-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
      });
    });
  }

  /* ──────────────────────────────────────────
     PAGE 4 — Compra Recorrente
     Toggle Recorrente Inteligente + presets
  ────────────────────────────────────────── */
  function initPage4() {
    var screen = document.getElementById('screen-dca');
    if (!screen) return;

    injectToggleCSS();

    /* Trouver le toggle "Recorrente Inteligente" */
    var riToggle    = null;
    var riContainer = null;
    screen.querySelectorAll('*').forEach(function (el) {
      if (riToggle) return;
      if (el.childNodes.length === 1 &&
          el.childNodes[0].nodeType === 3 &&
          el.childNodes[0].textContent.toLowerCase().includes('recorrente inteligente')) {
        var parent = el.closest('.freq-card, .dca-active-card, .amount-card, [class*="card"], div');
        if (parent) { riToggle = parent.querySelector('.toggle-wrap'); riContainer = parent; }
      }
    });
    if (!riToggle) riToggle = screen.querySelector('.toggle-wrap');

    /* Trouver la section Perfil de risco */
    var riskSection = null;
    screen.querySelectorAll('*').forEach(function (el) {
      if (riskSection) return;
      var t = el.textContent.toLowerCase();
      if (t.includes('perfil de risco') || t.includes('conservador') ||
          t.includes('moderado') || t.includes('agressivo')) {
        var s = el.closest('.freq-card, .dca-active-card, .amount-card, [class*="card"]');
        if (s && s !== riContainer) riskSection = s;
      }
    });

    if (riToggle) {
      var isRiOn = true;
      riToggle.classList.add('is-on');
      riToggle.addEventListener('click', function () {
        isRiOn = !isRiOn;
        riToggle.classList.toggle('is-on',  isRiOn);
        riToggle.classList.toggle('is-off', !isRiOn);
        if (riskSection) riskSection.classList.toggle('section-disabled', !isRiOn);
      });
    }

    /* Presets */
    var presets = screen.querySelectorAll('.preset');
    presets.forEach(function (preset) {
      preset.style.cursor = 'pointer';
      preset.addEventListener('click', function () {
        presets.forEach(function (p) { p.classList.remove('active'); });
        preset.classList.add('active');
        var amountVal = screen.querySelector('.amount-val');
        if (amountVal) {
          var match = preset.textContent.match(/(\d+)/);
          if (match) {
            var n = parseInt(match[1]);
            amountVal.textContent = 'R$ ' + n.toLocaleString('pt-BR', {
              minimumFractionDigits: 2, maximumFractionDigits: 2
            });
          }
        }
      });
    });
  }

  /* ──────────────────────────────────────────
     FIX ICÔNES FRÉQUENCE (page 4)
     Diario / Semanal / Mensal : SVG plus visibles
  ────────────────────────────────────────── */
  function fixFreqIcons() {
    var style = document.createElement('style');
    style.textContent = [
      /* Icônes inactives : gris foncé bien lisible */
      '#screen-dca .freq-opt .freq-emoji svg,',
      '#screen-dca .freq-opt svg {',
      '  stroke: #555566 !important;',
      '  color: #555566 !important;',
      '  opacity: 1 !important;',
      '}',
      /* Icône active : couleur orange BitReal */
      '#screen-dca .freq-opt.active .freq-emoji svg,',
      '#screen-dca .freq-opt.active svg {',
      '  stroke: #F7931A !important;',
      '  color: #F7931A !important;',
      '}',
      /* Taille légèrement augmentée */
      '#screen-dca .freq-emoji {',
      '  font-size: 26px !important;',
      '}',
      /* En mode clair, les SVG sont encore plus sombres */
      '@media (prefers-color-scheme: light) {',
      '  #screen-dca .freq-opt svg { stroke: #333344 !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ──────────────────────────────────────────
     CSS TOGGLE (partagé pages 3 & 4)
  ────────────────────────────────────────── */
  function injectToggleCSS() {
    if (document.getElementById('br-toggle-style')) return;
    var s = document.createElement('style');
    s.id = 'br-toggle-style';
    s.textContent = [
      '.toggle-wrap { transition: background 0.25s ease !important; }',
      '.toggle-wrap::after { transition: left 0.25s ease, right 0.25s ease !important; }',
      '.toggle-wrap.is-off { background: #ADADC0 !important; }',
      '.toggle-wrap.is-off::after { right: auto !important; left: 3px !important; }',
      '.toggle-wrap.is-on::after  { left: auto !important;  right: 3px !important; }',
      '.mult-section-disabled { opacity: 0.3 !important; pointer-events: none !important; transition: opacity 0.25s !important; }',
      '.section-disabled { opacity: 0.3 !important; pointer-events: none !important; transition: opacity 0.25s !important; }'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ──────────────────────────────────────────
     INIT
  ────────────────────────────────────────── */
  function init() {
    initPage1();
    initPage2();
    initPage3();
    initPage4();
    fixFreqIcons();
    console.log('[BitReal Patch v1.2] ✅ Chargé');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
