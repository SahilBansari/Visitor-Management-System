import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

interface EChartsWrapperProps {
    option: echarts.EChartsOption;
    style?: React.CSSProperties;
    theme?: string;
}

const EChartsWrapper: React.FC<EChartsWrapperProps> = ({ option, style, theme }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    // Initialize Chart
    useEffect(() => {
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current, theme);
        }

        // Cleanup
        return () => {
            chartInstance.current?.dispose();
        };
    }, [theme]);

    // Update Option
    useEffect(() => {
        chartInstance.current?.setOption(option);
    }, [option]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            chartInstance.current?.resize();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '300px', ...style }} />;
};

export default EChartsWrapper;