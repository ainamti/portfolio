console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// STEP 1: Define your pages
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/ainamti', title: 'GitHub', external: true },
];

// STEP 2: Create <nav> element and prepend to <body>
let nav = document.createElement('nav');
document.body.prepend(nav);

// STEP 3: Set base path depending on environment
const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/" // Local server
    : "/portfolio/"; // GitHub Pages repo name

// STEP 4: Loop through each page and create links
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Add BASE_PATH to relative URLs
  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  // Create <a> element
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  // Highlight current page
  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links (like GitHub) in new tab
  a.toggleAttribute("target", a.host !== location.host);
  if (a.host !== location.host) {
    a.target = "_blank";
    a.rel = "noopener noreferrer"; // security best practice
  }

  // Add the link to the navigation
  nav.append(a);
}

