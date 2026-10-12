import { useState, useEffect, useCallback, useRef } from 'react';
import './ProfileModal.css';

// Map of link type → icon + label
const LINK_CONFIG = {
  researchgate: { icon: 'fa-brands fa-researchgate', label: 'ResearchGate' },
  linkedin:     { icon: 'fa-brands fa-linkedin', label: 'LinkedIn' },
  scholar:      { icon: 'fa-solid fa-graduation-cap', label: 'Google Scholar' },
  website:      { icon: 'fa-solid fa-globe', label: 'Website' },
  orcid:        { icon: 'fa-brands fa-orcid', label: 'ORCID' },
  github:       { icon: 'fa-brands fa-github', label: 'GitHub' },
};

function ProfileModal({ person, onClose }) {
  const [closing, setClosing] = useState(false);
  const closeButtonRef = useRef(null);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // matches CSS animation duration
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!person) return null;

  const hasLinks = person.links && Object.keys(person.links).length > 0;
  const hasPublications = person.publications && person.publications.length > 0;
  const hasBio = person.bio && person.bio.trim().length > 0;
  const hasEmail = person.email && person.email.trim().length > 0;
  const hasPhone = person.phone && person.phone.trim().length > 0;
  const phoneHref = hasPhone ? person.phone.replace('(0)', '').replace(/[^+\d]/g, '') : '';
  const hasPhoto = person.photo && person.photo.trim().length > 0;
  const hasLab = person.lab && person.lab.trim().length > 0;
  const affiliationLines = [
    { icon: 'fa-building-columns', value: person.unit },
    { icon: 'fa-location-dot', value: person.building },
    { icon: 'fa-hospital', value: person.institution },
    { icon: 'fa-road', value: person.street },
    { icon: 'fa-map-pin', value: person.location },
  ].filter((item) => item.value && item.value.trim().length > 0);
  const hasAffiliation = affiliationLines.length > 0;
  const hasAnyContent = hasBio || hasEmail || hasPhone || hasAffiliation || hasLinks || hasPublications;

  return (
    <div
      className={`profile-modal-overlay ${closing ? 'profile-modal-overlay--closing' : ''}`}
      onClick={handleClose}
      role="presentation"
    >
      <div className="profile-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        {/* Close button */}
        <button ref={closeButtonRef} className="profile-modal__close" onClick={handleClose} aria-label="Close profile">
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>

        {/* Header: Avatar + Identity */}
        <div className="profile-modal__header">
          <div className="profile-modal__avatar">
            {hasPhoto ? (
              <img src={person.photo} alt={person.name} />
            ) : (
              <i className={`fa-solid ${person.icon || 'fa-user'} profile-modal__avatar-icon`}></i>
            )}
          </div>
          <div className="profile-modal__identity">
            <h2 id="profile-modal-title" className="profile-modal__name">{person.name}</h2>
            <p className="profile-modal__role">{person.role}</p>
            {hasLab && (
              <span className="profile-modal__lab">
                <i className="fa-solid fa-flask"></i>
                {person.lab}
              </span>
            )}
          </div>
        </div>

        <div className="profile-modal__divider"></div>

        {/* Body */}
        <div className="profile-modal__body">
          {/* Institutional affiliation */}
          {hasAffiliation && (
            <div>
              <div className="profile-modal__section-label">Affiliation</div>
              <div className="profile-modal__affiliation">
                {affiliationLines.map((item) => (
                  <div key={`${item.icon}-${item.value}`} className="profile-modal__affiliation-line">
                    <i className={`fa-solid ${item.icon}`}></i>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact details */}
          {(hasEmail || hasPhone) && (
            <div>
              <div className="profile-modal__section-label">Contact</div>
              <div className="profile-modal__contact-list">
                {hasEmail && (
                  <div className="profile-modal__contact">
                    <i className="fa-solid fa-envelope"></i>
                    <a href={`mailto:${person.email}`}>{person.email}</a>
                  </div>
                )}
                {hasPhone && (
                  <div className="profile-modal__contact">
                    <i className="fa-solid fa-phone"></i>
                    <a href={`tel:${phoneHref}`}>{person.phone}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          {hasBio && (
            <div>
              <div className="profile-modal__section-label">About</div>
              <p className="profile-modal__bio">{person.bio}</p>
            </div>
          )}

          {/* External Links */}
          {hasLinks && (
            <div>
              <div className="profile-modal__section-label">Profiles</div>
              <div className="profile-modal__links">
                {Object.entries(person.links).map(([key, url]) => {
                  if (!url) return null;
                  const config = LINK_CONFIG[key] || { icon: 'fa-solid fa-link', label: key };
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-modal__link-btn"
                    >
                      <i className={config.icon}></i>
                      {config.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Publications */}
          {hasPublications && (
            <div>
              <div className="profile-modal__section-label">
                Selected Publications ({person.publications.length})
              </div>
              <ul className="profile-modal__publications">
                {person.publications.map((pub, idx) => (
                  <li key={idx} className="profile-modal__pub-item">{pub}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty state: no extra data yet */}
          {!hasAnyContent && (
            <div className="profile-modal__empty">
              <i className="fa-solid fa-clock" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', opacity: 0.5 }}></i>
              Profile details coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
