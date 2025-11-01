import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `Projects (${projects.length})`;

renderProjects(projects, projectsContainer, 'h2');

let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

let colors = d3.scaleOrdinal(d3.schemeTableau10);

let sliceGenerator = d3.pie().value(d => d.value);
let arcData = sliceGenerator(data);

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let query = '';

arcData.forEach((d, idx) => {
  d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arcGenerator(d))
    .attr('fill', colors(idx));
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`)
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});

function renderPieChart(projectsGiven) {
  // Clear previous paths and legend
  const svg = d3.select('#projects-pie-plot');

  svg.selectAll('path').remove();

  const legend = d3.select('.legend');
  legend.selectAll('li').remove();

  // Rollup projects by year
  const rolledData = d3.rollups(
    projectsGiven,
    v => v.length,
    d => d.year
  );

  // Convert to { value, label } format
  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  if (data.length === 0) return; // Don't render empty chart

  // Color scale
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Generate slices
  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(data);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // Append paths
  arcData.forEach((d, idx) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(idx));
  });

  // Append legend
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderPieChart(projects);


let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();

  const filteredProjects = projects.filter(project => 
    Object.values(project).join(' ').toLowerCase().includes(query)
  );

  // Update project list
  renderProjects(filteredProjects, projectsContainer, 'h2');

  // Update pie chart and legend
  renderPieChart(filteredProjects);
});

