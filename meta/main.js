import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';

let allCommits = [];
let allData = [];
let colors = d3.scaleOrdinal(d3.schemeTableau10);

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
      lines,
    };
    return ret;
  }).sort((a, b) => a.datetime - b.datetime);
}

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

function renderStats(filteredData, filteredCommits) {
  updateStat('stat-commits', 'COMMITS', filteredCommits.length);
  const fileCount = d3.groups(filteredData, d => d.file).length;
  updateStat('stat-files', 'FILES', fileCount);
  updateStat('stat-loc', 'TOTAL LOC', filteredData.length);
  updateStat('stat-depth', 'MAX DEPTH', d3.max(filteredData, d => d.depth) || 0);
  updateStat('stat-char-length', 'LONGEST LINE', d3.max(filteredData, d => d.length) || 0);
  updateStat('stat-max-lines', 'MAX LINES', d3.max(filteredCommits, d => d.totalLines) || 0);
}

function renderCommitInfo(data, commits) {
  d3.select('#stats').html('');
  renderStats(data, commits);
}

function updateFileDisplay(filteredCommits) {
  const lines = filteredCommits.flatMap(d => d.lines);
  const files = d3.groups(lines, d => d.file).map(([name, lines]) => ({
    name,
    type: lines[0]?.type || 'Unknown',
    lines
  })).sort((a, b) => b.lines.length - a.lines.length);

  const filesContainer = d3.select('#files').selectAll('div.file-row')
    .data(files, d => d.name)
    .join(
      enter => enter.append('div')
        .attr('class', 'file-row')
        .call(div => {
          div.append('dt').append('code');
          div.append('dd');
        }),
      update => update,
      exit => exit.remove()
    )
    .attr('style', d => `--color: ${colors(d.type)}`);

  filesContainer.select('dt > code')
    .html(d => `${d.name}<small style="display:block;">${d.lines.length} lines</small>`);

  filesContainer.select('dd')
    .selectAll('div.loc')
    .data(d => d.lines)
    .join('div')
    .attr('class', 'loc');
}

// --- PLOT FUNCTIONS ---
function renderPlot(containerId, commits) {
  const width = 1000, height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select(containerId)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  svg.append('g').attr('transform', `translate(0,${usableArea.bottom})`).call(d3.axisBottom(xScale));
  svg.append('g').attr('transform', `translate(${usableArea.left},0)`).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2,'0') + ':00'));
  svg.append('g').attr('transform', `translate(${usableArea.left},0)`).call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
  svg.append('g').attr('class', 'dots');

  updatePlot(svg, commits, xScale, yScale);
  return { svg, xScale, yScale };
}

function updatePlot(svg, commits, xScale, yScale) {
  const rScale = d3.scaleSqrt().domain([1, d3.max(commits, d => d.totalLines)]).range([2,30]);

  svg.select('g.dots').selectAll('circle')
    .data(commits, d => d.id)
    .join(
      enter => enter.append('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity',0.7),
      update => update.transition().duration(200)
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines)),
      exit => exit.remove()
    );
}

async function main() {
  allData = await loadData();
  allCommits = processCommits(allData);

  renderCommitInfo(allData, allCommits);
  updateFileDisplay(allCommits);

  const scatterPlot = renderPlot('#scatter-chart', allCommits);
  const dotPlot = renderPlot('#dot-chart', allCommits);

  const scroller = scrollama();
  d3.select('#scatter-story').selectAll('.step')
    .data(allCommits)
    .join('div')
    .attr('class','step')
    .html(d => `<p>On ${d.datetime.toLocaleString('en',{dateStyle:'full',timeStyle:'short'})}, I made <a href="${d.url}" target="_blank">${d.totalLines} lines</a>.</p>`);

  scroller.setup({
    container:'#scrolly-1',
    step:'#scatter-story .step',
    offset:0.5
  }).onStepEnter(d => {
    const filtered = allCommits.filter(c => c.datetime <= d.element.__data__.datetime);
    updatePlot(scatterPlot.svg, filtered, scatterPlot.xScale, scatterPlot.yScale);
  });

  const dotScroller = scrollama();

  dotScroller.setup({
    container: '#scrolly-2',
    step: '#dot-story .step',
    offset: 0.5
  }).onStepEnter(d => {
    const type = d.element.dataset.type;
    let filteredCommitsByTech = [];

    if (type === 'intro') {
        filteredCommitsByTech = allCommits;
    } else {
        filteredCommitsByTech = allCommits.filter(c => 
            c.lines.some(l => l.type === type)
        );
    }

    updatePlot(dotPlot.svg, filteredCommitsByTech, dotPlot.xScale, dotPlot.yScale);
    
    d3.selectAll('#dot-story .step').classed('is-active', false);
    d3.select(d.element).classed('is-active', true);
  });
}

main();
