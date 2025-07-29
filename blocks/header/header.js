import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function addAnimation() {
  window.addEventListener('scroll', () => {
    const header = document.getElementsByClassName('header-nav-wrapper')[0];
    const scrollPosition = window.scrollY;
    const viewportWidth = window.innerWidth;

    if (viewportWidth > 900) {
      if (scrollPosition > 168) {
        header.classList.add('minimized');
      } else {
        header.classList.remove('minimized');
      }
    } else {
      header.classList.remove('minimized');
    }
  });
}

function setActiveTab() {
  const currentPath = window.location.pathname;
  const matchResult = currentPath.match(/^\/([^/]+)/);
  const path = matchResult ? matchResult[1] : null;
  const navTabLinks = document.querySelector('.nav-sections ul');

  [...navTabLinks.children].forEach((tab) => {
    const link = tab.querySelector('a');
    const linkTitle = link.title.toLowerCase();

    if (linkTitle === path || (linkTitle === 'shop' && ['products', 'equipment', 'search'].includes(path))) {
      link.classList.add('active');
    }
  });

  /* temp - only for the demo since the adventures landing page is the "home page"
  */
  /* if (!path) {
    const adventureTab = navTabLinks.querySelector('a[title="Adventures"],a[title="adventures"]');
    adventureTab.classList.add('active');
  } */
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const locale = getMetadata('locale');
  const navPath = locale ? `/${locale}/nav` : '/nav';
  const fragment = await loadFragment(navPath);
  let languages = null;

  try {
    const response = await fetch('/languages.json');
    languages = await response.json();
  } catch (e) {
    // error handling
  }

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';

  if (!fragment) {
    return;
  }

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  if (languages?.data) {
    // Create the select element
    const languageSelector = document.createElement('select');
    languageSelector.id = 'language-selector';

    languages.data.forEach((language) => {
      const option = document.createElement('option');
      option.value = language.url;
      option.textContent = language.locale;
      languageSelector.appendChild(option);
    });

    // Set the default value based on the locale meta tag
    // eslint-disable-next-line max-len
    const defaultLanguage = languages.data.find((lang) => lang.locale.toLowerCase() === locale.toLowerCase());
    if (defaultLanguage) {
      languageSelector.value = defaultLanguage.url;
    }

    // Add event listener to handle change event
    languageSelector.addEventListener('change', () => {
      window.location.href = languageSelector.value;
    });

    const navTools = nav.querySelector('.nav-tools');
    const liElem = document.createElement('li');
    liElem.append(languageSelector);
    navTools.querySelector('ul').prepend(liElem);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'header-nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  addAnimation();
  setActiveTab();
}
