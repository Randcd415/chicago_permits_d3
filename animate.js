function animate([projection, path, dict]) {

  const animate = d3.select('.buttons')
          .append("button")
          .attr("class", "timelapse")
          .text("Monthly Timelapse")
          .on('click', function(){

            var filtered_dict = {}
            var filtered_bar_array = []
            var months_iter = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            for (y in years_iter){
              filtered_dict[years_iter[y]] = dict[years_iter[y]];
            }
            var y = 0;
            var m = 0;
            g_map.selectAll(".dot").remove();

            function update_map(){

              // UPDATE MAP
              g_map.selectAll(".time_text").remove();

              g_map.append("text")
                .attr("class", "time_text")
                .attr('transform', `translate(${projection([-87.64, 42])})` )
                .text(`${months_iter[0]}` + " " + `${years_iter[0]}` + " - " + `${months_iter[m]}`);

              g_map.append("text")
                .attr("class", "time_text")
                .attr('transform', `translate(${projection([-87.526, 42])})` )
                .text(`${years_iter[y]}`);

              g_map.append("g").selectAll(".dot")
                .data(filtered_dict[years_iter[y]][m]["features"])
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('transform', d => `translate(${projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])})` )
                .attr("r", 2)
                .attr('fill', d => color(d.properties.BUILD))
                .attr("opacity",1)
                .transition()
                .duration(1000)
                .attr("opacity", .4)
                .attr("r", .9)

                m +=1
                if (m == 12){
                  m = 0;
                  y += 1;
                };
                if (y >= years_iter.length){
                  clearInterval(iterator);
                }
             };
            iterator = setInterval(update_map, 300);
          });
}
