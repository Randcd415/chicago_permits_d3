// SET UP MAP STATICS
function make_map([map, permits, neighborhoods, projection, path]) {

console.log(neighborhoods.features[1].properties.Name);

g_map.selectAll("path")
 .data(map.features)
 .enter()
 .append("path")
 .attr("d", path)
 .attr("class", "map");

// tooltip borrowed from https://bl.ocks.org/tiffylou/88f58da4599c9b95232f5c89a6321992
var tooltip = d3.select(".block_map").append("div")
       .attr("class", "tooltip")
       .style("opacity", 0);

 g_map.selectAll("path")
  .data(neighborhoods.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("class", "neighborhoods")
  .on("mouseover", d => {
        tooltip.transition()
               .duration(200)
               .style("opacity", 1);
        tooltip.html(d.properties.Name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px")
        .style("text-anchor", "middle");
  })
  .on("mouseout", d => {
    tooltip.transition()
    .duration(500)
    .style("opacity", 0);
  })

 g_map.selectAll(".dot")
 .data(permits.features)
 .enter()
 .append('circle')
 .attr('class', 'dot')
 .attr("r", .9)
 .attr("opacity", .4)
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

  }
