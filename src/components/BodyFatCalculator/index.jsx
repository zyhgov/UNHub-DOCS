import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 体脂率分类标准
const BODY_FAT_CATEGORIES = {
  male: [
    { min: 0, max: 6, label: '必需脂肪', color: '#3498db', description: '维持生命所需的最低脂肪量，低于此值危险' },
    { min: 6, max: 14, label: '运动员', color: '#2ecc71', description: '专业运动员水平，肌肉线条明显' },
    { min: 14, max: 18, label: '健康', color: '#27ae60', description: '理想的健康体脂范围' },
    { min: 18, max: 25, label: '可接受', color: '#f39c12', description: '正常范围，建议适当运动' },
    { min: 25, max: 100, label: '肥胖', color: '#e74c3c', description: '体脂过高，建议减脂' },
  ],
  female: [
    { min: 0, max: 14, label: '必需脂肪', color: '#3498db', description: '维持生命所需的最低脂肪量，低于此值危险' },
    { min: 14, max: 21, label: '运动员', color: '#2ecc71', description: '专业运动员水平，身材紧致' },
    { min: 21, max: 25, label: '健康', color: '#27ae60', description: '理想的健康体脂范围' },
    { min: 25, max: 32, label: '可接受', color: '#f39c12', description: '正常范围，建议适当运动' },
    { min: 32, max: 100, label: '肥胖', color: '#e74c3c', description: '体脂过高，建议减脂' },
  ],
};

// 年龄段理想体脂范围
const AGE_RANGES = {
  male: [
    { age: '20-29', ideal: '11-14%', acceptable: '14-20%' },
    { age: '30-39', ideal: '12-15%', acceptable: '15-21%' },
    { age: '40-49', ideal: '14-17%', acceptable: '17-23%' },
    { age: '50-59', ideal: '15-18%', acceptable: '18-24%' },
    { age: '60+', ideal: '16-19%', acceptable: '19-25%' },
  ],
  female: [
    { age: '20-29', ideal: '16-20%', acceptable: '20-25%' },
    { age: '30-39', ideal: '17-21%', acceptable: '21-26%' },
    { age: '40-49', ideal: '18-22%', acceptable: '22-28%' },
    { age: '50-59', ideal: '19-23%', acceptable: '23-30%' },
    { age: '60+', ideal: '20-24%', acceptable: '24-31%' },
  ],
};

// 计算方法
const METHODS = {
  navy: {
    name: '美国海军公式',
    description: '使用腰围、颈围等围度测量，准确度较高',
    requiresNeck: true,
    requiresWaist: true,
    requiresHip: true, // 仅女性需要
  },
  bmi: {
    name: 'BMI 估算法',
    description: '基于 BMI、年龄、性别估算，简便但精度较低',
    requiresNeck: false,
    requiresWaist: false,
    requiresHip: false,
  },
  ymca: {
    name: 'YMCA 公式',
    description: '仅需腰围和体重，适合快速估算',
    requiresNeck: false,
    requiresWaist: true,
    requiresHip: false,
  },
};

// 美国海军公式计算
function calculateNavy(gender, height, waist, neck, hip) {
  if (gender === 'male') {
    // 男性公式
    return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    // 女性公式
    return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  }
}

// BMI 估算法
function calculateFromBMI(gender, age, bmi) {
  if (gender === 'male') {
    return 1.20 * bmi + 0.23 * age - 16.2;
  } else {
    return 1.20 * bmi + 0.23 * age - 5.4;
  }
}

// YMCA 公式
function calculateYMCA(gender, weight, waist) {
  if (gender === 'male') {
    const leanBodyMass = (weight * 1.082) + 94.42 - (waist * 4.15);
    return ((weight - leanBodyMass) / weight) * 100;
  } else {
    const leanBodyMass = (weight * 0.732) + 8.987 + (waist * 0.157) - (waist * 0.249) + (waist * 0.434);
    return ((weight - leanBodyMass) / weight) * 100;
  }
}

function getCategory(bodyFat, gender) {
  const categories = BODY_FAT_CATEGORIES[gender];
  return categories.find(cat => bodyFat >= cat.min && bodyFat < cat.max);
}

function getAgeRange(age, gender) {
  const ranges = AGE_RANGES[gender];
  if (age < 30) return ranges[0];
  if (age < 40) return ranges[1];
  if (age < 50) return ranges[2];
  if (age < 60) return ranges[3];
  return ranges[4];
}

export default function BodyFatCalculator() {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [hip, setHip] = useState('');
  const [method, setMethod] = useState('navy');
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const wa = parseFloat(waist);
    const n = parseFloat(neck);
    const hi = parseFloat(hip);

    if (!h || !w || h <= 0 || w <= 0) return null;

    const bmi = w / ((h / 100) ** 2);
    let bodyFat = null;
    let methodsResults = {};

    // 计算各种方法的结果
    if (wa && n && (gender === 'male' || hi)) {
      methodsResults.navy = calculateNavy(gender, h, wa, n, hi);
    }

    if (a) {
      methodsResults.bmi = calculateFromBMI(gender, a, bmi);
    }

    if (wa) {
      methodsResults.ymca = calculateYMCA(gender, w, wa);
    }

    // 选择当前方法的结果
    bodyFat = methodsResults[method];

    if (bodyFat === null || bodyFat === undefined || isNaN(bodyFat)) {
      // 尝试使用其他可用方法
      if (methodsResults.navy) bodyFat = methodsResults.navy;
      else if (methodsResults.bmi) bodyFat = methodsResults.bmi;
      else if (methodsResults.ymca) bodyFat = methodsResults.ymca;
    }

    if (bodyFat === null || bodyFat === undefined || isNaN(bodyFat)) return null;

    // 限制合理范围
    bodyFat = Math.max(3, Math.min(60, bodyFat));

    const category = getCategory(bodyFat, gender);
    const ageRange = a ? getAgeRange(a, gender) : null;

    // 计算身体成分
    const fatMass = (w * bodyFat / 100).toFixed(1);
    const leanMass = (w - fatMass).toFixed(1);

    // 计算理想体脂对应的体重
    const idealBodyFat = gender === 'male' ? 15 : 22;
    const idealWeight = (parseFloat(leanMass) / (1 - idealBodyFat / 100)).toFixed(1);
    const weightToLose = (w - idealWeight).toFixed(1);

    return {
      bodyFat: bodyFat.toFixed(1),
      category,
      ageRange,
      bmi: bmi.toFixed(1),
      fatMass,
      leanMass,
      idealWeight,
      weightToLose,
      methodsResults,
    };
  }, [gender, age, height, weight, waist, neck, hip, method]);

  const handleCalculate = () => {
    if (height && weight) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setGender('male');
    setAge('');
    setHeight('');
    setWeight('');
    setWaist('');
    setNeck('');
    setHip('');
    setMethod('navy');
    setShowResult(false);
  };

  const currentMethod = METHODS[method];

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

        {/* 计算方法选择 */}
        <div className={styles.inputGroup}>
          <label>计算方法</label>
          <div className={styles.methodOptions}>
            {Object.entries(METHODS).map(([key, m]) => (
              <label
                key={key}
                className={`${styles.methodOption} ${method === key ? styles.active : ''}`}
              >
                <input
                  type="radio"
                  name="method"
                  value={key}
                  checked={method === key}
                  onChange={() => setMethod(key)}
                />
                <span className={styles.methodName}>{m.name}</span>
                <span className={styles.methodDesc}>{m.description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 基础数据 */}
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="age">年龄 (岁)</label>
            <input
              id="age"
              type="number"
              min="10"
              max="100"
              placeholder="例如：30"
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
              max="200"
              step="0.1"
              placeholder="例如：70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>

        {/* 围度测量 */}
        {(currentMethod.requiresWaist || currentMethod.requiresNeck || currentMethod.requiresHip) && (
          <div className={styles.measurementSection}>
            <h4>📏 围度测量</h4>
            <div className={styles.inputGrid}>
              {(currentMethod.requiresWaist || method === 'ymca') && (
                <div className={styles.inputGroup}>
                  <label htmlFor="waist">
                    腰围 (cm)
                    <span className={styles.measureTip}>肚脐位置水平测量</span>
                  </label>
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
                </div>
              )}

              {currentMethod.requiresNeck && (
                <div className={styles.inputGroup}>
                  <label htmlFor="neck">
                    颈围 (cm)
                    <span className={styles.measureTip}>喉结下方测量</span>
                  </label>
                  <input
                    id="neck"
                    type="number"
                    min="20"
                    max="60"
                    step="0.1"
                    placeholder="例如：38"
                    value={neck}
                    onChange={(e) => setNeck(e.target.value)}
                  />
                </div>
              )}

              {currentMethod.requiresHip && gender === 'female' && (
                <div className={styles.inputGroup}>
                  <label htmlFor="hip">
                    臀围 (cm)
                    <span className={styles.measureTip}>臀部最宽处测量</span>
                  </label>
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* 测量指南 */}
        {method === 'navy' && (
          <div className={styles.measureGuide}>
            <h4>📐 测量指南</h4>
            <div className={styles.guideGrid}>
              <div className={styles.guideItem}>
                <span className={styles.guideIcon}>👔</span>
                <div>
                  <strong>颈围</strong>
                  <p>在喉结正下方，颈部最细处水平测量</p>
                </div>
              </div>
              <div className={styles.guideItem}>
                <span className={styles.guideIcon}>👖</span>
                <div>
                  <strong>腰围</strong>
                  <p>在肚脐位置，自然呼吸时水平测量</p>
                </div>
              </div>
              {gender === 'female' && (
                <div className={styles.guideItem}>
                  <span className={styles.guideIcon}>👗</span>
                  <div>
                    <strong>臀围</strong>
                    <p>在臀部最宽处水平测量</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.primaryBtn} onClick={handleCalculate}>
            计算体脂率
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
            <div
              className={styles.bodyFatDisplay}
              style={{ borderColor: result.category?.color }}
            >
              <span
                className={styles.bodyFatValue}
                style={{ color: result.category?.color }}
              >
                {result.bodyFat}%
              </span>
              <span
                className={styles.bodyFatLabel}
                style={{ color: result.category?.color }}
              >
                {result.category?.label}
              </span>
            </div>

            {/* 体脂率刻度尺 */}
            <div className={styles.fatScale}>
              <div className={styles.scaleBar}>
                {BODY_FAT_CATEGORIES[gender].map((cat, index) => {
                  const width = cat.max === 100 
                    ? (gender === 'male' ? 35 : 28) 
                    : (cat.max - cat.min);
                  return (
                    <div
                      key={index}
                      className={styles.scaleSegment}
                      style={{
                        backgroundColor: cat.color,
                        width: `${gender === 'male' 
                          ? (index === 0 ? 15 : index === 1 ? 20 : index === 2 ? 10 : index === 3 ? 18 : 37)
                          : (index === 0 ? 20 : index === 1 ? 15 : index === 2 ? 10 : index === 3 ? 18 : 37)}%`
                      }}
                    >
                      <span>{cat.label}</span>
                    </div>
                  );
                })}
              </div>
              <div
                className={styles.scalePointer}
                style={{
                  left: `${Math.min(Math.max(
                    gender === 'male'
                      ? (result.bodyFat < 6 ? result.bodyFat / 6 * 15
                        : result.bodyFat < 14 ? 15 + (result.bodyFat - 6) / 8 * 20
                        : result.bodyFat < 18 ? 35 + (result.bodyFat - 14) / 4 * 10
                        : result.bodyFat < 25 ? 45 + (result.bodyFat - 18) / 7 * 18
                        : 63 + (result.bodyFat - 25) / 15 * 37)
                      : (result.bodyFat < 14 ? result.bodyFat / 14 * 20
                        : result.bodyFat < 21 ? 20 + (result.bodyFat - 14) / 7 * 15
                        : result.bodyFat < 25 ? 35 + (result.bodyFat - 21) / 4 * 10
                        : result.bodyFat < 32 ? 45 + (result.bodyFat - 25) / 7 * 18
                        : 63 + (result.bodyFat - 32) / 18 * 37),
                    2
                  ), 98)}%`
                }}
              >
                <div className={styles.pointerArrow}>▲</div>
                <div className={styles.pointerValue}>{result.bodyFat}%</div>
              </div>
            </div>
          </div>

          {/* 身体成分分析 */}
          <div className={styles.compositionSection}>
            <h4>🏋️ 身体成分分析</h4>
            <div className={styles.compositionCards}>
              <div className={styles.compositionCard}>
                <div className={styles.compositionVisual}>
                  <div className={styles.bodyChart}>
                    <div
                      className={styles.fatPortion}
                      style={{
                        height: `${result.bodyFat}%`,
                        backgroundColor: result.category?.color
                      }}
                    />
                    <div
                      className={styles.leanPortion}
                      style={{ height: `${100 - result.bodyFat}%` }}
                    />
                  </div>
                </div>
                <div className={styles.compositionStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statDot} style={{ backgroundColor: result.category?.color }}></span>
                    <span className={styles.statLabel}>脂肪重量</span>
                    <span className={styles.statValue}>{result.fatMass} kg</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statDot} style={{ backgroundColor: '#3b82f6' }}></span>
                    <span className={styles.statLabel}>瘦体重</span>
                    <span className={styles.statValue}>{result.leanMass} kg</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statDot} style={{ backgroundColor: '#6b7280' }}></span>
                    <span className={styles.statLabel}>总体重</span>
                    <span className={styles.statValue}>{weight} kg</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <h5>📊 BMI</h5>
                  <p className={styles.infoValue}>{result.bmi}</p>
                </div>
                <div className={styles.infoCard}>
                  <h5>🎯 理想体重</h5>
                  <p className={styles.infoValue}>{result.idealWeight} kg</p>
                  <p className={styles.infoDesc}>
                    基于理想体脂率 {gender === 'male' ? '15%' : '22%'}
                  </p>
                </div>
                <div className={styles.infoCard}>
                  <h5>⚖️ 建议调整</h5>
                  <p className={styles.infoValue}>
                    {parseFloat(result.weightToLose) > 0 ? (
                      <span style={{ color: '#ef4444' }}>减 {result.weightToLose} kg</span>
                    ) : parseFloat(result.weightToLose) < 0 ? (
                      <span style={{ color: '#3b82f6' }}>增 {Math.abs(result.weightToLose)} kg</span>
                    ) : (
                      <span style={{ color: '#22c55e' }}>保持</span>
                    )}
                  </p>
                </div>
                <div className={styles.infoCard}>
                  <h5>💪 健康评估</h5>
                  <p className={styles.infoDesc}>{result.category?.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 年龄段参考 */}
          {result.ageRange && (
            <div className={styles.ageRangeSection}>
              <h4>📅 您的年龄段参考值</h4>
              <div className={styles.ageRangeInfo}>
                <div className={styles.ageRangeItem}>
                  <span className={styles.ageRangeLabel}>理想范围</span>
                  <span className={styles.ageRangeValue}>{result.ageRange.ideal}</span>
                </div>
                <div className={styles.ageRangeItem}>
                  <span className={styles.ageRangeLabel}>可接受范围</span>
                  <span className={styles.ageRangeValue}>{result.ageRange.acceptable}</span>
                </div>
              </div>
            </div>
          )}

          {/* 多方法对比 */}
          {Object.keys(result.methodsResults).length > 1 && (
            <div className={styles.methodsComparison}>
              <h4>📐 不同方法对比</h4>
              <div className={styles.methodsTable}>
                {Object.entries(result.methodsResults).map(([key, value]) => (
                  value && (
                    <div
                      key={key}
                      className={`${styles.methodRow} ${method === key ? styles.active : ''}`}
                    >
                      <span className={styles.methodRowName}>
                        {METHODS[key].name}
                        {method === key && <span className={styles.currentBadge}>当前</span>}
                      </span>
                      <span className={styles.methodRowValue}>{value.toFixed(1)}%</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 参考标准 */}
      <div className={styles.referenceSection}>
        <h3>📚 体脂率参考标准</h3>

        <div className={styles.tablesContainer}>
          <div className={styles.tableWrapper}>
            <h4>👨 男性体脂率标准</h4>
            <table className={styles.referenceTable}>
              <thead>
                <tr>
                  <th>分类</th>
                  <th>体脂率</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {BODY_FAT_CATEGORIES.male.map((cat, index) => (
                  <tr key={index}>
                    <td>
                      <span className={styles.dot} style={{ backgroundColor: cat.color }}></span>
                      {cat.label}
                    </td>
                    <td>{cat.min}-{cat.max === 100 ? '∞' : cat.max}%</td>
                    <td>{cat.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tableWrapper}>
            <h4>👩 女性体脂率标准</h4>
            <table className={styles.referenceTable}>
              <thead>
                <tr>
                  <th>分类</th>
                  <th>体脂率</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {BODY_FAT_CATEGORIES.female.map((cat, index) => (
                  <tr key={index}>
                    <td>
                      <span className={styles.dot} style={{ backgroundColor: cat.color }}></span>
                      {cat.label}
                    </td>
                    <td>{cat.min}-{cat.max === 100 ? '∞' : cat.max}%</td>
                    <td>{cat.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 注意事项：</strong></p>
          <ul>
            <li>围度测量法的准确度取决于测量的准确性，建议多次测量取平均值</li>
            <li>BMI 估算法精度较低，仅供参考</li>
            <li>最准确的体脂测量方法是 DEXA 扫描或水下称重</li>
            <li>体脂率会随年龄增长自然上升，评估时需考虑年龄因素</li>
            <li>女性体脂率天然高于男性，这是正常的生理差异</li>
          </ul>
        </div>
      </div>
    </div>
  );
}