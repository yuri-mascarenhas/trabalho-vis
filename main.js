// Utils Functions
const loadData = async (file) => {
  const data = await d3.json(file);
  return data;
};

// Prepare Datasets
const prepareDatasets = (data) => {
  const salesByCategory = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.Sales),
      (d) => d.Category
    )
    .map(([category, sales]) => ({ category, sales }));

  const profitByCountry = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.Profit),
      (d) => d.Country
    )
    .map(([country, profit]) => ({ country, profit }));

  const top10Products = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.Sales),
      (d) => d["Product Name"]
    )
    .map(([productName, sales]) => ({ productName, sales }))
    .sort((a, b) => d3.descending(a.sales, b.sales))
    .slice(0, 10);

  return { salesByCategory, profitByCountry, top10Products };
};

// Main Function
const main = async () => {
  // Create configuration object and load data
  const margin = {
    top: 30,
    right: 20,
    bottom: 20,
    left: 80,
  };
  const colors = {
    bar: "steelblue",
  };
  let labels = {
    x: "X axis",
    y: "Y axis",
  };
  const config = new Config(500, 500, margin, colors, labels);
  let data = await loadData("./data/superstore.json");
  const datasets = prepareDatasets(data);

  // Create bar charts

  let barChart = new BarChart(".bar-charts", config, datasets.salesByCategory);

  // Render charts
  barChart.render();

  d3.select(".bar-selector")
    .append("select")
    .attr("id", "dataset-selector")
    .selectAll("option")
    .data([
      { label: "Sales by Category", value: "salesByCategory" },
      { label: "Profit by Country", value: "profitByCountry" },
      { label: "Top 10 Products by Sales", value: "top10Products" },
    ])
    .enter()
    .append("option")
    .attr("value", (d) => d.value)
    .text((d) => d.label);

  // Add event listener for dataset changes
  d3.select("#dataset-selector").on("change", (event) => {
    const selectedDataset = event.target.value;
    barChart.update(datasets[selectedDataset]);
  });
};

// MAIN EXECUTION
main();
