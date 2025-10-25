import { fetchJSON, renderProjects } from '../global.js';

// Fetch the projects data
const projects = await fetchJSON('../lib/projects.json');

// Get the container element
const projectsContainer = document.querySelector('.projects');

// Render the projects with h2 headings
renderProjects(projects, projectsContainer, 'h2');