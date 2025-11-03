import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HorizontalBarChartProps {
  data: { category: string; value: number; count?: number }[];
  height?: number;
  valueLabel?: string;
  showBaseline?: boolean;
  baselineValue?: number;
  chartType?: 'support' | 'challenge';
}

export function HorizontalBarChart({ 
  data, 
  height = 400, 
  valueLabel,
  showBaseline = false,
  baselineValue = 0,
  chartType = 'support',
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
      .attr('fill', d => {
        if (chartType === 'support') {
          return (d.value ?? 0) >= 0 ? 'var(--chart-support)' : 'var(--chart-challenge)';
        } else {
          return (d.value ?? 0) >= 0 ? 'var(--chart-challenge)' : 'var(--chart-support)';
        }
      })
      .attr('opacity', 0.8)
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 1);
        const direction = (d.value ?? 0) >= 0 
          ? (chartType === 'support' ? 'Higher support adaptation' : 'Higher challenge adaptation')
          : (chartType === 'support' ? 'Lower support adaptation' : 'Lower challenge adaptation');
        const countText = d.count !== undefined ? `<br/>Responses: ${d.count}` : '';
        tooltip
          .style('visibility', 'visible')
          .html(`<div style="max-width: 350px;"><strong>${d.category}</strong><br/>Difference: ${(d.value ?? 0) >= 0 ? '+' : ''}${d.value.toFixed(2)}<br/><em>${direction}</em>${countText}</div>`);
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
        d3.select(this).attr('opacity', 0.8);
        tooltip.style('visibility', 'hidden');
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

  }, [data, height, valueLabel, showBaseline, baselineValue, chartType]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef}></svg>
    </div>
  );
}
