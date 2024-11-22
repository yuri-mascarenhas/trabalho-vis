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

    const xKey = Object.keys(this.data[0])[0];
    const yKey = Object.keys(this.data[0])[1];

    this.x.domain(this.data.map((d) => d[xKey]));
    this.y.domain([0, d3.max(this.data, (d) => d[yKey])]);

    // Update axes
    this.xAxisGroup.call(d3.axisBottom(this.x));
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
      .attr("fill", colors.bar);

    // Remove any extra bars
    bars.exit().remove();
  }
}
