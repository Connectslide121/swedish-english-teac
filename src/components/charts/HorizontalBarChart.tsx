import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HorizontalBarChartProps {
  data: { category: string; value: number; count?: number }[];
  height?: number;
  valueLabel?: string;
  showBaseline?: boolean;
  baselineValue?: number;
}

export function HorizontalBarChart({ 
  data, 
  height = 400, 
  valueLabel,
  showBaseline = false,
  baselineValue = 0,
}: HorizontalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const margin = { top: 20, right: 60, bottom: 40, left: 150 };
    const width = containerRef.current.clientWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.2);

    const maxAbs = d3.max(data, d => Math.abs(d.value)) || 1;
    const x = d3.scaleLinear()
      .domain([-maxAbs, maxAbs])
      .nice()
      .range([0, innerWidth]);

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--foreground)');

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--foreground)');

    if (showBaseline) {
      g.append('line')
        .attr('x1', x(baselineValue))
        .attr('x2', x(baselineValue))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--muted-foreground)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4');
    }

    g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => (d.value ?? 0) >= 0 ? x(0) : x(d.value ?? 0))
      .attr('y', d => y(d.category) || 0)
      .attr('width', d => Math.abs(x(d.value ?? 0) - x(0)))
      .attr('height', y.bandwidth())
      .attr('fill', d => (d.value ?? 0) >= 0 ? 'var(--chart-challenge)' : 'var(--chart-support)')
      .attr('opacity', 0.8)
      .on('mouseenter', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 0.8);
      });

    g.selectAll('.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', d => (d.value ?? 0) >= 0 ? x(d.value ?? 0) + 5 : x(d.value ?? 0) - 5)
      .attr('y', d => (y(d.category) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.value ?? 0) >= 0 ? 'start' : 'end')
      .style('font-size', '11px')
      .style('fill', 'var(--foreground)')
      .text(d => {
        const valText = (d.value ?? 0).toFixed(2);
        return d.count !== undefined ? `${valText} (n=${d.count})` : valText;
      });

    if (valueLabel) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'var(--muted-foreground)')
        .text(valueLabel);
    }

  }, [data, height, valueLabel, showBaseline, baselineValue]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef}></svg>
    </div>
  );
}
