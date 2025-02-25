import { jsx as _jsx } from "react/jsx-runtime";
import { Chart as ChartJS, CategoryScale, LinearScale } from "chart.js";
import { BoxPlotController, BoxAndWhiskers, } from "chartjs-chart-box-and-violin-plot";
import { Chart } from "react-chartjs-2";
ChartJS.register(BoxPlotController, BoxAndWhiskers, CategoryScale, LinearScale);
const BarangayBoxplot = ({ barangay, data }) => {
    const chartData = {
        labels: ["Commodity", "Allocation", "High Value", "Farmer"],
        datasets: [
            {
                label: `Distribution for ${barangay}`,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
                outlierColor: "#999999",
                data: [
                    {
                        min: Math.min(...data.commodity),
                        q1: percentile(data.commodity, 25),
                        median: percentile(data.commodity, 50),
                        q3: percentile(data.commodity, 75),
                        max: Math.max(...data.commodity),
                    },
                    {
                        min: Math.min(...data.allocation),
                        q1: percentile(data.allocation, 25),
                        median: percentile(data.allocation, 50),
                        q3: percentile(data.allocation, 75),
                        max: Math.max(...data.allocation),
                    },
                    {
                        min: Math.min(...data.highValue),
                        q1: percentile(data.highValue, 25),
                        median: percentile(data.highValue, 50),
                        q3: percentile(data.highValue, 75),
                        max: Math.max(...data.highValue),
                    },
                    {
                        min: Math.min(...data.farmer),
                        q1: percentile(data.farmer, 25),
                        median: percentile(data.farmer, 50),
                        q3: percentile(data.farmer, 75),
                        max: Math.max(...data.farmer),
                    },
                ],
            },
        ],
    };
    return _jsx(Chart, { type: "boxplot", data: chartData });
};
// Helper function for percentile calculation
const percentile = (arr, p) => {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    if (Math.floor(index) === index)
        return sorted[index];
    const lower = sorted[Math.floor(index)];
    const upper = sorted[Math.ceil(index)];
    return lower + (upper - lower) * (index - Math.floor(index));
};
export default BarangayBoxplot;
