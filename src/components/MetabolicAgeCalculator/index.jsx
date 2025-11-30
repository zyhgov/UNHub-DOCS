import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 生活方式因素
const LIFESTYLE_FACTORS = {
  sleep: {
    name: '睡眠质量',
    icon: '😴',
    options: [
      { value: 'poor', label: '较差', description: '< 6小时或质量差', impact: 3 },
      { value: 'fair', label: '一般', description: '6-7小时', impact: 1 },
      { value: 'good', label: '良好', description: '7-8小时', impact: 0 },
      { value: 'excellent', label: '优秀', description: '7-9小时且质量高', impact: -1 },
    ],
  },
  exercise: {
    name: '运动频率',
    icon: '🏃',
    options: [
      { value: 'none', label: '几乎不运动', description: '久坐生活', impact: 4 },
      { value: 'light', label: '偶尔运动', description: '每周1-2次', impact: 1 },
      { value: 'moderate', label: '规律运动', description: '每周3-4次', impact: -1 },
      { value: 'active', label: '积极运动', description: '每周5次以上', impact: -3 },
    ],
  },
  stress: {
    name: '压力水平',
    icon: '😰',
    options: [
      { value: 'high', label: '压力很大', description: '经常焦虑紧张', impact: 3 },
      { value: 'moderate', label: '中等压力', description: '偶尔感到压力', impact: 1 },
      { value: 'low', label: '压力较小', description: '基本轻松', impact: 0 },
      { value: 'minimal', label: '几乎无压力', description: '心态平和', impact: -1 },
    ],
  },
  diet: {
    name: '饮食习惯',
    icon: '🥗',
    options: [
      { value: 'poor', label: '不健康', description: '常吃快餐、高糖高脂', impact: 3 },
      { value: 'fair', label: '一般', description: '偶尔注意饮食', impact: 1 },
      { value: 'good', label: '健康', description: '均衡饮食为主', impact: -1 },
      { value: 'excellent', label: '非常健康', description: '严格控制饮食', impact: -2 },
    ],
  },
  smoking: {
    name: '吸烟情况',
    icon: '🚬',
    options: [
      { value: 'heavy', label: '重度吸烟', description: '每天1包以上', impact: 5 },
      { value: 'moderate', label: '适度吸烟', description: '每天半包左右', impact: 3 },
      { value: 'light', label: '偶尔吸烟', description: '社交场合', impact: 1 },
      { value: 'never', label: '不吸烟', description: '从不或已戒烟', impact: 0 },
    ],
  },
  alcohol: {
    name: '饮酒情况',
    icon: '🍺',
    options: [
      { value: 'heavy', label: '经常饮酒', description: '几乎每天', impact: 3 },
      { value: 'moderate', label: '适度饮酒', description: '每周2-3次', impact: 1 },
      { value: 'light', label: '偶尔饮酒', description: '每月几次', impact: 0 },
      { value: 'never', label: '不饮酒', description: '从不', impact: -1 },
    ],
  },
  water: {
    name: '饮水量',
    icon: '💧',
    options: [
      { value: 'low', label: '较少', description: '< 1L/天', impact: 2 },
      { value: 'moderate', label: '一般', description: '1-1.5L/天', impact: 1 },
      { value: 'good', label: '充足', description: '1.5-2L/天', impact: 0 },
      { value: 'excellent', label: '非常充足', description: '> 2L/天', impact: -1 },
    ],
  },
  muscle: {
    name: '肌肉量',
    icon: '💪',
    options: [
      { value: 'low', label: '较少', description: '很少力量训练', impact: 3 },
      { value: 'average', label: '一般', description: '普通水平', impact: 1 },
      { value: 'good', label: '较好', description: '有规律训练', impact: -2 },
      { value: 'high', label: '很高', description: '健身爱好者', impact: -4 },
    ],
  },
};

// 代谢年龄评估等级
const METABOLIC_AGE_LEVELS = [
  { minDiff: -Infinity, maxDiff: -10, level: 'excellent', label: '卓越', color: '#22c55e', icon: '🌟', description: '您的代谢状态非常优秀！' },
  { minDiff: -10, maxDiff: -5, level: 'great', label: '优秀', color: '#84cc16', icon: '⭐', description: '您的代谢状态很好！' },
  { minDiff: -5, maxDiff: 0, level: 'good', label: '良好', color: '#eab308', icon: '👍', description: '您的代谢状态良好' },
  { minDiff: 0, maxDiff: 5, level: 'average', label: '一般', color: '#f59e0b', icon: '📊', description: '您的代谢状态一般，可以改善' },
  { minDiff: 5, maxDiff: 10, level: 'below', label: '偏低', color: '#f97316', icon: '⚠️', description: '您的代谢状态需要关注' },
  { minDiff: 10, maxDiff: Infinity, level: 'poor', label: '较差', color: '#ef4444', icon: '🔴', description: '建议积极改善生活方式' },
];

// 年龄段平均BMR参考值
const AGE_BMR_REFERENCE = {
  male: [
    { age: 20, bmr: 1800 },
    { age: 25, bmr: 1780 },
    { age: 30, bmr: 1750 },
    { age: 35, bmr: 1720 },
    { age: 40, bmr: 1680 },
    { age: 45, bmr: 1640 },
    { age: 50, bmr: 1600 },
    { age: 55, bmr: 1560 },
    { age: 60, bmr: 1520 },
    { age: 65, bmr: 1480 },
    { age: 70, bmr: 1440 },
    { age: 75, bmr: 1400 },
    { age: 80, bmr: 1360 },
  ],
  female: [
    { age: 20, bmr: 1500 },
    { age: 25, bmr: 1480 },
    { age: 30, bmr: 1450 },
    { age: 35, bmr: 1420 },
    { age: 40, bmr: 1380 },
    { age: 45, bmr: 1340 },
    { age: 50, bmr: 1300 },
    { age: 55, bmr: 1260 },
    { age: 60, bmr: 1220 },
    { age: 65, bmr: 1180 },
    { age: 70, bmr: 1140 },
    { age: 75, bmr: 1100 },
    { age: 80, bmr: 1060 },
  ],
};

// 计算BMR (Mifflin-St Jeor)
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

// 根据BMR反推代谢年龄
function calculateMetabolicAge(bmr, weight, height, gender, lifestyleImpact) {
  // 调整后的BMR
  const adjustedBMR = bmr - lifestyleImpact * 10;
  
  // 根据BMR反推年龄
  // BMR = 10 * weight + 6.25 * height - 5 * age + constant
  // age = (10 * weight + 6.25 * height + constant - BMR) / 5
  const constant = gender === 'male' ? 5 : -161;
  const metabolicAge = (10 * weight + 6.25 * height + constant - adjustedBMR) / 5;
  
  return Math.max(18, Math.min(90, Math.round(metabolicAge)));
}

// 获取代谢年龄评估等级
function getMetabolicAgeLevel(actualAge, metabolicAge) {
  const diff = metabolicAge - actualAge;
  return METABOLIC_AGE_LEVELS.find(l => diff >= l.minDiff && diff < l.maxDiff) || METABOLIC_AGE_LEVELS[METABOLIC_AGE_LEVELS.length - 1];
}

// 生成改善建议
function generateRecommendations(lifestyleChoices, metabolicAgeDiff) {
  const recommendations = [];
  const priorities = [];

  Object.entries(lifestyleChoices).forEach(([key, value]) => {
    const factor = LIFESTYLE_FACTORS[key];
    const option = factor.options.find(o => o.value === value);
    if (option && option.impact > 0) {
      priorities.push({
        factor: key,
        name: factor.name,
        icon: factor.icon,
        currentImpact: option.impact,
        currentLabel: option.label,
      });
    }
  });

  // 按影响程度排序
  priorities.sort((a, b) => b.currentImpact - a.currentImpact);

  // 生成具体建议
  const adviceMap = {
    sleep: '尝试保持7-8小时的规律睡眠，建立良好的睡前习惯',
    exercise: '逐步增加运动频率，建议每周至少进行150分钟中等强度运动',
    stress: '学习压力管理技巧，如冥想、深呼吸或瑜伽',
    diet: '减少加工食品摄入，增加蔬菜水果和优质蛋白',
    smoking: '戒烟是改善代谢健康的最有效方式之一',
    alcohol: '减少饮酒频率，每周不超过2次适量饮酒',
    water: '增加每日饮水量至1.5-2升',
    muscle: '增加力量训练，每周2-3次，提高肌肉量可显著提升基础代谢',
  };

  priorities.slice(0, 4).forEach(p => {
    recommendations.push({
      icon: p.icon,
      title: `改善${p.name}`,
      current: p.currentLabel,
      advice: adviceMap[p.factor],
      priority: p.currentImpact >= 3 ? 'high' : 'medium',
    });
  });

  return recommendations;
}

export default function MetabolicAgeCalculator() {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [lifestyle, setLifestyle] = useState({
    sleep: 'good',
    exercise: 'light',
    stress: 'moderate',
    diet: 'fair',
    smoking: 'never',
    alcohol: 'light',
    water: 'moderate',
    muscle: 'average',
  });
  const [showResult, setShowResult] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const updateLifestyle = (factor, value) => {
    setLifestyle(prev => ({ ...prev, [factor]: value }));
  };

  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const bf = parseFloat(bodyFat);

    if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) return null;

    // 计算实际BMR
    let bmr = calculateBMR(w, h, a, gender);

    // 如果有体脂率，使用Katch-McArdle公式调整
    if (bf && bf > 0 && bf < 100) {
      const leanMass = w * (1 - bf / 100);
      const katchBMR = 370 + 21.6 * leanMass;
      bmr = (bmr + katchBMR) / 2; // 取平均
    }

    // 计算生活方式影响
    let lifestyleImpact = 0;
    Object.entries(lifestyle).forEach(([key, value]) => {
      const factor = LIFESTYLE_FACTORS[key];
      const option = factor.options.find(o => o.value === value);
      if (option) {
        lifestyleImpact += option.impact;
      }
    });

    // 计算代谢年龄
    const metabolicAge = calculateMetabolicAge(bmr, w, h, gender, lifestyleImpact);
    const ageDiff = metabolicAge - a;
    const level = getMetabolicAgeLevel(a, metabolicAge);

    // 计算理想代谢年龄对应的BMR
    const idealMetabolicAge = Math.max(18, a - 5);
    const idealBMR = calculateBMR(w, h, idealMetabolicAge, gender);

    // BMI
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);

    // 生成建议
    const recommendations = generateRecommendations(lifestyle, ageDiff);

    // 计算生活方式评分 (0-100)
    let maxImpact = 0;
    let minImpact = 0;
    Object.values(LIFESTYLE_FACTORS).forEach(factor => {
      const impacts = factor.options.map(o => o.impact);
      maxImpact += Math.max(...impacts);
      minImpact += Math.min(...impacts);
    });
    const lifestyleScore = Math.round(100 - ((lifestyleImpact - minImpact) / (maxImpact - minImpact)) * 100);

    // 预估改善后的代谢年龄
    const potentialImprovement = Math.min(ageDiff > 0 ? ageDiff : 0, 10);

    return {
      bmr: Math.round(bmr),
      metabolicAge,
      actualAge: a,
      ageDiff,
      level,
      bmi,
      idealBMR: Math.round(idealBMR),
      lifestyleImpact,
      lifestyleScore,
      recommendations,
      potentialImprovement,
    };
  }, [gender, age, height, weight, bodyFat, lifestyle]);

  const handleCalculate = () => {
    if (height && weight && age) {
      setShowResult(true);
      setActiveStep(3);
    }
  };

  const handleReset = () => {
    setGender('male');
    setAge('');
    setHeight('');
    setWeight('');
    setBodyFat('');
    setLifestyle({
      sleep: 'good',
      exercise: 'light',
      stress: 'moderate',
      diet: 'fair',
      smoking: 'never',
      alcohol: 'light',
      water: 'moderate',
      muscle: 'average',
    });
    setShowResult(false);
    setActiveStep(1);
  };

  return (
    <div className={styles.calculator}>
      {/* 步骤指示器 */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${activeStep >= 1 ? styles.active : ''}`}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepLabel}>基础信息</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${activeStep >= 2 ? styles.active : ''}`}>
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepLabel}>生活方式</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${activeStep >= 3 ? styles.active : ''}`}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepLabel}>查看结果</span>
        </div>
      </div>

      {/* 步骤1: 基础信息 */}
      {activeStep === 1 && (
        <div className={styles.inputSection}>
          <h3>📊 基础身体信息</h3>

          {/* 性别选择 */}
          <div className={styles.inputGroup}>
            <label>性别</label>
            <div className={styles.genderButtons}>
              <button
                type="button"
                className={`${styles.genderBtn} ${gender === 'male' ? styles.active : ''}`}
                onClick={() => setGender('male')}
              >
                👨 男性
              </button>
              <button
                type="button"
                className={`${styles.genderBtn} ${gender === 'female' ? styles.active : ''}`}
                onClick={() => setGender('female')}
              >
                👩 女性
              </button>
            </div>
          </div>

          {/* 基础数据 */}
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="age">实际年龄 (岁) *</label>
              <input
                id="age"
                type="number"
                min="18"
                max="100"
                placeholder="例如：35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="height">身高 (cm) *</label>
              <input
                id="height"
                type="number"
                min="100"
                max="250"
                placeholder="例如：170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="weight">体重 (kg) *</label>
              <input
                id="weight"
                type="number"
                min="30"
                max="200"
                step="0.1"
                placeholder="例如：70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="bodyFat">体脂率 % (可选)</label>
              <input
                id="bodyFat"
                type="number"
                min="3"
                max="60"
                step="0.1"
                placeholder="例如：20"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              className={styles.primaryBtn} 
              onClick={() => setActiveStep(2)}
              disabled={!age || !height || !weight}
            >
              下一步：评估生活方式 →
            </button>
          </div>
        </div>
      )}

      {/* 步骤2: 生活方式评估 */}
      {activeStep === 2 && (
        <div className={styles.inputSection}>
          <h3>🎯 生活方式评估</h3>
          <p className={styles.sectionDesc}>
            请根据您的实际情况选择最接近的选项，这将帮助我们更准确地评估您的代谢年龄
          </p>

          <div className={styles.lifestyleGrid}>
            {Object.entries(LIFESTYLE_FACTORS).map(([key, factor]) => (
              <div key={key} className={styles.lifestyleCard}>
                <div className={styles.lifestyleHeader}>
                  <span className={styles.lifestyleIcon}>{factor.icon}</span>
                  <span className={styles.lifestyleName}>{factor.name}</span>
                </div>
                <div className={styles.lifestyleOptions}>
                  {factor.options.map((option) => (
                    <label
                      key={option.value}
                      className={`${styles.lifestyleOption} ${lifestyle[key] === option.value ? styles.active : ''}`}
                    >
                      <input
                        type="radio"
                        name={key}
                        value={option.value}
                        checked={lifestyle[key] === option.value}
                        onChange={() => updateLifestyle(key, option.value)}
                      />
                      <span className={styles.optionLabel}>{option.label}</span>
                      <span className={styles.optionDesc}>{option.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.buttonGroup}>
            <button 
              className={styles.secondaryBtn} 
              onClick={() => setActiveStep(1)}
            >
              ← 上一步
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={handleCalculate}
            >
              计算代谢年龄 🧬
            </button>
          </div>
        </div>
      )}

      {/* 步骤3: 结果展示 */}
      {activeStep === 3 && showResult && result && (
        <div className={styles.resultSection}>
          <h3>📋 您的代谢年龄报告</h3>

          {/* 主要结果 */}
          <div className={styles.mainResult}>
            <div className={styles.ageComparison}>
              <div className={styles.ageCard}>
                <span className={styles.ageLabel}>实际年龄</span>
                <span className={styles.ageValue}>{result.actualAge}</span>
                <span className={styles.ageUnit}>岁</span>
              </div>
              <div className={styles.ageVs}>
                <span className={styles.vsIcon}>⚡</span>
                <span>VS</span>
              </div>
              <div 
                className={styles.ageCard}
                style={{ borderColor: result.level.color }}
              >
                <span className={styles.ageLabel}>代谢年龄</span>
                <span 
                  className={styles.ageValue}
                  style={{ color: result.level.color }}
                >
                  {result.metabolicAge}
                </span>
                <span className={styles.ageUnit}>岁</span>
              </div>
            </div>

            <div 
              className={styles.resultBadge}
              style={{ backgroundColor: result.level.color }}
            >
              <span className={styles.badgeIcon}>{result.level.icon}</span>
              <div className={styles.badgeContent}>
                <span className={styles.badgeLabel}>代谢状态</span>
                <span className={styles.badgeValue}>{result.level.label}</span>
              </div>
              <span className={styles.badgeDiff}>
                {result.ageDiff > 0 ? `+${result.ageDiff}` : result.ageDiff} 岁
              </span>
            </div>

            <p className={styles.resultDesc}>{result.level.description}</p>
          </div>

          {/* 代谢年龄可视化 */}
          <div className={styles.ageVisual}>
            <h4>📊 代谢年龄对比</h4>
            <div className={styles.ageTimeline}>
              <div className={styles.timelineBar}>
                <div 
                  className={styles.actualAgeMarker}
                  style={{ left: `${Math.min(Math.max((result.actualAge - 18) / 62 * 100, 5), 95)}%` }}
                >
                  <div className={styles.markerLine}></div>
                  <div className={styles.markerLabel}>
                    实际 {result.actualAge}岁
                  </div>
                </div>
                <div 
                  className={styles.metabolicAgeMarker}
                  style={{ 
                    left: `${Math.min(Math.max((result.metabolicAge - 18) / 62 * 100, 5), 95)}%`,
                    '--marker-color': result.level.color
                  }}
                >
                  <div className={styles.markerLine}></div>
                  <div className={styles.markerLabel}>
                    代谢 {result.metabolicAge}岁
                  </div>
                </div>
              </div>
              <div className={styles.timelineLabels}>
                <span>18岁</span>
                <span>40岁</span>
                <span>60岁</span>
                <span>80岁</span>
              </div>
            </div>
          </div>

          {/* 综合指标 */}
          <div className={styles.metricsSection}>
            <h4>📈 综合健康指标</h4>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricIcon}>🔥</span>
                <span className={styles.metricLabel}>基础代谢率</span>
                <span className={styles.metricValue}>{result.bmr}</span>
                <span className={styles.metricUnit}>kcal/天</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricIcon}>⚖️</span>
                <span className={styles.metricLabel}>BMI</span>
                <span className={styles.metricValue}>{result.bmi}</span>
                <span className={styles.metricUnit}>kg/m²</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricIcon}>🎯</span>
                <span className={styles.metricLabel}>生活方式评分</span>
                <span className={styles.metricValue}>{result.lifestyleScore}</span>
                <span className={styles.metricUnit}>/ 100</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricIcon}>✨</span>
                <span className={styles.metricLabel}>改善潜力</span>
                <span className={styles.metricValue}>-{result.potentialImprovement}</span>
                <span className={styles.metricUnit}>岁</span>
              </div>
            </div>
          </div>

          {/* 生活方式评分仪表盘 */}
          <div className={styles.scoreSection}>
            <h4>🎯 生活方式评分</h4>
            <div className={styles.scoreGauge}>
              <svg viewBox="0 0 200 120" className={styles.gauge}>
                {/* 背景弧 */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e5e5e5"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* 分数弧 */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={result.lifestyleScore >= 80 ? '#22c55e' : result.lifestyleScore >= 60 ? '#eab308' : result.lifestyleScore >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${result.lifestyleScore * 2.51} 251`}
                />
                {/* 刻度 */}
                <text x="20" y="115" fontSize="10" fill="#888">0</text>
                <text x="95" y="30" fontSize="10" fill="#888">50</text>
                <text x="175" y="115" fontSize="10" fill="#888">100</text>
              </svg>
              <div className={styles.scoreCenter}>
                <span className={styles.scoreValue}>{result.lifestyleScore}</span>
                <span className={styles.scoreLabel}>分</span>
              </div>
            </div>
            <div className={styles.scoreLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#ef4444' }}></span>
                0-39 需改善
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#f59e0b' }}></span>
                40-59 一般
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#eab308' }}></span>
                60-79 良好
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#22c55e' }}></span>
                80-100 优秀
              </span>
            </div>
          </div>

          {/* 改善建议 */}
          {result.recommendations.length > 0 && (
            <div className={styles.recommendationsSection}>
              <h4>💡 个性化改善建议</h4>
              <div className={styles.recommendationsList}>
                {result.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`${styles.recommendationCard} ${styles[rec.priority]}`}
                  >
                    <div className={styles.recHeader}>
                      <span className={styles.recIcon}>{rec.icon}</span>
                      <span className={styles.recTitle}>{rec.title}</span>
                      {rec.priority === 'high' && (
                        <span className={styles.priorityBadge}>优先</span>
                      )}
                    </div>
                    <div className={styles.recCurrent}>
                      当前状态：<strong>{rec.current}</strong>
                    </div>
                    <div className={styles.recAdvice}>{rec.advice}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 预期改善 */}
          {result.ageDiff > 0 && (
            <div className={styles.improvementSection}>
              <h4>🚀 改善后的预期效果</h4>
              <div className={styles.improvementCard}>
                <div className={styles.improvementBefore}>
                  <span className={styles.improvementLabel}>当前</span>
                  <span className={styles.improvementValue}>{result.metabolicAge}岁</span>
                </div>
                <div className={styles.improvementArrow}>
                  <span>→</span>
                  <span className={styles.improvementPotential}>
                    可降低 {result.potentialImprovement} 岁
                  </span>
                </div>
                <div className={styles.improvementAfter}>
                  <span className={styles.improvementLabel}>改善后</span>
                  <span className={styles.improvementValue}>
                    {result.metabolicAge - result.potentialImprovement}岁
                  </span>
                </div>
              </div>
              <p className={styles.improvementNote}>
                通过改善上述生活方式因素，您的代谢年龄有望降低，更接近甚至低于实际年龄
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className={styles.buttonGroup}>
            <button 
              className={styles.secondaryBtn} 
              onClick={() => setActiveStep(2)}
            >
              ← 重新评估
            </button>
            <button 
              className={styles.secondaryBtn} 
              onClick={handleReset}
            >
              🔄 重新开始
            </button>
          </div>
        </div>
      )}

      {/* 知识科普 */}
      <div className={styles.knowledgeSection}>
        <h3>📚 代谢年龄知识</h3>

        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>什么是代谢年龄？</h4>
            <p>
              代谢年龄是根据基础代谢率（BMR）评估出的身体代谢状态对应的年龄。
              如果代谢年龄低于实际年龄，说明身体代谢能力较好；反之则需要关注。
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>影响代谢年龄的因素</h4>
            <ul>
              <li><strong>肌肉量：</strong>肌肉越多，代谢越高</li>
              <li><strong>运动习惯：</strong>规律运动提升代谢</li>
              <li><strong>睡眠质量：</strong>影响激素和代谢</li>
              <li><strong>饮食结构：</strong>均衡饮食促进代谢</li>
              <li><strong>压力水平：</strong>慢性压力降低代谢</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>如何降低代谢年龄</h4>
            <ul>
              <li>增加力量训练，提高肌肉量</li>
              <li>保证 7-8 小时优质睡眠</li>
              <li>增加蛋白质摄入</li>
              <li>避免极端节食</li>
              <li>减少久坐，增加日常活动</li>
              <li>管理压力，保持良好心态</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>代谢年龄的局限性</h4>
            <ul>
              <li>是估算值，非精确医学指标</li>
              <li>不能替代专业健康检查</li>
              <li>受多种因素影响，需综合评估</li>
              <li>应作为健康趋势参考，而非绝对标准</li>
            </ul>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 注意事项：</strong></p>
          <ul>
            <li>代谢年龄是基于统计模型的估算，仅供参考</li>
            <li>本计算器不能替代专业医疗诊断</li>
            <li>如有健康问题，请咨询医疗专业人员</li>
            <li>改善生活方式是降低代谢年龄的最有效方法</li>
          </ul>
        </div>
      </div>
    </div>
  );
}