import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

async function displayGitHubStats() {
  const githubData = await fetchGitHubData('ainamti'); 
  const profileStats = document.querySelector('#profile-stats');

  if (profileStats) {
    profileStats.innerHTML = `
      <dl class="stats-grid">
        <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
        <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
        <dt>Followers:</dt><dd>${githubData.followers}</dd>
        <dt>Following:</dt><dd>${githubData.following}</dd>
      </dl>
    `;
  } else {
    console.warn('No #profile-stats element found in index.html');
  }
}

displayGitHubStats();