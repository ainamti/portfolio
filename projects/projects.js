import { fetchJSON, renderProjects } from '../global.js';

// Fetch the projects data
const projects = await fetchJSON('../lib/projects.json');

// Get the container element
const projectsContainer = document.querySelector('.projects');

// Get the title element and update it with the count
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `Projects (${projects.length})`;

// Render the projects with h2 headings
renderProjects(projects, projectsContainer, 'h2');



