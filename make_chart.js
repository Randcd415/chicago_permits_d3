function make_chart([map, permits, all_grouped_data]) {

const xDomain = all_grouped_data.reduce((acc, row) => {
return {
  min: Math.min(row.Demolition, acc.min),
  max: Math.max(row.Construction, acc.max)
};
}, {min: Infinity, max: -Infinity});

var bar_gap = (xDomain.max - xDomain.min -((xDomain.max - xDomain.min) % 26)) / 26

var remainder_pos = xDomain.max % 300
var num_ticks_pos = (xDomain.max - remainder_pos) / 300
var remainder_neg = xDomain.min % 300
var num_ticks_neg = (xDomain.min - remainder_neg) / 300

var neg_axis = []
for (i = 0; i < (num_ticks_neg * -1) -1; i++) {
  neg_axis.push((i+1) * -300 - bar_gap);
}
var pos_axis = []
for (i = 0; i < num_ticks_pos -1; i++) {
  pos_axis.push((i+1) * 300 + bar_gap);
}

var tick_values = neg_axis.concat(pos_axis)

var x = d3.scaleLinear()
  .domain([xDomain.min, xDomain.max])
  .range([margin_chart.left, margin_chart.left + chart_plotWidth]);

var x_axis = d3.axisBottom(x)
   .tickValues(tick_values)
   .tickFormat(function(d, i){ if ( d > 0) return d - bar_gap;
                               if (d < 0) return (d + bar_gap) * -1});

var years = range(2006, 2019, 1);

var y_scale = d3.scaleBand()
 .domain(years)
 .range([margin_chart.top, chart_plotHeight])
 .padding(0.1);

svg_chart.append('g')
  .attr("class", "axis")
  .call(x_axis)
  .attr('transform', `translate(0, ${chart_plotHeight})`);

const labels = svg_chart.selectAll('.label').data(years);

labels.enter()
  .append('text')
  .attr('class', 'chart_label')
  .attr('x', d => x(0))
  .attr('y', d => y_scale(d) + (chart_plotHeight / years.length)/2)
  .attr('text-anchor', 'middle')
  .attr('font-size', 13)
  .text(d => d);

svg_chart.append("text")
  .attr("class", "chart_title")
  .attr("x", x(400))
  .attr("y", 44)
  .attr('text-anchor', 'middle')
  .attr('font-size', 16)
  .text("Demolition");

svg_chart.append("text")
  .attr("class", "chart_title")
  .attr("x", x(-400))
  .attr("y", 44)
  .attr('text-anchor', 'middle')
  .attr('font-size', 16)
  .text("Construction");

  const rects_dem = svg_chart.selectAll('.rects_dem').data(all_grouped_data);
  const rects_con = svg_chart.selectAll('.rects_con').data(all_grouped_data);

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
}
