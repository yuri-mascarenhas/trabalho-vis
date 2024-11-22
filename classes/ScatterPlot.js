class ScatterPlot {
  constructor(selector, config, data) {
    this.selector = selector;
    this.config = config;
    this.data = data;
    this.width = config.width;
    this.height = config.height;
    this.svg = null;
    this.initChart();
  }

  initChart() {
    const { margin, labels } = this.config;

    // Create SVG and group
    this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    // Add axis groups
    this.xAxisGroup = this.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${this.height})`);

    this.yAxisGroup = this.svg.append("g").attr("class", "y-axis");

    // Add axis labels
    this.xAxisLabel = this.svg
      .append("text")
      .attr("class", "axis-label")
      .attr("x", this.width / 2)
      .attr("y", this.height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text(labels.x);

    this.yAxisLabel = this.svg
      .append("text")
      .attr("class", "axis-label")
      .attr("x", -this.height / 2)
      .attr("y", -(margin.left - 25))
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text(labels.y);
  }

  render() {
    const { colors, labels } = this.config;
    const tooltip = d3.select("#tooltip"); // Select the tooltip div

    const xKey = Object.keys(this.data[0])[0];
    const yKey = Object.keys(this.data[0])[1];

    this.x.domain([0, d3.max(this.data, (d) => d[xKey])]);
    this.y.domain([0, d3.max(this.data, (d) => d[yKey])]);

    // Update axes
    this.xAxisGroup.call(d3.axisBottom(this.x));
    this.yAxisGroup.call(d3.axisLeft(this.y));

    // Render points
    const points = this.svg.selectAll("circle").data(this.data);

    points
      .enter()
      .append("circle")
      .merge(points)
      .attr("cx", (d) => this.x(d[xKey]))
      .attr("cy", (d) => this.y(d[yKey]))
      .attr("r", 5)
      .attr("fill", colors.point || "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange"); // Highlight point
        tooltip
          .style("opacity", 1)
          .html(`<strong>${xKey}: ${d[xKey]}</strong><br>${yKey}: ${d[yKey]}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", colors.point || "steelblue"); // Reset point color
        tooltip.style("opacity", 0); // Hide tooltip
      });

    points.exit().remove();
  }

  update(newData, newLabels) {
    this.data = newData;

    if (newLabels) {
      this.config.labels = newLabels;
      this.xAxisLabel.text(newLabels.x || xKey);
      this.yAxisLabel.text(newLabels.y || yKey);
    }

    this.render();
  }
}
