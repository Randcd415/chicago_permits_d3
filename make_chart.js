function make_chart([map, permits, all_grouped_data]) {

var xDomain = all_grouped_data.reduce((acc, row) => {
return {
  min: Math.min(row.Demolition, acc.min),
  max: Math.max(row.Construction, acc.max)
};
}, {min: Infinity, max: -Infinity});

var x = d3.scaleLinear()
  .domain([xDomain.min, xDomain.max])
  .range([margin_chart.left, margin_chart.left + chart_plotWidth]);

var x_axis = d3.axisBottom(x)
   .tickValues([-500 - bar_gap, 500 + bar_gap, 1000 + bar_gap, 1500 + bar_gap, 2000 + bar_gap])
   .tickFormat(function(d, i){ if ( d > 0) return d - 125;
                               if (d < 0) return (d + 125) * -1});

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
