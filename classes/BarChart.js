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
    this.aggregatedData = Array.from(this.data, ([category, sales]) => ({
      category,
      sales,
    }));

    const { margin } = this.config;

    // SVG creation
    this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("width", this.width + margin.left + margin.top)
      .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    this.x = d3
      .scaleBand()
      .domain(this.aggregatedData.map((d) => d.category))
      .range([0, this.width])
      .padding(0.2);

    this.y = d3
      .scaleLinear()
      .domain([0, d3.max(this.aggregatedData, (d) => d.sales)])
      .range([this.height, 0]);
    // Draw x-axis
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x));

    // Draw y-axis
    this.svg.append("g").call(d3.axisLeft(this.y));
  }

  render() {
    const { colors } = this.config;

    // Render bars using aggregated data
    this.svg
      .selectAll("rect")
      .data(this.aggregatedData)
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
}
