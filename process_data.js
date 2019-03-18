function process_data(data) {

  const [map, permits, neighborhoods, waterways] = data

  permits.features.forEach(function(d) {
      d.properties.ISSUE_DATE = parseTime(d.properties.ISSUE_DATE );
      d.properties.MONTH = d.properties.ISSUE_DATE.getMonth();
    });

  permits.features.sort(function(x, y){
     return d3.ascending(x.properties.ISSUE_DATE, y.properties.ISSUE_DATE);
   });

  const all_grouped_data = d3.nest()
        .key(function(d) {return d.properties.YEAR; })
        .key(function(d) {return d.properties.BUILD; })
        .entries(permits.features);

  all_grouped_data.forEach(function(d) {
   d["Construction"] = d.values[0].values.length,
   d["Demolition"] = -1 * d.values[1].values.length;
   });

   const projection = d3.geoMercator()
      .fitSize([plotWidth + margin_map.left, plotHeight + margin_map.top], map);

   const path = d3.geoPath()
     .projection(projection)
     .pointRadius(.7);

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
    }

  return ([map, permits, neighborhoods, waterways, projection, path, all_grouped_data, dict]);
}
