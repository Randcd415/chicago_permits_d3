// SET UP MAP STATICS
function make_map([map, permits, neighborhoods, waterways, projection, path]) {

spinner.stop();

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

g_map.selectAll("waterways")
.data(waterways.features)
.enter()
.append("path")
.attr("d", path)
.attr("class", "waterways");

 g_map.selectAll("neighborhoods")
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
    .duration(1000)
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

 d3.select('#text1').append("text")
   .attr("dy", "0em")
   .text("A city is not static. Chicago's neighborhoods are continually remade in the image of people moving in, or people left behind. As tides of investment ebb and flow, these patterns can be divined through residential building permits.")

 d3.select('#text2').append("text")
  .attr("dy", "1em")
  .text("In Chicago's Northwest Side, hundreds of new homes are built in burgeoning neighborhoods such as Wicker Park and Logan Square. In Northside neighborhoods like Lake View, homes are torn down and replaced.")

  d3.select('#text3').append("text")
   .attr("dy", "1em")
   .text("For Southside neighborhoods like Englewood, the dominant trend is demolition. Hundreds of buildings, often vacant and deemed unsafe or magnets for crime, are torn down, with little new investment afterwards.")
}
