import './HomePage.css';

const HOME_LABS = [
  {
    id: 2,
    name: 'Mindscan Lab',
    src: '/image/lab_red.png',
    alt: 'Mindscan Lab research environment',
    head: 'Dr. Farah I. Corona-Strauss',
    headPhoto: '/image/people/farah_i_corona_strauss.png',
    personTarget: 'Dr. Farah I. Corona-Strauss',
    position: 'top-left',
  },
  {
    id: 1,
    name: 'Translational Lab',
    src: '/image/lab_brick.png',
    alt: 'Translational Lab research building',
    head: 'Dr. Corinna Martin',
    headPhoto: '/image/people/corinna_martin_nee_bernarding.png',
    personTarget: 'Dr. Corinna Martin (née Bernarding)',
    position: 'bottom-left',
  },
  {
    id: 4,
    name: 'Digital Realities Lab',
    src: '/image/lab_car.png',
    alt: 'Digital Realities Lab mobile research environment',
    head: 'Tobias Grün, M.Sc.',
    headPhoto: '/image/people/tobias_grun_m.jpg',
    personTarget: 'Tobias Grün, M.Sc.',
    position: 'top-right',
  },
  {
    id: 3,
    name: 'Multiscale Lab',
    src: '/image/lab_white.png',
    alt: 'Multiscale Lab research building',
    head: 'Dr. Lars Haab',
    headPhoto: '/image/people/lars_haab.png',
    personTarget: 'Dr. Lars Haab',
    position: 'bottom-right',
  },
];

const RESEARCH_PILLARS = [
  { icon: 'fa-brain', label: 'Multiscale systems neuroscience' },
  { icon: 'fa-diagram-project', label: 'Quantitative neuromodeling' },
  { icon: 'fa-wave-square', label: 'Neuroimaging' },
];

const METHODS = [
  { icon: 'fa-chart-line', title: 'Signal processing', text: 'Turning complex neural signals into measurable patterns.' },
  { icon: 'fa-cubes-stacked', title: 'Computational modeling', text: 'Connecting observations with quantitative models of neural systems.' },
  { icon: 'fa-microscope', title: 'Multiscale neuroimaging', text: 'Studying neural activity across multiple spatial and temporal scales.' },
  { icon: 'fa-wifi', title: 'Contact-less assessment', text: 'Developing unobtrusive neurocognitive and neurophysiological methods.' },
];

const FEATURED_LABS = [
  {
    id: 2,
    number: '01',
    name: 'Mindscan Lab',
    domain: 'Human–machine interaction',
    person: 'Dr. Farah I. Corona-Strauss',
    role: 'Lab Head',
    photo: '/image/people/farah_i_corona_strauss.png',
    image: '/image/research-sites/mindscan/MindscanLabSlider2-700x470.jpg',
    description: 'Exploring attention and cognitive effort in interactive environments.',
  },
  {
    id: 1,
    number: '02',
    name: 'Translational Lab',
    domain: 'Medicine',
    person: 'Dr. Corinna Martin',
    role: 'Lab Head',
    photo: '/image/people/corinna_martin_nee_bernarding.png',
    image: '/image/research-sites/translational/TranslationalLabSlider2-700x470.jpg',
    description: 'Translating neuroscience and neurotechnology into clinical medicine.',
  },
  {
    id: 3,
    number: '03',
    name: 'Multiscale Lab',
    domain: 'Measurements & modeling',
    person: 'Dr. Lars Haab',
    role: 'Lab Head',
    photo: '/image/people/lars_haab.png',
    image: '/image/research-sites/multiscale/MultiscaleLabSlider3-700x470.png',
    description: 'Linking microscopic neural activity with macroscopic electrophysiology.',
  },
];

const TIMELINE = [
  { year: '2005', title: 'University Hospital', text: 'SNNU research within the Neurocenter of Saarland University Hospital.' },
  { year: '2012', title: 'Technikum', text: 'A new site at the Saarland University of Applied Sciences.' },
  { year: '2013', title: 'Haptics Lab', text: 'The Neurocognitive Haptics Lab opens with INM.' },
  { year: '2014', title: 'Bosenberg', text: 'Clinical research expands to the MediClin Rehabilitation Center.' },
  { year: '2015', title: 'Driving Test Field', text: 'Real-world neurocognitive driving research is established.' },
  { year: '2017', title: 'Visual Computing', text: 'The Visual Computing Lab joins the research landscape.' },
];

function HomePage({ hero, home, onNavigate, onSelectLab, onSelectPerson }) {
  const heroTitle = hero?.title || 'Systems Neuroscience & Neurotechnology Unit';
  const [titleFirstLine, ...titleRemainder] = heroTitle.split(/\s*&\s*/);
  const titleLastLine = titleRemainder.join(' & ');
  const about = home?.about || {};
  const mission = home?.mission || {};
  const methods = home?.methods || {};
  const labs = home?.labs || {};
  const network = home?.network || {};
  const pillars = about.pillars || RESEARCH_PILLARS;
  const methodItems = methods.items || METHODS;
  const featuredLabs = FEATURED_LABS.map((lab) => ({
    ...lab,
    ...(labs.featured || []).find((translatedLab) => translatedLab.id === lab.id),
  }));
  const timeline = network.timeline || TIMELINE;

  const goToSection = (sectionId) => {
    if (onNavigate) onNavigate(sectionId);
  };

  return (
    <div className="home-page home-page--editorial">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__canvas">
          <div className="home-hero__orbitals" aria-label="Research environments">
            {HOME_LABS.map((lab) => (
              <figure
                key={lab.name}
                className={`home-hero__orbital home-hero__orbital--${lab.position}`}
              >
                <figcaption className="home-hero__lab-title">{lab.name}</figcaption>
                <div className="home-hero__lab-visual">
                  <button type="button" className="home-hero__lab-image-action" onClick={() => onSelectLab?.(lab.id)} aria-label={`Open ${lab.name}`}>
                    <img
                      className="home-hero__lab-image"
                      src={lab.src}
                      alt={lab.alt}
                      draggable="false"
                    />
                  </button>
                  <button type="button" className="home-hero__lab-head" title={`${lab.head} — Lab Head`} onClick={() => onSelectPerson?.(lab.personTarget, true)} aria-label={`Find ${lab.head} in People`}>
                    <img src={lab.headPhoto} alt={`${lab.head}, Lab Head`} draggable="false" />
                  </button>
                </div>
              </figure>
            ))}
          </div>

          <div className="home-hero__focus">
            <div className="home-hero__portrait">
              <button
                type="button"
                className="home-hero__portrait-button"
                onClick={() => onSelectPerson?.('Prof. Dr. rer. nat. Dr. rer. med. habil. Daniel J. Strauss', false)}
                aria-label="Find Prof. Dr. Dr. Daniel J. Strauss in People"
              >
                <img
                  src="/image/hero_eeg.png"
                  alt="Prof. Dr. Dr. Daniel J. Strauss"
                  draggable="false"
                />
              </button>
              <div className="home-hero__copy">
                <p className="home-hero__eyebrow">{hero?.eyebrow || 'Your future in...'}</p>
                <h1 id="home-hero-title" className="home-hero__title">
                  <span>{titleFirstLine}</span>
                  {titleLastLine && <span className="home-hero__ampersand">&amp;</span>}
                  {titleLastLine && <span>{titleLastLine}</span>}
                </h1>
              </div>
            </div>
          </div>
        </div>
        <a className="home-hero__continue" href="#home-introduction" aria-label="Discover SNNU">
          <span>{home?.continueLabel || 'Discover SNNU'}</span>
          <i className="fa-solid fa-arrow-down" aria-hidden="true"></i>
        </a>
      </section>

      <section id="home-introduction" className="home-story home-story--intro" aria-labelledby="home-about-title">
        <div className="home-story__shell">
          <div className="home-section-heading">
            <p className="home-kicker">{about.kicker || 'About the unit'}</p>
            <h2 id="home-about-title">{about.title?.[0] || 'One unit.'}<br />{about.title?.[1] || 'Many scales.'}</h2>
          </div>

          <div className="home-intro-grid">
            <button
              type="button"
              className="home-director-card"
              onClick={() => onSelectPerson?.('Prof. Dr. rer. nat. Dr. rer. med. habil. Daniel J. Strauss', false)}
              aria-label="Meet Prof. Dr. Dr. Daniel J. Strauss and the SNNU team"
            >
              <img src="/image/people/daniel_j_strauss.png" alt="Prof. Dr. Dr. Daniel J. Strauss" loading="lazy" />
              <span className="home-director-card__shade"></span>
              <span className="home-director-card__content">
                <span className="home-director-card__role">{about.directorRole || 'Director'}</span>
                <strong>Prof. Dr. Dr.<br />Daniel J. Strauss</strong>
                <span className="home-inline-link">{about.teamLink || 'Meet the team'} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
              </span>
            </button>

            <div className="home-intro-copy">
              <p className="home-intro-copy__lead">
                {about.lead || 'SNNU brings different disciplines together to understand neural systems and turn that understanding into technology with real world impact.'}
              </p>
              <div className="home-pillar-list" aria-label="Core research areas">
                {pillars.map((pillar) => (
                  <div className="home-pillar" key={pillar.label}>
                    <span className="home-pillar__icon"><i className={`fa-solid ${pillar.icon}`} aria-hidden="true"></i></span>
                    <span>{pillar.label}</span>
                  </div>
                ))}
              </div>
              <p className="home-intro-copy__note">
                {about.note || 'A multidisciplinary research unit spanning systems neuroscience, engineering and clinical application.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-story home-story--bridge" aria-labelledby="home-bridge-title">
        <div className="home-story__shell">
          <div className="home-section-heading home-section-heading--center">
            <p className="home-kicker">{mission.kicker || 'Our mission'}</p>
            <h2 id="home-bridge-title">{mission.title || 'Bridging ideas and impact'}</h2>
            <p>{mission.intro || 'From theoretical and computational neuroscience to applications in medicine and human-machine interaction.'}</p>
          </div>

          <div className="home-bridge-map">
            <article className="home-bridge-card home-bridge-card--theory">
              <span className="home-bridge-card__index">01</span>
              <i className="fa-solid fa-code-branch" aria-hidden="true"></i>
              <p>{mission.cards?.[0]?.title || 'Theory & computation'}</p>
              <span>{mission.cards?.[0]?.text || 'Models of complex neural systems'}</span>
            </article>

            <div className="home-bridge-map__connection" aria-hidden="true">
              <span></span>
              <div><i className="fa-solid fa-brain"></i></div>
              <span></span>
            </div>

            <article className="home-bridge-card home-bridge-card--medicine">
              <span className="home-bridge-card__index">02</span>
              <i className="fa-solid fa-heart-pulse" aria-hidden="true"></i>
              <p>{mission.cards?.[1]?.title || 'Clinical medicine'}</p>
              <span>{mission.cards?.[1]?.text || 'Translation into patient-centered research'}</span>
            </article>

            <article className="home-bridge-card home-bridge-card--interaction">
              <span className="home-bridge-card__index">03</span>
              <i className="fa-solid fa-car-side" aria-hidden="true"></i>
              <p>{mission.cards?.[2]?.title || 'Human-machine interaction'}</p>
              <span>{mission.cards?.[2]?.text || 'Technology designed around human cognition'}</span>
            </article>
          </div>

          <div className="home-research-focus">
            <span className="home-research-focus__label">{mission.focusLabel || 'Research focus'}</span>
            <strong>{mission.focusTitle || 'Neural correlates of'}</strong>
            <span>{mission.attention || 'Attention'}</span>
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            <span>{mission.effort || 'Cognitive effort'}</span>
          </div>
        </div>
      </section>

      <section className="home-story home-story--methods" aria-labelledby="home-methods-title">
        <div className="home-story__shell home-methods-layout">
          <div className="home-methods-visual">
            <img
              src="/image/research-sites/multiscale/MultiscaleLabSlider1-700x470.png"
              alt="High-speed camera used for voltage-sensitive dye imaging"
              loading="lazy"
            />
            <div className="home-methods-visual__badge">
              <strong>{methods.badgeTitle || 'Multi'}</strong>
              <span>{methods.badgeText || 'spatial + temporal scales'}</span>
            </div>
          </div>

          <div className="home-methods-content">
            <div className="home-section-heading">
              <p className="home-kicker">{methods.kicker || 'How we investigate'}</p>
              <h2 id="home-methods-title">{methods.title || 'Methods across scales'}</h2>
            </div>
            <div className="home-methods-list">
              {methodItems.map((method, index) => (
                <article className="home-method" key={method.title}>
                  <span className="home-method__number">0{index + 1}</span>
                  <span className="home-method__icon"><i className={`fa-solid ${method.icon}`} aria-hidden="true"></i></span>
                  <div>
                    <h3>{method.title}</h3>
                    <p>{method.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-story home-story--labs" aria-labelledby="home-labs-title">
        <div className="home-story__shell">
          <div className="home-section-heading home-section-heading--split">
            <div>
              <p className="home-kicker">{labs.kicker || 'Where ideas become experiments'}</p>
              <h2 id="home-labs-title">{labs.title?.[0] || 'Six labs.'}<br />{labs.title?.[1] || 'One shared mission.'}</h2>
            </div>
            <p>{labs.intro || 'Specialized environments connect fundamental research, clinical translation and human-centered technology.'}</p>
          </div>

          <div className="home-featured-labs">
            {featuredLabs.map((lab) => (
              <article className="home-featured-lab" key={lab.id}>
                <button type="button" className="home-featured-lab__action" onClick={() => onSelectLab?.(lab.id)} aria-label={`Explore ${lab.name}`}>
                  <div className="home-featured-lab__image">
                    <img src={lab.image} alt={`${lab.name} research environment`} loading="lazy" />
                    <span className="home-featured-lab__number">{lab.number}</span>
                    <span className="home-featured-lab__domain">{lab.domain}</span>
                  </div>
                  <div className="home-featured-lab__body">
                    <h3>{lab.name}</h3>
                    <p>{lab.description}</p>
                  </div>
                </button>
                <button type="button" className="home-featured-lab__head" onClick={() => onSelectPerson?.(lab.person, true)} aria-label={`Find ${lab.person} in People`}>
                  <img src={lab.photo} alt="" loading="lazy" />
                  <span><strong>{lab.person}</strong><small>{lab.role}</small></span>
                  <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </button>
              </article>
            ))}
          </div>

          <button type="button" className="home-outline-cta" onClick={() => goToSection('section-research-site')}>
            {labs.cta || 'Explore all research sites'} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </section>

      <section className="home-story home-story--network" aria-labelledby="home-network-title">
        <div className="home-story__shell">
          <div className="home-network-top">
            <div className="home-section-heading">
              <p className="home-kicker">{network.kicker || 'A connected research ecosystem'}</p>
              <h2 id="home-network-title">{network.title?.[0] || 'Across faculties,'}<br />{network.title?.[1] || 'institutes and sites.'}</h2>
            </div>
            <div className="home-network-intro">
              <p>{network.intro || 'SNNU belongs to the Medical Faculty of Saarland University and the Faculty of Engineering at htw saar.'}</p>
              <div className="home-institution-links">
                <a href="http://www.uni-saarland.de/" target="_blank" rel="noreferrer">Saarland University <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
                <a href="http://www.htwsaar.de/" target="_blank" rel="noreferrer">htw saar <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
              </div>
            </div>
          </div>

          <div className="home-timeline" aria-label="SNNU institutional timeline">
            {timeline.map((item) => (
              <article className="home-timeline__item" key={item.year}>
                <span className="home-timeline__year">{item.year}</span>
                <span className="home-timeline__dot" aria-hidden="true"></span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="home-network-sites">
            <a href="http://www.uniklinikum-saarland.de/de/" target="_blank" rel="noreferrer"><i className="fa-solid fa-hospital" aria-hidden="true"></i><span>{network.sites?.[0]?.name || 'Saarland University Hospital'}<small>{network.sites?.[0]?.detail || 'Neurocenter · since 2005'}</small></span></a>
            <a href="http://www.bosenberg-kliniken.de/" target="_blank" rel="noreferrer"><i className="fa-solid fa-house-medical" aria-hidden="true"></i><span>{network.sites?.[1]?.name || 'MediClin Bosenberg'}<small>{network.sites?.[1]?.detail || 'Rehabilitation Center · since 2014'}</small></span></a>
            <a href="http://www.leibniz-inm.de/" target="_blank" rel="noreferrer"><i className="fa-solid fa-atom" aria-hidden="true"></i><span>{network.sites?.[2]?.name || 'Leibniz INM'}<small>{network.sites?.[2]?.detail || 'Institutional collaboration · since 2013'}</small></span></a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
