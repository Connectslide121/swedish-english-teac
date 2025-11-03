import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GroupedBarChartProps {
  data: { category: string; support: number; challenge: number }[];
  height?: number;
}

export function GroupedBarChart({ data, height = 350 }: GroupedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const margin = { top: 40, right: 100, bottom: 60, left: 60 };
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

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(['support', 'challenge'])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const maxValue = d3.max(data, d => Math.max(d.support, d.challenge)) || 5;
    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .nice()
      .range([innerHeight, 0]);

    const colors = {
      support: 'var(--chart-support)',
      challenge: 'var(--chart-challenge)',
    };

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0))
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

    const categories = g.selectAll('.category')
      .data(data)
      .join('g')
      .attr('class', 'category')
      .attr('transform', d => `translate(${x0(d.category)},0)`);

    categories.selectAll('.bar')
      .data(d => [
        { key: 'support', value: d.support ?? 0, category: d.category },
        { key: 'challenge', value: d.challenge ?? 0, category: d.category },
      ])
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x1(d.key) || 0)
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', d => colors[d.key as keyof typeof colors])
      .attr('opacity', 0.9)
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 1);
        const typeName = d.key === 'support' ? 'Support Adaptation' : 'Challenge Adaptation';
        tooltip
          .style('visibility', 'visible')
          .html(`<div style="max-width: 300px;"><strong>${d.category}</strong><br/>${typeName}: ${d.value.toFixed(2)}</div>`);
      })
      .on('mousemove', function(event) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const tooltipX = event.pageX - containerRect.left + 10;
        const tooltipY = event.pageY - containerRect.top - 40;
        
        tooltip
          .style('top', `${tooltipY}px`)
          .style('left', `${tooltipX}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 0.9);
        tooltip.style('visibility', 'hidden');
      });

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10},${margin.top})`);

    [
      { label: 'Support', color: colors.support },
      { label: 'Challenge', color: colors.challenge },
    ].forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0,${i * 25})`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color)
        .attr('opacity', 0.9);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .style('fill', 'var(--foreground)')
        .text(item.label);
    });

  }, [data, height]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef}></svg>
    </div>
  );
}
