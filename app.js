/**
 * Creates a D3.js chart with x/y axis, title, subtitle, and customizable colors.
 *
 * @param {Object} config - Configuration object for the chart.
 * @param {string} config.container - The CSS selector for the container element (e.g., '#chart').
 * @param {Array<Object>} config.data - Array of data objects to be visualized.
 * @param {string} config.xValue - The key name for accessing x values in the data objects.
 * @param {string} config.yValue - The key name for accessing y values in the data objects.
 * @param {string} config.xLabel - Label for the x-axis.
 * @param {string} config.yLabel - Label for the y-axis.
 * @param {string} config.title - The title of the chart.
 * @param {string} config.subtitle - The subtitle of the chart.
 * @param {Array<string>} config.colors - Array of colors for data points.
 * @param {Array<string>} config.description - Array of descriptions for each data point.
 */
function createChart({
  container,
  data,
  xValue,
  yValue,
  xLabel,
  yLabel,
  title,
  subtitle,
  colors,
  description,
}) {
  // Set the dimensions and margins of the chart
  const margin = { top: 60, right: 30, bottom: 120, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define the x and y scales
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d[xValue]), d3.max(data, (d) => d[xValue])])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d[yValue]), d3.max(data, (d) => d[yValue])])
    .range([height, 0]);

  // Create and append the x-axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("class", "axis-label")
    .style("text-anchor", "end")
    .text(xLabel);

  // Create and append the y-axis
  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("x", 0)
    .attr("y", -40)
    .attr("fill", "black")
    .attr("class", "axis-label")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .text(yLabel);

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("class", "title")
    .text(title);

  // Add subtitle
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0)
    .attr("class", "subtitle")
    .text(subtitle);

  // Draw data points (example for scatter plot)
  svg
    .selectAll(".point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", (d) => xScale(d[xValue]))
    .attr("cy", (d) => yScale(d[yValue]))
    .attr("r", 5)
    .attr("fill", (d, i) => colors[i % colors.length])
    .append("title")
    .text((d, i) => description[i % description.length]);

  // Optional: Add legend for colors if needed
  if (colors.length && description.length) {
    const legend = svg
      .append("g")
      .attr("transform", `translate(0, ${height + 40})`);

    colors.forEach((color, index) => {
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", index * 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);

      legend
        .append("text")
        .attr("x", 15)
        .attr("y", index * 20 + 10)
        .style("font-size", "12px")
        .text(description[index]);
    });
  }
}

// Example Usage:
/**
 * Example dataset for the chart.
 * @type {Array<{x: number, y: number}>}
 */
const data = [
  { x: 10, y: 20 },
  { x: 20, y: 30 },
  { x: 30, y: 40 },
  { x: 40, y: 50 },
];

// Call the createChart function with example data.
createChart({
  container: "#chart",
  data: data,
  xValue: "x",
  yValue: "y",
  xLabel: "X Axis Label",
  yLabel: "Y Axis Label",
  title: "My Chart Title",
  subtitle: "This is a subtitle",
  colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"],
  description: ["Data Point A", "Data Point B", "Data Point C", "Data Point D"],
});
