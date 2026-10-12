from .hero import HERO_DATA
from .home import HOME_DATA
from .research_site import RESEARCH_SITE_DATA
from .virtual_tour import VIRTUAL_TOUR_DATA
from .people import PEOPLE_DATA
from .news import NEWS_DATA
from .nav import NAV_DATA
from .sections.publication import PUBLICATION_SECTION
from .sections.projects import PROJECTS_SECTION
from .sections.teaching import TEACHING_SECTION
from .sections.preprint import PREPRINT_SECTION
from .sections.about import ABOUT_SECTION
from .sections.join import JOIN_SECTION
from .sections.legal import LEGAL_SECTION

INITIAL_PAGE_DATA = {
    "hero": HERO_DATA,
    "home": HOME_DATA,
    "researchSite": RESEARCH_SITE_DATA,
    "virtualTour": VIRTUAL_TOUR_DATA,
    "people": PEOPLE_DATA,
    "news": NEWS_DATA,
    "sections": [
        PUBLICATION_SECTION,
        PROJECTS_SECTION,
        TEACHING_SECTION,
        PREPRINT_SECTION,
        ABOUT_SECTION,
        JOIN_SECTION,
        LEGAL_SECTION,
    ],
    "nav": NAV_DATA,
}
