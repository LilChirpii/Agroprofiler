import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface PieChartProps {
    data: { name: string; value: number }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (svgRef.current && data) {
            const svg = d3.select(svgRef.current);
            const width = svgRef.current.clientWidth;
            const height = svgRef.current.clientHeight;
            const radius = Math.min(width, height) / 2;
            const color = d3.scaleOrdinal(d3.schemeCategory10);
            const tooltip = d3
                .select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.selectAll("*").remove(); // Clear previous contents

            const pie = d3
                .pie<{ name: string; value: number }>()
                .value((d) => d.value);

            const arc = d3
                .arc<d3.PieArcDatum<{ name: string; value: number }>>()
                .outerRadius(radius - 10)
                .innerRadius(0);

            const labelArc = d3
                .arc<d3.PieArcDatum<{ name: string; value: number }>>()
                .outerRadius(radius - 40)
                .innerRadius(radius - 40);

            const g = svg
                .append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            const arcs = g
                .selectAll(".arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc");

            arcs.append("path")
                .attr("d", arc)
                .style("fill", (d) => color(d.data.name))
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip
                        .html(`${d.data.name}: ${d.data.value}`)
                        .style("left", `${event.pageX + 5}px`)
                        .style("top", `${event.pageY - 28}px`);
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .style("opacity", 0.7);
                })
                .on("mouseout", (event) => {
                    tooltip.transition().duration(500).style("opacity", 0);
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .style("opacity", 1);
                })
                .on("click", (event, d) => {
                    alert(`You clicked on ${d.data.name}`);
                });

            arcs.append("text")
                .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text((d) => d.data.name);

            // Add a legend
            // const legend = g
            //     .append("g")
            //     .attr("transform", `translate(${radius},${-height / 200})`);

            // legend
            //     .selectAll("rect")
            //     .data(color.domain())
            //     .enter()
            //     .append("rect")
            //     .attr("x", 0)
            //     .attr("y", (d, i) => i * 20)
            //     .attr("width", 18)
            //     .attr("height", 18)
            //     .style("fill", color);

            // legend
            //     .selectAll("text")
            //     .data(color.domain())
            //     .enter()
            //     .append("text")
            //     .attr("x", 30)
            //     .attr("y", (d, i) => i * 20 + 9)
            //     .attr("dy", ".35em")
            //     .style("text-anchor", "start")
            //     .text((d) => d);
        }
    }, [data]);

    return (
        <div>
            <svg
                ref={svgRef}
                width="100%"
                height="250"
                style={{ border: "none", borderRadius: "5px" }}
            >
                {/* SVG content will be added by D3 */}
            </svg>
            <style>
                {`
                    .tooltip {
                        position: absolute;
                        text-align: center;
                        padding: 5px;
                        font-size: 12px;
                        background: lightsteelblue;
                        border-radius: 5px;
                        pointer-events: none;
                    }
                `}
            </style>
        </div>
    );
};

export default PieChart;
