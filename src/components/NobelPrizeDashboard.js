// src/components/NobelPrizeDashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import EChartsWrapper from '@site/src/components/EChartsWrapper';

// 科研风格的配色方案
const SCIENTIFIC_COLORS = {
  primary: '#1f77b4',
  secondary: '#2ca02c',
  tertiary: '#d62728',
  quaternary: '#ff7f0e',
  quinary: '#9467bd',
  senary: '#8c564b',
  
  physics: '#3366cc',
  chemistry: '#dc3912',
  medicine: '#109618',
  literature: '#ff9900',
  peace: '#0099c6',
  economics: '#990099',
  
  male: '#1f77b4',
  female: '#e377c2',
  other: '#7f7f7f',
  
  individual: '#2ca02c',
  organization: '#d62728',
  
  success: '#109618',
  warning: '#ff9900',
  danger: '#dc3912',
  info: '#3366cc'
};

// 分类映射
const CATEGORIES = {
  'Physics': '物理学',
  'Chemistry': '化学',
  'Physiology or Medicine': '生理学或医学',
  'Medicine': '医学',
  'Literature': '文学',
  'Peace': '和平',
  'Economics': '经济学'
};

function parseCSVLine(line) {
  const values = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function useNobelData() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/archive/nobel.csv');
        if (!response.ok) throw new Error('Failed to fetch data');
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        if (lines.length === 0) throw new Error('No data found');

        const headers = parseCSVLine(lines[0]);
        const parsedData = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const obj = {};
          headers.forEach((header, index) => {
            let value = values[index] || '';
            if (value === 'NA' || value === '') {
              value = null;
            }
            obj[header] = value;
          });
          return obj;
        }).filter(item => item.year);

        setRawData(parsedData);
      } catch (err) {
        console.error('Failed to load Nobel data', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { rawData, loading, error };
}

function filterData(data, yearRange, selectedCategories) {
  return data.filter(d => {
    const y = parseInt(d.year, 10);
    const category = d.category;
    return !isNaN(y) && 
           y >= yearRange[0] && 
           y <= yearRange[1] &&
           (selectedCategories.length === 0 || selectedCategories.includes(category));
  });
}

function calculateStatistics(data) {
  const stats = {
    totalPrizes: 0,
    totalLaureates: 0,
    countries: new Set(),
    organizations: new Set(),
    categories: new Set(),
    years: new Set(),
    ageStats: { min: Infinity, max: -Infinity, total: 0, count: 0 },
    gender: { male: 0, female: 0, other: 0 },
    types: { individual: 0, organization: 0 },
    categoryCount: {},
    decadeCount: {},
    countryCount: {}
  };

  data.forEach(d => {
    stats.totalPrizes++;
    stats.years.add(d.year);
    stats.categories.add(d.category);
    
    stats.categoryCount[d.category] = (stats.categoryCount[d.category] || 0) + 1;
    
    if (d.birth_country) {
      stats.countries.add(d.birth_country);
      stats.countryCount[d.birth_country] = (stats.countryCount[d.birth_country] || 0) + 1;
    }
    
    if (d.organization_name) stats.organizations.add(d.organization_name);
    
    if (d.year) {
      const decade = Math.floor(parseInt(d.year) / 10) * 10;
      stats.decadeCount[decade] = (stats.decadeCount[decade] || 0) + 1;
    }
    
    if (d.sex === 'Male') stats.gender.male++;
    else if (d.sex === 'Female') stats.gender.female++;
    else if (d.sex) stats.gender.other++;
    
    if (d.laureate_type === 'Individual') stats.types.individual++;
    else if (d.laureate_type === 'Organization') stats.types.organization++;
    
    if (d.birth_date && d.year) {
      const birthYear = new Date(d.birth_date).getFullYear();
      const prizeYear = parseInt(d.year, 10);
      if (!isNaN(birthYear) && !isNaN(prizeYear)) {
        const age = prizeYear - birthYear;
        stats.ageStats.min = Math.min(stats.ageStats.min, age);
        stats.ageStats.max = Math.max(stats.ageStats.max, age);
        stats.ageStats.total += age;
        stats.ageStats.count++;
      }
    }
  });

  stats.totalLaureates = data.length;
  stats.uniqueCountries = stats.countries.size;
  stats.uniqueOrganizations = stats.organizations.size;
  stats.uniqueCategories = stats.categories.size;
  stats.uniqueYears = stats.years.size;
  
  if (stats.ageStats.count > 0) {
    stats.ageStats.average = Math.round(stats.ageStats.total / stats.ageStats.count);
  } else {
    stats.ageStats.average = 0;
    stats.ageStats.min = 0;
    stats.ageStats.max = 0;
  }

  return stats;
}

// 统计卡片组件
function StatCard({ title, value, subtitle, color = SCIENTIFIC_COLORS.primary, icon }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
      borderLeft: `6px solid ${color}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }} className="stat-card">
      {icon && (
        <div style={{ fontSize: '32px', marginBottom: '12px', color: color }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: color, marginBottom: '8px' }}>
        {value}
      </div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// 1. 获奖趋势图表
function PrizeTrendChart({ data }) {
  const yearData = {};
  const categoryYearData = {};
  const categories = [...new Set(data.map(d => d.category))].sort();

  categories.forEach(cat => {
    categoryYearData[cat] = {};
  });

  data.forEach(d => {
    const year = parseInt(d.year, 10);
    const category = d.category;
    
    if (!isNaN(year)) {
      yearData[year] = (yearData[year] || 0) + 1;
      categoryYearData[category][year] = (categoryYearData[category][year] || 0) + 1;
    }
  });

  const years = Object.keys(yearData).map(Number).sort((a, b) => a - b);
  
  const categorySeries = categories.map((category, index) => {
    const colorKeys = ['physics', 'chemistry', 'medicine', 'literature', 'peace', 'economics'];
    const color = SCIENTIFIC_COLORS[colorKeys[index]] || SCIENTIFIC_COLORS.primary;
    
    return {
      name: CATEGORIES[category] || category,
      type: 'line',
      data: years.map(y => categoryYearData[category][y] || 0),
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2, color },
      itemStyle: { color }
    };
  });

  const option = {
    title: { 
      text: '诺贝尔奖历年获奖趋势分析', 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#ccc',
      borderWidth: 1
    },
    legend: {
      top: 40,
      type: 'scroll',
      textStyle: { fontSize: 11 }
    },
    grid: {
      left: 60,
      right: 30,
      top: 80,
      bottom: 80,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years,
      name: '年份',
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { 
        fontSize: 10,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '获奖人次',
      nameLocation: 'middle',
      nameGap: 40,
      axisLine: { lineStyle: { color: '#666' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: categorySeries,
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        bottom: 20,
        height: 20,
        borderColor: '#ddd',
        textStyle: { color: '#666' }
      }
    ]
  };

  return <EChartsWrapper option={option} style={{ height: '500px', width: '100%' }} />;
}

// 2. 国家分布图表
function CountryDistributionChart({ data }) {
  const countryCount = {};
  const countryDetails = {};

  data.forEach(d => {
    const country = d.birth_country;
    if (country) {
      countryCount[country] = (countryCount[country] || 0) + 1;
      
      if (!countryDetails[country]) {
        countryDetails[country] = {
          count: 0,
          categories: new Set(),
          firstYear: Infinity,
          lastYear: -Infinity
        };
      }
      countryDetails[country].count++;
      countryDetails[country].categories.add(d.category);
      
      const year = parseInt(d.year);
      if (year < countryDetails[country].firstYear) countryDetails[country].firstYear = year;
      if (year > countryDetails[country].lastYear) countryDetails[country].lastYear = year;
    }
  });

  const sorted = Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const countryData = sorted.map(([country]) => country);
  const counts = sorted.map(([, count]) => count);
  const details = sorted.map(([country]) => countryDetails[country]);

  const option = {
    title: { 
      text: '获奖者出生国家分布 Top 20', 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        const index = params[0].dataIndex;
        const country = sorted[index][0];
        const detail = details[index];
        const categories = Array.from(detail.categories).map(cat => CATEGORIES[cat] || cat).join('、');
        
        return `
          <div style="font-weight: bold; margin-bottom: 8px;">
            ${country}
          </div>
          <div style="margin-bottom: 4px;">获奖人次: <strong>${detail.count}</strong></div>
          <div style="margin-bottom: 4px;">涉及奖项: ${categories}</div>
          <div style="margin-bottom: 4px;">时间跨度: ${detail.firstYear}-${detail.lastYear}</div>
        `;
      }
    },
    grid: {
      left: 150,
      right: 40,
      top: 60,
      bottom: 60,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '获奖人次',
      axisLine: { lineStyle: { color: '#666' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    yAxis: {
      type: 'category',
      data: countryData,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { 
        fontSize: 11,
        formatter: function(value) {
          return value.length > 12 ? value.substring(0, 12) + '...' : value;
        }
      }
    },
    series: [{
      data: counts,
      type: 'bar',
      itemStyle: { 
        color: SCIENTIFIC_COLORS.primary,
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}',
        color: '#666',
        fontSize: 11
      }
    }]
  };

  return <EChartsWrapper option={option} style={{ height: '600px', width: '100%' }} />;
}

// 3. 机构分布图表
function OrganizationDistributionChart({ data }) {
  const orgCount = {};
  const orgDetails = {};

  data
    .filter(d => d.organization_name && d.laureate_type === 'Individual')
    .forEach(d => {
      const org = d.organization_name;
      const country = d.organization_country;
      
      orgCount[org] = (orgCount[org] || 0) + 1;
      
      if (!orgDetails[org]) {
        orgDetails[org] = {
          name: org,
          country: country,
          count: 0,
          categories: new Set(),
          firstYear: Infinity,
          lastYear: -Infinity
        };
      }
      orgDetails[org].count++;
      orgDetails[org].categories.add(d.category);
      
      const year = parseInt(d.year);
      if (year < orgDetails[org].firstYear) orgDetails[org].firstYear = year;
      if (year > orgDetails[org].lastYear) orgDetails[org].lastYear = year;
    });

  const sorted = Object.entries(orgCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const orgs = sorted.map(([name]) => name);
  const counts = sorted.map(([, count]) => count);
  const details = sorted.map(([name]) => orgDetails[name]);

  const option = {
    title: { 
      text: '获奖者所属机构分布 Top 15', 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        const index = params[0].dataIndex;
        const detail = details[index];
        const categories = Array.from(detail.categories).map(cat => CATEGORIES[cat] || cat).join('、');
        
        return `
          <div style="font-weight: bold; margin-bottom: 8px;">
            ${detail.name}
          </div>
          <div style="margin-bottom: 4px;">国家: ${detail.country || '未知'}</div>
          <div style="margin-bottom: 4px;">获奖人次: <strong>${detail.count}</strong></div>
          <div style="margin-bottom: 4px;">涉及奖项: ${categories}</div>
          <div style="margin-bottom: 4px;">时间跨度: ${detail.firstYear}-${detail.lastYear}</div>
        `;
      }
    },
    grid: {
      left: 200,
      right: 40,
      top: 60,
      bottom: 60,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '获奖人次',
      axisLine: { lineStyle: { color: '#666' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    yAxis: {
      type: 'category',
      data: orgs,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { 
        fontSize: 10,
        formatter: function(value) {
          return value.length > 25 ? value.substring(0, 25) + '...' : value;
        }
      }
    },
    series: [{
      data: counts,
      type: 'bar',
      itemStyle: { 
        color: SCIENTIFIC_COLORS.chemistry,
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}',
        color: '#666',
        fontSize: 11
      }
    }]
  };

  return <EChartsWrapper option={option} style={{ height: '500px', width: '100%' }} />;
}

// 4. 性别分布图表
function GenderDistributionChart({ data }) {
  const categoryGender = {};
  const categories = [...new Set(data.map(d => d.category))].sort();

  categories.forEach(cat => {
    categoryGender[cat] = { male: 0, female: 0, other: 0 };
  });

  data
    .filter(d => d.laureate_type === 'Individual' && d.sex)
    .forEach(d => {
      const cat = d.category;
      const sex = d.sex.toLowerCase();
      if (categoryGender[cat] && categoryGender[cat][sex] !== undefined) {
        categoryGender[cat][sex]++;
      }
    });

  const series = [
    {
      name: '男性',
      type: 'bar',
      stack: 'total',
      data: categories.map(cat => categoryGender[cat].male),
      itemStyle: { color: SCIENTIFIC_COLORS.male }
    },
    {
      name: '女性',
      type: 'bar',
      stack: 'total',
      data: categories.map(cat => categoryGender[cat].female),
      itemStyle: { color: SCIENTIFIC_COLORS.female }
    }
  ];

  const option = {
    title: { 
      text: '各奖项性别分布分析', 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      top: 40,
      textStyle: { fontSize: 12 }
    },
    grid: {
      left: 60,
      right: 40,
      top: 80,
      bottom: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories.map(cat => CATEGORIES[cat] || cat),
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { 
        fontSize: 11,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      axisLine: { lineStyle: { color: '#666' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: series
  };

  return <EChartsWrapper option={option} style={{ height: '450px', width: '100%' }} />;
}

// 5. 获奖年龄分析
function AgeAnalysisChart({ data }) {
  const ageData = [];
  const ageBins = {};

  // 初始化年龄区间
  for (let i = 20; i <= 90; i += 5) {
    ageBins[i] = 0;
  }

  data
    .filter(d => d.birth_date && d.year && d.laureate_type === 'Individual')
    .forEach(d => {
      const birthYear = new Date(d.birth_date).getFullYear();
      const prizeYear = parseInt(d.year, 10);
      
      if (!isNaN(birthYear) && !isNaN(prizeYear)) {
        const age = prizeYear - birthYear;
        ageData.push(age);
        const bin = Math.floor(age / 5) * 5;
        if (ageBins[bin] !== undefined) {
          ageBins[bin]++;
        }
      }
    });

  const ageRanges = Object.keys(ageBins).map(Number).sort((a, b) => a - b);
  const ageCounts = ageRanges.map(bin => ageBins[bin]);

  const option = {
    title: { 
      text: '获奖者年龄分布', 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 60,
      right: 40,
      top: 60,
      bottom: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ageRanges.map(bin => `${bin}-${bin+4}岁`),
      name: '年龄区间',
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { 
        fontSize: 10,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      axisLine: { lineStyle: { color: '#666' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [{
      data: ageCounts,
      type: 'bar',
      itemStyle: { 
        color: SCIENTIFIC_COLORS.primary,
        borderRadius: [2, 2, 0, 0]
      }
    }]
  };

  return <EChartsWrapper option={option} style={{ height: '450px', width: '100%' }} />;
}

// 6. 奖项类型分布
function PrizeTypeChart({ data }) {
  const typeData = [
    { 
      name: '个人', 
      value: data.filter(d => d.laureate_type === 'Individual').length 
    },
    { 
      name: '组织', 
      value: data.filter(d => d.laureate_type === 'Organization').length 
    }
  ];

  const option = {
    title: { 
      text: '获奖者类型分布', 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [{
      name: '获奖类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: true
      },
      data: typeData.map((item, index) => ({
        ...item,
        itemStyle: {
          color: index === 0 ? SCIENTIFIC_COLORS.individual : SCIENTIFIC_COLORS.organization
        }
      }))
    }]
  };

  return <EChartsWrapper option={option} style={{ height: '400px', width: '100%' }} />;
}

// 7. 时间线分析
function TimelineAnalysisChart({ data }) {
  const decadeData = {};
  const categories = [...new Set(data.map(d => d.category))].sort();

  data.forEach(d => {
    const year = parseInt(d.year, 10);
    if (!isNaN(year)) {
      const decade = Math.floor(year / 10) * 10;
      if (!decadeData[decade]) {
        decadeData[decade] = {};
        categories.forEach(cat => {
          decadeData[decade][cat] = 0;
        });
      }
      decadeData[decade][d.category]++;
    }
  });

  const decades = Object.keys(decadeData).map(Number).sort((a, b) => a - b);
  
  const series = categories.map((category, index) => {
    const colorKeys = ['physics', 'chemistry', 'medicine', 'literature', 'peace', 'economics'];
    const color = SCIENTIFIC_COLORS[colorKeys[index]] || SCIENTIFIC_COLORS.primary;
    
    return {
      name: CATEGORIES[category] || category,
      type: 'line',
      stack: 'total',
      areaStyle: { color: color + '40' },
      lineStyle: { width: 2, color },
      emphasis: {
        focus: 'series'
      },
      data: decades.map(decade => decadeData[decade][category])
    };
  });

  const option = {
    title: { 
      text: '诺贝尔奖年代分布趋势', 
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      top: 40,
      type: 'scroll',
      textStyle: { fontSize: 11 }
    },
    grid: {
      left: 60,
      right: 40,
      top: 80,
      bottom: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: decades.map(d => `${d}s`),
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#666' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: series
  };

  return <EChartsWrapper option={option} style={{ height: '450px', width: '100%' }} />;
}

// 数据表格组件
function DataTable({ data, searchTerm, setSearchTerm, sortConfig, requestSort, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) {
  const [selectedColumns, setSelectedColumns] = useState([
    'year', 'category', 'full_name', 'birth_country', 'sex', 'organization_name', 'motivation'
  ]);

  const [expandedRows, setExpandedRows] = useState(new Set());

  const columns = [
    { key: 'year', name: '年份', width: '80px' },
    { key: 'category', name: '奖项', width: '120px' },
    { key: 'full_name', name: '获奖者', width: '150px' },
    { key: 'birth_country', name: '出生国家', width: '120px' },
    { key: 'sex', name: '性别', width: '80px' },
    { key: 'organization_name', name: '所属机构', width: '180px' },
    { key: 'organization_country', name: '机构国家', width: '120px' },
    { key: 'laureate_type', name: '类型', width: '100px' },
    { key: 'motivation', name: '获奖原因', width: '300px' },
    { key: 'prize_share', name: '奖金份额', width: '100px' }
  ];

  // 筛选和排序数据
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => 
      Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const toggleRowExpansion = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const renderTableCell = (value, columnKey, isExpanded = false) => {
    if (!value) return <span style={{ color: '#999', fontStyle: 'italic' }}>无数据</span>;
    
    switch (columnKey) {
      case 'category':
        return <span style={{ fontWeight: '500' }}>{CATEGORIES[value] || value}</span>;
      
      case 'sex':
        return value === 'Male' ? '男性' : value === 'Female' ? '女性' : value;
      
      case 'laureate_type':
        return value === 'Individual' ? '个人' : '组织';
      
      case 'motivation':
        if (isExpanded) {
          return (
            <div style={{ lineHeight: '1.5', whiteSpace: 'normal' }}>
              {value}
            </div>
          );
        } else {
          return (
            <div 
              style={{ 
                maxWidth: '300px', 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                lineHeight: '1.5'
              }}
              title={value}
            >
              {value}
              {value.length > 100 && (
                <span style={{ color: SCIENTIFIC_COLORS.primary, fontSize: '12px', marginLeft: '4px' }}>
                  [点击展开]
                </span>
              )}
            </div>
          );
        }
      
      case 'year':
        return <strong>{value}</strong>;
      
      default:
        return value;
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '16px' }}>详细数据集表格</h3>
        
        {/* 搜索和筛选控制 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '16px' }}>
          <div>
            <input
              type="text"
              placeholder="搜索获奖者、机构、国家、获奖原因..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${SCIENTIFIC_COLORS.primary}40`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>显示列:</span>
            <select
              value=""
              onChange={(e) => handleColumnToggle(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${SCIENTIFIC_COLORS.primary}40`,
                borderRadius: '6px',
                fontSize: '12px'
              }}
            >
              <option value="">选择要显示的列...</option>
              {columns.map(col => (
                <option key={col.key} value={col.key}>
                  {selectedColumns.includes(col.key) ? '✓ ' : ''}{col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 列选择器 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {columns.map(col => (
            <label key={col.key} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(col.key)}
                onChange={() => handleColumnToggle(col.key)}
                style={{ marginRight: '4px' }}
              />
              {col.name}
            </label>
          ))}
        </div>

        {/* 统计信息 */}
        <div style={{ 
          padding: '12px', 
          background: `${SCIENTIFIC_COLORS.primary}08`, 
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          显示 {paginatedData.length} 条记录，共 {filteredAndSortedData.length} 条记录
          {searchTerm && ` (搜索: "${searchTerm}")`}
        </div>
      </div>

      {/* 表格 */}
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: `${SCIENTIFIC_COLORS.primary}10` }}>
              {columns
                .filter(col => selectedColumns.includes(col.key))
                .map(col => (
                  <th
                    key={col.key}
                    style={{
                      padding: '12px 8px',
                      textAlign: 'left',
                      borderBottom: `2px solid ${SCIENTIFIC_COLORS.primary}30`,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minWidth: col.width
                    }}
                    onClick={() => requestSort(col.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {col.name}
                      <span style={{ fontSize: '12px' }}>{getSortIcon(col.key)}</span>
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const isExpanded = expandedRows.has(index);
              const globalIndex = (currentPage - 1) * itemsPerPage + index;
              
              return (
                <React.Fragment key={`${item.laureate_id}-${globalIndex}`}>
                  <tr 
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s ease',
                      cursor: item.motivation && item.motivation.length > 100 ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => e.target.style.background = `${SCIENTIFIC_COLORS.primary}05`}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    onClick={() => item.motivation && item.motivation.length > 100 && toggleRowExpansion(index)}
                  >
                    {columns
                      .filter(col => selectedColumns.includes(col.key))
                      .map(col => (
                        <td key={col.key} style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                          {renderTableCell(item[col.key], col.key, isExpanded)}
                        </td>
                      ))}
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td 
                        colSpan={selectedColumns.length}
                        style={{ 
                          padding: '16px',
                          background: `${SCIENTIFIC_COLORS.primary}03`,
                          borderBottom: '2px solid #f0f0f0'
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px', alignItems: 'start' }}>
                          <div style={{ fontWeight: 'bold', color: SCIENTIFIC_COLORS.primary, whiteSpace: 'nowrap' }}>
                            完整获奖原因:
                          </div>
                          <div style={{ lineHeight: '1.6', color: '#333' }}>
                            {item.motivation}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            第 {currentPage} 页，共 {totalPages} 页
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: `1px solid ${SCIENTIFIC_COLORS.primary}40`,
                background: 'white',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              首页
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: `1px solid ${SCIENTIFIC_COLORS.primary}40`,
                background: 'white',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              上一页
            </button>
            
            {/* 页码显示 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${currentPage === pageNum ? SCIENTIFIC_COLORS.primary : SCIENTIFIC_COLORS.primary + '40'}`,
                    background: currentPage === pageNum ? SCIENTIFIC_COLORS.primary : 'white',
                    color: currentPage === pageNum ? 'white' : '#333',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: `1px solid ${SCIENTIFIC_COLORS.primary}40`,
                background: 'white',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              下一页
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: `1px solid ${SCIENTIFIC_COLORS.primary}40`,
                background: 'white',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              末页
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span>每页显示:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setCurrentPage(1);
                setItemsPerPage(Number(e.target.value));
              }}
              style={{
                padding: '4px 8px',
                border: `1px solid ${SCIENTIFIC_COLORS.primary}40`,
                borderRadius: '4px'
              }}
            >
              <option value={10}>10 条</option>
              <option value={25}>25 条</option>
              <option value={50}>50 条</option>
              <option value={100}>100 条</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// 主要组件
export default function NobelPrizeDashboard() {
  const { rawData, loading, error } = useNobelData();
  const [yearRange, setYearRange] = useState([1901, 2025]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [activeTab, setActiveTab] = useState('charts');

  const allCategories = useMemo(() => {
    return [...new Set(rawData.map(d => d.category))].filter(Boolean).sort();
  }, [rawData]);

  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    return filterData(rawData, yearRange, selectedCategories);
  }, [rawData, yearRange, selectedCategories]);

  const statistics = useMemo(() => {
    return calculateStatistics(filteredData);
  }, [filteredData]);

  const minYear = useMemo(() => {
    const years = rawData.map(d => parseInt(d.year)).filter(y => !isNaN(y));
    return years.length > 0 ? Math.min(...years) : 1901;
  }, [rawData]);

  const maxYear = useMemo(() => {
    const years = rawData.map(d => parseInt(d.year)).filter(y => !isNaN(y));
    return years.length > 0 ? Math.max(...years) : 2025;
  }, [rawData]);

  const handleStartYearChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    
    const clampedValue = Math.max(minYear, Math.min(maxYear, value));
    
    if (clampedValue > yearRange[1]) {
      setYearRange([clampedValue, clampedValue]);
    } else {
      setYearRange([clampedValue, yearRange[1]]);
    }
    setCurrentPage(1);
  };

  const handleEndYearChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    
    const clampedValue = Math.max(minYear, Math.min(maxYear, value));
    
    if (clampedValue < yearRange[0]) {
      setYearRange([clampedValue, clampedValue]);
    } else {
      setYearRange([yearRange[0], clampedValue]);
    }
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const selectAllCategories = () => {
    setSelectedCategories(allCategories);
    setCurrentPage(1);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // 当搜索词或筛选条件变化时重置到第一页
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, yearRange, selectedCategories]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: SCIENTIFIC_COLORS.primary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
          <div>正在加载诺贝尔奖数据...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#fee', 
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: SCIENTIFIC_COLORS.danger,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div><strong>数据加载错误:</strong> {error}</div>
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          请检查 /data/archive/nobel.csv 文件是否存在且格式正确。
        </div>
      </div>
    );
  }

  if (rawData.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#eef', 
        border: '1px solid #ccf',
        borderRadius: '8px',
        color: SCIENTIFIC_COLORS.info,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <div>未能加载数据，请检查 nobel.csv 是否已正确放置。</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '100%', 
      margin: '0 auto',
      fontFamily: 'OpenAISans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
{/* 标题区域 - 极简专业版本 */}
<div style={{ 
  background: 'white',
  color: '#2c3e50',
  padding: '45px 30px',
  marginBottom: '40px',
  textAlign: 'center',
//   border: '1px solid #e2e8f0',
  borderRadius: '8px'
}}>
  <div style={{
    fontSize: 'clamp(2.5rem, 4vw, 3.2rem)',
    fontWeight: '300',
    color: '#1a365d',
    marginBottom: '12px',
    letterSpacing: '-0.02em'
  }}>
    Nobel Prize Analysis
  </div>
  
  <div style={{
    fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
    color: '#4a5568',
    fontWeight: '400',
    marginBottom: '8px'
  }}>
    1901–2025 全面数据集可视化
  </div>
  
  <div style={{
    width: '60px',
    height: '2px',
    background: '#1f77b4',
    margin: '20px auto',
    opacity: 0.6
  }} />
  
  <div style={{
    fontSize: '0.95rem',
    color: '#718096',
    fontWeight: '300',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.5'
  }}>
    分析物理学、化学、医学、文学、和平与经济科学一个多世纪以来的突破性成就。
  </div>
</div>

      {/* 筛选控件 */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '24px', 
        backgroundColor: 'white',
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: SCIENTIFIC_COLORS.primary,
          fontSize: '20px'
        }}>
          数据筛选控制台
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px' }}>
              年份范围选择
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1' }}>
                <input
                  type="number"
                  min={minYear}
                  max={maxYear}
                  value={yearRange[0]}
                  onChange={handleStartYearChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    border: `2px solid ${SCIENTIFIC_COLORS.primary}40`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>起始年份</div>
              </div>
              
              <div style={{ color: '#666', fontWeight: 'bold' }}>至</div>
              
              <div style={{ flex: '1' }}>
                <input
                  type="number"
                  min={minYear}
                  max={maxYear}
                  value={yearRange[1]}
                  onChange={handleEndYearChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    border: `2px solid ${SCIENTIFIC_COLORS.primary}40`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>结束年份</div>
              </div>
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: '600' }}>奖项类别筛选</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={selectAllCategories}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: SCIENTIFIC_COLORS.success,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  全选
                </button>
                <button 
                  onClick={clearAllCategories}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: SCIENTIFIC_COLORS.danger,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  清空
                </button>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '8px',
              maxHeight: '120px',
              overflowY: 'auto',
              padding: '8px',
              border: `1px solid ${SCIENTIFIC_COLORS.primary}20`,
              borderRadius: '8px',
              background: '#fafafa'
            }}>
              {allCategories.map(category => (
                <label key={category} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '13px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: selectedCategories.includes(category) ? `${SCIENTIFIC_COLORS.primary}15` : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    style={{ marginRight: '6px' }}
                  />
                  {CATEGORIES[category] || category}
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ 
          padding: '16px', 
          background: `${SCIENTIFIC_COLORS.primary}08`, 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>当前筛选结果:</strong> 
          <span style={{ color: SCIENTIFIC_COLORS.primary, fontWeight: '600', margin: '0 8px' }}>
            {yearRange[0]}年 – {yearRange[1]}年
          </span>
          | 类别: 
          <span style={{ color: SCIENTIFIC_COLORS.secondary, fontWeight: '500', margin: '0 8px' }}>
            {selectedCategories.length === 0 ? '全部奖项' : selectedCategories.map(cat => CATEGORIES[cat] || cat).join('、')}
          </span>
          | 共 
          <span style={{ color: SCIENTIFIC_COLORS.tertiary, fontWeight: 'bold', margin: '0 4px' }}>
            {filteredData.length}
          </span> 
          条获奖记录
        </div>
      </div>

      {/* 标签页切换 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: `2px solid ${SCIENTIFIC_COLORS.primary}20` }}>
          <button
            onClick={() => setActiveTab('charts')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'charts' ? SCIENTIFIC_COLORS.primary : 'transparent',
              color: activeTab === 'charts' ? 'white' : SCIENTIFIC_COLORS.primary,
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            📊 图表分析
          </button>
          <button
            onClick={() => setActiveTab('table')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'table' ? SCIENTIFIC_COLORS.primary : 'transparent',
              color: activeTab === 'table' ? 'white' : SCIENTIFIC_COLORS.primary,
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            📋 数据表格
          </button>
        </div>
      </div>

      {/* 统计概览 */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          color: SCIENTIFIC_COLORS.primary, 
          borderBottom: `3px solid ${SCIENTIFIC_COLORS.primary}30`,
          paddingBottom: '12px',
          marginBottom: '24px',
          fontSize: '24px'
        }}>
          数据统计概览
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          <StatCard 
            title="总获奖人次" 
            value={statistics.totalLaureates.toLocaleString()} 
            subtitle="涵盖所有奖项类别"
            color={SCIENTIFIC_COLORS.primary}
            icon="🏆"
          />
          <StatCard 
            title="涉及国家" 
            value={statistics.uniqueCountries.toLocaleString()} 
            subtitle="个不同国家/地区"
            color={SCIENTIFIC_COLORS.secondary}
            icon="🌍"
          />
          <StatCard 
            title="研究机构" 
            value={statistics.uniqueOrganizations.toLocaleString()} 
            subtitle="个不同机构组织"
            color={SCIENTIFIC_COLORS.tertiary}
            icon="🏛️"
          />
          <StatCard 
            title="平均获奖年龄" 
            value={statistics.ageStats.average} 
            subtitle={`岁 (${statistics.ageStats.min}-${statistics.ageStats.max})`}
            color={SCIENTIFIC_COLORS.quaternary}
            icon="👨‍🎓"
          />
          <StatCard 
            title="女性获奖者" 
            value={statistics.gender.female.toLocaleString()} 
            subtitle={`占个人奖项 ${((statistics.gender.female / statistics.types.individual) * 100).toFixed(1)}%`}
            color={SCIENTIFIC_COLORS.female}
            icon="👩‍🔬"
          />
          <StatCard 
            title="组织获奖" 
            value={statistics.types.organization.toLocaleString()} 
            subtitle={`占全部奖项 ${((statistics.types.organization / statistics.totalLaureates) * 100).toFixed(1)}%`}
            color={SCIENTIFIC_COLORS.organization}
            icon="🏢"
          />
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'charts' ? (
        /* 图表展示区域 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          <div>
            <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '20px' }}>
              1. 历年获奖趋势分析
            </h3>
            <PrizeTrendChart data={filteredData} />
          </div>

          <div>
            <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '20px' }}>
              2. 国家分布分析
            </h3>
            <CountryDistributionChart data={filteredData} />
          </div>

          <div>
            <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '20px' }}>
              3. 机构分布分析
            </h3>
            <OrganizationDistributionChart data={filteredData} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
            <div>
              <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '20px' }}>
                4. 性别分布分析
              </h3>
              <GenderDistributionChart data={filteredData} />
            </div>
            <div>
              <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '20px' }}>
                5. 获奖年龄分析
              </h3>
              <AgeAnalysisChart data={filteredData} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
            <div>
              <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '20px' }}>
                6. 获奖类型分布
              </h3>
              <PrizeTypeChart data={filteredData} />
            </div>
            <div>
              <h3 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '20px' }}>
                7. 年代分布趋势
              </h3>
              <TimelineAnalysisChart data={filteredData} />
            </div>
          </div>
        </div>
      ) : (
        /* 数据表格区域 */
        <DataTable
          data={filteredData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortConfig={sortConfig}
          requestSort={requestSort}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      )}

      {/* 数据说明 */}
      <div style={{ 
        marginTop: '50px', 
        padding: '24px', 
        background: '#f8f9fa',
        borderRadius: '12px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h4 style={{ color: SCIENTIFIC_COLORS.primary, marginBottom: '12px' }}>
          数据集说明
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <strong>📊 数据集来源</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>诺贝尔奖官方数据集</li>
              <li>时间范围: 1901年 - 2025年</li>
              <li>包含6大奖项类别</li>
            </ul>
          </div>
          <div>
            <strong>🎯 交互功能</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>支持年份区间筛选</li>
              <li>多选奖项类别过滤</li>
              <li>图表缩放与悬停提示</li>
              <li>表格搜索、排序、分页</li>
            </ul>
          </div>
          <div>
            <strong>📈 可视化特性</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>不同类型的图表</li>
              <li>科研风格的配色方案</li>
              <li>响应式布局设计</li>
              <li>可配置的数据表格</li>
            </ul>
          </div>
        </div>
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <strong>最后更新:</strong> 2025年 | <strong>数据记录:</strong> {rawData.length.toLocaleString()} 条 | 
          <strong> 时间跨度:</strong> {minYear}-{maxYear}年
        </div>
      </div>
    </div>
  );
}