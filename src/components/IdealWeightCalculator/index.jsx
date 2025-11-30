import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 理想体重计算公式
const FORMULAS = {
  devine: {
    name: 'Devine 公式',
    year: '1974',
    description: '最常用的临床公式',
    calculate: (height, gender) => {
      const inches = height / 2.54;
      const baseHeight = 60; // 5 feet = 60 inches
      if (gender === 'male') {
        return 50 + 2.3 * (inches - baseHeight);
      }
      return 45.5 + 2.3 * (inches - baseHeight);
    },
  },
  robinson: {
    name: 'Robinson 公式',
    year: '1983',
    description: '改良版 Devine 公式',
    calculate: (height, gender) => {
      const inches = height / 2.54;
      const baseHeight = 60;
      if (gender === 'male') {
        return 52 + 1.9 * (inches - baseHeight);
      }
      return 49 + 1.7 * (inches - baseHeight);
    },
  },
  miller: {
    name: 'Miller 公式',
    year: '1983',
    description: '适合较矮人群',
    calculate: (height, gender) => {
      const inches = height / 2.54;
      const baseHeight = 60;
      if (gender === 'male') {
        return 56.2 + 1.41 * (inches - baseHeight);
      }
      return 53.1 + 1.36 * (inches - baseHeight);
    },
  },
  hamwi: {
    name: 'Hamwi 公式',
    year: '1964',
    description: '经典公式',
    calculate: (height, gender) => {
      const inches = height / 2.54;
      const baseHeight = 60;
      if (gender === 'male') {
        return 48 + 2.7 * (inches - baseHeight);
      }
      return 45.5 + 2.2 * (inches - baseHeight);
    },
  },
  broca: {
    name: 'Broca 公式',
    year: '1871',
    description: '简单易记，适合亚洲人',
    calculate: (height, gender) => {
      if (gender === 'male') {
        return (height - 100) * 0.9;
      }
      return (height - 100) * 0.85;
    },
  },
  bmi: {
    name: 'BMI 标准法',
    year: '现代',
    description: '基于 BMI 22 计算',
    calculate: (height, gender) => {
      const heightM = height / 100;
      return 22 * heightM * heightM;
    },
  },
  lorentz: {
    name: 'Lorentz 公式',
    year: '1929',
    description: '欧洲常用公式',
    calculate: (height, gender) => {
      if (gender === 'male') {
        return height - 100 - (height - 150) / 4;
      }
      return height - 100 - (height - 150) / 2.5;
    },
  },
};

// 体型分类
const BODY_TYPES = [
  { 
    type: 'underweight', 
    label: '偏瘦', 
    bmiRange: [0, 18.5], 
    color: '#3b82f6',
    icon: '🦴',
    description: '体重低于健康范围'
  },
  { 
    type: 'normal', 
    label: '正常', 
    bmiRange: [18.5, 24], 
    color: '#22c55e',
    icon: '✅',
    description: '健康的体重范围'
  },
  { 
    type: 'overweight', 
    label: '超重', 
    bmiRange: [24, 28], 
    color: '#f59e0b',
    icon: '⚠️',
    description: '略高于健康范围'
  },
  { 
    type: 'obese', 
    label: '肥胖', 
    bmiRange: [28, 100], 
    color: '#ef4444',
    icon: '🔴',
    description: '需要关注健康'
  },
];

// 框架类型调整系数
const FRAME_TYPES = [
  { value: 'small', label: '小骨架', factor: 0.9, description: '手腕较细，骨架较小' },
  { value: 'medium', label: '中骨架', factor: 1.0, description: '正常骨架大小' },
  { value: 'large', label: '大骨架', factor: 1.1, description: '手腕较粗，骨架较大' },
];

// 计算健康体重范围（基于BMI）
function calculateHealthyRange(height, standard = 'china') {
  const heightM = height / 100;
  if (standard === 'china') {
    return {
      min: (18.5 * heightM * heightM).toFixed(1),
      max: (24 * heightM * heightM).toFixed(1),
      idealBmi: 22,
    };
  }
  // WHO 标准
  return {
    min: (18.5 * heightM * heightM).toFixed(1),
    max: (25 * heightM * heightM).toFixed(1),
    idealBmi: 22,
  };
}

// 获取体型分类
function getBodyType(bmi) {
  return BODY_TYPES.find(t => bmi >= t.bmiRange[0] && bmi < t.bmiRange[1]) || BODY_TYPES[3];
}

// 计算达到目标所需时间
function calculateTimeToGoal(currentWeight, targetWeight, weeklyChange = 0.5) {
  const diff = Math.abs(currentWeight - targetWeight);
  const weeks = diff / weeklyChange;
  const months = weeks / 4.3;
  return {
    weeks: Math.round(weeks),
    months: Math.round(months * 10) / 10,
  };
}

export default function IdealWeightCalculator() {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [age, setAge] = useState('');
  const [frameType, setFrameType] = useState('medium');
  const [selectedFormula, setSelectedFormula] = useState('bmi');
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const h = parseFloat(height);
    const cw = parseFloat(currentWeight);
    const a = parseFloat(age);

    if (!h || h < 100 || h > 250) return null;

    // 计算所有公式的结果
    const formulaResults = {};
    Object.entries(FORMULAS).forEach(([key, formula]) => {
      let idealWeight = formula.calculate(h, gender);
      // 应用骨架调整
      const frameFactor = FRAME_TYPES.find(f => f.value === frameType)?.factor || 1;
      idealWeight *= frameFactor;
      formulaResults[key] = Math.round(idealWeight * 10) / 10;
    });

    // 主要使用的理想体重
    const primaryIdeal = formulaResults[selectedFormula];

    // 计算健康范围
    const healthyRange = calculateHealthyRange(h);
    const frameFactor = FRAME_TYPES.find(f => f.value === frameType)?.factor || 1;
    healthyRange.min = (parseFloat(healthyRange.min) * frameFactor).toFixed(1);
    healthyRange.max = (parseFloat(healthyRange.max) * frameFactor).toFixed(1);

    // 所有公式的平均值
    const avgIdeal = Object.values(formulaResults).reduce((a, b) => a + b, 0) / Object.keys(formulaResults).length;

    // 当前状态分析
    let currentBmi = null;
    let bodyType = null;
    let weightDiff = null;
    let diffPercentage = null;
    let timeToGoal = null;

    if (cw && cw > 0) {
      currentBmi = cw / ((h / 100) ** 2);
      bodyType = getBodyType(currentBmi);
      weightDiff = cw - primaryIdeal;
      diffPercentage = ((weightDiff / primaryIdeal) * 100).toFixed(1);
      timeToGoal = calculateTimeToGoal(cw, primaryIdeal);
    }

    // 年龄调整建议
    let ageAdvice = null;
    if (a) {
      if (a >= 65) {
        ageAdvice = '老年人建议BMI维持在20-25之间，略高于年轻人标准';
      } else if (a < 18) {
        ageAdvice = '青少年应参考年龄别BMI标准，本计算器主要适用于成人';
      }
    }

    return {
      primaryIdeal,
      formulaResults,
      avgIdeal: Math.round(avgIdeal * 10) / 10,
      healthyRange,
      currentBmi: currentBmi ? currentBmi.toFixed(1) : null,
      bodyType,
      weightDiff: weightDiff ? Math.round(weightDiff * 10) / 10 : null,
      diffPercentage,
      timeToGoal,
      ageAdvice,
      height: h,
    };
  }, [gender, height, currentWeight, age, frameType, selectedFormula]);

  const handleCalculate = () => {
    if (height && parseFloat(height) >= 100) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setGender('male');
    setHeight('');
    setCurrentWeight('');
    setAge('');
    setFrameType('medium');
    setSelectedFormula('bmi');
    setShowResult(false);
  };

  return (
    <div className={styles.calculator}>
      {/* 输入区域 */}
      <div className={styles.inputSection}>
        <h3>📊 输入您的数据</h3>

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
            <label htmlFor="currentWeight">当前体重 (kg)</label>
            <input
              id="currentWeight"
              type="number"
              min="30"
              max="300"
              step="0.1"
              placeholder="例如：70（可选）"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="age">年龄 (岁)</label>
            <input
              id="age"
              type="number"
              min="10"
              max="120"
              placeholder="例如：30（可选）"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>

        {/* 骨架类型 */}
        <div className={styles.inputGroup}>
          <label>骨架类型</label>
          <div className={styles.frameOptions}>
            {FRAME_TYPES.map((frame) => (
              <label
                key={frame.value}
                className={`${styles.frameOption} ${frameType === frame.value ? styles.active : ''}`}
              >
                <input
                  type="radio"
                  name="frame"
                  value={frame.value}
                  checked={frameType === frame.value}
                  onChange={() => setFrameType(frame.value)}
                />
                <span className={styles.frameLabel}>{frame.label}</span>
                <span className={styles.frameDesc}>{frame.description}</span>
              </label>
            ))}
          </div>
          <div className={styles.frameTip}>
            💡 <strong>如何判断骨架大小？</strong> 用拇指和中指环绕手腕：能轻松触碰=小骨架；刚好触碰=中骨架；无法触碰=大骨架
          </div>
        </div>

        {/* 计算公式选择 */}
        <div className={styles.inputGroup}>
          <label>计算公式</label>
          <div className={styles.formulaOptions}>
            {Object.entries(FORMULAS).map(([key, formula]) => (
              <label
                key={key}
                className={`${styles.formulaOption} ${selectedFormula === key ? styles.active : ''}`}
              >
                <input
                  type="radio"
                  name="formula"
                  value={key}
                  checked={selectedFormula === key}
                  onChange={() => setSelectedFormula(key)}
                />
                <div className={styles.formulaInfo}>
                  <span className={styles.formulaName}>{formula.name}</span>
                  <span className={styles.formulaYear}>{formula.year}</span>
                </div>
                <span className={styles.formulaDesc}>{formula.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.primaryBtn} onClick={handleCalculate}>
            计算理想体重
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
          <div className={styles.mainResult}>
            <div className={styles.idealWeightCard}>
              <span className={styles.idealIcon}>⚖️</span>
              <div className={styles.idealContent}>
                <span className={styles.idealLabel}>您的理想体重</span>
                <span className={styles.idealValue}>{result.primaryIdeal}</span>
                <span className={styles.idealUnit}>公斤</span>
              </div>
              <div className={styles.idealFormula}>
                使用 {FORMULAS[selectedFormula].name}
              </div>
            </div>

            <div className={styles.rangeCard}>
              <span className={styles.rangeIcon}>📏</span>
              <div className={styles.rangeContent}>
                <span className={styles.rangeLabel}>健康体重范围</span>
                <span className={styles.rangeValue}>
                  {result.healthyRange.min} - {result.healthyRange.max}
                </span>
                <span className={styles.rangeUnit}>公斤</span>
              </div>
              <div className={styles.rangeNote}>
                基于 BMI 18.5-24（中国标准）
              </div>
            </div>
          </div>

          {/* 体重范围可视化 */}
          <div className={styles.weightScale}>
            <h4>📊 体重范围可视化</h4>
            <div className={styles.scaleContainer}>
              <div className={styles.scaleBar}>
                {BODY_TYPES.map((type, index) => (
                  <div
                    key={type.type}
                    className={styles.scaleSegment}
                    style={{ 
                      backgroundColor: type.color,
                      width: index === 0 ? '20%' : index === 1 ? '30%' : index === 2 ? '25%' : '25%'
                    }}
                  >
                    <span>{type.label}</span>
                  </div>
                ))}
              </div>
              
              {/* 理想体重标记 */}
              <div 
                className={styles.idealMarker}
                style={{ left: '35%' }}
              >
                <div className={styles.markerLine}></div>
                <div className={styles.markerLabel}>
                  理想<br/>{result.primaryIdeal}kg
                </div>
              </div>

              {/* 当前体重标记 */}
              {result.currentBmi && (
                <div 
                  className={styles.currentMarker}
                  style={{ 
                    left: `${Math.min(Math.max(
                      result.currentBmi < 18.5 ? (result.currentBmi / 18.5) * 20 :
                      result.currentBmi < 24 ? 20 + ((result.currentBmi - 18.5) / 5.5) * 30 :
                      result.currentBmi < 28 ? 50 + ((result.currentBmi - 24) / 4) * 25 :
                      75 + ((result.currentBmi - 28) / 12) * 25,
                      2
                    ), 98)}%`
                  }}
                >
                  <div className={styles.currentLine}></div>
                  <div className={styles.currentLabel}>
                    当前<br/>{currentWeight}kg
                  </div>
                </div>
              )}

              <div className={styles.scaleLabels}>
                <span>偏瘦</span>
                <span>正常</span>
                <span>超重</span>
                <span>肥胖</span>
              </div>
            </div>
          </div>

          {/* 当前状态分析 */}
          {result.currentBmi && (
            <div className={styles.statusSection}>
              <h4>📈 当前状态分析</h4>
              <div className={styles.statusCards}>
                <div 
                  className={styles.statusCard}
                  style={{ borderColor: result.bodyType.color }}
                >
                  <span className={styles.statusIcon}>{result.bodyType.icon}</span>
                  <span className={styles.statusLabel}>体型分类</span>
                  <span 
                    className={styles.statusValue}
                    style={{ color: result.bodyType.color }}
                  >
                    {result.bodyType.label}
                  </span>
                  <span className={styles.statusDesc}>{result.bodyType.description}</span>
                </div>

                <div className={styles.statusCard}>
                  <span className={styles.statusIcon}>📊</span>
                  <span className={styles.statusLabel}>当前 BMI</span>
                  <span className={styles.statusValue}>{result.currentBmi}</span>
                  <span className={styles.statusDesc}>理想 BMI 范围：18.5-24</span>
                </div>

                <div className={styles.statusCard}>
                  <span className={styles.statusIcon}>
                    {result.weightDiff > 0 ? '📉' : result.weightDiff < 0 ? '📈' : '✅'}
                  </span>
                  <span className={styles.statusLabel}>与理想体重差距</span>
                  <span 
                    className={styles.statusValue}
                    style={{ 
                      color: result.weightDiff > 5 ? '#ef4444' : 
                             result.weightDiff < -5 ? '#3b82f6' : '#22c55e' 
                    }}
                  >
                    {result.weightDiff > 0 ? '+' : ''}{result.weightDiff} kg
                  </span>
                  <span className={styles.statusDesc}>
                    {result.weightDiff > 0 ? `超出 ${result.diffPercentage}%` : 
                     result.weightDiff < 0 ? `低于 ${Math.abs(result.diffPercentage)}%` : 
                     '恰好理想！'}
                  </span>
                </div>

                {result.weightDiff !== 0 && Math.abs(result.weightDiff) > 1 && (
                  <div className={styles.statusCard}>
                    <span className={styles.statusIcon}>⏱️</span>
                    <span className={styles.statusLabel}>预计达成时间</span>
                    <span className={styles.statusValue}>
                      {result.timeToGoal.months} 个月
                    </span>
                    <span className={styles.statusDesc}>
                      按每周 {result.weightDiff > 0 ? '减' : '增'} 0.5kg 计算
                    </span>
                  </div>
                )}
              </div>

              {/* 建议 */}
              <div className={styles.adviceCard}>
                <h5>💡 个性化建议</h5>
                {result.weightDiff > 5 && (
                  <ul>
                    <li>建议每日热量缺口控制在 300-500 千卡</li>
                    <li>增加有氧运动，每周至少 150 分钟</li>
                    <li>保证充足蛋白质摄入，防止肌肉流失</li>
                    <li>避免过度节食，以免代谢下降</li>
                  </ul>
                )}
                {result.weightDiff < -5 && (
                  <ul>
                    <li>建议每日热量盈余 300-500 千卡</li>
                    <li>增加力量训练，促进肌肉增长</li>
                    <li>选择营养密度高的食物</li>
                    <li>保证充足睡眠，促进身体恢复</li>
                  </ul>
                )}
                {Math.abs(result.weightDiff) <= 5 && (
                  <ul>
                    <li>您的体重已接近理想范围，继续保持！</li>
                    <li>保持规律运动和均衡饮食</li>
                    <li>定期监测体重变化</li>
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 年龄提示 */}
          {result.ageAdvice && (
            <div className={styles.ageAdvice}>
              <span className={styles.ageIcon}>👴</span>
              <p>{result.ageAdvice}</p>
            </div>
          )}

          {/* 多公式对比 */}
          <div className={styles.comparisonSection}>
            <h4>📐 不同公式计算结果对比</h4>
            <div className={styles.comparisonGrid}>
              {Object.entries(result.formulaResults).map(([key, value]) => (
                <div 
                  key={key}
                  className={`${styles.comparisonCard} ${selectedFormula === key ? styles.active : ''}`}
                  onClick={() => setSelectedFormula(key)}
                >
                  <div className={styles.comparisonHeader}>
                    <span className={styles.comparisonName}>{FORMULAS[key].name}</span>
                    {selectedFormula === key && (
                      <span className={styles.currentBadge}>当前</span>
                    )}
                  </div>
                  <span className={styles.comparisonValue}>{value} kg</span>
                  <span className={styles.comparisonYear}>{FORMULAS[key].year}</span>
                </div>
              ))}
            </div>
            <div className={styles.avgResult}>
              <span>所有公式平均值：</span>
              <strong>{result.avgIdeal} kg</strong>
            </div>
          </div>

          {/* 快速参考表 */}
          <div className={styles.quickReference}>
            <h4>📋 身高-理想体重速查表（{gender === 'male' ? '男性' : '女性'}）</h4>
            <div className={styles.referenceTable}>
              <table>
                <thead>
                  <tr>
                    <th>身高</th>
                    <th>理想体重</th>
                    <th>健康范围</th>
                  </tr>
                </thead>
                <tbody>
                  {[155, 160, 165, 170, 175, 180, 185].map(h => {
                    const ideal = FORMULAS.bmi.calculate(h, gender);
                    const range = calculateHealthyRange(h);
                    const isCurrentHeight = Math.abs(h - result.height) < 3;
                    return (
                      <tr key={h} className={isCurrentHeight ? styles.highlight : ''}>
                        <td>{h} cm</td>
                        <td>{ideal.toFixed(1)} kg</td>
                        <td>{range.min} - {range.max} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 知识科普 */}
      <div className={styles.knowledgeSection}>
        <h3>📚 理想体重知识</h3>

        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>什么是理想体重？</h4>
            <p>
              理想体重是指与身高、性别、年龄相匹配的、对健康最有利的体重范围。
              它不是一个固定数值，而是一个范围。理想体重因人而异，受骨架大小、
              肌肉量、年龄等因素影响。
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>为什么有这么多公式？</h4>
            <p>
              不同公式基于不同人群的研究数据开发：
            </p>
            <ul>
              <li><strong>Devine：</strong>临床用药剂量计算，最常用</li>
              <li><strong>Broca：</strong>简单易记，适合亚洲人</li>
              <li><strong>BMI法：</strong>基于现代健康标准</li>
              <li><strong>Robinson/Miller：</strong>修正版，更精确</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>理想体重的局限性</h4>
            <ul>
              <li>不考虑肌肉量（运动员可能"超重"但很健康）</li>
              <li>不考虑体脂分布</li>
              <li>不适用于孕妇、儿童、青少年</li>
              <li>老年人标准可适当放宽</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>如何科学管理体重</h4>
            <ul>
              <li>设定合理目标，每周减/增 0.5kg 为宜</li>
              <li>关注体脂率，而非单纯体重数字</li>
              <li>结合力量训练，保持肌肉量</li>
              <li>保持长期健康的生活方式</li>
            </ul>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 注意事项：</strong></p>
          <ul>
            <li>理想体重仅供参考，不应作为唯一的健康指标</li>
            <li>运动员、孕妇等特殊人群应使用专业评估方法</li>
            <li>体重管理应循序渐进，避免极端节食</li>
            <li>如有健康问题，请咨询医疗专业人员</li>
          </ul>
        </div>
      </div>
    </div>
  );
}