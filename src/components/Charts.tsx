import React from 'react';
import { LineChartData, BarChartData, PieChartData, AreaChartData } from '../types';

// Utility functions for chart calculations
const getMaxValue = (datasets: Array<{ data: Array<{ y: number }> }>): number => {
  return Math.max(...datasets.flatMap(dataset => dataset.data.map(point => point.y)));
};

const getMinValue = (datasets: Array<{ data: Array<{ y: number }> }>): number => {
  return Math.min(...datasets.flatMap(dataset => dataset.data.map(point => point.y)));
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Line Chart Component
interface LineChartProps {
  data: LineChartData;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  title?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 600,
  height = 400,
  showGrid = true,
  showLegend = true,
  title
}) => {
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (data.datasets.length === 0 || data.datasets[0].data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = getMaxValue(data.datasets);
  const minValue = Math.min(0, getMinValue(data.datasets));
  const valueRange = maxValue - minValue;
  const dataPointCount = data.datasets[0].data.length;

  const getX = (index: number) => (index / (dataPointCount - 1)) * chartWidth;
  const getY = (value: number) => chartHeight - ((value - minValue) / valueRange) * chartHeight;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <svg width={width} height={height} className="border border-gray-200 rounded-lg">
        {/* Grid lines */}
        {showGrid && (
          <g>
            {/* Horizontal grid lines */}
            {Array.from({ length: 6 }, (_, i) => {
              const y = padding.top + (i / 5) * chartHeight;
              const value = maxValue - (i / 5) * valueRange;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 5}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                  >
                    {formatNumber(value)}
                  </text>
                </g>
              );
            })}
            
            {/* Vertical grid lines */}
            {data.datasets[0].data.map((point, i) => {
              if (i % Math.ceil(dataPointCount / 8) !== 0) return null;
              const x = padding.left + getX(i);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {point.x.toString().substring(5)} {/* Show MM-DD */}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Data lines */}
        {data.datasets.map((dataset, datasetIndex) => (
          <g key={datasetIndex}>
            <path
              d={`M ${dataset.data.map((point, i) => 
                `${padding.left + getX(i)},${padding.top + getY(point.y)}`
              ).join(' L ')}`}
              fill="none"
              stroke={dataset.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {dataset.data.map((point, i) => (
              <circle
                key={i}
                cx={padding.left + getX(i)}
                cy={padding.top + getY(point.y)}
                r={3}
                fill={dataset.color}
                className="hover:r-4 transition-all"
              >
                <title>{`${dataset.label}: ${point.y}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>

      {/* Legend */}
      {showLegend && data.datasets.length > 1 && (
        <div className="flex justify-center mt-4 space-x-6">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: BarChartData;
  width?: number;
  height?: number;
  showLegend?: boolean;
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 600,
  height = 400,
  showLegend = true,
  title
}) => {
  const padding = { top: 40, right: 40, bottom: 80, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (data.categories.length === 0 || data.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.datasets.flatMap(dataset => dataset.data));
  const barWidth = chartWidth / (data.categories.length * data.datasets.length + data.categories.length - 1);
  const groupWidth = barWidth * data.datasets.length;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <svg width={width} height={height} className="border border-gray-200 rounded-lg">
        {/* Y-axis grid lines and labels */}
        {Array.from({ length: 6 }, (_, i) => {
          const y = padding.top + (i / 5) * chartHeight;
          const value = maxValue - (i / 5) * maxValue;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y + 5}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {formatNumber(value)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.categories.map((category, categoryIndex) => (
          <g key={categoryIndex}>
            {data.datasets.map((dataset, datasetIndex) => {
              const value = dataset.data[categoryIndex] || 0;
              const barHeight = (value / maxValue) * chartHeight;
              const x = padding.left + categoryIndex * (groupWidth + barWidth) + datasetIndex * barWidth;
              const y = padding.top + chartHeight - barHeight;

              return (
                <rect
                  key={datasetIndex}
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill={dataset.color}
                  className="hover:opacity-80 transition-opacity"
                >
                  <title>{`${category} - ${dataset.label}: ${value}`}</title>
                </rect>
              );
            })}
            
            {/* Category label */}
            <text
              x={padding.left + categoryIndex * (groupWidth + barWidth) + groupWidth / 2}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {category.length > 8 ? `${category.substring(0, 8)}...` : category}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      {showLegend && data.datasets.length > 1 && (
        <div className="flex justify-center mt-4 space-x-6">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: PieChartData;
  width?: number;
  height?: number;
  showLabels?: boolean;
  title?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  width = 400,
  height = 400,
  showLabels = true,
  title
}) => {
  if (data.segments.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;

  let currentAngle = 0;

  const createPath = (startAngle: number, endAngle: number, outerRadius: number) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      )}
      
      <div className="flex items-center justify-center">
        <svg width={width} height={height}>
          {data.segments.map((segment, index) => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + (segment.percentage / 100) * 360;
            const midAngle = (startAngle + endAngle) / 2;
            const path = createPath(startAngle, endAngle, radius);

            currentAngle = endAngle;

            return (
              <g key={index}>
                <path
                  d={path}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
                </path>
                
                {showLabels && segment.percentage > 5 && (
                  <text
                    x={centerX + (radius * 0.7) * Math.cos((midAngle - 90) * (Math.PI / 180))}
                    y={centerY + (radius * 0.7) * Math.sin((midAngle - 90) * (Math.PI / 180))}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-white"
                  >
                    {segment.percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-2 mt-4">
        {data.segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-700">{segment.label}</span>
            </div>
            <div className="text-gray-600">
              {formatNumber(segment.value)} ({segment.percentage.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component
interface DonutChartProps {
  data: PieChartData;
  width?: number;
  height?: number;
  innerRadius?: number;
  title?: string;
  centerLabel?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 300,
  height = 300,
  innerRadius = 60,
  title,
  centerLabel,
  centerValue
}) => {
  if (data.segments.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 20;

  let currentAngle = 0;

  const createDonutPath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + outerR * Math.cos(startAngleRad);
    const y1 = centerY + outerR * Math.sin(startAngleRad);
    const x2 = centerX + outerR * Math.cos(endAngleRad);
    const y2 = centerY + outerR * Math.sin(endAngleRad);

    const x3 = centerX + innerR * Math.cos(endAngleRad);
    const y3 = centerY + innerR * Math.sin(endAngleRad);
    const x4 = centerX + innerR * Math.cos(startAngleRad);
    const y4 = centerY + innerR * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      )}
      
      <div className="flex items-center justify-center">
        <svg width={width} height={height}>
          {data.segments.map((segment, index) => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + (segment.percentage / 100) * 360;
            const path = createDonutPath(startAngle, endAngle, innerRadius, outerRadius);

            currentAngle = endAngle;

            return (
              <path
                key={index}
                d={path}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
              </path>
            );
          })}
          
          {/* Center text */}
          {(centerLabel || centerValue) && (
            <g>
              <text
                x={centerX}
                y={centerY - 10}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-600"
              >
                {centerLabel}
              </text>
              <text
                x={centerX}
                y={centerY + 15}
                textAnchor="middle"
                className="text-xl font-bold fill-gray-900"
              >
                {centerValue}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Compact Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-700">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Area Chart Component
interface AreaChartProps {
  data: AreaChartData;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  title?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  width = 600,
  height = 400,
  showGrid = true,
  showLegend = true,
  title
}) => {
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (data.datasets.length === 0 || data.datasets[0].data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = getMaxValue(data.datasets);
  const minValue = Math.min(0, getMinValue(data.datasets));
  const valueRange = maxValue - minValue;
  const dataPointCount = data.datasets[0].data.length;

  const getX = (index: number) => (index / (dataPointCount - 1)) * chartWidth;
  const getY = (value: number) => chartHeight - ((value - minValue) / valueRange) * chartHeight;

  const createAreaPath = (dataset: typeof data.datasets[0]) => {
    const linePath = `M ${dataset.data.map((point, i) => 
      `${padding.left + getX(i)},${padding.top + getY(point.y)}`
    ).join(' L ')}`;
    
    const firstPoint = dataset.data[0];
    const lastPoint = dataset.data[dataset.data.length - 1];
    const baseY = padding.top + getY(0);
    
    return `${linePath} L ${padding.left + getX(dataset.data.length - 1)},${baseY} L ${padding.left + getX(0)},${baseY} Z`;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <svg width={width} height={height} className="border border-gray-200 rounded-lg">
        {/* Grid lines */}
        {showGrid && (
          <g>
            {Array.from({ length: 6 }, (_, i) => {
              const y = padding.top + (i / 5) * chartHeight;
              const value = maxValue - (i / 5) * valueRange;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 5}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                  >
                    {formatNumber(value)}
                  </text>
                </g>
              );
            })}
            
            {data.datasets[0].data.map((point, i) => {
              if (i % Math.ceil(dataPointCount / 8) !== 0) return null;
              const x = padding.left + getX(i);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {point.x.toString().substring(5)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Area fills */}
        {data.datasets.map((dataset, index) => (
          <path
            key={index}
            d={createAreaPath(dataset)}
            fill={dataset.fillColor}
            stroke={dataset.color}
            strokeWidth={2}
            className="hover:opacity-80 transition-opacity"
          />
        ))}
      </svg>

      {/* Legend */}
      {showLegend && data.datasets.length > 1 && (
        <div className="flex justify-center mt-4 space-x-6">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
