import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { Download } from '@phosphor-icons/react';
import { exportSvgToPng, getChartFilename } from '@/lib/export-utils';
import { getFullQuestion } from '@/lib/question-mappings';

interface BarChartProps {
  data: { label: string; value: number; color?: string; fullQuestion?: string }[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  exportPrefix?: string;
  enableQuestionTooltips?: boolean;
}

export function BarChart({ data, height = 300, xLabel, yLabel, exportPrefix = 'bar-chart', enableQuestionTooltips = false }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (svgRef.current) {
      await exportSvgToPng(svgRef.current, getChartFilename(exportPrefix));
    }
  };

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
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)');

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const maxValue = d3.max(data, d => d.value) || 5;
    const minValue = d3.min(data, d => d.value) || 0;
    const isRatingScale = maxValue <= 5 && yLabel?.includes('1-5');
    
    let yDomain: [number, number];
    if (isRatingScale) {
      yDomain = [0, 5];
    } else {
      const padding = (maxValue - minValue) * 0.1;
      yDomain = [Math.max(0, minValue - padding), maxValue + padding];
    }
    
    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    xAxis.selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
      .style('fill', 'var(--foreground)');
    
    xAxis.selectAll('line, path')
      .style('stroke', 'var(--border)');

    const yAxis = g.append('g')
      .call(
        isRatingScale 
          ? d3.axisLeft(y).tickValues([0, 1, 2, 3, 4, 5])
          : d3.axisLeft(y).ticks(8)
      );
    
    yAxis.selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
      .style('fill', 'var(--foreground)');
    
    yAxis.selectAll('line, path')
      .style('stroke', 'var(--border)');

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
        
        let questionText = '';
        if (enableQuestionTooltips) {
          const variableName = d.label.split(':')[0].trim();
          const fullQuestion = d.fullQuestion || getFullQuestion(variableName);
          if (fullQuestion) {
            questionText = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--muted-foreground); font-style: italic;">${fullQuestion}</div>`;
          }
        }
        
        tooltip
          .style('visibility', 'visible')
          .html(`<div style="max-width: 400px;"><strong>${d.label}</strong><br/>Value: ${d.value.toFixed(2)}${questionText}</div>`);
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

    g.selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => (x(d.label) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.value ?? 0) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
      .style('fill', 'var(--foreground)')
      .style('font-weight', '500')
      .text(d => d.value.toFixed(2));

    if (xLabel) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
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
        .style('font-family', 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
        .style('fill', 'var(--muted-foreground)')
        .text(yLabel);
    }

  }, [data, height, xLabel, yLabel, enableQuestionTooltips]);

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
