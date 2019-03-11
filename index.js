/* global d3 */

Promise.all([
  'chicago.geojson',
  'permits_res.geojson'
].map(url => fetch(url).then(data => data.json())))
  .then(data => myVis(data));

function myVis(data) {
const [map, permits] = data

const parseTime = d3.timeParse("%Y-%m-%d");
permits.features.forEach(function(d) {
    d.properties.ISSUE_DATE = parseTime(d.properties.ISSUE_DATE );
    d.properties.MONTH = d.properties.ISSUE_DATE.getMonth();
  });

permits.features.sort(function(x, y){
   return d3.ascending(x.properties.ISSUE_DATE, y.properties.ISSUE_DATE);
 });

// Create title
const title = d3.select('.title')
                .append("text")
                .attr("class", "title")
                .text("Building Permits in Chicago");

// Set Constants
const height = 700;
const width = 500;
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

// Create Slider (code adapted from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518)
// Range
  const sliderRange = d3.sliderBottom()
    .min(2006)
    .max(2019)
    .width(400)
    .tickFormat(d3.format("d"))
    .step(1)
    .ticks(14)
    .default([2006, 2019])
    .fill("grey")
    .on('onchange', val => {
      d3.select('p#value-range')
        .text(val.map(d3.format('d'))
        .join('-'));})
    .on("end", val => {
      year_updates(val);
      });

// this range function borrowedf from stack overflow: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration
function range(start, end, delta) {
  return Array.from(
    {length: (end - start) / delta}, (v, k) => (k * delta) + start
    )
  };

const gRange = d3
  .select('div#slider-range')
  .append('svg')
  .attr('width', 500)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(30,30)');

gRange.call(sliderRange);

d3.select('p#value-range')
  .text(
    sliderRange
      .value()
      .map(d3.format('d'))
      .join('-'))
  .attr('class', 'chart_label');

  // SET UP MAP STATICS
const svg_map = d3.select(".block_map").append("svg")
    .attr("width", width)
    .attr("height", height);

const g_map = svg_map.append("g")

const projection = d3.geoMercator()
     .fitSize([plotWidth + margin_map.left, plotHeight + margin_map.top], map);

const path = d3.geoPath()
    .projection(projection)
    .pointRadius(.7);

g_map.selectAll("path")
   .data(map.features)
   .enter()
   .append("path")
   .attr("d", path)
   .attr("class", "map");

   g_map.selectAll(".dot")
   .data(permits.features)
   .enter()
   .append('circle')
   .attr('class', 'dot')
   .attr("r", 1)
   .attr("opacity", 1)
   .attr('transform', d => `translate(${projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])})` )
   .attr('fill', d => color(d.properties.BUILD));

   g_map.append("circle")
      .attr('fill', "#00B28F")
      .attr('transform', `translate(${projection([-87.58, 41.87])})` )
      .attr("r", 5)
      .attr("opacity", .9);

   g_map.append("circle")
       .attr('fill', "#FF5416")
       .attr('transform', `translate(${projection([-87.58, 41.86])})` )
       .attr("r", 5)
       .attr("opacity", .9);

   g_map.append("text")
       .attr("class", "legend_text")
       .attr('transform', `translate(${projection([-87.57, 41.8565])})` )
       .text("Construction");

   g_map.append("text")
       .attr("class", "legend_text")
       .attr('transform', `translate(${projection([-87.57, 41.8665])})` )
       .text("Demolition");

// SET UP BAR CHART STATICS
const bar_gap = 125

const all_grouped_data = d3.nest()
     .key(function(d) {return d.properties.YEAR; })
     .key(function(d) {return d.properties.BUILD; })
     .entries(permits.features);

all_grouped_data.forEach(function(d) {
  d["Construction"] = d.values[0].values.length,
  d["Demolition"] = -1 * d.values[1].values.length;
  });

const xDomain = all_grouped_data.reduce((acc, row) => {
return {
  min: Math.min(row.Demolition, acc.min),
  max: Math.max(row.Construction, acc.max)
};
}, {min: Infinity, max: -Infinity});

const x = d3.scaleLinear()
  .domain([xDomain.min, xDomain.max])
  .range([margin_chart.left, margin_chart.left + chart_plotWidth]);

const x_axis = d3.axisBottom(x)
   .tickValues([-500 - bar_gap, 500 + bar_gap, 1000 + bar_gap, 1500 + bar_gap, 2000 + bar_gap])
   .tickFormat(function(d, i){ if ( d > 0) return d - 125;
                               if (d < 0) return (d + 125) * -1});

const svg_chart = d3.select(".block_chart").append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);

svg_chart.append('g')
  .call(x_axis)
  .attr('transform', `translate(0, ${chart_plotHeight})`);

// Slice and aggregate data at the year month level
   years = range(2006, 2019, 1);
   dict = {};
   bar_array= []
   for (y in years) {
     dict[years[y]] = {}
     for (m in range(0, 12, 1)) {
       dict[years[y]][m] = {};
       dict[years[y]][m]["features"] = permits.features.filter(function(feature) {
         return feature.properties.YEAR == years[y] && feature.properties.MONTH == m
       })
       dict[years[y]][m]["Construction"] = d3.nest()
            .key(function(d) {return d.properties.BUILD; })
            .entries(dict[years[y]][m]["features"])[0].values.length;
       dict[years[y]][m]["Demolition"] = d3.nest()
           .key(function(d) {return d.properties.BUILD; })
           .entries(dict[years[y]][m]["features"])[1].values.length
         };
     bar_array[years[y]] = dict[years[y]]
   };

 var y_scale = d3.scaleBand()
   .domain(years)
   .range([margin_chart.top, chart_plotHeight])
   .padding(0.1);


function year_updates(val) {

   years_iter = range(val[0], val[1] + 1, 1);
   var filtered_dict = {}
   var filtered_bar_array = []
   for (y in years_iter){
     filtered_dict[years_iter[y]] = dict[years_iter[y]];
   }

   var filtered_bar = all_grouped_data.filter(d => d.key >= val[0] && d.key  <= val[1]);

   g_map.selectAll(".dot").remove();

   const y_scale = d3.scaleBand()
     .domain(years_iter)
     .range([margin_chart.top, chart_plotHeight])
     .padding(0.1);

   svg_chart.selectAll('.rects_dem').remove()
   svg_chart.selectAll('.rects_con').remove()
   svg_chart.selectAll('.label').remove()
   svg_chart.selectAll('.chart_title').remove()
   svg_chart.selectAll('.chart_label').remove()

   const labels = svg_chart.selectAll('.label').data(years_iter);

   labels.enter()
     .append('text')
     .attr('class', 'chart_label')
     .attr('x', d => x(0))
     .attr('y', d => y_scale(d) + 14)
     .attr('text-anchor', 'middle')
     .attr('font-size', 13)
     .text(d => d);

   svg_chart.append("text")
     .attr("class", "chart_title")
     .attr("x", x(xDomain.min/2))
     .attr("y", 44)
     .attr('text-anchor', 'middle')
     .attr('font-size', 16)
     .text("Demolition");

   svg_chart.append("text")
     .attr("class", "chart_title")
     .attr("x", x(-xDomain.min/2))
     .attr("y", 44)
     .attr('text-anchor', 'middle')
     .attr('font-size', 16)
     .text("Construction");

     const rects_dem = svg_chart.selectAll('.rects_dem').data(filtered_bar);
     const rects_con = svg_chart.selectAll('.rects_con').data(filtered_bar);

     rects_dem.enter()
             .append('rect')
             .attr('class', 'rects_dem')
             .attr('width', d => x(-bar_gap) - x(d.Demolition))
             .attr('height', y_scale.bandwidth())
             .attr('x', d => x(d.Demolition))
             .attr('y', d => y_scale(d.key))
             .attr('fill', colorRange[1])
             .attr("opacity", 0.5);

     rects_con.enter()
             .append('rect')
             .attr('class', 'rects_con')
             .attr('width', d => x(d.Construction) - x(bar_gap))
             .attr('height', y_scale.bandwidth())
             .attr('x', d => x(bar_gap))
             .attr('y', d => y_scale(d.key))
             .attr('fill', colorRange[0])
             .attr("opacity", 0.5);

   var y = 0;
   var m = 0;

   function update_map(){

     // UPDATE MAP
     g_map.selectAll(".time_text").remove();

     g_map.append("text")
       .attr("class", "time_text")
       .attr('transform', `translate(${projection([-87.57, 42])})` )
       .text(`${years_iter[y]}`);

     g_map.append("g").selectAll(".dot")
       .data(dict[years_iter[y]][m]["features"])
       .enter()
       .append('circle')
       .attr('class', 'dot')
       .attr('transform', d => `translate(${projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])})` )
       .attr("r", 1.5)
       .attr("opacity",1)
       .attr('fill', d => color(d.properties.BUILD))
       .transition()
       .duration(500)
       .attr("opacity", .4)
       .attr("r", .8)

       m +=1
       if (m == 11){
         m = 0;
         y += 1;
       };
       if (y >= years_iter.length){
         clearInterval(iterator);
       }
    };
   iterator = setInterval(update_map, 100);
   }
}

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
