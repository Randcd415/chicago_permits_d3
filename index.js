/* global d3 */

//SET CONSTANTS
const height = 700;
const width = 500;
// const height = document.getElementById("block_map").clientHeight;
// const width = document.getElementById("block_map").clientWidth;
const margin_map = {top: 50, left: 100, right: 50, bottom: 50};
const plotWidth = width - margin_map.left - margin_map.right;
const plotHeight = height - margin_map.bottom - margin_map.top;
const chart_height = 400;
const chart_width = 500;
const margin_chart = {top: 50, left: 50, right: 50, bottom: 50};
const chart_plotWidth = chart_width - margin_chart.left - margin_chart.right;
const chart_plotHeight = chart_height - margin_chart.bottom - margin_chart.top;
const colorRange = ["#00B28F", "#FF5416"];
const color = d3.scaleOrdinal().domain([0,1]).range(colorRange);

const title = d3.select('.title')
                .append("text")
                .attr("class", "title")
                .text("Building Permits in Chicago");

const parseTime = d3.timeParse("%Y-%m-%d");

const svg_map = d3.select(".block_map").append("svg")
  .attr("width", width)
  .attr("height", height);

const g_map = svg_map.append("g")

const svg_chart = d3.select(".block_chart").append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);

const bar_gap = 125

// this range function borrowed from stack overflow: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration
function range(start, end, delta) {
  return Array.from(
    {length: (end - start) / delta}, (v, k) => (k * delta) + start
    )
  };

Promise.all([
  'chicago.geojson',
  'permits_res.geojson',
  'neighborhoods.geojson'
].map(url => fetch(url).then(data => data.json())))
  .then(data =>{
        return process_data(data);
  })
  .then(([map, permits, neighborhoods, projection, path, all_grouped_data, dict]) => {
        make_map([map, permits, neighborhoods, projection, path]);
        make_chart([map, permits, all_grouped_data]);
        make_slider([map, permits, path, projection, all_grouped_data, dict])
        animate([projection, path, dict]);
   });













// THIS IS THE AGGREGATE THE NESTED ARRAY INTO A CUMULATIVE SUM

// for (var i=1; i<all_month_grouped_data.length; i++) {
//   for (var z=0; z<all_month_grouped_data[i].values.length; z++) {
//    all_month_grouped_data[i].values[z]["Cons_Cum"] = all_month_grouped_data[i-1].values[z].values[0] + all_month_grouped_data[i].values[z].values[0]
//   }
// }

// THIS IS TO TAKE CARE OF THE TRUE VS FALSE ISSUE

// all_grouped_data.forEach(function(d) {
//   if (d.values[0].key == "true") {
//     d["Construction"] = d.values[0].values.length;
//     d["Demolition"] = d.values[1].values.length;
//     } else {
//       d["Construction"] = d.values[1].values.length;
//       d["Demolition"] = d.values[0].values.length;
//     })

// THIS IS THE START OF FIGURING OUT BAR CHART

// const all_month_grouped_data = d3.nest()
//     .key(function(d) {return d.properties.YEAR;})
//     .key(function(d) {return d.properties.MONTH;})
//     .key(function(d) {return d.properties.BUILD;})
//     .rollup(function(d) {return d.length;})
//     .entries(permits.features);
