import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

export function renderProjects(project, containerElement) {
  containerElement.innerHTML = '';
  projects.forEach(project => {
  const article = document.createElement('article');
  article.innerHTML = `
    <h3>${project.title}</h3>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
`;
containerElement.appendChild(article);

  })

}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  projects.forEach(project => {
  const article = document.createElement('article');
  article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
    `;
containerElement.appendChild(article);

  })
}