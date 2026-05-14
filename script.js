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

document.querySelectorAll('.service-card, .testimonial-card, .process__step, .about__pillar, .gallery__item, .stats__item, .section-header').forEach((el, i) => {
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
