class BarChart {
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
    // Convert data into array of objects
    const { margin, labels } = this.config;

    // SVG creation
    this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("width", this.width + margin.left + margin.top)
      .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    this.x = d3.scaleBand().range([0, this.width]).padding(0.2);
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

    this.x.domain(this.data.map((d) => d[xKey]));
    this.y.domain([0, d3.max(this.data, (d) => d[yKey])]);

    // Update axes
    const xAxis = this.xAxisGroup.call(d3.axisBottom(this.x));
    if (labels.x === "Product") {
      xAxis.selectAll("text").style("opacity", 0); // Hide tick text
    } else {
      xAxis.selectAll("text").style("opacity", 1); // Show tick text
    }

    this.yAxisGroup.call(d3.axisLeft(this.y));

    // Render bars
    const bars = this.svg.selectAll("rect").data(this.data);

    bars
      .enter()
      .append("rect")
      .merge(bars)
      .attr("x", (d) => this.x(d[xKey]))
      .attr("y", (d) => this.y(d[yKey]))
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => this.height - this.y(d[yKey]))
      .attr("fill", colors.bar)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange"); // Highlight bar
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d[xKey]}</strong><br>Value: ${d[yKey]}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", colors.bar); // Reset bar color
        tooltip.style("opacity", 0); // Hide tooltip
      });

    bars.exit().remove();
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
