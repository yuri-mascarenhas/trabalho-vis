class BarChart {
  constructor(selector, config, data) {
    this.selector = selector;
    this.config = config;
    this.data = data;
    this.svg = null;
    this.initChart();
  }

  initChart() {
    this.aggregatedData = Array.from(this.data, ([category, sales]) => ({
      category,
      sales,
    }));
    console.log("Aggregated Data:", this.aggregatedData);

    this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr(
        "width",
        this.config.width + this.config.margin.left + this.config.margin.top
      )
      .attr(
        "height",
        this.config.height + this.config.margin.top + this.config.margin.bottom
      )
      .append("g")
      .attr(
        "transform",
        `translate(${this.config.margin.left}, ${this.config.margin.top})`
      );

    this.x = d3
      .scaleBand()
      .domain(this.aggregatedData.map((d) => d.category))
      .range([0, this.width])
      .padding(0.2);
    this.y = d3
      .scaleLinear()
      .domain([0, d3.max(this.aggregatedData, (d) => d.sales)])
      .range([this.height, 0]);
    console.log("X scale domain:", this.x.domain()); // Debug: Check x scale domain
    console.log("Y scale domain:", this.y.domain()); // Debug: Check y scale domain
    // X axis
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x));
    // Y axis
    this.svg.append("g").call(d3.axisLeft(this.y));
  }

  render() {
    this.svg
      .selectAll("rect")
      .data(this.aggregatedData)
      .enter()
      .append("rect")
      .attr("x", (d) => {
        const xVal = this.x(d.category); // Check the value of x(d.category)
        console.log("X value:", xVal); // Debug: Check the calculated x value
        return xVal;
      })
      .attr("y", (d) => {
        const yVal = this.y(d.sales); // Check the value of y(d.sales)
        console.log("Y value:", yVal); // Debug: Check the calculated y value
        return yVal;
      })
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => this.height - this.y(d.sales))
      .attr("fill", this.config.colors.bar);
  }
}
