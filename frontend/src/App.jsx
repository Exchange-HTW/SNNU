import { useState, useEffect, useRef } from 'react'
import './App.css'
import HomePage from './components/HomePage'
import ProfileModal from './components/ProfileModal'
import ResearchLabDetail from './components/ResearchLabDetail'
import defaultPageData from './data/defaultPageData.json'

// Available languages for the picker
const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'zh', label: '中文', short: '中' },
  { code: 'ja', label: '日本語', short: '日' },
  { code: 'ko', label: '한국어', short: '한' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'ar', label: 'العربية', short: 'ع' },
  { code: 'tr', label: 'Türkçe', short: 'TR' },
  { code: 'pl', label: 'Polski', short: 'PL' },
  { code: 'nl', label: 'Nederlands', short: 'NL' },
  { code: 'sv', label: 'Svenska', short: 'SV' },
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const AUTHOR_ALIASES = {
  'd strauss': 'Daniel J. Strauss',
  'd j strauss': 'Daniel J. Strauss',
  'daniel j strauss': 'Daniel J. Strauss',
  'f i corona strauss': 'Farah I. Corona-Strauss',
  'farah i corona strauss': 'Farah I. Corona-Strauss',
  'w delb': 'Wolfgang Delb',
  'l haab': 'Lars Haab',
  'r hannemann': 'Ronny Hannemann',
  'c bernarding': 'Corinna Bernarding',
  'p k plinkert': 'Peter K. Plinkert',
};

const canonicalAuthorName = (author) => {
  const cleaned = author.trim().replace(/\.+$/, '');
  const key = cleaned
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—-]/g, ' ')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
  if (!key || key === 'authors not identified') return '';
  return AUTHOR_ALIASES[key] || cleaned;
};

const DEFAULT_RESEARCH_LABS = [
  { id: 2, name: 'Mindscan Lab', desc: 'Non-invasive brain monitoring', icon: 'fa-brain' },
  { id: 1, name: 'Translational Lab', desc: 'Clinical translation of cognitive technologies', icon: 'fa-microscope' },
  { id: 3, name: 'Multiscale Lab', desc: 'Neuromodeling and signal processing', icon: 'fa-network-wired' },
  { id: 4, name: 'Digital Realities Lab', desc: 'Immersive virtual reality and interaction', icon: 'fa-vr-cardboard' },
  { id: 5, name: 'Neurocognitive Haptics Lab', desc: 'Tactile perception and neurocognitive haptic interaction', icon: 'fa-hand' },
  { id: 6, name: 'Neurocognitive Driving Test Field', desc: 'Neurocognitive assessment in realistic driving scenarios', icon: 'fa-car-side' },
];
function App() {
  const [page, setPage] = useState(defaultPageData)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [selections, setSelections] = useState({
    school: "HTW Saar",
    language: "en",
    audience: "Student"
  })

  const [showGhostTitle, setShowGhostTitle] = useState(false);
  const [ghostTitleText, setGhostTitleText] = useState('');
  const [sectionViewModes, setSectionViewModes] = useState({});
  const [langOpen, setLangOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedLabId, setSelectedLabId] = useState(2);
  const [activeSectionId, setActiveSectionId] = useState('section-home');
  const [openDockMenu, setOpenDockMenu] = useState(null);
  const [dockCloseSpeed, setDockCloseSpeed] = useState('slow');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const langRef = useRef(null);
  const dockCloseTimerRef = useRef(null);
  const dockSpeedTimerRef = useRef(null);
  const pageScrollFrameRef = useRef(null);

  // Current language display
  const currentLang = LANGUAGES.find(l => l.code === selections.language) || LANGUAGES[0];

  // Close lang picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(dockCloseTimerRef.current);
    window.clearTimeout(dockSpeedTimerRef.current);
    window.cancelAnimationFrame(pageScrollFrameRef.current);
  }, []);

  // Helper to toggle view mode (grid, timeline, analytics)
  const toggleViewMode = (sectionId, mode) => {
    setSectionViewModes(prev => ({
      ...prev,
      [sectionId]: mode
    }));
  };

  // We use useEffect to load the Unity script since it expects the canvas to be in the DOM
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/default-data`);
        if (!response.ok) throw new Error(`Content API returned ${response.status}`);
        const data = await response.json();
        setPage(data);
        setLoadError('');
      } catch (error) {
        console.warn("Backend API not reachable; using bundled default data in English:", error);
        // Fallback gracefully to default data without blocking the UI
        setPage(defaultPageData);
        setLoadError('');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();

  }, [retryToken]);

  // Ghost title scroll listener & visibility monitor
  useEffect(() => {
    const handleScrollCheck = () => {
      const activeSection = document.querySelector('.demo-section.active') || document.querySelector('.demo-section');
      if (activeSection) {
        const titleEl = activeSection.querySelector('.section-title') || activeSection.querySelector('h1');
        if (titleEl) {
          const rect = titleEl.getBoundingClientRect();
          // Title is off-screen if its top is pushed off-screen (< 15px) or bottom is above navbar area (<= 75px)
          const isOffScreen = rect.top < 15 || rect.bottom <= 75;
          if (isOffScreen) {
            setShowGhostTitle(true);
            setGhostTitleText(titleEl.textContent.trim());
          } else {
            setShowGhostTitle(false);
          }
        } else {
          setShowGhostTitle(false);
        }
      } else {
        setShowGhostTitle(false);
      }
    };

    window.addEventListener('scroll', handleScrollCheck, true);
    window.addEventListener('resize', handleScrollCheck);

    // Polling interval so it instantly detects title off-screen even without scroll events
    const interval = setInterval(handleScrollCheck, 200);
    handleScrollCheck();

    return () => {
      window.removeEventListener('scroll', handleScrollCheck, true);
      window.removeEventListener('resize', handleScrollCheck);
      clearInterval(interval);
    };
  }, [page]);

  const requestGeneratedPage = async (newSelections) => {
    if (newSelections.language === 'en') {
      setPage(defaultPageData);
      setSelections(newSelections);
      setLoadError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSelections)
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || `Translation API returned ${response.status}`);
      }
      setPage(await response.json());
      setSelections(newSelections);
    } catch (error) {
      console.error('Error generating translated content:', error);
      alert(`The AI translation service (Ollama) is currently unavailable or unreachable. Displaying the portal in English.\n\nDetail: ${error.message}`);
      setSelections({ ...newSelections, language: 'en' });
      setPage(defaultPageData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (langCode) => {
    requestGeneratedPage({ ...selections, language: langCode })
  }

  const animatePageScroll = (targetY, duration = 950) => {
    window.cancelAnimationFrame(pageScrollFrameRef.current)
    const startY = window.scrollY
    const distance = targetY - startY
    const startTime = performance.now()

    const step = (time) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      window.scrollTo(0, startY + distance * eased)
      if (progress < 1) pageScrollFrameRef.current = window.requestAnimationFrame(step)
    }

    pageScrollFrameRef.current = window.requestAnimationFrame(step)
  }

  const selectResearchLab = (labId) => {
    setSelectedLabId(labId)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const detail = document.getElementById('research-lab-detail')
        if (!detail) return
        const navbarHeight = document.getElementById('floating-dock')?.getBoundingClientRect().height || 76
        const targetY = detail.getBoundingClientRect().top + window.scrollY - navbarHeight - 24
        animatePageScroll(Math.max(0, targetY))
      })
    })
  }

  const handleScrollTo = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      document.querySelectorAll('.demo-section').forEach(sec => sec.classList.remove('active'));
      el.classList.add('active');
      setActiveSectionId(targetId);
      setMobileNavOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const openResearchLabFromHome = (labId) => {
    const section = document.getElementById('section-research-site')
    if (!section) return

    document.querySelectorAll('.demo-section').forEach(sec => sec.classList.remove('active'))
    section.classList.add('active')
    setActiveSectionId('section-research-site')
    setMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
    selectResearchLab(labId)
  }

  const openPersonFromHome = (personName, preferLabHead = true) => {
    const section = document.getElementById('section-people')
    if (!section) return

    document.querySelectorAll('.demo-section').forEach(sec => sec.classList.remove('active'))
    section.classList.add('active')
    setActiveSectionId('section-people')
    setMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scopedCards = preferLabHead
          ? [...document.querySelectorAll('.people-category-group--lab-heads .person-card')]
          : []
        const allCards = [...document.querySelectorAll('.person-card')]
        const target = [...scopedCards, ...allCards].find(card => card.dataset.name === personName)
        if (!target) return

        const navbarHeight = document.getElementById('floating-dock')?.getBoundingClientRect().height || 84
        const targetY = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 32
        animatePageScroll(Math.max(0, targetY), 760)
        target.classList.add('person-card--home-focus')
        window.setTimeout(() => target.classList.remove('person-card--home-focus'), 1800)
      })
    })
  }

  const clearDockCloseTimer = () => {
    window.clearTimeout(dockCloseTimerRef.current);
  };

  const setFastDockClose = () => {
    setDockCloseSpeed('fast');
    window.clearTimeout(dockSpeedTimerRef.current);
    dockSpeedTimerRef.current = window.setTimeout(() => setDockCloseSpeed('slow'), 260);
  };

  const openDockDropdown = (menuId) => {
    clearDockCloseTimer();
    if (openDockMenu && openDockMenu !== menuId) setFastDockClose();
    setOpenDockMenu(menuId);
  };

  const scheduleDockDropdownClose = () => {
    clearDockCloseTimer();
    dockCloseTimerRef.current = window.setTimeout(() => {
      setDockCloseSpeed('slow');
      setOpenDockMenu(null);
    }, 500);
  };

  const closeDockDropdownFast = () => {
    clearDockCloseTimer();
    if (openDockMenu) setFastDockClose();
    setOpenDockMenu(null);
  };

  const handleDockAction = (targetId) => {
    closeDockDropdownFast();
    handleScrollTo(targetId);
  };

  if (!page) {
    return (
      <div className="app-state" role={loadError ? 'alert' : 'status'}>
        <div className="app-state__card">
          <span className="app-state__brand">HTW Saar · SNNU</span>
          <i className={`fa-solid ${loadError ? 'fa-cloud-arrow-down' : 'fa-spinner fa-spin'} app-state__icon`} aria-hidden="true"></i>
          <h1>{loadError ? 'The content service is unavailable' : 'Loading SNNU'}</h1>
          <p>{loadError ? 'Please check the API connection and try again. Your current choices will be preserved.' : 'Preparing the research portal…'}</p>
          {loadError && <button className="primary-btn" type="button" onClick={() => setRetryToken((value) => value + 1)}>Try again</button>}
        </div>
      </div>
    );
  }

  const serverResearchLabs = page.researchSite?.labs || []
  const researchLabs = DEFAULT_RESEARCH_LABS.map((fallbackLab) => ({
    ...fallbackLab,
    ...(serverResearchLabs.find((lab) => lab.id === fallbackLab.id) || {})
  }))
  const selectedLab = researchLabs.find((lab) => lab.id === selectedLabId)

  return (
    <>

      {/* Minimalist Ghost Section Title */}
      <div
        className="ghost-title-banner"
        style={{
          position: 'fixed',
          top: '78px',
          left: '50%',
          transform: showGhostTitle ? 'translate(-50%, 0)' : 'translate(-50%, -10px)',
          opacity: showGhostTitle ? 0.4 : 0,
          pointerEvents: 'none',
          zIndex: 9995,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          color: '#000000',
          fontSize: '1.1rem',
          fontWeight: '700',
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}
      >
        <span>{ghostTitleText}</span>
      </div>

      {/* Floating Dock (acts as main unified navbar) — sticky so it doesn't overlap subpage content */}
      <nav className="floating-dock dock-top" id="floating-dock" data-dropdown-close={dockCloseSpeed} aria-label="Primary navigation">
        <button className="home-navbar__logo" type="button" onClick={() => handleScrollTo('section-home')} aria-label="SNNU home">
          <span className="home-navbar__logo-sub">HTW Saar</span>
          <span className="home-navbar__logo-main">SNNU</span>
        </button>

        <button className="mobile-nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>
          <i className={`fa-solid ${mobileNavOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true"></i>
        </button>

        <div className={`dock-navigation ${mobileNavOpen ? 'dock-navigation--open' : ''}`}>

        <button type="button" className={`dock-item ${activeSectionId === 'section-home' ? 'active' : ''}`} onMouseEnter={closeDockDropdownFast} onClick={() => handleScrollTo('section-home')}>
          <i className="fa-solid fa-house"></i>
          <span className="dock-label">{page.nav?.home || "Home"}</span>
        </button>

        <button type="button" className={`dock-item ${activeSectionId === 'section-people' ? 'active' : ''}`} onMouseEnter={closeDockDropdownFast} onClick={() => handleScrollTo('section-people')}>
          <i className="fa-solid fa-users"></i>
          <span className="dock-label">{page.nav?.people || "People"}</span>
        </button>

        <div
          className={`dock-dropdown ${openDockMenu === 'research-site' ? 'dock-dropdown--open' : ''}`}
          onMouseEnter={() => openDockDropdown('research-site')}
          onMouseLeave={scheduleDockDropdownClose}
        >
          <button type="button" className={`dock-item ${['section-research-site', 'section-virtual-tour'].includes(activeSectionId) ? 'active' : ''}`} onClick={() => setOpenDockMenu(openDockMenu === 'research-site' ? null : 'research-site')} aria-expanded={openDockMenu === 'research-site'}>
            <i className="fa-solid fa-microscope"></i>
            <span className="dock-label">Research site</span>
          </button>
          <div className="dock-dropdown-content" role="menu">
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-research-site')}>Research site</button>
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-virtual-tour')}>Virtual tour</button>
          </div>
        </div>

        <div
          className={`dock-dropdown ${openDockMenu === 'research' ? 'dock-dropdown--open' : ''}`}
          onMouseEnter={() => openDockDropdown('research')}
          onMouseLeave={scheduleDockDropdownClose}
        >
          <button type="button" className={`dock-item ${['section-publication', 'section-projects'].includes(activeSectionId) ? 'active' : ''}`} onClick={() => setOpenDockMenu(openDockMenu === 'research' ? null : 'research')} aria-expanded={openDockMenu === 'research'}>
            <i className="fa-solid fa-flask"></i>
            <span className="dock-label">Research</span>
          </button>
          <div className="dock-dropdown-content" role="menu">
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-publication')}>Publications</button>
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-projects')}>Projects</button>
          </div>
        </div>

        <button type="button" className={`dock-item ${activeSectionId === 'section-news' ? 'active' : ''}`} onMouseEnter={closeDockDropdownFast} onClick={() => handleScrollTo('section-news')}>
          <i className="fa-solid fa-newspaper"></i>
          <span className="dock-label">{page.nav?.news || "News"}</span>
        </button>

        <div
          className={`dock-dropdown ${openDockMenu === 'study' ? 'dock-dropdown--open' : ''}`}
          onMouseEnter={() => openDockDropdown('study')}
          onMouseLeave={scheduleDockDropdownClose}
        >
          <button type="button" className={`dock-item ${['section-teaching', 'section-preprint'].includes(activeSectionId) ? 'active' : ''}`} onClick={() => setOpenDockMenu(openDockMenu === 'study' ? null : 'study')} aria-expanded={openDockMenu === 'study'}>
            <i className="fa-solid fa-graduation-cap"></i>
            <span className="dock-label">Study</span>
          </button>
          <div className="dock-dropdown-content" role="menu">
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-teaching')}>Teaching</button>
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-preprint')}>Preprints</button>
          </div>
        </div>

        <div
          className={`dock-dropdown ${openDockMenu === 'join' ? 'dock-dropdown--open' : ''}`}
          onMouseEnter={() => openDockDropdown('join')}
          onMouseLeave={scheduleDockDropdownClose}
        >
          <button type="button" className={`dock-item ${['section-about', 'section-join'].includes(activeSectionId) ? 'active' : ''}`} onClick={() => setOpenDockMenu(openDockMenu === 'join' ? null : 'join')} aria-expanded={openDockMenu === 'join'}>
            <i className="fa-solid fa-handshake"></i>
            <span className="dock-label">Join us</span>
          </button>
          <div className="dock-dropdown-content" role="menu">
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-about')}>About us</button>
            <button type="button" className="dock-dropdown-item" onClick={() => handleDockAction('section-join')}>Join us</button>
          </div>
        </div>
        </div>

        <div className="navbar-actions">
        <div className="lang-picker" ref={langRef} onMouseEnter={closeDockDropdownFast}>
          <button
            className="lang-picker__trigger"
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Change language"
            aria-expanded={langOpen}
            disabled={isLoading}
          >
            <i className="fa-solid fa-globe"></i>
            <span className="lang-picker__code">{currentLang.short}</span>
            {isLoading && <i className="fa-solid fa-spinner fa-spin lang-picker__spinner"></i>}
          </button>
          {langOpen && (
            <div className="lang-picker__dropdown">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  disabled={isLoading}
                  className={`lang-picker__option ${lang.code === selections.language ? 'lang-picker__option--active' : ''}`}
                  onClick={() => {
                    handleLanguageChange(lang.code);
                    setLangOpen(false);
                  }}
                >
                  <span className="lang-picker__option-short">{lang.short}</span>
                  <span className="lang-picker__option-label">{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="home-navbar__uni-logo" title="Universität des Saarlandes">
          <img src="/image/uds-owl-logo.png" alt="Universität des Saarlandes" />
        </div>
        </div>
      </nav>

      {loadError && <div className="api-error-banner" role="alert">{loadError}</div>}

      {/* Main Content Container */}
      <main id="app-container" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>

        {/* Section 1: Home — Full-page Hero + Labs with scroll animation */}
        <section id="section-home" className="demo-section active" style={{ padding: 0 }}>
          <HomePage
            hero={page.hero}
            home={page.home}
            labsTitle={page.researchSite?.title}
            isActive={activeSectionId === 'section-home'}
            onNavigate={handleScrollTo}
            onSelectLab={openResearchLabFromHome}
            onSelectPerson={openPersonFromHome}
          />
        </section>

        {/* Section: Research Site */}
        <section id="section-research-site" className="demo-section">
          <div className="content-wrapper">
            <h2 className="section-title text-center">{page.researchSite.title}</h2>
            <p className="section-subtitle text-center research-sites-intro">Select a research site to view its details.</p>
            <div className="labs-grid research-sites-layout">
              <div className="lab-module map-module melted-3d-card">
                <div className="module-header">
                  <i className="fa-solid fa-flask"></i> SNNU Laboratories
                </div>
                <div className="module-body lab-menu-container">
                  <ul className="lab-menu">
                    {researchLabs.map((lab) => (
                      <li
                        key={lab.id}
                        className={`lab-menu-item ${selectedLabId === lab.id ? 'lab-menu-item--selected' : ''}`}
                        role="button"
                        tabIndex="0"
                        aria-pressed={selectedLabId === lab.id}
                        onClick={() => selectResearchLab(lab.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            selectResearchLab(lab.id)
                          }
                        }}
                      >
                        <div className="lab-icon"><i className={`fa-solid ${lab.icon || 'fa-microscope'}`}></i></div>
                        <div className="lab-details">
                          <h4>{lab.name}</h4>
                          <p>{lab.desc}</p>
                        </div>
                        <i className="fa-solid fa-chevron-right lab-menu-item__arrow" aria-hidden="true"></i>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedLab && <ResearchLabDetail lab={selectedLab} />}
            </div>
          </div>
        </section>
        {/* Section: Virtual Tour */}
        <section id="section-virtual-tour" className="demo-section">
          <div className="content-wrapper">
            <h2 className="section-title text-center">{page.virtualTour.title}</h2>
            <div className="labs-grid virtual-tour-layout">
              <div className="lab-module unity-module melted-3d-card">
                <div className="module-header">
                  <i className="fa-brands fa-unity"></i> {page.virtualTour.header}
                </div>
                <div className="module-body unity-desktop" id="unity-container">
                  <canvas id="unity-canvas" width="960" height="600" tabIndex="-1"></canvas>
                  <div id="unity-loading-bar">
                    <div id="unity-logo"></div>
                    <div id="unity-progress-bar-empty">
                      <div id="unity-progress-bar-full"></div>
                    </div>
                  </div>
                  <div id="unity-warning"> </div>
                  <div id="unity-footer">
                    <div id="unity-logo-title-footer"></div>
                    <div id="unity-fullscreen-button"></div>
                    <div id="unity-build-title">SNNUnit_VirtualTour</div>
                  </div>
                </div>
              </div>
              <div className="text-center" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <a href="webxr/index.html" target="_blank" className="primary-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  <i className="fa-solid fa-vr-cardboard" style={{ marginRight: '0.5rem' }}></i> Launch WebXR VR Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The People */}
        <section id="section-people" className="demo-section">
          <div className="content-wrapper">
            <div className="people-grid">
              <div className="people-visuals">
                <div className="slideshow-3">
                  <img src="image/gifPeople1.jpg" alt="People 1" />
                  <img src="image/gifPeople2.jpg" alt="People 2" />
                  <img src="image/gifPeople3.jpg" alt="People 3" />
                </div>
              </div>
              <div className="people-info">
                <h2 className="section-title text-center">{page.people.title}</h2>
                <p className="section-subtitle text-center">{page.people.subtitle}</p>
                <div className="people-list mt-4 people-list-container">
                  {page.people?.categories?.map((category, idx) => (
                    <div
                      key={idx}
                      className={`people-category-group ${category.id === 'lab-heads' ? 'people-category-group--lab-heads' : ''} ${category.id === 'researchers' ? 'people-category-group--researchers' : ''}`}
                    >
                      <h4 className="people-category">{category.name}</h4>
                      <div className="people-category-members">
                        {category.members?.map((member, mIdx) => (
                          <button type="button" key={mIdx} className="people-item person-card melted-3d-card" data-name={member.name} data-role={member.role} onClick={() => setSelectedPerson(member)} aria-label={`View profile for ${member.name}`}>
                            <div className="people-item-icon">
                              {member.photo ? (
                                <img className="people-item-photo" src={member.photo} alt="" loading="lazy" />
                              ) : (
                                <i className={`fa-solid ${member.icon}`}></i>
                              )}
                            </div>
                            <div className="people-item-content">
                              <h3>{member.name}</h3>
                              <p>View Profile</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: News */}
        <section id="section-news" className="demo-section">
          <div className="content-wrapper">
            <div className="editor-header text-center">
              <h2 className="section-title">{page.news.title}</h2>
              <p className="section-subtitle">{page.news.subtitle}</p>
            </div>
              <div className="news-feed" id="news-container">
                {(page.news.items || []).map((item) => (
                  <article className="news-card" key={`${item.date}-${item.title}`}>
                    <time className="news-date">{item.date}</time>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-excerpt">{item.excerpt}</p>
                  </article>
                ))}
                {!page.news.items?.length && <p className="empty-state">No news has been published yet.</p>}
              </div>
          </div>
        </section>

        {/* Extra Sections */}
        {page.sections?.map((section, idx) => {
          const sectionId = section.id || `section-extra-${idx}`;
          const allowTimelineAndGrid = sectionId === 'section-projects' || sectionId === 'section-publication';
          const allowAnalytics = sectionId === 'section-publication';

          // Analytics computation
          let yearCounts = {};
          let authorCounts = {};
          let authorYearCounts = {};
          if (allowAnalytics && section.cards) {
            section.cards.forEach(card => {
              const hasKnownYear = card.year && card.year !== 'Unknown' && card.year !== 'None';
              if (hasKnownYear) {
                yearCounts[card.year] = (yearCounts[card.year] || 0) + 1;
                if (!authorYearCounts[card.year]) authorYearCounts[card.year] = {};
              }
              let authors = Array.isArray(card.authors) ? card.authors : [];
              if (authors.length === 0 && card.text) {
                const plainText = card.text.replace(/<[^>]*>?/gm, '');
                const authorText = plainText.split(/[“"]/)[0] || '';
                authors = authorText
                  .replace(/\s+(?:and|&)\s+/gi, ';')
                  .split(/[;,]/)
                  .map(author => author.trim())
                  .filter(author => author.length > 0 && !author.endsWith(' al.'));
              }
              authors.forEach(author => {
                const canonicalAuthor = canonicalAuthorName(author);
                if (!canonicalAuthor) return;
                authorCounts[canonicalAuthor] = (authorCounts[canonicalAuthor] || 0) + 1;
                if (hasKnownYear) {
                  authorYearCounts[card.year][canonicalAuthor] = (authorYearCounts[card.year][canonicalAuthor] || 0) + 1;
                }
              });
            });
          }
          const sortedYears = Object.keys(yearCounts).sort((a, b) => Number(a) - Number(b));
          const topAuthorsEntries = Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
          const top5Authors = topAuthorsEntries.map(e => e[0]);
          const top10Authors = Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
          const maxAuthorCount = Math.max(...top10Authors.map(a => a[1]), 1);

          let maxStackedCount = 1;
          sortedYears.forEach(year => {
            let stackSum = 0;
            top5Authors.forEach(author => {
              stackSum += (authorYearCounts[year]?.[author] || 0);
            });
            if (stackSum > maxStackedCount) maxStackedCount = stackSum;
          });

          const authorColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

          return (
            <section key={sectionId} id={sectionId} className="demo-section">
              <div className="content-wrapper text-center" style={{ maxWidth: '96%', margin: '0 auto' }}>
                <h2 className="section-title">{section.title}</h2>

                {/* View Toggle Bar */}
                {section.cards && allowTimelineAndGrid && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      padding: '4px',
                      borderRadius: '30px',
                      background: '#ffffff',
                      border: '1px solid #dbe3ec',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
                    }}>
                      <button
                        onClick={() => toggleViewMode(sectionId, 'cards')}
                        style={{
                          padding: '6px 18px',
                          borderRadius: '20px',
                          border: 'none',
                          background: (sectionViewModes[sectionId] || 'cards') === 'cards' ? '#e0f2fe' : 'transparent',
                          color: '#111827',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fa-solid fa-border-all"></i> Grid View
                      </button>
                      <button
                        onClick={() => toggleViewMode(sectionId, 'timeline')}
                        style={{
                          padding: '6px 18px',
                          borderRadius: '20px',
                          border: 'none',
                          background: sectionViewModes[sectionId] === 'timeline' ? '#e0f2fe' : 'transparent',
                          color: '#111827',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fa-solid fa-timeline"></i> Timeline View
                      </button>
                      {allowAnalytics && (
                        <button
                          onClick={() => toggleViewMode(sectionId, 'analytics')}
                          style={{
                            padding: '6px 18px',
                            borderRadius: '20px',
                            border: 'none',
                            background: sectionViewModes[sectionId] === 'analytics' ? '#e0f2fe' : 'transparent',
                            color: '#111827',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <i className="fa-solid fa-chart-pie"></i> Analytics View
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {section.cards ? (
                  sectionViewModes[sectionId] === 'analytics' && allowAnalytics ? (
                    <div style={{ textAlign: 'left', padding: '2rem 1rem' }}>
                      <h3 style={{ color: '#111827', fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>Publication Statistics</h3>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
                        {/* Top 5 Authors Stacked Chart */}
                        <div style={{ flex: '1 1 100%', background: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid #dbe3ec', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
                          <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', textAlign: 'center', fontSize: '1.3rem' }}>Top 5 Authors Publications per Year</h4>

                          {/* Legend */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {top5Authors.map((author, idx) => (
                              <div key={author} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                                <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: authorColors[idx], boxShadow: `0 0 10px ${authorColors[idx]}80` }}></div>
                                {author}
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: '350px', paddingBottom: '30px', borderBottom: '1px solid #cbd5e1' }}>
                            {sortedYears.map(year => {
                              return (
                                <div key={year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '35px', height: '100%', justifyContent: 'flex-end' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column-reverse', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
                                    {top5Authors.map((author, idx) => {
                                      const count = authorYearCounts[year]?.[author] || 0;
                                      const heightPct = (count / maxStackedCount) * 100;
                                      return count > 0 ? (
                                        <div key={author} title={`${author}: ${count} papers in ${year}`} style={{
                                          width: '100%',
                                          height: `${heightPct}%`,
                                          backgroundColor: authorColors[idx],
                                          transition: 'height 1s ease-out',
                                          borderTop: '1px solid rgba(0,0,0,0.3)',
                                          borderLeft: '1px solid rgba(255,255,255,0.2)',
                                          borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}></div>
                                      ) : null;
                                    })}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '12px', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>{year}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Top Authors Chart */}
                        <div style={{ flex: '1 1 100%', background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #dbe3ec', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
                          <h4 style={{ color: '#111827', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>Top 10 Authors Overall</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {top10Authors.map(([author, count]) => {
                              const widthPct = (count / maxAuthorCount) * 100;
                              return (
                                <div key={author} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '120px', fontSize: '0.8rem', color: '#334155', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {author}
                                  </div>
                                  <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '16px', position: 'relative' }}>
                                    <div style={{
                                      position: 'absolute', left: 0, top: 0, height: '100%',
                                      width: `${widthPct}%`,
                                      background: 'linear-gradient(90deg, var(--accent-2) 0%, rgba(236,72,153,0.5) 100%)',
                                      borderRadius: '4px',
                                      transition: 'width 1s ease-out'
                                    }}></div>
                                  </div>
                                  <div style={{ width: '20px', fontSize: '0.8rem', color: '#111827', fontWeight: 'bold' }}>{count}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : allowTimelineAndGrid && sectionViewModes[sectionId] === 'timeline' ? (
                    /* Timeline View */
                    <div className="timeline-wrapper" style={{ position: 'relative', maxWidth: '1000px', margin: '2rem auto', padding: '1rem 0' }}>
                      {/* Central Glowing Line */}
                      <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '0',
                        bottom: '0',
                        width: '3px',
                        background: 'linear-gradient(to bottom, var(--accent-1, #6366f1), rgba(99, 102, 241, 0.15))',
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}></div>

                      {section.cards.flatMap((card, cIdx) => {
                        const isEven = cIdx % 2 === 0;
                        const isYearStart = cIdx === 0 || card.year !== section.cards[cIdx - 1].year;
                        const isLastCard = cIdx === section.cards.length - 1;
                        const items = [];

                        if (isYearStart && card.year) {
                          items.push(
                            <div
                              key={`year-start-${cIdx}`}
                              className="timeline-year-boundary timeline-year-boundary--start"
                              aria-label={`Start of ${card.year}`}
                            >
                              <span className="timeline-year-circle">{card.year}</span>
                            </div>
                          );
                        }

                        items.push(
                          <div key={`tl-${cIdx}`} style={{
                            display: 'flex',
                            justifyContent: isEven ? 'flex-start' : 'flex-end',
                            marginBottom: '1rem',
                            position: 'relative',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}>
                            {/* Central Glowing Node Marker */}
                            <div style={{
                              position: 'absolute',
                              left: '50%',
                              top: '20px',
                              transform: 'translateX(-50%)',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: 'var(--accent-1, #6366f1)',
                              boxShadow: '0 0 14px var(--accent-1, #6366f1)',
                              border: '3px solid rgba(15, 23, 42, 1)',
                              zIndex: 2
                            }}></div>

                            {/* Timeline Card */}
                            <div className="glass-card melted-3d-card" style={{
                              width: card.fullWidth ? '100%' : '44%',
                              padding: '1.5rem',
                              textAlign: 'left',
                              boxSizing: 'border-box',
                              wordBreak: 'break-word',
                              margin: '0',
                              zIndex: 3
                            }}>
                              {card.subtitle && (
                                <div style={{ marginBottom: '0.8rem' }}>
                                  <span style={{
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    color: 'var(--accent-1, #6366f1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.82rem',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <i className="fa-regular fa-calendar-check"></i>
                                    {card.subtitle}
                                  </span>
                                </div>
                              )}
                              <div style={{ textAlign: card.align || 'left', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                <p dangerouslySetInnerHTML={{ __html: card.text }}></p>
                              </div>
                            </div>
                          </div>
                        );

                        if (isLastCard && card.year) {
                          items.push(
                            <div
                              key={`year-end-${cIdx}`}
                              className="timeline-year-boundary timeline-year-boundary--end"
                              aria-label={`End of ${card.year}`}
                            >
                              <span className="timeline-year-circle">{card.year}</span>
                            </div>
                          );
                        }
                        return items;
                      })}
                    </div>
                  ) : (
                    /* Grid View */
                    <div style={{ marginTop: '2rem' }}>
                      {sectionId === 'section-publication' || sectionId === 'section-projects' ? (
                        /* Grouped by Year - List Layout */
                        (() => {
                          const grouped = Object.entries(
                            section.cards.reduce((acc, card) => {
                              const y = card.year || 'Unknown';
                              if (!acc[y]) acc[y] = [];
                              acc[y].push(card);
                              return acc;
                            }, {})
                          ).sort((a, b) => b[0].localeCompare(a[0]));
                          return (
                            <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                              <style>{`
                                .pub-list-row p { margin: 0; }
                                .pub-list-row a { color: #1d4ed8; text-decoration: none; }
                                .pub-list-row a:hover { color: #7c3aed; text-decoration: underline; }
                                .pub-list-row span { font-size: 0.78rem !important; padding: 2px 8px !important; }
                              `}</style>
                              {grouped.map(([year, yearCards]) => (
                                <div key={year} style={{ marginBottom: '2.5rem' }}>
                                  {/* Year header row */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '0.75rem'
                                  }}>
                                    <span style={{
                                      fontSize: '1.5rem',
                                      fontWeight: '800',
                                      color: '#075071',
                                      flexShrink: 0
                                    }}>{year}</span>
                                    <div style={{
                                      flex: 1,
                                      height: '2px',
                                      background: 'rgba(7, 80, 113, 0.42)',
                                      borderRadius: '2px'
                                    }}></div>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      color: 'rgba(15,23,42,0.55)',
                                      flexShrink: 0
                                    }}>{yearCards.length} {sectionId === 'section-projects' ? `project${yearCards.length !== 1 ? 's' : ''}` : `publication${yearCards.length !== 1 ? 's' : ''}`}</span>
                                  </div>
                                  {/* Publication rows */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                    {yearCards.map((card, cIdx) => (
                                      <div
                                        key={cIdx}
                                        className="pub-list-row"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.85rem',
                                          background: '#ffffff',
                                          borderRadius: '10px',
                                          padding: '0.6rem 1.1rem',
                                          border: '1px solid rgba(15,23,42,0.12)',
                                          position: 'relative',
                                          overflow: 'hidden',
                                          transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
                                          cursor: 'default'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.borderColor = 'rgba(7,80,113,0.45)';
                                          e.currentTarget.style.boxShadow = '0 4px 20px -6px rgba(7,80,113,0.22)';
                                          e.currentTarget.style.background = '#f2f7f9';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.borderColor = 'rgba(15,23,42,0.12)';
                                          e.currentTarget.style.boxShadow = 'none';
                                          e.currentTarget.style.background = '#ffffff';
                                        }}
                                      >
                                        {/* Left accent bar */}
                                        <div style={{
                                          position: 'absolute',
                                          left: 0,
                                          top: 0,
                                          bottom: 0,
                                          width: '3px',
                                          background: '#075071',
                                          borderRadius: '10px 0 0 10px'
                                        }}></div>
                                        {/* Index number */}
                                        <span style={{
                                          fontSize: '0.72rem',
                                          fontWeight: '700',
                                          color: '#075071',
                                          minWidth: '1.6rem',
                                          textAlign: 'right',
                                          flexShrink: 0,
                                          marginLeft: '0.4rem'
                                        }}>{cIdx + 1}</span>
                                        {/* Publication text */}
                                        <div style={{
                                          fontSize: '0.83rem',
                                          lineHeight: '1.5',
                                          color: '#111827',
                                          flex: 1,
                                          minWidth: 0
                                        }}>
                                          <p dangerouslySetInnerHTML={{ __html: card.text }} style={{ margin: 0 }}></p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()
                      ) : (
                        /* Standard Flat Grid */
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', justifyContent: 'center' }}>
                          {section.cards.map((card, cIdx) => (
                            <div key={cIdx} className="glass-card melted-3d-card" style={{ maxWidth: card.fullWidth ? '100%' : '800px', padding: '1.2rem', flex: card.fullWidth ? '1 1 100%' : '1 1 360px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                              <i className={`fa-solid ${card.icon || section.icon || 'fa-star'} card-icon`} style={{ fontSize: '2rem', marginBottom: '0.8rem', color: 'var(--text-main)' }}></i>
                              {card.subtitle ? <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>{card.subtitle}</h3> : <h3 style={{ marginBottom: '1rem' }}>Coming Soon</h3>}
                              <div style={{ textAlign: card.align || 'center', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                <p dangerouslySetInnerHTML={{ __html: card.text }}></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="glass-card melted-3d-card" style={{ margin: '2rem auto', maxWidth: '800px', padding: '3rem' }}>
                    <i className={`fa-solid ${section.icon || 'fa-star'} card-icon`} style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-main)' }}></i>
                    {section.subtitle ? <h3>{section.subtitle}</h3> : <h3>Coming Soon</h3>}
                    <p dangerouslySetInnerHTML={{ __html: section.text }}></p>
                  </div>
                )}
              </div>
            </section>
          )
        })}

      </main>

      {/* Bottom Navbar for Legal Notice */}
      <footer className="bottom-navbar">
        <a href="#" onClick={(e) => { e.preventDefault(); handleScrollTo('section-legal'); }}>Legal notice</a>
        <span aria-hidden="true">·</span>
        <span>SNNU · HTW Saar</span>
      </footer>

      {/* Profile Modal */}
      {selectedPerson && (
        <ProfileModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

    </>
  )
}

export default App
