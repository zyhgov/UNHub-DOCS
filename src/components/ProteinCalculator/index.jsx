import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 活动水平
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: '久坐不动', description: '办公室工作，几乎不运动', factor: 0.8 },
  { value: 'light', label: '轻度活动', description: '每周轻度运动 1-2 次', factor: 1.0 },
  { value: 'moderate', label: '中度活动', description: '每周中等强度运动 3-4 次', factor: 1.2 },
  { value: 'active', label: '积极运动', description: '每周高强度运动 5-6 次', factor: 1.5 },
  { value: 'athlete', label: '专业运动', description: '每天高强度训练', factor: 1.8 },
];

// 健身目标
const FITNESS_GOALS = [
  { 
    value: 'lose', 
    label: '减脂', 
    icon: '🔥',
    description: '减少体脂，保持肌肉',
    proteinRange: { min: 1.6, max: 2.4 },
    tip: '高蛋白摄入有助于减脂期间保持肌肉量'
  },
  { 
    value: 'maintain', 
    label: '维持', 
    icon: '⚖️',
    description: '保持当前身体状态',
    proteinRange: { min: 1.2, max: 1.6 },
    tip: '适量蛋白质维持身体正常机能'
  },
  { 
    value: 'gain', 
    label: '增肌', 
    icon: '💪',
    description: '增加肌肉量',
    proteinRange: { min: 1.6, max: 2.2 },
    tip: '充足蛋白质是肌肉合成的基础'
  },
  { 
    value: 'athlete', 
    label: '运动员', 
    icon: '🏆',
    description: '高强度竞技训练',
    proteinRange: { min: 1.8, max: 2.5 },
    tip: '高强度训练需要更多蛋白质支持恢复'
  },
];

// 特殊人群调整
const SPECIAL_CONDITIONS = [
  { value: 'none', label: '无', adjustment: 0 },
  { value: 'pregnant', label: '孕期', adjustment: 25 },
  { value: 'breastfeeding', label: '哺乳期', adjustment: 20 },
  { value: 'elderly', label: '老年人(65+)', adjustment: 0.2 },
  { value: 'recovery', label: '伤病恢复期', adjustment: 0.3 },
  { value: 'vegan', label: '素食者', adjustment: 0.1 },
];

// 高蛋白食物数据库
const PROTEIN_FOODS = {
  meat: {
    name: '肉类',
    icon: '🥩',
    foods: [
      { name: '鸡胸肉', protein: 31, serving: '100g', calories: 165 },
      { name: '牛里脊', protein: 26, serving: '100g', calories: 150 },
      { name: '猪里脊', protein: 26, serving: '100g', calories: 143 },
      { name: '羊肉', protein: 25, serving: '100g', calories: 250 },
      { name: '鸭胸肉', protein: 23, serving: '100g', calories: 140 },
    ]
  },
  seafood: {
    name: '海鲜',
    icon: '🐟',
    foods: [
      { name: '金枪鱼', protein: 30, serving: '100g', calories: 130 },
      { name: '三文鱼', protein: 25, serving: '100g', calories: 208 },
      { name: '虾', protein: 24, serving: '100g', calories: 99 },
      { name: '鳕鱼', protein: 23, serving: '100g', calories: 105 },
      { name: '带鱼', protein: 18, serving: '100g', calories: 127 },
    ]
  },
  dairy: {
    name: '乳制品',
    icon: '🥛',
    foods: [
      { name: '希腊酸奶', protein: 10, serving: '100g', calories: 97 },
      { name: '脱脂牛奶', protein: 3.4, serving: '100ml', calories: 35 },
      { name: '奶酪', protein: 25, serving: '100g', calories: 350 },
      { name: '脱脂奶粉', protein: 36, serving: '100g', calories: 362 },
      { name: '酸奶', protein: 4.3, serving: '100g', calories: 72 },
    ]
  },
  eggs: {
    name: '蛋类',
    icon: '🥚',
    foods: [
      { name: '全蛋', protein: 13, serving: '100g (约2个)', calories: 155 },
      { name: '蛋白', protein: 11, serving: '100g', calories: 52 },
      { name: '鹌鹑蛋', protein: 13, serving: '100g', calories: 158 },
      { name: '鸭蛋', protein: 13, serving: '100g', calories: 180 },
    ]
  },
  plant: {
    name: '植物蛋白',
    icon: '🌱',
    foods: [
      { name: '豆腐', protein: 8, serving: '100g', calories: 76 },
      { name: '毛豆', protein: 11, serving: '100g', calories: 121 },
      { name: '黄豆', protein: 36, serving: '100g', calories: 446 },
      { name: '黑豆', protein: 24, serving: '100g', calories: 341 },
      { name: '豆浆', protein: 3.3, serving: '100ml', calories: 33 },
      { name: '豆腐干', protein: 16, serving: '100g', calories: 140 },
    ]
  },
  supplements: {
    name: '蛋白补剂',
    icon: '🥤',
    foods: [
      { name: '乳清蛋白粉', protein: 80, serving: '100g', calories: 400 },
      { name: '酪蛋白粉', protein: 75, serving: '100g', calories: 380 },
      { name: '大豆蛋白粉', protein: 85, serving: '100g', calories: 370 },
      { name: '蛋白棒', protein: 20, serving: '1根(60g)', calories: 230 },
    ]
  },
};

// 计算每餐分配
function calculateMealDistribution(totalProtein, meals) {
  const distributions = {
    3: [
      { name: '早餐', ratio: 0.25, time: '7:00-8:00' },
      { name: '午餐', ratio: 0.35, time: '12:00-13:00' },
      { name: '晚餐', ratio: 0.40, time: '18:00-19:00' },
    ],
    4: [
      { name: '早餐', ratio: 0.20, time: '7:00-8:00' },
      { name: '午餐', ratio: 0.30, time: '12:00-13:00' },
      { name: '加餐', ratio: 0.15, time: '15:00-16:00' },
      { name: '晚餐', ratio: 0.35, time: '18:00-19:00' },
    ],
    5: [
      { name: '早餐', ratio: 0.20, time: '7:00-8:00' },
      { name: '上午加餐', ratio: 0.10, time: '10:00' },
      { name: '午餐', ratio: 0.25, time: '12:00-13:00' },
      { name: '下午加餐', ratio: 0.15, time: '15:00-16:00' },
      { name: '晚餐', ratio: 0.30, time: '18:00-19:00' },
    ],
    6: [
      { name: '早餐', ratio: 0.15, time: '7:00' },
      { name: '上午加餐', ratio: 0.10, time: '10:00' },
      { name: '午餐', ratio: 0.20, time: '12:00' },
      { name: '下午加餐', ratio: 0.15, time: '15:00' },
      { name: '晚餐', ratio: 0.25, time: '18:00' },
      { name: '睡前', ratio: 0.15, time: '21:00' },
    ],
  };

  return distributions[meals].map(meal => ({
    ...meal,
    protein: Math.round(totalProtein * meal.ratio),
  }));
}

export default function ProteinCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [bodyFat, setBodyFat] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [specialCondition, setSpecialCondition] = useState('none');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [useLeanMass, setUseLeanMass] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const bf = parseFloat(bodyFat);

    if (!w || w <= 0) return null;

    // 计算基础体重（可以使用瘦体重）
    let baseWeight = w;
    let leanMass = null;
    
    if (useLeanMass && bf && bf > 0 && bf < 100) {
      leanMass = w * (1 - bf / 100);
      baseWeight = leanMass;
    }

    // 获取目标的蛋白质范围
    const goalData = FITNESS_GOALS.find(g => g.value === goal);
    const activityData = ACTIVITY_LEVELS.find(l => l.value === activityLevel);

    // 基础蛋白质需求
    let minProtein = baseWeight * goalData.proteinRange.min;
    let maxProtein = baseWeight * goalData.proteinRange.max;

    // 活动水平调整
    const activityMultiplier = 1 + (activityData.factor - 1) * 0.3;
    minProtein *= activityMultiplier;
    maxProtein *= activityMultiplier;

    // 特殊人群调整
    const condition = SPECIAL_CONDITIONS.find(c => c.value === specialCondition);
    if (condition.value === 'pregnant' || condition.value === 'breastfeeding') {
      minProtein += condition.adjustment;
      maxProtein += condition.adjustment;
    } else if (condition.adjustment > 0) {
      minProtein *= (1 + condition.adjustment);
      maxProtein *= (1 + condition.adjustment);
    }

    // 年龄调整（老年人需要更多）
    if (a && a >= 65) {
      minProtein *= 1.1;
      maxProtein *= 1.1;
    }

    minProtein = Math.round(minProtein);
    maxProtein = Math.round(maxProtein);
    const recommendedProtein = Math.round((minProtein + maxProtein) / 2);

    // BMI 计算（如果有身高）
    let bmi = null;
    if (h && h > 0) {
      bmi = (w / ((h / 100) ** 2)).toFixed(1);
    }

    // 每餐分配
    const mealDistribution = calculateMealDistribution(recommendedProtein, mealsPerDay);

    // 占每日热量百分比估算
    const proteinCalories = recommendedProtein * 4;
    
    // 估算每日热量需求（简化版）
    let bmr;
    if (gender === 'male') {
      bmr = h && a ? 10 * w + 6.25 * h - 5 * a + 5 : w * 24;
    } else {
      bmr = h && a ? 10 * w + 6.25 * h - 5 * a - 161 : w * 22;
    }
    const tdee = Math.round(bmr * activityData.factor);
    const proteinPercentage = Math.round((proteinCalories / tdee) * 100);

    // 每公斤体重蛋白质
    const proteinPerKg = (recommendedProtein / w).toFixed(2);

    return {
      minProtein,
      maxProtein,
      recommendedProtein,
      proteinPerKg,
      leanMass: leanMass ? leanMass.toFixed(1) : null,
      bmi,
      mealDistribution,
      proteinCalories,
      proteinPercentage,
      tdee,
      goalData,
      activityData,
    };
  }, [weight, height, age, gender, bodyFat, activityLevel, goal, specialCondition, mealsPerDay, useLeanMass]);

  const handleCalculate = () => {
    if (weight && parseFloat(weight) > 0) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setGender('male');
    setBodyFat('');
    setActivityLevel('moderate');
    setGoal('maintain');
    setSpecialCondition('none');
    setMealsPerDay(3);
    setUseLeanMass(false);
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

        {/* 使用瘦体重计算 */}
        {bodyFat && (
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={useLeanMass}
                onChange={(e) => setUseLeanMass(e.target.checked)}
              />
              <span className={styles.checkmark}></span>
              <span>使用瘦体重计算（更精确，推荐体脂率较高者使用）</span>
            </label>
          </div>
        )}

        {/* 健身目标 */}
        <div className={styles.inputGroup}>
          <label>健身目标</label>
          <div className={styles.goalOptions}>
            {FITNESS_GOALS.map((g) => (
              <label
                key={g.value}
                className={`${styles.goalOption} ${goal === g.value ? styles.active : ''}`}
              >
                <input
                  type="radio"
                  name="goal"
                  value={g.value}
                  checked={goal === g.value}
                  onChange={() => setGoal(g.value)}
                />
                <span className={styles.goalIcon}>{g.icon}</span>
                <span className={styles.goalLabel}>{g.label}</span>
                <span className={styles.goalDesc}>{g.description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 活动水平 */}
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

        {/* 附加选项 */}
        <div className={styles.additionalOptions}>
          <div className={styles.inputGroup}>
            <label htmlFor="condition">特殊情况</label>
            <select
              id="condition"
              value={specialCondition}
              onChange={(e) => setSpecialCondition(e.target.value)}
            >
              {SPECIAL_CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="meals">每日餐数</label>
            <select
              id="meals"
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
            >
              <option value={3}>3 餐</option>
              <option value={4}>4 餐</option>
              <option value={5}>5 餐</option>
              <option value={6}>6 餐</option>
            </select>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.primaryBtn} onClick={handleCalculate}>
            计算蛋白质需求
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
            <div className={styles.primaryResult}>
              <div className={styles.resultIcon}>🥩</div>
              <div className={styles.resultContent}>
                <span className={styles.resultLabel}>每日蛋白质推荐摄入量</span>
                <div className={styles.resultRange}>
                  <span className={styles.resultMin}>{result.minProtein}g</span>
                  <span className={styles.resultDivider}>-</span>
                  <span className={styles.resultMax}>{result.maxProtein}g</span>
                </div>
                <div className={styles.resultRecommended}>
                  推荐：<strong>{result.recommendedProtein}g</strong> / 天
                </div>
              </div>
            </div>

            <div className={styles.secondaryResults}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>⚖️</span>
                <span className={styles.statValue}>{result.proteinPerKg}</span>
                <span className={styles.statLabel}>g/kg 体重</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>🔥</span>
                <span className={styles.statValue}>{result.proteinCalories}</span>
                <span className={styles.statLabel}>千卡 (蛋白质热量)</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📊</span>
                <span className={styles.statValue}>{result.proteinPercentage}%</span>
                <span className={styles.statLabel}>每日热量占比</span>
              </div>
              {result.leanMass && (
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>💪</span>
                  <span className={styles.statValue}>{result.leanMass}</span>
                  <span className={styles.statLabel}>kg 瘦体重</span>
                </div>
              )}
            </div>
          </div>

          {/* 目标说明 */}
          <div className={styles.goalTip}>
            <span className={styles.goalTipIcon}>{result.goalData.icon}</span>
            <div className={styles.goalTipContent}>
              <strong>{result.goalData.label}目标</strong>
              <p>{result.goalData.tip}</p>
            </div>
          </div>

          {/* 每餐分配 */}
          <div className={styles.mealSection}>
            <h4>🍽️ 每餐蛋白质分配建议</h4>
            <div className={styles.mealCards}>
              {result.mealDistribution.map((meal, index) => (
                <div key={index} className={styles.mealCard}>
                  <div className={styles.mealHeader}>
                    <span className={styles.mealName}>{meal.name}</span>
                    <span className={styles.mealTime}>{meal.time}</span>
                  </div>
                  <div className={styles.mealProtein}>
                    <span className={styles.mealValue}>{meal.protein}</span>
                    <span className={styles.mealUnit}>g</span>
                  </div>
                  <div className={styles.mealBar}>
                    <div 
                      className={styles.mealBarFill}
                      style={{ width: `${meal.ratio * 100}%` }}
                    ></div>
                  </div>
                  <span className={styles.mealRatio}>{Math.round(meal.ratio * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 蛋白质可视化 */}
          <div className={styles.visualSection}>
            <h4>📊 每日蛋白质摄入可视化</h4>
            <div className={styles.proteinVisual}>
              <div className={styles.proteinBar}>
                <div 
                  className={styles.proteinFill}
                  style={{ width: `${Math.min((result.recommendedProtein / 200) * 100, 100)}%` }}
                >
                  <span>{result.recommendedProtein}g</span>
                </div>
              </div>
              <div className={styles.proteinScale}>
                <span>0g</span>
                <span>50g</span>
                <span>100g</span>
                <span>150g</span>
                <span>200g</span>
              </div>
            </div>
            <div className={styles.proteinContext}>
              <p>
                相当于约 <strong>{Math.round(result.recommendedProtein / 31 * 100)}g</strong> 鸡胸肉，
                或 <strong>{Math.round(result.recommendedProtein / 13 * 2)}</strong> 个鸡蛋，
                或 <strong>{Math.round(result.recommendedProtein / 25 * 100)}g</strong> 三文鱼
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 高蛋白食物参考 */}
      <div className={styles.foodSection}>
        <h3>🥗 高蛋白食物参考</h3>
        
        <div className={styles.foodCategories}>
          {Object.entries(PROTEIN_FOODS).map(([key, category]) => (
            <div key={key} className={styles.foodCategory}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
              <div className={styles.foodList}>
                {category.foods.map((food, index) => (
                  <div key={index} className={styles.foodItem}>
                    <span className={styles.foodName}>{food.name}</span>
                    <div className={styles.foodInfo}>
                      <span className={styles.foodProtein}>{food.protein}g</span>
                      <span className={styles.foodServing}>/{food.serving}</span>
                    </div>
                    <span className={styles.foodCalories}>{food.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 知识科普 */}
      <div className={styles.knowledgeSection}>
        <h3>📚 蛋白质知识</h3>

        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>为什么蛋白质重要？</h4>
            <ul>
              <li>构建和修复肌肉组织</li>
              <li>制造酶和激素</li>
              <li>支持免疫系统</li>
              <li>增加饱腹感，有助控制体重</li>
              <li>维持皮肤、头发、指甲健康</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>蛋白质摄入时机</h4>
            <ul>
              <li><strong>早餐：</strong>开启一天的蛋白质合成</li>
              <li><strong>运动后：</strong>30分钟-2小时内最佳</li>
              <li><strong>睡前：</strong>缓释蛋白有助夜间恢复</li>
              <li>每餐摄入 20-40g 最有效</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>蛋白质来源选择</h4>
            <ul>
              <li><strong>完全蛋白：</strong>肉、鱼、蛋、奶含全部必需氨基酸</li>
              <li><strong>植物蛋白：</strong>需搭配食用（如豆+谷）</li>
              <li>优先选择低脂肪来源</li>
              <li>多样化摄入更健康</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>常见误区</h4>
            <ul>
              <li>❌ 蛋白质吃太多会伤肾（健康人无此问题）</li>
              <li>❌ 只有健身才需要高蛋白（所有人都需要）</li>
              <li>❌ 植物蛋白不如动物蛋白（合理搭配同样有效）</li>
              <li>❌ 蛋白粉是"药"（只是食物补充剂）</li>
            </ul>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 注意事项：</strong></p>
          <ul>
            <li>肾功能不全者应在医生指导下控制蛋白质摄入</li>
            <li>蛋白质摄入应均匀分布在各餐，单次摄入上限约 40-50g</li>
            <li>增加蛋白质摄入时应同时增加饮水量</li>
            <li>优先选择天然食物，蛋白粉仅作为补充</li>
            <li>计算结果仅供参考，具体需求因人而异</li>
          </ul>
        </div>
      </div>
    </div>
  );
}