// Other functions
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNumber = Math.ceil(((d - week1) / 86400000 + 1) / 7);
  return weekNumber;
}

function parseDate(dateString) {
  const parts = dateString.split("-");
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
}

// Prepare data functions
const loadData = async (file) => {
  const data = await d3.json(file);
  return data;
};

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
    .map(([country, profit]) => ({ country, profit }))
    .sort((a, b) => d3.descending(a.profit, b.profit))
    .slice(0, 10);

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

const prepareScatterDatasets = (data) => {
  const profitBySale = data
    .map((d) => ({ sales: d.Sales, profit: d.Profit }))
    .sort((a, b) => d3.descending(a.profit, b.profit))
    .slice(0, 300);

  const salesProfitMargin = data
    .filter((d) => d.Sales > 0 && d.Profit > 0)
    .map((d) => ({
      profitMargin: d.Profit / d.Sales,
      sales: d.Sales,
    }))
    .sort((a, b) => d3.descending(a.sales, b.sales))
    .slice(0, 300);

  const highProfitShippingCost = data
    .filter((d) => d.Profit > 50 && d["Shipping Cost"] > 0)
    .map((d) => ({ shippingCost: d["Shipping Cost"], profit: d.Profit }))
    .sort((a, b) => d3.descending(a.profit, b.profit))
    .slice(0, 300);

  return { profitBySale, salesProfitMargin, highProfitShippingCost };
};

const prepareHeatDatasets = (data) => {
  const sumSalesRegionCategory = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.Sales),
      (d) => d.Region,
      (d) => d.Category
    )
    .map(([region, categories]) =>
      categories.map(([category, sales]) => ({
        region,
        category,
        sales,
      }))
    )
    .flat();

  const dailySales = data
    .map((d) => {
      const date = parseDate(d["Order Date"]);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return {
        day,
        month,
        sales: d.Sales,
      };
    })
    .reduce((acc, d) => {
      const key = `${d.month}-${d.day}`;
      if (!acc[key]) {
        acc[key] = { sales: 0 };
      }
      acc[key].sales += d.sales;
      return acc;
    }, {});

  const formattedDailySales = Array.from({ length: 12 }, (_, monthIndex) => {
    return Array.from({ length: 31 }, (_, dayIndex) => {
      const day = dayIndex + 1;
      const month = monthIndex + 1;

      const key = `${month}-${day}`;
      const sales = dailySales[key] ? dailySales[key].sales : 0;

      return { day, month, sales };
    });
  }).flat();

  const monthlySales = data
    .map((d) => {
      const date = parseDate(d["Order Date"]);
      const month = date.getMonth();
      const quarter = Math.floor(month / 3);
      return {
        month: (month % 3) + 1,
        quarter,
        sales: d.Sales,
      };
    })
    .reduce((acc, d) => {
      const key = `${d.quarter}-${d.month}`;
      if (!acc[key]) {
        acc[key] = { sales: 0 };
      }
      acc[key].sales += d.sales;
      return acc;
    }, {});

  const formattedMonthlySales = Array.from({ length: 4 }, (_, quarterIndex) => {
    return Array.from({ length: 3 }, (_, monthIndex) => {
      const month = monthIndex + 1;
      const quarter = quarterIndex;

      const key = `${quarter}-${month}`;
      const sales = monthlySales[key] ? monthlySales[key].sales : 0;

      return { month, quarter: quarter + 1, sales };
    });
  }).flat();

  return {
    sumSalesRegionCategory,
    dailySales: formattedDailySales,
    monthlySales: formattedMonthlySales,
  };
};

// Get label functions

const getLabel = (dataset) => {
  switch (dataset) {
    case "profitByCountry":
      return {
        x: "Country",
        y: "Profit",
      };
    case "top10Products":
      return {
        x: "Product",
        y: "Sales",
      };
    default:
      return {
        x: "Categories",
        y: "Sales",
      };
  }
};

const getScatterLabel = (dataset) => {
  switch (dataset) {
    case "salesProfitMargin":
      return {
        x: "Profit Margin",
        y: "Sales",
      };
    case "highProfitShippingCost":
      return {
        x: "Shipping Cost",
        y: "Profit",
      };
    default:
      return {
        x: "Profit",
        y: "Sales",
      };
  }
};

const getHeatLabel = (dataset) => {
  switch (dataset) {
    case "dailySales":
      return {
        x: "Day of Month",
        y: "Month of Year",
      };
    case "monthlySales":
      return {
        x: "Month of Quarter",
        y: "Quarter of Year",
      };
    default:
      return {
        x: "Region",
        y: "Category",
      };
  }
};

// Main Function
const main = async () => {
  // Create configuration object and load data
  const margin = {
    top: 50,
    right: 30,
    bottom: 60,
    left: 100,
  };
  const colors = {
    bar: "steelblue",
  };
  let labels = getLabel("default");
  let scatterLabels = getScatterLabel("default");
  let heatLabels = getHeatLabel("default");
  const config = new Config(800, 600, margin, colors, labels);
  const scatterConfig = new Config(800, 600, margin, colors, scatterLabels);
  const heatConfig = new Config(800, 600, margin, colors, heatLabels);

  let data = await loadData("./data/superstore.json");
  const datasets = prepareDatasets(data);
  const scatterDatasets = prepareScatterDatasets(data);
  const heatDatasets = prepareHeatDatasets(data);

  // Create charts
  let barChart = new BarChart(".bar", config, datasets.salesByCategory);
  let scatterPlot = new ScatterPlot(
    ".scatter",
    scatterConfig,
    scatterDatasets.profitBySale
  );
  let heatMap = new HeatMap(
    ".heat",
    heatConfig,
    heatDatasets.sumSalesRegionCategory
  );

  // Render
  barChart.render();
  scatterPlot.render();
  heatMap.render();

  // Seletors
  d3.select(".bar-selector")
    .append("select")
    .attr("id", "bar-selector")
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

  d3.select(".scatter-selector")
    .append("select")
    .attr("id", "scatter-selector")
    .selectAll("option")
    .data([
      { label: "Profit by Sale", value: "profitBySale" },
      { label: "Sales by Profit Margin", value: "salesProfitMargin" },
      {
        label: "(High) Profit by Shipping Cost",
        value: "highProfitShippingCost",
      },
    ])
    .enter()
    .append("option")
    .attr("value", (d) => d.value)
    .text((d) => d.label);

  d3.select(".heat-selector")
    .append("select")
    .attr("id", "heat-selector")
    .selectAll("option")
    .data([
      {
        label: "Sales sum by Category/Region",
        value: "sumSalesRegionCategory",
      },
      {
        label: "Daily Sales",
        value: "dailySales",
      },
      {
        label: "Monthly Sales",
        value: "monthlySales",
      },
    ])
    .enter()
    .append("option")
    .attr("value", (d) => d.value)
    .text((d) => d.label);

  // Event listener for dataset changes
  d3.select("#bar-selector").on("change", (event) => {
    const selectedDataset = event.target.value;
    labels = getLabel(selectedDataset);
    barChart.update(datasets[selectedDataset], labels);
  });

  d3.select("#scatter-selector").on("change", (event) => {
    const selectedDataset = event.target.value;
    scatterLabels = getScatterLabel(selectedDataset);
    scatterPlot.update(scatterDatasets[selectedDataset], scatterLabels);
  });

  d3.select("#heat-selector").on("change", (event) => {
    const selectedDataset = event.target.value;
    heatLabels = getHeatLabel(selectedDataset);
    heatMap.update(heatDatasets[selectedDataset], heatLabels);
  });
};

// MAIN EXECUTION
main();
