console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);
currentLink.classList.add('current');
if (currentLink) {
  // or if (currentLink !== undefined)
  currentLink.classList.add('current');
}

// --- Step 3.1: Create nav and pages array ---

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'About' },
  { url: 'contact/', title: 'Contact' }
  // add more pages as needed
];

// Create the <nav> element
let nav = document.createElement('nav');
document.body.prepend(nav);

// --- Step 3.2: Handle base path for local vs GitHub Pages ---
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                    // Local server
  : "/portfolio/";          // GitHub Pages repo name (change to your repo name!)

// --- Step 3.3: Loop through pages and add links ---
for (let p of pages) {
  let url = p.url;
  let title = p.title;
  let classAttribute = '';
  let targetAttribute = '';

  // Fix the URL using BASE_PATH
  url = !url.startsWith('http') ? BASE_PATH + url : url;

  // Create a temporary link to compare pathnames
  let tempLink = document.createElement('a');
  tempLink.href = url;

  // Check if this link points to the current page
  if (tempLink.pathname === location.pathname) {
    classAttribute = ' class="current"';
  }

  // If this is an external link, open in a new tab
  if (p.external) {
    targetAttribute = ' target="_blank"';
  }

  // Add link to nav
  nav.insertAdjacentHTML('beforeend', `<a href="${url}"${targetAttribute}${classAttribute}>${title}</a>`);
}
