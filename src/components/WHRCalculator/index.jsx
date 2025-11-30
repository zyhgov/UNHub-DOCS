import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 腰臀比健康标准
const WHR_STANDARDS = {
  male: [
    { min: 0, max: 0.90, level: 'low', label: '低风险', color: '#22c55e', description: '脂肪分布健康，心血管疾病风险较低' },
    { min: 0.90, max: 0.95, level: 'moderate', label: '中等风险', color: '#f59e0b', description: '需要关注，建议改善生活方式' },
    { min: 0.95, max: 1.00, level: 'high', label: '高风险', color: '#f97316', description: '腹部脂肪偏多，健康风险增加' },
    { min: 1.00, max: 2.00, level: 'very-high', label: '极高风险', color: '#ef4444', description: '腹部肥胖明显，需要积极干预' },
  ],
  female: [
    { min: 0, max: 0.80, level: 'low', label: '低风险', color: '#22c55e', description: '脂肪分布健康，心血管疾病风险较低' },
    { min: 0.80, max: 0.85, level: 'moderate', label: '中等风险', color: '#f59e0b', description: '需要关注，建议改善生活方式' },
    { min: 0.85, max: 0.90, level: 'high', label: '高风险', color: '#f97316', description: '腹部脂肪偏多，健康风险增加' },
    { min: 0.90, max: 2.00, level: 'very-high', label: '极高风险', color: '#ef4444', description: '腹部肥胖明显，需要积极干预' },
  ],
};

// 腰围健康标准（中国标准）
const WAIST_STANDARDS = {
  male: [
    { min: 0, max: 85, level: 'normal', label: '正常', color: '#22c55e' },
    { min: 85, max: 90, level: 'warning', label: '预警', color: '#f59e0b' },
    { min: 90, max: 200, level: 'danger', label: '危险', color: '#ef4444' },
  ],
  female: [
    { min: 0, max: 80, level: 'normal', label: '正常', color: '#22c55e' },
    { min: 80, max: 85, level: 'warning', label: '预警', color: '#f59e0b' },
    { min: 85, max: 200, level: 'danger', label: '危险', color: '#ef4444' },
  ],
};

// 体型分类
const BODY_SHAPES = {
  apple: {
    name: '苹果型',
    icon: '🍎',
    description: '脂肪主要堆积在腹部',
    characteristics: ['腰部较粗', '上半身较胖', '腿部相对较细'],
    risks: ['心血管疾病风险较高', '糖尿病风险增加', '代谢综合征风险'],
    advice: ['重点减少腹部脂肪', '增加有氧运动', '控制碳水摄入', '避免久坐'],
  },
  pear: {
    name: '梨型',
    icon: '🍐',
    description: '脂肪主要堆积在臀部和大腿',
    characteristics: ['臀部较宽', '大腿较粗', '腰部相对较细'],
    risks: ['相对心血管风险较低', '可能影响下肢关节', '静脉曲张风险'],
    advice: ['可适当进行下肢训练', '保持健康体重', '避免长时间站立'],
  },
  balanced: {
    name: '均衡型',
    icon: '⚖️',
    description: '脂肪分布较为均匀',
    characteristics: ['腰臀比例适中', '身材较为匀称'],
    risks: ['健康风险相对较低'],
    advice: ['继续保持健康生活方式', '规律运动', '均衡饮食'],
  },
};

// 年龄段风险调整
const AGE_RISK_FACTORS = [
  { minAge: 0, maxAge: 30, factor: 0.95, note: '年轻人代谢较快，风险相对较低' },
  { minAge: 30, maxAge: 40, factor: 1.0, note: '标准风险评估' },
  { minAge: 40, maxAge: 50, factor: 1.05, note: '中年后代谢下降，需更加注意' },
  { minAge: 50, maxAge: 60, factor: 1.10, note: '腹部脂肪更易堆积' },
  { minAge: 60, maxAge: 200, factor: 1.15, note: '老年人需特别关注腰围' },
];

// 健康疾病风险评估
const HEALTH_RISKS = {
  low: [
    { disease: '2型糖尿病', risk: '低', icon: '💉' },
    { disease: '心血管疾病', risk: '低', icon: '❤️' },
    { disease: '高血压', risk: '低', icon: '🩺' },
    { disease: '代谢综合征', risk: '低', icon: '⚡' },
  ],
  moderate: [
    { disease: '2型糖尿病', risk: '中等', icon: '💉' },
    { disease: '心血管疾病', risk: '中等', icon: '❤️' },
    { disease: '高血压', risk: '中等', icon: '🩺' },
    { disease: '代谢综合征', risk: '中等', icon: '⚡' },
  ],
  high: [
    { disease: '2型糖尿病', risk: '较高', icon: '💉' },
    { disease: '心血管疾病', risk: '较高', icon: '❤️' },
    { disease: '高血压', risk: '较高', icon: '🩺' },
    { disease: '代谢综合征', risk: '较高', icon: '⚡' },
  ],
  'very-high': [
    { disease: '2型糖尿病', risk: '高', icon: '💉' },
    { disease: '心血管疾病', risk: '高', icon: '❤️' },
    { disease: '高血压', risk: '高', icon: '🩺' },
    { disease: '代谢综合征', risk: '高', icon: '⚡' },
  ],
};

function getWHRCategory(whr, gender) {
  const standards = WHR_STANDARDS[gender];
  return standards.find(s => whr >= s.min && whr < s.max) || standards[standards.length - 1];
}

function getWaistCategory(waist, gender) {
  const standards = WAIST_STANDARDS[gender];
  return standards.find(s => waist >= s.min && waist < s.max) || standards[standards.length - 1];
}

function getBodyShape(whr, gender) {
  const threshold = gender === 'male' ? 0.90 : 0.80;
  const lowThreshold = gender === 'male' ? 0.85 : 0.75;
  
  if (whr >= threshold) return BODY_SHAPES.apple;
  if (whr < lowThreshold) return BODY_SHAPES.pear;
  return BODY_SHAPES.balanced;
}

function getAgeRiskFactor(age) {
  if (!age) return { factor: 1.0, note: '' };
  return AGE_RISK_FACTORS.find(a => age >= a.minAge && age < a.maxAge) || AGE_RISK_FACTORS[AGE_RISK_FACTORS.length - 1];
}

export default function WHRCalculator() {
  const [gender, setGender] = useState('male');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(waist);
    const h = parseFloat(hip);
    const a = parseFloat(age);
    const ht = parseFloat(height);
    const wt = parseFloat(weight);

    if (!w || !h || w <= 0 || h <= 0) return null;

    // 计算腰臀比
    const whr = w / h;

    // 获取分类
    const whrCategory = getWHRCategory(whr, gender);
    const waistCategory = getWaistCategory(w, gender);
    const bodyShape = getBodyShape(whr, gender);
    const ageRiskFactor = getAgeRiskFactor(a);

    // 计算理想腰围范围
    const idealWHR = gender === 'male' ? 0.85 : 0.75;
    const idealWaist = (idealWHR * h).toFixed(1);
    const waistToLose = w > parseFloat(idealWaist) ? (w - parseFloat(idealWaist)).toFixed(1) : 0;

    // 计算腰围身高比 (WHtR)
    let whtr = null;
    let whtrCategory = null;
    if (ht && ht > 0) {
      whtr = (w / ht).toFixed(2);
      if (whtr < 0.4) {
        whtrCategory = { label: '偏瘦', color: '#3b82f6' };
      } else if (whtr < 0.5) {
        whtrCategory = { label: '健康', color: '#22c55e' };
      } else if (whtr < 0.6) {
        whtrCategory = { label: '超重风险', color: '#f59e0b' };
      } else {
        whtrCategory = { label: '肥胖风险', color: '#ef4444' };
      }
    }

    // BMI（如果提供了身高体重）
    let bmi = null;
    if (ht && wt && ht > 0 && wt > 0) {
      bmi = (wt / ((ht / 100) ** 2)).toFixed(1);
    }

    // 健康风险
    const healthRisks = HEALTH_RISKS[whrCategory.level];

    // 目标值
    const targetWHR = gender === 'male' ? 0.90 : 0.80;
    const targetWaist = gender === 'male' ? 85 : 80;

    return {
      whr: whr.toFixed(2),
      whrCategory,
      waistCategory,
      bodyShape,
      ageRiskFactor,
      idealWaist,
      waistToLose,
      whtr,
      whtrCategory,
      bmi,
      healthRisks,
      targetWHR,
      targetWaist,
      waist: w,
      hip: h,
    };
  }, [gender, waist, hip, age, height, weight]);

  const handleCalculate = () => {
    if (waist && hip && parseFloat(waist) > 0 && parseFloat(hip) > 0) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setGender('male');
    setWaist('');
    setHip('');
    setAge('');
    setHeight('');
    setWeight('');
    setShowResult(false);
  };

  return (
    <div className={styles.calculator}>
      {/* 输入区域 */}
      <div className={styles.inputSection}>
        <h3>📏 输入您的数据</h3>

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

        {/* 主要测量数据 */}
        <div className={styles.mainInputs}>
          <div className={styles.inputCard}>
            <div className={styles.inputIcon}>📍</div>
            <div className={styles.inputGroup}>
              <label htmlFor="waist">腰围 (cm) *</label>
              <input
                id="waist"
                type="number"
                min="40"
                max="200"
                step="0.1"
                placeholder="例如：80"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
              <span className={styles.inputHint}>肚脐水平位置测量</span>
            </div>
          </div>

          <div className={styles.inputCard}>
            <div className={styles.inputIcon}>📍</div>
            <div className={styles.inputGroup}>
              <label htmlFor="hip">臀围 (cm) *</label>
              <input
                id="hip"
                type="number"
                min="50"
                max="200"
                step="0.1"
                placeholder="例如：95"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
              />
              <span className={styles.inputHint}>臀部最宽处测量</span>
            </div>
          </div>
        </div>

        {/* 可选数据 */}
        <div className={styles.optionalSection}>
          <h4>📊 可选数据（用于更精确评估）</h4>
          <div className={styles.optionalGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="age">年龄 (岁)</label>
              <input
                id="age"
                type="number"
                min="10"
                max="120"
                placeholder="例如：35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="height">身高 (cm)</label>
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
              <label htmlFor="weight">体重 (kg)</label>
              <input
                id="weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                placeholder="例如：65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 测量指南 */}
        <div className={styles.measureGuide}>
          <h4>📐 正确测量方法</h4>
          <div className={styles.guideGrid}>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>👔</span>
              <div>
                <strong>腰围测量</strong>
                <p>站立放松，在肚脐水平位置，用软尺水平环绕测量。呼气末测量最准确。</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>👖</span>
              <div>
                <strong>臀围测量</strong>
                <p>站立，双脚并拢，在臀部最突出的位置水平环绕测量。</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.primaryBtn} onClick={handleCalculate}>
            计算腰臀比
          </button>
          <button className={styles.secondaryBtn} onClick={handleReset}>
            重置
          </button>
        </div>
      </div>

      {/* 结果区域 */}
      {showResult && result && (
        <div className={styles.resultSection}>
          <h3>📋 计算结果</h3>

          {/* 主要结果 */}
          <div className={styles.mainResults}>
            <div 
              className={styles.whrCard}
              style={{ borderColor: result.whrCategory.color }}
            >
              <div className={styles.whrHeader}>
                <span className={styles.whrLabel}>腰臀比 (WHR)</span>
                <span 
                  className={styles.whrBadge}
                  style={{ backgroundColor: result.whrCategory.color }}
                >
                  {result.whrCategory.label}
                </span>
              </div>
              <div 
                className={styles.whrValue}
                style={{ color: result.whrCategory.color }}
              >
                {result.whr}
              </div>
              <div className={styles.whrDesc}>
                {result.whrCategory.description}
              </div>
            </div>

            <div className={styles.bodyShapeCard}>
              <span className={styles.bodyShapeIcon}>{result.bodyShape.icon}</span>
              <span className={styles.bodyShapeLabel}>体型分类</span>
              <span className={styles.bodyShapeName}>{result.bodyShape.name}</span>
              <span className={styles.bodyShapeDesc}>{result.bodyShape.description}</span>
            </div>
          </div>

          {/* WHR 刻度尺 */}
          <div className={styles.whrScale}>
            <h4>📊 腰臀比健康范围（{gender === 'male' ? '男性' : '女性'}标准）</h4>
            <div className={styles.scaleContainer}>
              <div className={styles.scaleBar}>
                {WHR_STANDARDS[gender].map((standard, index) => {
                  const widths = gender === 'male' 
                    ? ['45%', '15%', '15%', '25%']
                    : ['40%', '15%', '15%', '30%'];
                  return (
                    <div
                      key={index}
                      className={styles.scaleSegment}
                      style={{ 
                        backgroundColor: standard.color,
                        width: widths[index]
                      }}
                    >
                      <span>{standard.label}</span>
                    </div>
                  );
                })}
              </div>
              <div 
                className={styles.scalePointer}
                style={{ 
                  left: `${Math.min(Math.max(
                    gender === 'male'
                      ? (result.whr < 0.90 ? (result.whr / 0.90) * 45
                        : result.whr < 0.95 ? 45 + ((result.whr - 0.90) / 0.05) * 15
                        : result.whr < 1.00 ? 60 + ((result.whr - 0.95) / 0.05) * 15
                        : 75 + ((result.whr - 1.00) / 0.20) * 25)
                      : (result.whr < 0.80 ? (result.whr / 0.80) * 40
                        : result.whr < 0.85 ? 40 + ((result.whr - 0.80) / 0.05) * 15
                        : result.whr < 0.90 ? 55 + ((result.whr - 0.85) / 0.05) * 15
                        : 70 + ((result.whr - 0.90) / 0.20) * 30),
                    2
                  ), 98)}%`
                }}
              >
                <div className={styles.pointerArrow}>▲</div>
                <div className={styles.pointerValue}>{result.whr}</div>
              </div>
              <div className={styles.scaleLabels}>
                <span>0</span>
                <span>{gender === 'male' ? '0.90' : '0.80'}</span>
                <span>{gender === 'male' ? '0.95' : '0.85'}</span>
                <span>{gender === 'male' ? '1.00' : '0.90'}</span>
                <span>{gender === 'male' ? '1.20' : '1.10'}</span>
              </div>
            </div>
          </div>

          {/* 综合指标 */}
          <div className={styles.metricsSection}>
            <h4>📈 综合健康指标</h4>
            <div className={styles.metricsGrid}>
              <div 
                className={styles.metricCard}
                style={{ borderLeftColor: result.waistCategory.color }}
              >
                <span className={styles.metricIcon}>📏</span>
                <span className={styles.metricLabel}>腰围评估</span>
                <span className={styles.metricValue}>{result.waist} cm</span>
                <span 
                  className={styles.metricStatus}
                  style={{ color: result.waistCategory.color }}
                >
                  {result.waistCategory.label}
                </span>
                <span className={styles.metricNote}>
                  {gender === 'male' ? '男性标准 < 85cm' : '女性标准 < 80cm'}
                </span>
              </div>

              {result.whtr && (
                <div 
                  className={styles.metricCard}
                  style={{ borderLeftColor: result.whtrCategory.color }}
                >
                  <span className={styles.metricIcon}>📐</span>
                  <span className={styles.metricLabel}>腰围身高比</span>
                  <span className={styles.metricValue}>{result.whtr}</span>
                  <span 
                    className={styles.metricStatus}
                    style={{ color: result.whtrCategory.color }}
                  >
                    {result.whtrCategory.label}
                  </span>
                  <span className={styles.metricNote}>健康标准 &lt; 0.5</span>
                </div>
              )}

              {result.bmi && (
                <div className={styles.metricCard}>
                  <span className={styles.metricIcon}>⚖️</span>
                  <span className={styles.metricLabel}>BMI</span>
                  <span className={styles.metricValue}>{result.bmi}</span>
                  <span className={styles.metricNote}>仅供参考</span>
                </div>
              )}

              <div className={styles.metricCard}>
                <span className={styles.metricIcon}>🎯</span>
                <span className={styles.metricLabel}>建议腰围</span>
                <span className={styles.metricValue}>{result.idealWaist} cm</span>
                {result.waistToLose > 0 && (
                  <span className={styles.metricNote} style={{ color: '#f59e0b' }}>
                    需减少 {result.waistToLose} cm
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 年龄风险提示 */}
          {result.ageRiskFactor.note && (
            <div className={styles.ageNote}>
              <span className={styles.ageIcon}>👤</span>
              <p>{result.ageRiskFactor.note}</p>
            </div>
          )}

          {/* 健康风险评估 */}
          <div className={styles.riskSection}>
            <h4>⚠️ 相关健康风险评估</h4>
            <div className={styles.riskGrid}>
              {result.healthRisks.map((risk, index) => (
                <div key={index} className={styles.riskCard}>
                  <span className={styles.riskIcon}>{risk.icon}</span>
                  <span className={styles.riskDisease}>{risk.disease}</span>
                  <span 
                    className={styles.riskLevel}
                    style={{ 
                      color: risk.risk === '低' ? '#22c55e' : 
                             risk.risk === '中等' ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    {risk.risk}风险
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 体型特征与建议 */}
          <div className={styles.bodyShapeSection}>
            <h4>{result.bodyShape.icon} {result.bodyShape.name}体型分析</h4>
            <div className={styles.shapeContent}>
              <div className={styles.shapeColumn}>
                <h5>📌 体型特征</h5>
                <ul>
                  {result.bodyShape.characteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.shapeColumn}>
                <h5>⚠️ 潜在风险</h5>
                <ul>
                  {result.bodyShape.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.shapeColumn}>
                <h5>💡 健康建议</h5>
                <ul>
                  {result.bodyShape.advice.map((advice, index) => (
                    <li key={index}>{advice}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 对比图示 */}
          <div className={styles.comparisonSection}>
            <h4>📊 您的数据 vs 健康标准</h4>
            <div className={styles.comparisonBars}>
              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>腰臀比</span>
                <div className={styles.comparisonBar}>
                  <div 
                    className={styles.comparisonFill}
                    style={{ 
                      width: `${Math.min((result.whr / 1.2) * 100, 100)}%`,
                      backgroundColor: result.whrCategory.color
                    }}
                  ></div>
                  <div 
                    className={styles.comparisonTarget}
                    style={{ left: `${(result.targetWHR / 1.2) * 100}%` }}
                  >
                    <span>标准线 {result.targetWHR}</span>
                  </div>
                </div>
                <span className={styles.comparisonValue}>{result.whr}</span>
              </div>

              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>腰围</span>
                <div className={styles.comparisonBar}>
                  <div 
                    className={styles.comparisonFill}
                    style={{ 
                      width: `${Math.min((result.waist / 120) * 100, 100)}%`,
                      backgroundColor: result.waistCategory.color
                    }}
                  ></div>
                  <div 
                    className={styles.comparisonTarget}
                    style={{ left: `${(result.targetWaist / 120) * 100}%` }}
                  >
                    <span>标准线 {result.targetWaist}cm</span>
                  </div>
                </div>
                <span className={styles.comparisonValue}>{result.waist} cm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 参考标准 */}
      <div className={styles.referenceSection}>
        <h3>📚 腰臀比参考标准</h3>

        <div className={styles.tablesContainer}>
          <div className={styles.tableWrapper}>
            <h4>👨 男性标准</h4>
            <table className={styles.referenceTable}>
              <thead>
                <tr>
                  <th>腰臀比</th>
                  <th>风险等级</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {WHR_STANDARDS.male.map((standard, index) => (
                  <tr key={index}>
                    <td>
                      <span className={styles.dot} style={{ backgroundColor: standard.color }}></span>
                      {standard.min} - {standard.max < 2 ? standard.max : '∞'}
                    </td>
                    <td style={{ color: standard.color, fontWeight: 600 }}>{standard.label}</td>
                    <td>{standard.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tableWrapper}>
            <h4>👩 女性标准</h4>
            <table className={styles.referenceTable}>
              <thead>
                <tr>
                  <th>腰臀比</th>
                  <th>风险等级</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {WHR_STANDARDS.female.map((standard, index) => (
                  <tr key={index}>
                    <td>
                      <span className={styles.dot} style={{ backgroundColor: standard.color }}></span>
                      {standard.min} - {standard.max < 2 ? standard.max : '∞'}
                    </td>
                    <td style={{ color: standard.color, fontWeight: 600 }}>{standard.label}</td>
                    <td>{standard.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.waistStandard}>
          <h4>📏 腰围健康标准（中国）</h4>
          <div className={styles.waistGrid}>
            <div className={styles.waistCard}>
              <span className={styles.waistIcon}>👨</span>
              <span className={styles.waistGender}>男性</span>
              <div className={styles.waistLevels}>
                <div className={styles.waistLevel}>
                  <span style={{ color: '#22c55e' }}>✓ &lt; 85cm</span>
                  <span>正常</span>
                </div>
                <div className={styles.waistLevel}>
                  <span style={{ color: '#f59e0b' }}>⚠ 85-90cm</span>
                  <span>预警</span>
                </div>
                <div className={styles.waistLevel}>
                  <span style={{ color: '#ef4444' }}>✗ ≥ 90cm</span>
                  <span>危险</span>
                </div>
              </div>
            </div>
            <div className={styles.waistCard}>
              <span className={styles.waistIcon}>👩</span>
              <span className={styles.waistGender}>女性</span>
              <div className={styles.waistLevels}>
                <div className={styles.waistLevel}>
                  <span style={{ color: '#22c55e' }}>✓ &lt; 80cm</span>
                  <span>正常</span>
                </div>
                <div className={styles.waistLevel}>
                  <span style={{ color: '#f59e0b' }}>⚠ 80-85cm</span>
                  <span>预警</span>
                </div>
                <div className={styles.waistLevel}>
                  <span style={{ color: '#ef4444' }}>✗ ≥ 85cm</span>
                  <span>危险</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 知识科普 */}
      <div className={styles.knowledgeSection}>
        <h3>📖 腰臀比知识</h3>

        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>什么是腰臀比？</h4>
            <p>
              腰臀比 (WHR) 是腰围与臀围的比值，是评估腹部脂肪分布的重要指标。
              它比单纯体重或 BMI 更能反映内脏脂肪水平和心血管疾病风险。
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>为什么腰臀比重要？</h4>
            <ul>
              <li>反映脂肪分布，而非单纯体重</li>
              <li>与心血管疾病风险密切相关</li>
              <li>预测2型糖尿病风险</li>
              <li>比 BMI 更能识别"隐性肥胖"</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>苹果型 vs 梨型</h4>
            <ul>
              <li><strong>苹果型：</strong>脂肪集中在腹部，健康风险较高</li>
              <li><strong>梨型：</strong>脂肪集中在臀部和大腿，风险相对较低</li>
              <li>男性更易形成苹果型，女性更易形成梨型</li>
              <li>绝经后女性可能向苹果型转变</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>如何改善腰臀比</h4>
            <ul>
              <li>增加有氧运动（跑步、游泳、骑车）</li>
              <li>减少精制碳水和糖分摄入</li>
              <li>增加蛋白质摄入</li>
              <li>进行核心力量训练</li>
              <li>保证充足睡眠，减少压力</li>
            </ul>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 注意事项：</strong></p>
          <ul>
            <li>测量时应保持一致的时间和状态（建议早晨空腹）</li>
            <li>孕妇、腹部有积液者不适用此计算器</li>
            <li>腰臀比只是健康评估的一个指标，需结合其他指标综合判断</li>
            <li>如有健康问题，请咨询专业医疗人员</li>
          </ul>
        </div>
      </div>
    </div>
  );
}