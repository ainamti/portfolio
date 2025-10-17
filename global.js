console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// 1. Define the BASE_PATH to fix the URL issue
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server: path is the root
  : "/portfolio/";       // GitHub Pages: path includes the repository name

// 2. Define the navigation data structure
// Use simple relative paths that rely on BASE_PATH for context
let pages = [
  { url: '', title: 'Home' }, // url: '' for the home page
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/ainamti', title: 'GitHub', external: true } // External link
];

// 3. Create and prepend the <nav> element
let nav = document.createElement('nav');
document.body.prepend(nav);

// 4. Loop to create, correct, and insert links
for (let p of pages) {
  let url = p.url;
  let title = p.title;
  let classAttribute = '';
  let targetAttribute = '';
  
  // A. Correct the URL using BASE_PATH (The Fix!)
  url = !url.startsWith('http') ? BASE_PATH + url : url;

  // B. Logic for 'current' class and external links
  
  // Create a temporary link element to resolve the URL and compare pathnames
  let tempLink = document.createElement('a');
  tempLink.href = url;
  
  // Check if the link is the current page
  if (tempLink.pathname === location.pathname) {
    classAttribute = ' class="current"';
  }

  // Check for external links
  if (p.external) {
    targetAttribute = ' target="_blank"';
  }

  // C. Create and add the link to the nav element
  nav.insertAdjacentHTML('beforeend', `<a href="${url}"${targetAttribute}${classAttribute}>${title}</a>`);
}