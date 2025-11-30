import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// BMI 分类标准（中国标准）
const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: '体重过低', color: '#3498db', risk: '营养不良风险增加', advice: '建议增加营养摄入，适当增重' },
  { min: 18.5, max: 24, label: '体重正常', color: '#2ecc71', risk: '健康风险较低', advice: '继续保持健康的生活方式' },
  { min: 24, max: 28, label: '超重', color: '#f39c12', risk: '慢性病风险增加', advice: '建议控制饮食，增加运动' },
  { min: 28, max: 100, label: '肥胖', color: '#e74c3c', risk: '心血管疾病、糖尿病等风险显著增加', advice: '建议就医咨询，制定减重计划' },
];

// WHO 国际标准对照
const WHO_CATEGORIES = [
  { min: 0, max: 18.5, label: '偏瘦' },
  { min: 18.5, max: 25, label: '正常' },
  { min: 25, max: 30, label: '超重' },
  { min: 30, max: 35, label: '一级肥胖' },
  { min: 35, max: 40, label: '二级肥胖' },
  { min: 40, max: 100, label: '三级肥胖' },
];

function getBMICategory(bmi, categories) {
  return categories.find(cat => bmi >= cat.min && bmi < cat.max);
}

function calculateIdealWeight(height) {
  const heightM = height / 100;
  return {
    min: (18.5 * heightM * heightM).toFixed(1),
    ideal: (22 * heightM * heightM).toFixed(1),
    max: (24 * heightM * heightM).toFixed(1),
  };
}

// 计算指针位置（关键修复）
function calculatePointerPosition(bmi) {
  // 刻度范围：0-40，分为4个区间
  // 过低: 0-18.5 (占比 18.5/40 = 46.25%)
  // 正常: 18.5-24 (占比 5.5/40 = 13.75%)
  // 超重: 24-28 (占比 4/40 = 10%)
  // 肥胖: 28-40 (占比 12/40 = 30%)
  
  // 为了视觉效果，我们使用固定宽度的区间
  // 过低: 0-25%, 正常: 25-50%, 超重: 50-75%, 肥胖: 75-100%
  
  const clampedBmi = Math.max(0, Math.min(40, bmi));
  
  if (clampedBmi < 18.5) {
    // 过低区间：0-25%
    return (clampedBmi / 18.5) * 25;
  } else if (clampedBmi < 24) {
    // 正常区间：25-50%
    return 25 + ((clampedBmi - 18.5) / (24 - 18.5)) * 25;
  } else if (clampedBmi < 28) {
    // 超重区间：50-75%
    return 50 + ((clampedBmi - 24) / (28 - 24)) * 25;
  } else {
    // 肥胖区间：75-100%
    return 75 + ((clampedBmi - 28) / (40 - 28)) * 25;
  }
}

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    if (!height || !weight || height <= 0 || weight <= 0) return null;
    
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    const bmi = weightKg / (heightM * heightM);
    
    return {
      bmi: bmi.toFixed(1),
      bmiRaw: bmi,
      category: getBMICategory(bmi, BMI_CATEGORIES),
      whoCategory: getBMICategory(bmi, WHO_CATEGORIES),
      idealWeight: calculateIdealWeight(parseFloat(height)),
      weightDiff: (weightKg - 22 * heightM * heightM).toFixed(1),
      pointerPosition: calculatePointerPosition(bmi),
    };
  }, [height, weight]);

  const handleCalculate = () => {
    if (height && weight && parseFloat(height) > 0 && parseFloat(weight) > 0) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setGender('male');
    setShowResult(false);
  };

  return (
    <div className={styles.calculator}>
      {/* 输入区域 */}
      <div className={styles.inputSection}>
        <h3>📊 输入您的数据</h3>
        
        <div className={styles.inputGroup}>
          <label htmlFor="height">身高 (cm)</label>
          <input
            id="height"
            type="number"
            min="50"
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
            min="20"
            max="300"
            step="0.1"
            placeholder="例如：65"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="age">年龄 (可选)</label>
            <input
              id="age"
              type="number"
              min="1"
              max="120"
              placeholder="例如：30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="gender">性别</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.primaryBtn} onClick={handleCalculate}>
            计算 BMI
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
          
          {/* BMI 数值展示 */}
          <div 
            className={styles.bmiDisplay}
            style={{ borderColor: result.category?.color }}
          >
            <span 
              className={styles.bmiValue}
              style={{ color: result.category?.color }}
            >
              {result.bmi}
            </span>
            <span 
              className={styles.bmiLabel}
              style={{ color: result.category?.color }}
            >
              {result.category?.label}
            </span>
          </div>

          {/* BMI 刻度尺 */}
          <div className={styles.bmiScale}>
            <div className={styles.scaleBar}>
              <div 
                className={styles.scaleSegment} 
                style={{ backgroundColor: '#3498db', width: '25%' }}
              >
                <span>过低</span>
              </div>
              <div 
                className={styles.scaleSegment} 
                style={{ backgroundColor: '#2ecc71', width: '25%' }}
              >
                <span>正常</span>
              </div>
              <div 
                className={styles.scaleSegment} 
                style={{ backgroundColor: '#f39c12', width: '25%' }}
              >
                <span>超重</span>
              </div>
              <div 
                className={styles.scaleSegment} 
                style={{ backgroundColor: '#e74c3c', width: '25%' }}
              >
                <span>肥胖</span>
              </div>
            </div>
            <div 
              className={styles.scalePointer}
              style={{ left: `${result.pointerPosition}%` }}
            >
              <div className={styles.pointerArrow}>▲</div>
              <div className={styles.pointerValue}>{result.bmi}</div>
            </div>
            <div className={styles.scaleLabels}>
              <span>0</span>
              <span>18.5</span>
              <span>24</span>
              <span>28</span>
              <span>40</span>
            </div>
          </div>

          {/* 详细信息卡片 */}
          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <h4>⚠️ 健康风险</h4>
              <p>{result.category?.risk}</p>
            </div>
            
            <div className={styles.infoCard}>
              <h4>💡 建议</h4>
              <p>{result.category?.advice}</p>
            </div>

            <div className={styles.infoCard}>
              <h4>⚖️ 理想体重范围</h4>
              <p>
                <strong>{result.idealWeight.min} - {result.idealWeight.max} kg</strong>
                <br />
                <small>理想体重：{result.idealWeight.ideal} kg</small>
              </p>
            </div>

            <div className={styles.infoCard}>
              <h4>📈 体重差距</h4>
              <p>
                {parseFloat(result.weightDiff) > 0 ? (
                  <span style={{ color: '#e74c3c' }}>
                    超出理想体重 <strong>{result.weightDiff} kg</strong>
                  </span>
                ) : parseFloat(result.weightDiff) < 0 ? (
                  <span style={{ color: '#3498db' }}>
                    低于理想体重 <strong>{Math.abs(result.weightDiff)} kg</strong>
                  </span>
                ) : (
                  <span style={{ color: '#2ecc71' }}>
                    <strong>恰好是理想体重！</strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* WHO 标准对照 */}
          <div className={styles.whoSection}>
            <h4>🌍 WHO 国际标准参考</h4>
            <p>按照世界卫生组织标准，您的 BMI 属于：<strong>{result.whoCategory?.label}</strong></p>
          </div>
        </div>
      )}

      {/* BMI 参考表格 */}
      <div className={styles.referenceSection}>
        <h3>📚 BMI 分类参考标准</h3>
        
        <div className={styles.tableWrapper}>
          <table className={styles.referenceTable}>
            <thead>
              <tr>
                <th>分类</th>
                <th>中国标准</th>
                <th>WHO 国际标准</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className={styles.dot} style={{ backgroundColor: '#3498db' }}></span>偏瘦/过低</td>
                <td>&lt; 18.5</td>
                <td>&lt; 18.5</td>
              </tr>
              <tr>
                <td><span className={styles.dot} style={{ backgroundColor: '#2ecc71' }}></span>正常</td>
                <td>18.5 - 23.9</td>
                <td>18.5 - 24.9</td>
              </tr>
              <tr>
                <td><span className={styles.dot} style={{ backgroundColor: '#f39c12' }}></span>超重</td>
                <td>24 - 27.9</td>
                <td>25 - 29.9</td>
              </tr>
              <tr>
                <td><span className={styles.dot} style={{ backgroundColor: '#e74c3c' }}></span>肥胖</td>
                <td>≥ 28</td>
                <td>≥ 30</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.note}>
          <p><strong>📌 说明：</strong></p>
          <ul>
            <li>本计算器默认使用<strong>中国成人标准</strong>，因为亚洲人群在较低 BMI 时即可能出现健康风险</li>
            <li>BMI 仅作为初步筛查工具，不能反映体脂分布、肌肉量等因素</li>
            <li>运动员、孕妇、老年人等特殊人群应结合其他指标综合评估</li>
            <li>如有健康疑虑，请咨询专业医疗人员</li>
          </ul>
        </div>
      </div>
    </div>
  );
}