import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { Download } from '@phosphor-icons/react';
import { exportSvgToPng, getChartFilename } from '@/lib/export-utils';
import { getFullQuestion } from '@/lib/question-mappings';

interface GroupedBarChartProps {
  data: { category: string; support: number; challenge: number; fullQuestion?: string }[];
  height?: number;
  exportPrefix?: string;
}

export function GroupedBarChart({ data, height = 350, exportPrefix = 'grouped-bar-chart' }: GroupedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (svgRef.current) {
      await exportSvgToPng(svgRef.current, getChartFilename(exportPrefix));
    }
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
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
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
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

    const maxValue = d3.max(data, d => Math.max(d.support || 0, d.challenge || 0)) || 5;
    const y = d3.scaleLinear()
      .domain([0, Math.max(maxValue, 0.1)])
      .nice()
      .range([innerHeight, 0]);

    const colors = {
      support: 'var(--chart-support)',
      challenge: 'var(--chart-challenge)',
    };

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0));
    
    xAxis.selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
      .style('fill', 'var(--foreground)');
    
    xAxis.selectAll('line, path')
      .style('stroke', 'var(--border)');

    const yAxis = g.append('g')
      .call(d3.axisLeft(y));
    
    yAxis.selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
      .style('fill', 'var(--foreground)');
    
    yAxis.selectAll('line, path')
      .style('stroke', 'var(--border)');

    const categories = g.selectAll('.category')
      .data(data)
      .join('g')
      .attr('class', 'category')
      .attr('transform', d => `translate(${x0(d.category)},0)`);

    categories.selectAll('.bar')
      .data(d => [
        { key: 'support', value: d.support ?? 0, category: d.category, fullQuestion: d.fullQuestion },
        { key: 'challenge', value: d.challenge ?? 0, category: d.category, fullQuestion: d.fullQuestion },
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
        const typeName = d.key === 'support' ? 'Support Teachers' : 'Challenge Teachers';
        
        const questionText = d.fullQuestion 
          ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--muted-foreground); font-style: italic;">${d.fullQuestion}</div>`
          : '';
        
        tooltip
          .style('visibility', 'visible')
          .html(`<div style="max-width: 400px;"><strong>${d.category}</strong><br/>${typeName}: ${d.value.toFixed(2)}${questionText}</div>`);
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

    categories.selectAll('.bar-label')
      .data(d => [
        { key: 'support', value: d.support ?? 0, category: d.category, fullQuestion: d.fullQuestion },
        { key: 'challenge', value: d.challenge ?? 0, category: d.category, fullQuestion: d.fullQuestion },
      ])
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => (x1(d.key) || 0) + x1.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
      .style('fill', 'var(--foreground)')
      .style('font-weight', '500')
      .text(d => d.value.toFixed(2));

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 20},${margin.top})`);

    [
      { label: 'Support', color: colors.support },
      { label: 'Challenge', color: colors.challenge },
    ].forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0,${i * 25})`);

      legendItem.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('rx', 3)
        .attr('fill', item.color)
        .attr('opacity', 0.9);

      legendItem.append('text')
        .attr('x', 24)
        .attr('y', 13)
        .style('font-size', '13px')
        .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
        .style('font-weight', '500')
        .style('fill', 'var(--foreground)')
        .text(item.label);
    });

  }, [data, height]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2"
        >
          <Download size={16} />
          Export Chart
        </Button>
      </div>
      <div ref={containerRef} className="w-full relative">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
