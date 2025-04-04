import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
  { name: "SolarCells", amount: 4890 },
  { name: "Glass", amount: 2103 },
  { name: "JunctionBox", amount: 2050 },
  { name: "Adhesive", amount: 1300 },
  { name: "BackSheet", amount: 1100 },
  { name: "Frame", amount: 700 },
  { name: "Encapsulant", amount: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BF5", "#F55B5B", "#34D399"];

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-12 items-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-700 dark:text-gray-300">Variant:</p>
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60} // Convierte el gráfico en una dona
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${new Intl.NumberFormat("us").format(value)}`} />
          <Legend />
        </PieChart>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-700 dark:text-gray-300">Variant: `pie`</p>
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100} // Gráfico de pastel (sin innerRadius)
            fill="#82ca9d"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${new Intl.NumberFormat("us").format(value)}`} />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default Dashboard;