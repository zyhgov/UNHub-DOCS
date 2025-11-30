import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// BMR 计算公式
const FORMULAS = {
  mifflin: {
    name: 'Mifflin-St Jeor',
    description: '目前最准确的公式（推荐）',
    year: '1990',
    calculate: (weight, height, age, gender) => {
      const base = 10 * weight + 6.25 * height - 5 * age;
      return gender === 'male' ? base + 5 : base - 161;
    },
  },
  harris: {
    name: 'Harris-Benedict',
    description: '经典公式，历史悠久',
    year: '1918',
    calculate: (weight, height, age, gender) => {
      if (gender === 'male') {
        return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
      }
      return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    },
  },
  katch: {
    name: 'Katch-McArdle',
    description: '基于瘦体重，适合运动员',
    year: '1996',
    calculate: (weight, height, age, gender, bodyFat) => {
      if (!bodyFat) return null;
      const leanMass = weight * (1 - bodyFat / 100);
      return 370 + 21.6 * leanMass;
    },
    requiresBodyFat: true,
  },
};

// 活动系数
const ACTIVITY_LEVELS = [
  { value: 1.2, label: '久坐不动', description: '几乎不运动，办公室工作' },
  { value: 1.375, label: '轻度活动', description: '每周轻度运动 1-3 次' },
  { value: 1.55, label: '中度活动', description: '每周中等强度运动 3-5 次' },
  { value: 1.725, label: '高度活动', description: '每周高强度运动 6-7 次' },
  { value: 1.9, label: '专业运动', description: '每天高强度训练或体力劳动' },
];

// 目标建议
const GOALS = {
  lose: { label: '减脂', factor: 0.8, description: '每日热量缺口约 20%' },
  maintain: { label: '维持', factor: 1.0, description: '保持当前体重' },
  gain: { label: '增肌', factor: 1.1, description: '每日热量盈余约 10%' },
};

export default function BMRCalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [bodyFat, setBodyFat] = useState('');
  const [formula, setFormula] = useState('mifflin');
  const [activityLevel, setActivityLevel] = useState(1.375);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    if (!height || !weight || !age) return null;

    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const bf = bodyFat ? parseFloat(bodyFat) : null;

    if (h <= 0 || w <= 0 || a <= 0) return null;

    // 计算所有公式的 BMR
    const bmrResults = {};
    Object.entries(FORMULAS).forEach(([key, f]) => {
      if (f.requiresBodyFat && !bf) {
        bmrResults[key] = null;
      } else {
        bmrResults[key] = Math.round(f.calculate(w, h, a, gender, bf));
      }
    });

    // 主要使用的 BMR
    const primaryBmr = bmrResults[formula] || bmrResults.mifflin;
    
    // TDEE（每日总能量消耗）
    const tdee = Math.round(primaryBmr * activityLevel);

    // 各目标热量
    const goalCalories = {};
    Object.entries(GOALS).forEach(([key, goal]) => {
      goalCalories[key] = Math.round(tdee * goal.factor);
    });

    // 宏量营养素建议（基于维持热量）
    const macros = {
      protein: { min: Math.round(w * 1.6), max: Math.round(w * 2.2) },
      fat: { min: Math.round(tdee * 0.25 / 9), max: Math.round(tdee * 0.35 / 9) },
      carbs: {
        min: Math.round((tdee - w * 2.2 * 4 - tdee * 0.35) / 4),
        max: Math.round((tdee - w * 1.6 * 4 - tdee * 0.25) / 4),
      },
    };

    return {
      bmr: primaryBmr,
      bmrResults,
      tdee,
      goalCalories,
      macros,
      activityLabel: ACTIVITY_LEVELS.find(l => l.value === activityLevel)?.label,
    };
  }, [height, weight, age, gender, bodyFat, formula, activityLevel]);

  const handleCalculate = () => {
    if (height && weight && age) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setGender('male');
    setBodyFat('');
    setFormula('mifflin');
    setActivityLevel(1.375);
    setShowResult(false);
  };

  return (
    <div className={styles.calculator}>
      {/* 输入区域 */}
      <div className={styles.inputSection}>
        <h3>📊 输入您的数据</h3>

        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="gender">性别</label>
            <div className={styles.genderButtons}>
              <button
                type="button"
                className={`${styles.genderBtn} ${gender === 'male' ? styles.active : ''}`}
                onClick={() => setGender('male')}
              >
                👨 男
              </button>
              <button
                type="button"
                className={`${styles.genderBtn} ${gender === 'female' ? styles.active : ''}`}
                onClick={() => setGender('female')}
              >
                👩 女
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="age">年龄 (岁)</label>
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

          <div className={styles.inputGroup}>
            <label htmlFor="formula">计算公式</label>
            <select
              id="formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
            >
              {Object.entries(FORMULAS).map(([key, f]) => (
                <option key={key} value={key} disabled={f.requiresBodyFat && !bodyFat}>
                  {f.name} {f.requiresBodyFat && !bodyFat ? '(需体脂率)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>活动水平</label>
          <div className={styles.activityOptions}>
            {ACTIVITY_LEVELS.map((level) => (
              <label
                key={level.value}
                className={`${styles.activityOption} ${activityLevel === level.value ? styles.active : ''}`}
              >
                <input
                  type="radio"
                  name="activity"
                  value={level.value}
                  checked={activityLevel === level.value}
                  onChange={() => setActivityLevel(level.value)}
                />
                <span className={styles.activityLabel}>{level.label}</span>
                <span className={styles.activityDesc}>{level.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.primaryBtn} onClick={handleCalculate}>
            计算 BMR
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

          {/* 主要结果卡片 */}
          <div className={styles.mainResults}>
            <div className={styles.resultCard}>
              <div className={styles.resultIcon}>🔥</div>
              <div className={styles.resultInfo}>
                <span className={styles.resultLabel}>基础代谢率 (BMR)</span>
                <span className={styles.resultValue}>{result.bmr}</span>
                <span className={styles.resultUnit}>千卡/天</span>
              </div>
              <div className={styles.resultDesc}>
                身体在完全静息状态下维持生命所需的最低能量
              </div>
            </div>

            <div className={styles.resultCard}>
              <div className={styles.resultIcon}>⚡</div>
              <div className={styles.resultInfo}>
                <span className={styles.resultLabel}>每日总消耗 (TDEE)</span>
                <span className={styles.resultValue}>{result.tdee}</span>
                <span className={styles.resultUnit}>千卡/天</span>
              </div>
              <div className={styles.resultDesc}>
                活动水平：{result.activityLabel}
              </div>
            </div>
          </div>

          {/* 目标热量 */}
          <div className={styles.goalsSection}>
            <h4>🎯 目标热量建议</h4>
            <div className={styles.goalCards}>
              {Object.entries(GOALS).map(([key, goal]) => (
                <div 
                  key={key} 
                  className={`${styles.goalCard} ${styles[key]}`}
                >
                  <span className={styles.goalLabel}>{goal.label}</span>
                  <span className={styles.goalValue}>{result.goalCalories[key]}</span>
                  <span className={styles.goalUnit}>千卡/天</span>
                  <span className={styles.goalDesc}>{goal.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 宏量营养素建议 */}
          <div className={styles.macrosSection}>
            <h4>🥗 宏量营养素建议（基于维持热量）</h4>
            <div className={styles.macroCards}>
              <div className={styles.macroCard}>
                <div className={styles.macroIcon} style={{ backgroundColor: '#ef4444' }}>P</div>
                <div className={styles.macroInfo}>
                  <span className={styles.macroLabel}>蛋白质</span>
                  <span className={styles.macroValue}>
                    {result.macros.protein.min} - {result.macros.protein.max} g
                  </span>
                  <span className={styles.macroDesc}>每公斤体重 1.6-2.2g</span>
                </div>
              </div>

              <div className={styles.macroCard}>
                <div className={styles.macroIcon} style={{ backgroundColor: '#f59e0b' }}>F</div>
                <div className={styles.macroInfo}>
                  <span className={styles.macroLabel}>脂肪</span>
                  <span className={styles.macroValue}>
                    {result.macros.fat.min} - {result.macros.fat.max} g
                  </span>
                  <span className={styles.macroDesc}>总热量的 25-35%</span>
                </div>
              </div>

              <div className={styles.macroCard}>
                <div className={styles.macroIcon} style={{ backgroundColor: '#10b981' }}>C</div>
                <div className={styles.macroInfo}>
                  <span className={styles.macroLabel}>碳水化合物</span>
                  <span className={styles.macroValue}>
                    {Math.max(0, result.macros.carbs.min)} - {result.macros.carbs.max} g
                  </span>
                  <span className={styles.macroDesc}>剩余热量补充</span>
                </div>
              </div>
            </div>
          </div>

          {/* 公式对比 */}
          <div className={styles.formulaComparison}>
            <h4>📐 不同公式计算结果对比</h4>
            <div className={styles.formulaTable}>
              {Object.entries(FORMULAS).map(([key, f]) => (
                <div 
                  key={key} 
                  className={`${styles.formulaRow} ${formula === key ? styles.active : ''}`}
                >
                  <div className={styles.formulaInfo}>
                    <span className={styles.formulaName}>
                      {f.name}
                      {formula === key && <span className={styles.recommended}>当前使用</span>}
                    </span>
                    <span className={styles.formulaMeta}>{f.year} · {f.description}</span>
                  </div>
                  <div className={styles.formulaValue}>
                    {result.bmrResults[key] ? (
                      <>{result.bmrResults[key]} <small>kcal</small></>
                    ) : (
                      <span className={styles.naValue}>需要体脂率</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 热量消耗可视化 */}
          <div className={styles.calorieBreakdown}>
            <h4>📊 每日热量消耗构成</h4>
            <div className={styles.breakdownBar}>
              <div 
                className={styles.breakdownSegment}
                style={{ 
                  width: `${(result.bmr / result.tdee) * 100}%`,
                  backgroundColor: '#3b82f6'
                }}
              >
                <span>BMR {Math.round((result.bmr / result.tdee) * 100)}%</span>
              </div>
              <div 
                className={styles.breakdownSegment}
                style={{ 
                  width: `${10}%`,
                  backgroundColor: '#8b5cf6'
                }}
              >
                <span>TEF</span>
              </div>
              <div 
                className={styles.breakdownSegment}
                style={{ 
                  width: `${100 - (result.bmr / result.tdee) * 100 - 10}%`,
                  backgroundColor: '#10b981'
                }}
              >
                <span>活动</span>
              </div>
            </div>
            <div className={styles.breakdownLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#3b82f6' }}></span>
                <span>基础代谢 (BMR)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#8b5cf6' }}></span>
                <span>食物热效应 (TEF) ~10%</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#10b981' }}></span>
                <span>活动消耗 (NEAT + EAT)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 知识科普 */}
      <div className={styles.knowledgeSection}>
        <h3>📚 相关知识</h3>

        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>什么是基础代谢率？</h4>
            <p>
              基础代谢率 (BMR) 是指人体在清醒而又极端安静的状态下，不受肌肉活动、环境温度、
              食物及精神紧张等影响时的能量代谢率。它占每日总能量消耗的 60-75%。
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>什么是 TDEE？</h4>
            <p>
              每日总能量消耗 (TDEE) = BMR + 食物热效应 + 活动消耗。
              这是您每天实际消耗的总热量，是制定饮食计划的重要依据。
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>如何选择计算公式？</h4>
            <p>
              <strong>Mifflin-St Jeor：</strong>最新最准确，适合大多数人<br />
              <strong>Harris-Benedict：</strong>经典公式，可能略高估<br />
              <strong>Katch-McArdle：</strong>基于瘦体重，适合知道体脂率的人
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>影响 BMR 的因素</h4>
            <ul>
              <li>年龄：随年龄增长而降低</li>
              <li>性别：男性通常高于女性</li>
              <li>肌肉量：肌肉越多，BMR 越高</li>
              <li>体温：体温升高会增加 BMR</li>
              <li>激素：甲状腺激素影响显著</li>
            </ul>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 注意事项：</strong></p>
          <ul>
            <li>计算结果仅供参考，实际代谢率因人而异</li>
            <li>减重时热量缺口不宜超过 500 kcal/天</li>
            <li>长期低热量饮食会导致代谢适应性下降</li>
            <li>建议配合定期体重监测调整摄入量</li>
            <li>如有特殊健康状况，请咨询专业人士</li>
          </ul>
        </div>
      </div>
    </div>
  );
}