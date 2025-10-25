import { fetchJSON, renderProjects, fetchGithubData } from './global.js';
async function displayLatestProjects() {
  // Fetch all projects
  const projects = await fetchJSON('./lib/projects.json');

  // Take only the first 3
  const latestProjects = projects.slice(0, 3);

  // Select container on homepage
  const projectsContainer = document.querySelector('.projects');

  // Safety check
  if (!projectsContainer) {
    console.error('No .projects container found in index.html');
    return;
  }

  // Render first 3 projects
  renderProjects(latestProjects, projectsContainer, 'h3');
}

displayLatestProjects();

<script src="index.js" type="module" defer></script>
