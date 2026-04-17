// Data
const skills = [
  { icon: 'fab fa-js', label: 'JavaScript' },
  { icon: 'fas fa-terminal', label: 'TypeScript' },
  { icon: 'fab fa-java', label: 'Java' },
  { icon: 'fab fa-react', label: 'React' },
  { icon: 'fab fa-node-js', label: 'Node.js' },
  { icon: 'fas fa-brain', label: 'AI/ML' },
  { icon: 'fas fa-database', label: 'Data Structures' },
];

const projects = [
  {
    id: 1, num: '01',
    title: 'StocksPortfolio',
    description: 'Full-stack web application to manage and track stock portfolios with live data.',
    technologies: ['JavaScript', 'HTML', 'CSS'],
    githubUrl: 'https://github.com/Rishirxt/StocksPortfolio',
    icon: 'fas fa-chart-line',
    accent: 'var(--yellow)',
  },
  {
    id: 2, num: '02',
    title: 'Coindex',
    description: 'Robust cryptocurrency tracking and indexing platform to monitor market trends.',
    technologies: ['TypeScript', 'React', 'API'],
    githubUrl: 'https://github.com/Rishirxt/Coindex',
    icon: 'fas fa-coins',
    accent: 'var(--black)',
  },
  {
    id: 3, num: '03',
    title: 'ChessBot',
    description: 'Intelligent chess engine built with Java, featuring move validation and standard algorithms.',
    technologies: ['Java', 'Algorithms', 'Chess Logic'],
    githubUrl: 'https://github.com/Rishirxt/ChessBot',
    icon: 'fas fa-chess-knight',
    accent: 'var(--red)',
  },
  {
    id: 4, num: '04',
    title: 'FraudDetection',
    description: 'ML-based system designed to flag and detect fraudulent activities in varied environments.',
    technologies: ['JavaScript', 'ML', 'Data Analysis'],
    githubUrl: 'https://github.com/Rishirxt/FraudDetection-System',
    icon: 'fas fa-shield-alt',
    accent: 'var(--blue)',
  },
];

const marqueeItems = ['AI/ML', '★', 'REACT', '★', 'NODE.JS', '★', 'DATA STRUCTURES', '★', 'TYPESCRIPT', '★', 'JAVA', '★', 'COMPUTER VISION', '★', 'NLP', '★'];

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  renderMarquee();
  renderSkills();
  renderProjects();

  setupScrollAnimations();
  setupNavScroll();
});

// Render Functions
function renderMarquee() {
  const track = document.getElementById('marquee-track');
  const items = [...marqueeItems, ...marqueeItems]; // Duplicate for endless effect
  track.innerHTML = items.map(item => `<span class="marquee-item">${item}</span>`).join('');
}

function renderSkills() {
  const container = document.getElementById('skills-container');
  container.innerHTML = skills.map(s => 
    `<span class="skill-tag-brut">
      <i class="${s.icon}" style="font-size: 14px;"></i>
      ${s.label}
    </span>`
  ).join('');
}

function renderProjects() {
  const container = document.getElementById('projects-container');
  container.innerHTML = projects.map((p, i) => {
    const isDarkAccent = p.accent === 'var(--black)' || p.accent === 'var(--blue)';
    const accentText = isDarkAccent ? 'var(--yellow)' : 'var(--black)';
    const badgeColor = p.accent === 'var(--yellow)' ? 'var(--yellow)' : 'transparent';
    const badgeText = isDarkAccent ? 'var(--black)' : 'var(--black)';
    
    return `
      <div class="project-card-brut parallax-el reveal opacity-0" data-speed="0.15" style="transform: translateY(50px); transition-delay: ${i * 0.1}s">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div style="background: ${p.accent}; color: ${accentText}; border: var(--border); width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            <i class="${p.icon}"></i>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-family: 'Space Mono', monospace; font-size: 0.7rem; font-weight: 700; color: #888; letter-spacing: 1px;">${p.num}</span>
            <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: var(--border); box-shadow: 3px 3px 0 #0a0a0a; font-size: 18px; transition: transform 0.1s;" onmouseover="this.style.transform='translate(-2px, -2px)'" onmouseout="this.style.transform='translate(0, 0)'">
              <i class="fab fa-github"></i>
            </a>
          </div>
        </div>
        <h3 style="font-weight: 900; font-size: 1.25rem; letter-spacing: -0.5px; margin-bottom: 10px;">${p.title}</h3>
        <p style="font-size: 0.9rem; line-height: 1.7; color: #333; margin-bottom: 20px;">${p.description}</p>
        <div>
          ${p.technologies.map(t => `<span class="tech-badge" style="background: ${badgeColor}; color: ${badgeText};">${t}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Scrolling and Parallax
function setupScrollAnimations() {
  const parallaxEls = document.querySelectorAll('.parallax-el');
  const revealEls = document.querySelectorAll('.reveal');

  // RequestAnimationFrame for smooth parallax
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    
    // Nav bar style toggle
    const nav = document.getElementById('brut-nav');
    if (scrollY > 40) {
      nav.classList.add('dark');
    } else {
      nav.classList.remove('dark');
    }

    parallaxEls.forEach(el => {
      // getBoundingClientRect is expensive, so a simple scrollY calculation is often enough for simple parallax
      const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
      
      // We calculate a yOffset. If element is further down, we might want it to move based on its offsetTop
      // For simple Framer Motion recreation:
      const yOffset = (scrollY * speed * -1); 
      
      // Some elements we want to move downwards, some upwards. 
      // If it's a decorative shape, moving it down relative to scroll
      
      // Combining the active class transform from reveal with parallax transform is tricky in inline styles
      // We will apply parallax using a CSS variable or setting transform directly but preserving the required positions.
      // Easiest is to set a custom property and use it in CSS, but for vanilla JS inline overriding works too
      
      el.style.transform = \`translateY(\${yOffset}px)\`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  // Intersection Observer for scroll reveal (equivalent to whileInView)
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Only run animation once by unobserving
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
        
        // Remove parallax transform conflict lock temporarily
        setTimeout(() => {
          entry.target.classList.remove('opacity-0');
        }, 600);
      }
    });
  }, revealOptions);

  revealEls.forEach(el => revealObserver.observe(el));
}

// Navigation helpers
window.scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};
