import { useEffect, useState } from 'react';
import './ResearchLabDetail.css';

function LabGallery({ gallery }) {
  const images = gallery.images || [];
  const imageCount = images.length;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (imageCount < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % imageCount);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [imageCount]);

  return (
    <figure className={`lab-gallery lab-gallery--${images.length}`} aria-label={gallery.label}>
      {images.map((src, index) => (
        <img
          key={`${src}-${index}`}
          className={`lab-gallery__slide ${index === activeIndex ? 'lab-gallery__slide--active' : ''}`}
          src={src}
          alt={index === 0 ? gallery.label : ''}
          loading="lazy"
          aria-hidden={index !== activeIndex}
        />
      ))}
      <figcaption className="lab-gallery__caption">
        <i className="fa-solid fa-images" aria-hidden="true"></i>
        {gallery.label}
      </figcaption>
    </figure>
  );
}

function ResearchLabDetail({ lab }) {
  if (!lab) return null;

  if (lab.status) {
    return (
      <article id="research-lab-detail" className="research-lab-panel research-lab-panel--construction" aria-live="polite">
        <div className="construction-visual" role="img" aria-label={`${lab.name}: ${lab.status}`}>
          <span className="construction-visual__grid" aria-hidden="true"></span>
          <i className="fa-solid fa-person-digging" aria-hidden="true"></i>
          <span className="construction-visual__label">{lab.status}</span>
        </div>
        <div className="research-lab-panel__intro">
          <span className="research-lab-panel__eyebrow">Research site</span>
          <h3>{lab.name}</h3>
          <p>{lab.desc}</p>
        </div>
      </article>
    );
  }

  const galleries = lab.galleries || [];
  const gifs = lab.gifs || [];
  const locations = lab.locations || [];

  return (
    <article id="research-lab-detail" className="research-lab-panel" aria-live="polite">
      <header className="research-lab-panel__header">
        <div className="research-lab-panel__icon"><i className={`fa-solid ${lab.icon || 'fa-microscope'}`} aria-hidden="true"></i></div>
        <div>
          <span className="research-lab-panel__eyebrow">{lab.eyebrow || 'Research'}</span>
          <h3>{lab.name}</h3>
        </div>
      </header>

      <div className="research-lab-panel__copy">
        {(lab.research || []).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>

      {galleries.length > 0 && (
        <div className={`research-lab-galleries ${galleries.length > 1 ? 'research-lab-galleries--split' : ''}`}>
          {galleries.map((gallery, index) => <LabGallery key={`${gallery.label}-${index}`} gallery={gallery} />)}
        </div>
      )}

      {gifs.length > 0 && (
        <div className="research-lab-gif-row">
          {gifs.map((gif) => (
            <figure className="research-lab-gif" key={gif.src}>
              <img src={gif.src} alt={gif.caption} loading="lazy" />
              <figcaption>{gif.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <section className="research-lab-locations" aria-labelledby={`lab-locations-${lab.id}`}>
          <div className="research-lab-locations__heading">
            <span className="research-lab-panel__eyebrow">Visit the lab</span>
            <h4 id={`lab-locations-${lab.id}`}>Locations</h4>
          </div>
          <div className={`research-lab-map-grid ${locations.length > 1 ? 'research-lab-map-grid--multiple' : ''}`}>
            {locations.map((location) => (
              <article className="research-lab-map" key={location.name}>
                <div className="research-lab-map__copy">
                  <div>
                    <h5>{location.name}</h5>
                    <p>{location.address}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}`} target="_blank" rel="noopener noreferrer">
                    Open map <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                  </a>
                </div>
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(location.mapQuery)}&output=embed`}
                  title={`Map showing ${location.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                ></iframe>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default ResearchLabDetail;
