function range_update([path, projection, years_iter, filtered_permits, filtered_bar]) {

   g_map.selectAll(".dot").remove();

   g_map.selectAll(".time_text").remove();

   // g_map.append("text")
   //   .attr("class", "time_text")
   //   .attr('transform', `translate(${projection([-87.65, 42])})` )
   //   .text("Jan " + `${years_iter[0]}` + " - Dec " + `${years_iter[years_iter.length - 1]}`);

   g_map.append("g").selectAll(".dot")
     .data(filtered_permits)
     .enter()
     .append('circle')
     .attr('class', 'dot')
     .attr('transform', d => `translate(${projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])})` )
     .attr('fill', d => color(d.properties.BUILD))
     .attr("r", .9)
     .attr("opacity",.4)

     var y_scale = d3.scaleBand()
       .domain(years_iter)
       .range([margin_chart.top, chart_plotHeight])
       .padding(0.1);

   svg_chart.selectAll('.rects_dem').remove()
   svg_chart.selectAll('.rects_con').remove()
   svg_chart.selectAll('.label').remove()
   svg_chart.selectAll('.chart_title').remove()
   svg_chart.selectAll('.chart_label').remove()
   svg_chart.selectAll('.axis').remove()


   const xDomain = filtered_bar.reduce((acc, row) => {
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

   const labels = svg_chart.selectAll('.label').data(years_iter);

   svg_chart.append('g')
     .attr("class", "axis")
     .call(x_axis)
     .attr('transform', `translate(0, ${chart_plotHeight})`);

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
     .attr("x", x(-400))
     .attr("y", 44)
     .attr('text-anchor', 'middle')
     .attr('font-size', 16)
     .text("Demolition");

   svg_chart.append("text")
     .attr("class", "chart_title")
     .attr("x", x(400))
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
   }
