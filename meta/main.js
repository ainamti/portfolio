import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let xScale, yScale, usableArea; // Global scales for updating
let allCommits = []; // Global list of ALL processed commits
let allData = []; // Global list of ALL raw data lines
let colors = d3.scaleOrdinal(d3.schemeTableau10); // Step 2.4: Define ordinal color scale

// Load CSV data
async function loadData() {
  const data = await d3.csv('loc.csv', row => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
    type: row.type, 
    file: row.file,
    commit: row.commit,
  }));
  return data;
}

// Process commits from CSV
function processCommits(data) {
  return d3.groups(data, d => d.commit).map(([commit, lines]) => {
    const first = lines[0];
    const { author, date, time, timezone, datetime } = first;
    const ret = {
      id: commit,
      url: 'https://github.com/vis-society/lab-7/commit/' + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    Object.defineProperty(ret, 'lines', {
      value: lines,
      enumerable: false,
      writable: false,
      configurable: true,
    });

    return ret;
  });
}

// --- STATS RENDERING LOGIC ---

// Helper function to create/update a single stat display
function updateStat(id, label, value) {
    let container = d3.select('#stats').select(`.stat-container[data-id="${id}"]`);
    if (container.empty()) {
        container = d3.select('#stats').append('div')
            .attr('class', 'stat-container')
            .attr('data-id', id);
        container.append('div').attr('class', 'stat-value').attr('id', id);
        container.append('div').attr('class', 'stat-label').text(label);
    }
    container.select('.stat-value').text(value);
}

// Renders/updates all stats based on filtered data/commits
function renderStats(filteredData, filteredCommits) {
  // Commit Count (Commits)
  updateStat('stat-commits', 'COMMITS', filteredCommits.length);

  // File Count (Files)
  const fileCount = d3.groups(filteredData, d => d.file).length;
  updateStat('stat-files', 'FILES', fileCount);

  // Total LOC (Total LOC)
  updateStat('stat-loc', 'TOTAL LOC', filteredData.length);

  // Max Depth (Max Depth)
  const maxDepth = d3.max(filteredData, d => d.depth) || 0;
  updateStat('stat-depth', 'MAX DEPTH', maxDepth);
  
  // Longest Line (Characters)
  const maxCharLength = d3.max(filteredData, d => d.length) || 0;
  updateStat('stat-char-length', 'LONGEST LINE', maxCharLength);

  // Max Lines in a single commit (Max Lines)
  const maxLinesInCommit = d3.max(filteredCommits, d => d.totalLines) || 0;
  updateStat('stat-max-lines', 'MAX LINES', maxLinesInCommit);
}

// Initial stats setup - now calls the dynamic renderStats
function renderCommitInfo(data, commits) {
  d3.select('#stats').html(''); 
  renderStats(data, commits);
}

// --- FILE DISPLAY LOGIC (Step 2.1 - 2.4) ---

function updateFileDisplay(filteredCommits) {
  // 1. Get all lines from filtered commits
  let lines = filteredCommits.flatMap((d) => d.lines);

  // 2. Obtain files, group lines, and sort
  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      // Step 2.4: Determine file type from the first line
      const type = lines[0]?.type || 'Unknown'; 
      return { name, lines, type };
    })
    // Step 2.3: Sort files by line count in descending order
    .sort((a, b) => b.lines.length - a.lines.length);

  let filesContainer = d3
    .select('#files')
    .selectAll('div.file-row') 
    .data(files, (d) => d.name)
    .join(
      // Step 2.1: ENTER block
      (enter) =>
        enter.append('div')
          .attr('class', 'file-row') 
          .call((div) => {
            div.append('dt').append('code');
            div.append('dd');
          }),
      (update) => update,
      (exit) => exit.remove()
    )
    // Step 2.4: Apply color variable based on file type
    .attr('style', (d) => `--color: ${colors(d.type)}`);

  // Step 2.2: Update filename and line count (using small tag)
  filesContainer.select('dt > code').html((d) => 
    `${d.name}<small style="display: block;">${d.lines.length} lines</small>`
  );

  // Step 2.2: Unit visualization—append one div for each line
  filesContainer
    .select('dd')
    .selectAll('div.loc')
    .data((d) => d.lines)
    .join('div')
    .attr('class', 'loc');
}


// --- SCATTER PLOT LOGIC ---

// Render scatter plot once
function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 };

  usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Scales
  xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Axes
  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis')
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));

  // Gridlines
  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Dots group
  svg.append('g').attr('class', 'dots');

  // Initial draw
  updateScatterPlot(commits);

  // Brush selection
  createBrushSelector(svg);
}

// Update scatter plot dynamically
function updateScatterPlot(commits) {
  const svg = d3.select('#chart svg');

  // Update x-axis domain based on filtered commits
  xScale.domain(d3.extent(commits, d => d.datetime));
  svg.select('g.x-axis').call(d3.axisBottom(xScale));

  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines || 1, maxLines || 1]).range([2, 30]);

  const sortedCommits = d3.sort(commits, d => -d.totalLines);

  svg.select('g.dots')
    .selectAll('circle')
    // 🟢 Step 1.3: Add key function for stable circles
    .data(sortedCommits, d => d.id) 
    .join(
      enter => enter.append('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
          d3.select(event.currentTarget).style('fill-opacity', 1);
          renderTooltipContent(commit);
          updateTooltipVisibility(true);
          updateTooltipPosition(event);
        })
        .on('mouseleave', event => {
          d3.select(event.currentTarget).style('fill-opacity', 0.7);
          updateTooltipVisibility(false);
        }),
      update => update
        .transition().duration(200)
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines)),
      exit => exit.remove()
    );
}

// Brush selector
function createBrushSelector(svg) {
  svg.call(d3.brush().on('start brush end', brushed));
  svg.selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', d => isCommitSelected(selection, d));
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
  if (!selection) return false;
  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection ? allCommits.filter(d => isCommitSelected(selection, d)) : [];
  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection ? allCommits.filter(d => isCommitSelected(selection, d)) : [];
  const container = document.getElementById('language-breakdown');

  if (!selectedCommits.length) {
    container.innerHTML = '';
    return;
  }

  const lines = selectedCommits.flatMap(d => d.lines);
  const breakdown = d3.rollup(lines, v => v.length, d => d.type);

  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${d3.format('.1~%')(proportion)})</dd>
    `;
  }
}

// Tooltip functions
function renderTooltipContent(commit) {
  if (!commit) return;
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time-tooltip');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  link.href = commit.url;
  link.textContent = commit.id;
  const dt = commit.datetime instanceof Date && !isNaN(commit.datetime) ? commit.datetime : new Date();
  date.textContent = dt.toLocaleDateString('en', { dateStyle: 'full' });
  time.textContent = dt.toLocaleTimeString('en', { timeStyle: 'short' });
  author.textContent = commit.author || 'Unknown';
  lines.textContent = commit.totalLines || 0;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

// Main function
async function main() {
  allData = await loadData(); 
  allCommits = processCommits(allData); 

  renderCommitInfo(allData, allCommits); 
  renderScatterPlot(allData, allCommits); 

  // Slider for filtering
  const timeScale = d3.scaleTime()
    .domain(d3.extent(allCommits, d => d.datetime))
    .range([0, 100]);

  function onTimeSliderChange() {
    const commitProgress = +document.getElementById("commit-progress").value;
    const commitMaxTime = timeScale.invert(commitProgress);
    
    document.getElementById("commit-time").textContent =
      commitMaxTime.toLocaleString([], { dateStyle: "long", timeStyle: "short" });

    const filteredCommits = allCommits.filter(d => d.datetime <= commitMaxTime);
    const filteredData = filteredCommits.flatMap(d => d.lines);

    updateScatterPlot(filteredCommits);
    renderStats(filteredData, filteredCommits); 
    
    // 🟢 Step 2.1: Update the file display 
    updateFileDisplay(filteredCommits); 
  }

  document.getElementById("commit-progress").addEventListener("input", onTimeSliderChange);
  onTimeSliderChange(); // initialize
}

main();