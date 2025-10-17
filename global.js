console.log('IT’S ALIVE!');

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

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  // add the rest of your pages here
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name

url = !url.startsWith('http') ? BASE_PATH + url : url;

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