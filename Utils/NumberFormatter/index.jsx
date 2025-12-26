const NumberFormatter = (value) => {
  if (value === null || value === undefined) return "0";

  const num = Number(value);

  const units = [
    { limit: 1e18, suffix: "Qi" }, // Quintillion
    { limit: 1e15, suffix: "Qa" }, // Quadrillion
    { limit: 1e12, suffix: "T" }, // Trillion
    { limit: 1e9, suffix: "B" }, // Billion
    { limit: 1e6, suffix: "M" }, // Million
    { limit: 1e3, suffix: "K" }, // Thousand
  ];

  for (let unit of units) {
    if (num >= unit.limit) {
      return (num / unit.limit).toFixed(2).replace(/\.00$/, "") + unit.suffix;
    }
  }

  return num.toString();
};

export default NumberFormatter;
