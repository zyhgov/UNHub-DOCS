import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function EChartsWrapper({ option }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      // 防止重复初始化
      if (chartInstance.current) {
        chartInstance.current.dispose(); // 销毁旧实例
      }
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 设置图表配置
    if (chartInstance.current && option) {
      chartInstance.current.setOption(option);
    }

    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [option]);

  // 响应窗口大小变化
  useEffect(() => {
    const resizeChart = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', resizeChart);
    return () => {
      window.removeEventListener('resize', resizeChart);
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '400px', margin: '20px 0' }}
    />
  );
}

export default EChartsWrapper;