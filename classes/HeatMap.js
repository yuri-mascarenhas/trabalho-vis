class HeatMap {
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
    this.x = d3.scaleBand().range([0, this.width]).padding(0.05);
    this.y = d3.scaleBand().range([0, this.height]).padding(0.05);
    this.colorScale = d3.scaleSequential(d3.interpolateBlues); // Default color scale

    // Add axis groups
    this.xAxisGroup = this.svg.append("g").attr("class", "x-axis");
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
    const tooltip = d3.select("#tooltip");

    const xKey = Object.keys(this.data[0])[0];
    const yKey = Object.keys(this.data[0])[1];
    const valueKey = Object.keys(this.data[0])[2];

    // Update scales
    this.x.domain([...new Set(this.data.map((d) => d[xKey]))]);
    this.y.domain([...new Set(this.data.map((d) => d[yKey]))]);
    this.colorScale.domain([0, d3.max(this.data, (d) => d[valueKey])]);

    // Update axes
    this.xAxisGroup
      .call(d3.axisBottom(this.x).tickSize(0))
      .selectAll("text")
      .attr("transform", "translate(0, -10)")
      .style("text-anchor", "middle");
    this.xAxisGroup.selectAll("path, line").style("display", "none");

    this.yAxisGroup.call(d3.axisLeft(this.y).tickSize(0));
    this.yAxisGroup.selectAll("path, line").style("display", "none");

    // Render cells
    const cells = this.svg.selectAll("rect").data(this.data);

    cells
      .enter()
      .append("rect")
      .merge(cells)
      .attr("x", (d) => this.x(d[xKey]))
      .attr("y", (d) => this.y(d[yKey]))
      .attr("width", this.x.bandwidth())
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => this.colorScale(d[valueKey]))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2); // Highlight cell
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${xKey}: ${d[xKey]}</strong><br><strong>${yKey}: ${d[yKey]}</strong><br>Value: ${d[valueKey]}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none");
        tooltip.style("opacity", 0);
      });

    cells.exit().remove();

    // Update axis labels
    this.xAxisLabel.text(labels.x || xKey);
    this.yAxisLabel.text(labels.y || yKey);
  }

  update(newData, newLabels) {
    this.data = newData;

    if (newLabels) {
      this.config.labels = newLabels;
      this.xAxisLabel.text(newLabels.x || Object.keys(this.data[0])[0]);
      this.yAxisLabel.text(newLabels.y || Object.keys(this.data[0])[1]);
    }

    this.render();
  }
}
