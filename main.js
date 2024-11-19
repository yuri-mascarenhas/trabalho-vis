// Utils Functions
const loadData = async (file) => {
  const data = await d3.json(file);
  return data;
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
    bar: "red",
  };
  const config = new Config(500, 500, margin, colors);
  let data = await loadData("./data/superstore.json");

  // Create bar charts
  const salesByCategory = d3.rollup(
    data,
    (v) => d3.sum(v, (d) => d.Sales),
    (d) => d.Category
  );
  let bar1 = new BarChart(".bar-charts", config, salesByCategory);

  // Render charts
  bar1.render();
};

// MAIN EXECUTION
main();
