/* global d3 */


Promise.all([
  'chicago.geojson',
  'permits_res.geojson'
].map(url => fetch(url).then(data => data.json())))
  .then(data => myVis(data));

function myVis(data) {
  const [map, permits] = data

// Create title
  const title = d3.select('.title')
                  .append("text")
                  .attr("class", "title")
                  .text("Building Permits in Chicago");

// Set Constants
  const height = 600;
  const width = 700;
  const margin = {top: 50, left: 50, right: 50, bottom: 50};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.bottom - margin.top;
  const chart_height = 400;
  const chart_width = 500;
  const chart_plotWidth = chart_width - margin.left - margin.right;
  const chart_plotHeight = chart_height - margin.bottom - margin.top;
  const colorRange = ["#00B28F", "#FF5416"];
  const color = d3.scaleOrdinal().domain([0,1]).range(colorRange);

// Create Map
  const svg_map = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  const projection = d3.geoMercator()
                       .fitSize([plotWidth + margin.left, plotHeight + margin.top], map);

  const path = d3.geoPath()
      .projection(projection)
      .pointRadius(.7);

  svg_map.selectAll("path")
     .data(map.features)
     .enter()
     .append("path")
     .attr("d", path)
     .attr("class", "map");

   svg_map.selectAll("dot")
      .data(permits.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "dot")
      .attr('fill', d => color(d.properties.BUILD))
      .attr("opacity", .8);

  // Add legend
  svg_map.append("circle")
     .attr('fill', "#00B28F")
     .attr("cx", 450)
     .attr("cy", 230)
     .attr("r", 3.5)
     .attr("opacity", .7);

   svg_map.append("circle")
      .attr('fill', "#FF5416")
      .attr("cx", 450)
      .attr("cy", 250)
      .attr("r", 3.5)
      .attr("opacity", .7);

    svg_map.append("text")
      .attr("class", "legend_text")
      .attr("x", 460)
      .attr("y", 235)
      .text("Construction");

    svg_map.append("text")
      .attr("class", "legend_text")
      .attr("x", 460)
      .attr("y", 255)
      .text("Demolition");

/// Create Chart
 const data_year = permits.features.reduce((acc, row) => {
       if (!acc[row.properties.YEAR]) {
           acc[row.properties.YEAR] = 0;
       }
       acc[row.properties.YEAR] += 1;
       return acc;
 },  {});

 const grouped_data = d3.nest()
                        .key(function(d) {return d.properties.YEAR; })
                        .key(function(d) {return d.properties.BUILD; })
                        .entries(permits.features);

grouped_data.forEach(function(d) {
  d["Construction"] = d.values[0].values.length,
  d["Demolition"] = -1 * d.values[1].values.length;
});

const xDomain = grouped_data.reduce((acc, row) => {
 return {
   min: Math.min(row.Demolition, acc.min),
   max: Math.max(row.Construction, acc.max)
 };
}, {min: Infinity, max: -Infinity});

const yDomain = grouped_data.reduce((acc, row) => {
 return {
   min: Math.min(row.key, acc.min),
   max: Math.max(row.key, acc.max)
 };
}, {min: Infinity, max: -Infinity});

const x = d3.scaleLinear()
  .domain([xDomain.min, xDomain.max])
  .range([margin.left, margin.left + chart_plotWidth]);

const years = Object.keys(data_year);

const bar_gap = 125

const y = d3.scaleBand()
  .domain(years)
  .range([margin.top, chart_plotHeight])
  .padding(0.1);

const svg_chart = d3.select("body").append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);

const rects_dem = svg_chart.selectAll('.rects_dem').data(grouped_data);
rects_dem.enter()
        .append('rect')
        .attr('class', 'rects_dem')
        .attr('width', d => x(-bar_gap) - x(d.Demolition))
        .attr('height', y.bandwidth())
        .attr('x', d => x(d.Demolition))
        .attr('y', d => y(d.key))
        .attr('fill', colorRange[1])
        .attr("opacity", 0.5);

const rects_con = svg_chart.selectAll('.rects_con').data(grouped_data);
rects_con.enter()
        .append('rect')
        .attr('class', 'rects_con')
        .attr('width', d => x(d.Construction) - x(bar_gap))
        .attr('height', y.bandwidth())
        .attr('x', d => x(bar_gap))
        .attr('y', d => y(d.key))
        .attr('fill', colorRange[0])
        .attr("opacity", 0.5);

  svg_chart.append('g')
    .call(d3.axisBottom(x))
    .attr('transform', `translate(0, ${chart_plotHeight})`);

  const labels = svg_chart.selectAll('.label').data(grouped_data);

  labels.enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(0))
    .attr('y', d => y(d.key) + 14)
    .attr('text-anchor', 'middle')
    .attr('font-size', 13)
    .attr('font-family', "Segoe UI Light")
    .text(d => d.key);

}

//
//
// function find_domain(data) {
//     const lats = [];
//     const longs = [];
//     for (k in data.features) {
//       lats.push(data.features[k].properties.LATITUDE);
//       longs.push(data.features[k].properties.LONGITUDE);
//     }
//     return{min_lat: lats.reduce((min, p) => p < min ? p : min, lats[0]),
//            max_lat: lats.reduce((max, p) => p > max ? p : max, lats[0]),
//            min_long: longs.reduce((min, p) => p < min ? p : min, longs[0]),
//            max_long: longs.reduce((max, p) => p > max ? p : max, longs[0])};
//   }
