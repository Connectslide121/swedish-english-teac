import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
}

export function BarChart({ data, height = 300, xLabel, yLabel }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = containerRef.current.clientWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'var(--popover)')
      .style('color', 'var(--popover-foreground)')
      .style('border', '1px solid var(--border)')
      .style('border-radius', '0.375rem')
      .style('padding', '0.5rem 0.75rem')
      .style('font-size', '0.875rem')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)');

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 5])
      .nice()
      .range([innerHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', 'var(--foreground)');

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--foreground)');

    g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label) || 0)
      .attr('y', d => y(d.value ?? 0))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.value ?? 0))
      .attr('fill', d => d.color || 'var(--chart-neutral)')
      .attr('opacity', 0.9)
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 1);
        tooltip
          .style('visibility', 'visible')
          .html(`<div style="max-width: 300px;"><strong>${d.label}</strong><br/>Value: ${d.value.toFixed(2)}</div>`);
      })
      .on('mousemove', function(event) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const tooltipX = event.clientX - containerRect.left + 10;
        const tooltipY = event.clientY - containerRect.top - 40;
        
        tooltip
          .style('top', `${tooltipY}px`)
          .style('left', `${tooltipX}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 0.9);
        tooltip.style('visibility', 'hidden');
      });

    if (xLabel) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'var(--muted-foreground)')
        .text(xLabel);
    }

    if (yLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'var(--muted-foreground)')
        .text(yLabel);
    }

  }, [data, height, xLabel, yLabel]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef}></svg>
    </div>
  );
}
