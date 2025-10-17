onsole.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  
  : "/portfolio/";      

let pages = [
  { url: '', title: 'Home' }, // url: '' for the home page (which will resolve to BASE_PATH)
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  // Use absolute URL for external links
  { url: 'https://github.com/ainamti', title: 'GitHub', external: true }
];

// 3. Create and prepend the <nav> element
let nav = document.createElement('nav');
document.body.prepend(nav);

// 4. Loop to create and insert links (CORRECTED LOOP STRUCTURE)
for (let p of pages) {
  let url = p.url;
  let title = p.title;
  let classAttribute = ''; // Initialize class attribute string

  // A. Handle absolute (external) vs. relative (internal) URLs
  if (!url.startsWith('http')) {
    // If relative, prefix with the appropriate BASE_PATH
    url = BASE_PATH + url;
  }
  
  // B. Logic to set the 'current' class
  // 1. Create a temporary link element to resolve the URL
  let tempLink = document.createElement('a');
  tempLink.href = url;
  
  // 2. Check for the 'current' page link
  // Note: tempLink.pathname will include the BASE_PATH if it's an internal link
  if (tempLink.pathname === location.pathname) {
    classAttribute = ' class="current"';
  }

  // C. Add target="_blank" for external links
  if (p.external) {
    classAttribute += ' target="_blank"';
  }

  // D. Create and add the link to the nav element
  nav.insertAdjacentHTML('beforeend', `<a href="${url}"${classAttribute}>${title}</a>`);
}