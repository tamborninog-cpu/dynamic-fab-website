/* Dynamic Fab & Finishing — Script */

// Nav scroll behavior
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Counter animation
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(update);
}

// Scroll reveal + counter trigger
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.service-card, .testimonial-card, .process__step, .about__pillar, .gallery__item, .stats__item, .section-header, .cfg-step, .faq__item, .colors__preview, .colors__picker, .ba').forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 4 === 1) el.classList.add('reveal-delay-1');
  if (i % 4 === 2) el.classList.add('reveal-delay-2');
  if (i % 4 === 3) el.classList.add('reveal-delay-3');
  revealObserver.observe(el);
});

// Counter observer
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stats__number').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) counterObserver.observe(statsSection);

// File upload UX
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('fileUpload');

if (fileInput) {
  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    if (files.length > 0) {
      const p = fileUploadArea.querySelector('p');
      p.textContent = files.map(f => f.name).join(', ');
      p.style.color = '#f97316';
    }
  });

  ['dragover', 'dragenter'].forEach(evt => {
    fileUploadArea.addEventListener(evt, e => {
      e.preventDefault();
      fileUploadArea.style.borderColor = '#f97316';
      fileUploadArea.style.background = 'rgba(249,115,22,0.04)';
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    fileUploadArea.addEventListener(evt, () => {
      fileUploadArea.style.borderColor = '';
      fileUploadArea.style.background = '';
    });
  });
}

// Quote form handling
const quoteForm = document.getElementById('quoteForm');
const quoteSuccess = document.getElementById('quoteSuccess');
const resetFormBtn = document.getElementById('resetForm');

function validateField(field) {
  const valid = field.checkValidity() && field.value.trim() !== '';
  field.classList.toggle('error', !valid);
  return valid;
}

if (quoteForm) {
  quoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const required = quoteForm.querySelectorAll('[required]');
    let allValid = true;
    required.forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      const firstError = quoteForm.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate form submission
    const submitBtn = quoteForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.8s linear infinite">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Sending...
    `;

    setTimeout(() => {
      quoteForm.style.display = 'none';
      quoteSuccess.style.display = 'flex';
      quoteSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1200);
  });

  // Clear error on input
  quoteForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });
}

if (resetFormBtn) {
  resetFormBtn.addEventListener('click', e => {
    e.preventDefault();
    quoteForm.reset();
    quoteForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    const submitBtn = quoteForm.querySelector('[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
      Submit Quote Request
    `;
    const p = fileUploadArea?.querySelector('p');
    if (p) { p.textContent = 'Drop files here or '; p.style.color = ''; }
    quoteForm.style.display = 'flex';
    quoteSuccess.style.display = 'none';
    document.getElementById('quote').scrollIntoView({ behavior: 'smooth' });
  });
}

// Spinner keyframe (injected)
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);

/* =============================================
   PROJECT CONFIGURATOR
   ============================================= */
(function () {
  const configurator = document.getElementById('configurator');
  if (!configurator) return;

  const selections = { service: [], material: '', size: '', timeline: '', timelineValue: '' };

  const turnaroundMap = {
    'ASAP / Rush': 'Rush — prioritized',
    '1–2 Weeks': 'Approx. 1–2 weeks',
    '2–4 Weeks': 'Approx. 2–4 weeks',
    'Flexible': 'Scheduled to fit you'
  };
  const scopeMap = {
    'Small — a few parts': 'Prototype / small batch',
    'Medium — batch run': 'Batch production',
    'Large — production volume': 'High-volume run'
  };

  const summaryList = document.getElementById('cfgSummaryList');
  const turnaroundEl = document.getElementById('cfgTurnaround');
  const scopeEl = document.getElementById('cfgScope');

  configurator.querySelectorAll('.cfg-options').forEach(group => {
    const key = group.dataset.group;
    const single = group.dataset.single === 'true';
    group.querySelectorAll('.cfg-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.value.replace(/&amp;/g, '&');
        if (single) {
          const active = chip.getAttribute('aria-pressed') === 'true';
          group.querySelectorAll('.cfg-chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
          chip.setAttribute('aria-pressed', active ? 'false' : 'true');
          selections[key] = active ? '' : value;
          if (key === 'timeline') selections.timelineValue = active ? '' : (chip.dataset.timeline || '');
        } else {
          const active = chip.getAttribute('aria-pressed') === 'true';
          chip.setAttribute('aria-pressed', active ? 'false' : 'true');
          if (active) {
            selections[key] = selections[key].filter(v => v !== value);
          } else {
            selections[key] = [...selections[key], value];
          }
        }
        renderSummary();
      });
    });
  });

  function renderSummary() {
    const rows = [];
    if (selections.service.length) rows.push(['Services', selections.service.join(', ')]);
    if (selections.material) rows.push(['Material', selections.material]);
    if (selections.size) rows.push(['Size', selections.size.split(' — ')[0]]);
    if (selections.timeline) rows.push(['Timeline', selections.timeline]);

    if (!rows.length) {
      summaryList.innerHTML = '<li class="cfg-summary-empty">Start selecting options and your project summary builds here.</li>';
    } else {
      summaryList.innerHTML = rows.map(([k, v]) => `<li><span>${k}: </span><strong>${v}</strong></li>`).join('');
    }
    turnaroundEl.textContent = turnaroundMap[selections.timeline] || '—';
    scopeEl.textContent = scopeMap[selections.size] || '—';
  }

  const cfgSubmit = document.getElementById('cfgSubmit');
  if (cfgSubmit) {
    cfgSubmit.addEventListener('click', () => {
      // Pre-fill the quote form from the configurator
      document.querySelectorAll('input[name="services"]').forEach(cb => {
        cb.checked = selections.service.includes(cb.value);
      });
      const timelineSelect = document.getElementById('timeline');
      if (timelineSelect && selections.timelineValue) timelineSelect.value = selections.timelineValue;

      const desc = document.getElementById('description');
      if (desc) {
        const parts = [];
        if (selections.service.length) parts.push('Service(s): ' + selections.service.join(', '));
        if (selections.material) parts.push('Material: ' + selections.material);
        if (selections.size) parts.push('Project size: ' + selections.size);
        if (selections.timeline) parts.push('Timeline: ' + selections.timeline);
        if (parts.length) {
          const prefill = parts.join('\n') + '\n\nAdditional details: ';
          desc.value = desc.value.trim() ? desc.value : prefill;
        }
      }

      const quote = document.getElementById('quote');
      if (quote) {
        const top = quote.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      // Focus first empty required field for a smooth handoff
      setTimeout(() => {
        const firstName = document.getElementById('firstName');
        if (firstName) firstName.focus({ preventScroll: true });
      }, 600);
    });
  }
})();

/* =============================================
   POWDER COAT COLOR STUDIO
   ============================================= */
(function () {
  const swatchWrap = document.getElementById('colorSwatches');
  if (!swatchWrap) return;

  const colors = [
    { name: 'Safety Orange', hex: '#f97316', finish: 'Gloss finish' },
    { name: 'Jet Black', hex: '#0b0b0b', finish: 'Gloss finish' },
    { name: 'Wrinkle Black', hex: '#181818', finish: 'Textured wrinkle' },
    { name: 'Gloss White', hex: '#f4f4f5', finish: 'Gloss finish' },
    { name: 'Fire Engine Red', hex: '#c1121f', finish: 'Gloss finish' },
    { name: 'Gunmetal Gray', hex: '#2b2f33', finish: 'Satin finish' },
    { name: 'Hammertone Silver', hex: '#8a8d91', finish: 'Textured hammertone' },
    { name: 'Racing Blue', hex: '#1e3a8a', finish: 'Gloss finish' },
    { name: 'Sky Blue', hex: '#2f80ed', finish: 'Gloss finish' },
    { name: 'Forest Green', hex: '#1b5e20', finish: 'Gloss finish' },
    { name: 'Hi-Viz Yellow', hex: '#e4d000', finish: 'Gloss finish' },
    { name: 'Copper Vein', hex: '#8c5a2b', finish: 'Textured vein' },
    { name: 'Candy Purple', hex: '#6d28d9', finish: 'Candy gloss' },
    { name: 'Pearl Gold', hex: '#c9a227', finish: 'Metallic pearl' },
    { name: 'Bronze', hex: '#6b4f2a', finish: 'Metallic finish' },
    { name: 'Clay Tan', hex: '#b7a284', finish: 'Satin finish' }
  ];

  const partEls = document.querySelectorAll('#coatPart path, #coatPart rect');
  const nameEl = document.getElementById('colorName');
  const finishEl = document.getElementById('colorFinish');
  const currentSwatch = document.getElementById('colorSwatch');
  const cta = document.getElementById('colorCta');
  let selected = colors[0];

  function apply(color) {
    selected = color;
    partEls.forEach(el => { el.setAttribute('fill', color.hex); });
    nameEl.textContent = color.name;
    finishEl.textContent = color.finish;
    currentSwatch.style.background = color.hex;
  }

  colors.forEach((color, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'colors__swatch';
    btn.style.background = color.hex;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-label', color.name + ', ' + color.finish);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => {
      swatchWrap.querySelectorAll('.colors__swatch').forEach(s => s.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      apply(color);
    });
    swatchWrap.appendChild(btn);
  });

  apply(colors[0]);

  if (cta) {
    cta.addEventListener('click', () => {
      const powder = document.querySelector('input[name="services"][value="Powder Coating"]');
      if (powder) powder.checked = true;
      const desc = document.getElementById('description');
      if (desc) {
        const line = 'Powder coat color of interest: ' + selected.name + ' (' + selected.finish + ').';
        if (!desc.value.includes(selected.name)) {
          desc.value = desc.value.trim() ? desc.value + '\n' + line : line + '\n\nAdditional details: ';
        }
      }
    });
  }
})();

/* =============================================
   BEFORE / AFTER SLIDER
   ============================================= */
(function () {
  const slider = document.getElementById('baSlider');
  if (!slider) return;
  const before = document.getElementById('baBefore');
  const handle = document.getElementById('baHandle');
  let dragging = false;

  function setPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    before.style.width = pct + '%';
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', Math.round(pct));
  }

  function posFromEvent(clientX) {
    const rect = slider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function onMove(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(posFromEvent(clientX));
  }

  function startDrag(e) {
    dragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(posFromEvent(clientX));
    e.preventDefault();
  }

  slider.addEventListener('mousedown', startDrag);
  slider.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('touchend', () => { dragging = false; });

  handle.addEventListener('keydown', e => {
    const current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    if (e.key === 'ArrowLeft') { setPos(current - 5); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { setPos(current + 5); e.preventDefault(); }
    else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
    else if (e.key === 'End') { setPos(100); e.preventDefault(); }
  });

  setPos(50);
})();

/* =============================================
   FAQ ACCORDION
   ============================================= */
(function () {
  document.querySelectorAll('.faq__item').forEach(item => {
    const q = item.querySelector('.faq__q');
    const a = item.querySelector('.faq__a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close others for a clean accordion
      document.querySelectorAll('.faq__item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq__a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });
})();
