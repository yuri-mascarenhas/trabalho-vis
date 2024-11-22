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
      .attr("class", "x-axis-label")
      .attr("x", this.width / 2)
      .attr("y", this.height + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .text(labels.x);

    this.yAxisLabel = this.svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("x", -this.height / 2)
      .attr("y", -margin.left + 10)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text(labels.y);
  }

  render() {
    const { colors } = this.config;

    // Render bars using aggregated data
    this.svg
      .selectAll("rect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("x", (d) => {
        const xVal = this.x(d.category);
        return xVal;
      })
      .attr("y", (d) => {
        const yVal = this.y(d.sales);
        return yVal;
      })
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => {
        const heightVal = this.height - this.y(d.sales);
        return heightVal;
      })
      .attr("fill", colors.bar);
  }

  update(newData) {
    this.data = newData;
    this.render();
  }
}
