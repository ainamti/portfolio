import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
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

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Number of files
  const numFiles = d3.groups(data, d => d.file).length;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  // Max file length
  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, d => d.line),
    d => d.file
  );
  const maxFileLength = d3.max(fileLengths, d => d[1]);
  dl.append('dt').text('Maximum file length (lines)');
  dl.append('dd').text(maxFileLength);

  // Average line length
  const avgLineLength = d3.mean(data, d => d.length);
  dl.append('dt').text('Average line length (characters)');
  dl.append('dd').text(avgLineLength.toFixed(1));

  // Max depth
  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Maximum depth');
  dl.append('dd').text(maxDepth);

  // Time of day with most work
  const workByPeriod = d3.rollups(
    data,
    v => v.length,
    d => {
      const hour = d.datetime.getHours();
      if (hour < 6) return 'Night';
      if (hour < 12) return 'Morning';
      if (hour < 18) return 'Afternoon';
      return 'Evening';
    }
  );
  const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
  dl.append('dt').text('Time of day with most work');
  dl.append('dd').text(maxPeriod);
}

function renderScatterPlot() {
  // 1️⃣ Sort commits so large dots (big edits) are drawn first
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // 2️⃣ Compute min and max edited lines across commits
  const [minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);

  // 3️⃣ Define a square root radius scale (for perceptual accuracy)
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]); // adjust if dots look too big/small

  // 4️⃣ Bind data and create circles
  const dots = svg.select('.dots');

  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      // Increase opacity when hovered
      d3.select(event.currentTarget).style('fill-opacity', 1);

      // Update and show tooltip
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      // Reset opacity and hide tooltip
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
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

// Main async function
async function main() {
  const data = await loadData();
  const commits = processCommits(data);

  renderCommitInfo(data, commits);
  renderScatterPlot(data, commits); // render scatterplot AFTER data is ready
}

// Run main
main();