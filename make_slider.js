function make_slider([map, permits, path, projection, all_grouped_data, dict]) {
// Create Slider (code adapted from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518)
const sliderRange = d3.sliderBottom()
  .min(2006)
  .max(2018)
  .width(400)
  .tickFormat(d3.format("d"))
  .step(1)
  .ticks(14)
  .default([2006, 2018])
  .fill("grey")
  .on('onchange', val => {
    d3.select('p#value-range')
      .text(val.map(d3.format('d'))
      .join('-'));})
  .on("end", val => {
    var years_iter = range(val[0], val[1] + 1, 1);
    var filtered_permits = permits.features.filter(function(feature) {
       return feature.properties.YEAR >= val[0] && feature.properties.YEAR <= val[1]
     })
    var filtered_bar = all_grouped_data.filter(d => d.key >= val[0] && d.key  <= val[1]);
    range_update([path, projection, years_iter, filtered_permits, filtered_bar]);
    // animate([path, projection, years_iter, dict])
    window.years_iter = years_iter;
    });

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
}
