import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 活动水平系数
const ACTIVITY_LEVELS = [
  { value: 1.2, label: '久坐不动', description: '几乎不运动，办公室工作', icon: '🪑' },
  { value: 1.375, label: '轻度活动', description: '每周轻度运动 1-3 次', icon: '🚶' },
  { value: 1.55, label: '中度活动', description: '每周中等强度运动 3-5 次', icon: '🏃' },
  { value: 1.725, label: '高度活动', description: '每周高强度运动 6-7 次', icon: '🏋️' },
  { value: 1.9, label: '专业运动', description: '每天高强度训练或体力劳动', icon: '🏆' },
];

// 目标设置
const GOALS = [
  { 
    value: 'extreme-lose', 
    label: '快速减脂', 
    deficit: -750,
    percentage: -25,
    description: '每周减重约 0.75kg',
    color: '#ef4444',
    icon: '🔥🔥',
    warning: '较激进，可能影响代谢'
  },
  { 
    value: 'lose', 
    label: '稳定减脂', 
    deficit: -500,
    percentage: -20,
    description: '每周减重约 0.5kg',
    color: '#f97316',
    icon: '🔥',
    warning: null
  },
  { 
    value: 'slow-lose', 
    label: '缓慢减脂', 
    deficit: -250,
    percentage: -10,
    description: '每周减重约 0.25kg',
    color: '#eab308',
    icon: '📉',
    warning: null
  },
  { 
    value: 'maintain', 
    label: '维持体重', 
    deficit: 0,
    percentage: 0,
    description: '保持当前体重',
    color: '#22c55e',
    icon: '⚖️',
    warning: null
  },
  { 
    value: 'slow-gain', 
    label: '缓慢增重', 
    deficit: 250,
    percentage: 10,
    description: '每周增重约 0.25kg',
    color: '#3b82f6',
    icon: '📈',
    warning: null
  },
  { 
    value: 'gain', 
    label: '稳定增肌', 
    deficit: 500,
    percentage: 15,
    description: '每周增重约 0.5kg',
    color: '#8b5cf6',
    icon: '💪',
    warning: null
  },
];

// 宏量营养素方案
const MACRO_PLANS = {
  balanced: {
    name: '均衡饮食',
    description: '适合大多数人',
    protein: 0.25,
    carbs: 0.50,
    fat: 0.25,
  },
  lowCarb: {
    name: '低碳饮食',
    description: '适合减脂、控糖',
    protein: 0.30,
    carbs: 0.30,
    fat: 0.40,
  },
  highCarb: {
    name: '高碳饮食',
    description: '适合高强度运动',
    protein: 0.25,
    carbs: 0.55,
    fat: 0.20,
  },
  highProtein: {
    name: '高蛋白饮食',
    description: '适合增肌、减脂',
    protein: 0.35,
    carbs: 0.40,
    fat: 0.25,
  },
  keto: {
    name: '生酮饮食',
    description: '极低碳水',
    protein: 0.25,
    carbs: 0.05,
    fat: 0.70,
  },
};

// 常见食物热量数据库
const FOOD_DATABASE = {
  staples: {
    name: '主食',
    icon: '🍚',
    foods: [
      { name: '米饭', calories: 116, serving: '100g', protein: 2.6, carbs: 25.6, fat: 0.3 },
      { name: '面条（熟）', calories: 110, serving: '100g', protein: 3.5, carbs: 23, fat: 0.5 },
      { name: '馒头', calories: 223, serving: '100g', protein: 7, carbs: 47, fat: 1.1 },
      { name: '全麦面包', calories: 246, serving: '100g', protein: 9, carbs: 41, fat: 3.4 },
      { name: '燕麦片', calories: 377, serving: '100g', protein: 13.5, carbs: 66, fat: 6.5 },
      { name: '红薯', calories: 86, serving: '100g', protein: 1.6, carbs: 20, fat: 0.1 },
      { name: '玉米', calories: 112, serving: '100g', protein: 4, carbs: 22, fat: 1.2 },
    ]
  },
  proteins: {
    name: '蛋白质',
    icon: '🥩',
    foods: [
      { name: '鸡胸肉', calories: 165, serving: '100g', protein: 31, carbs: 0, fat: 3.6 },
      { name: '牛里脊', calories: 150, serving: '100g', protein: 26, carbs: 0, fat: 5 },
      { name: '猪里脊', calories: 143, serving: '100g', protein: 26, carbs: 0, fat: 4 },
      { name: '三文鱼', calories: 208, serving: '100g', protein: 25, carbs: 0, fat: 12 },
      { name: '虾', calories: 99, serving: '100g', protein: 24, carbs: 0.2, fat: 0.3 },
      { name: '鸡蛋', calories: 155, serving: '100g(约2个)', protein: 13, carbs: 1.1, fat: 11 },
      { name: '豆腐', calories: 76, serving: '100g', protein: 8, carbs: 1.9, fat: 4.2 },
    ]
  },
  vegetables: {
    name: '蔬菜',
    icon: '🥬',
    foods: [
      { name: '西兰花', calories: 34, serving: '100g', protein: 2.8, carbs: 7, fat: 0.4 },
      { name: '菠菜', calories: 23, serving: '100g', protein: 2.9, carbs: 3.6, fat: 0.4 },
      { name: '番茄', calories: 18, serving: '100g', protein: 0.9, carbs: 3.9, fat: 0.2 },
      { name: '黄瓜', calories: 15, serving: '100g', protein: 0.7, carbs: 3.6, fat: 0.1 },
      { name: '胡萝卜', calories: 41, serving: '100g', protein: 0.9, carbs: 10, fat: 0.2 },
      { name: '生菜', calories: 15, serving: '100g', protein: 1.4, carbs: 2.9, fat: 0.2 },
      { name: '芹菜', calories: 16, serving: '100g', protein: 0.7, carbs: 3, fat: 0.2 },
    ]
  },
  fruits: {
    name: '水果',
    icon: '🍎',
    foods: [
      { name: '苹果', calories: 52, serving: '100g', protein: 0.3, carbs: 14, fat: 0.2 },
      { name: '香蕉', calories: 89, serving: '100g', protein: 1.1, carbs: 23, fat: 0.3 },
      { name: '橙子', calories: 47, serving: '100g', protein: 0.9, carbs: 12, fat: 0.1 },
      { name: '葡萄', calories: 69, serving: '100g', protein: 0.7, carbs: 18, fat: 0.2 },
      { name: '草莓', calories: 32, serving: '100g', protein: 0.7, carbs: 8, fat: 0.3 },
      { name: '西瓜', calories: 30, serving: '100g', protein: 0.6, carbs: 8, fat: 0.2 },
      { name: '蓝莓', calories: 57, serving: '100g', protein: 0.7, carbs: 14, fat: 0.3 },
    ]
  },
  dairy: {
    name: '乳制品',
    icon: '🥛',
    foods: [
      { name: '全脂牛奶', calories: 61, serving: '100ml', protein: 3.2, carbs: 4.8, fat: 3.3 },
      { name: '脱脂牛奶', calories: 35, serving: '100ml', protein: 3.4, carbs: 5, fat: 0.1 },
      { name: '酸奶（原味）', calories: 72, serving: '100g', protein: 4.3, carbs: 5, fat: 3.3 },
      { name: '希腊酸奶', calories: 97, serving: '100g', protein: 10, carbs: 3.6, fat: 5 },
      { name: '奶酪', calories: 350, serving: '100g', protein: 25, carbs: 1.3, fat: 27 },
    ]
  },
  snacks: {
    name: '零食饮料',
    icon: '🍿',
    foods: [
      { name: '薯片', calories: 536, serving: '100g', protein: 7, carbs: 53, fat: 33 },
      { name: '巧克力', calories: 535, serving: '100g', protein: 6, carbs: 60, fat: 30 },
      { name: '可乐', calories: 42, serving: '100ml', protein: 0, carbs: 11, fat: 0 },
      { name: '奶茶（珍珠）', calories: 120, serving: '100ml', protein: 1, carbs: 20, fat: 4 },
      { name: '啤酒', calories: 43, serving: '100ml', protein: 0.5, carbs: 3.6, fat: 0 },
      { name: '坚果混合', calories: 607, serving: '100g', protein: 20, carbs: 21, fat: 52 },
      { name: '饼干', calories: 480, serving: '100g', protein: 6, carbs: 65, fat: 22 },
    ]
  },
};

// 运动消耗热量（每30分钟/60kg体重）
const EXERCISE_DATABASE = [
  { name: '快走', caloriesPer30Min: 150, icon: '🚶', intensity: 'low' },
  { name: '慢跑', caloriesPer30Min: 250, icon: '🏃', intensity: 'medium' },
  { name: '快跑', caloriesPer30Min: 400, icon: '🏃‍♂️', intensity: 'high' },
  { name: '游泳', caloriesPer30Min: 300, icon: '🏊', intensity: 'medium' },
  { name: '骑自行车', caloriesPer30Min: 200, icon: '🚴', intensity: 'medium' },
  { name: '力量训练', caloriesPer30Min: 180, icon: '🏋️', intensity: 'medium' },
  { name: '瑜伽', caloriesPer30Min: 100, icon: '🧘', intensity: 'low' },
  { name: '跳绳', caloriesPer30Min: 350, icon: '⏱️', intensity: 'high' },
  { name: '篮球', caloriesPer30Min: 280, icon: '🏀', intensity: 'high' },
  { name: '足球', caloriesPer30Min: 300, icon: '⚽', intensity: 'high' },
  { name: '羽毛球', caloriesPer30Min: 200, icon: '🏸', intensity: 'medium' },
  { name: '爬楼梯', caloriesPer30Min: 250, icon: '🪜', intensity: 'medium' },
];

export default function CalorieCalculator() {
  // 基础信息
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState(1.55);
  const [goal, setGoal] = useState('maintain');
  const [macroPlan, setMacroPlan] = useState('balanced');
  
  // 食物计算器
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [foodSearch, setFoodSearch] = useState('');
  
  // 运动计算器
  const [selectedExercises, setSelectedExercises] = useState([]);
  
  // Tab 状态
  const [activeTab, setActiveTab] = useState('calculator');
  
  const [showResult, setShowResult] = useState(false);

  // 计算结果
  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);

    if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) return null;

    // BMR (Mifflin-St Jeor)
    let bmr;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    // TDEE
    const tdee = Math.round(bmr * activityLevel);

    // 目标热量
    const goalData = GOALS.find(g => g.value === goal);
    const targetCalories = Math.round(tdee + goalData.deficit);

    // 宏量营养素
    const macroData = MACRO_PLANS[macroPlan];
    const macros = {
      protein: {
        grams: Math.round((targetCalories * macroData.protein) / 4),
        calories: Math.round(targetCalories * macroData.protein),
        percentage: Math.round(macroData.protein * 100),
      },
      carbs: {
        grams: Math.round((targetCalories * macroData.carbs) / 4),
        calories: Math.round(targetCalories * macroData.carbs),
        percentage: Math.round(macroData.carbs * 100),
      },
      fat: {
        grams: Math.round((targetCalories * macroData.fat) / 9),
        calories: Math.round(targetCalories * macroData.fat),
        percentage: Math.round(macroData.fat * 100),
      },
    };

    // BMI
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);

    // 每周预期变化
    const weeklyChange = (goalData.deficit * 7 / 7700).toFixed(2);

    // 每餐热量（按3餐分配）
    const mealCalories = {
      breakfast: Math.round(targetCalories * 0.30),
      lunch: Math.round(targetCalories * 0.35),
      dinner: Math.round(targetCalories * 0.35),
    };

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      goalData,
      macros,
      macroData,
      bmi,
      weeklyChange,
      mealCalories,
    };
  }, [gender, age, height, weight, activityLevel, goal, macroPlan]);

  // 食物总热量
  const foodTotals = useMemo(() => {
    return selectedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.totalCalories,
        protein: acc.protein + food.totalProtein,
        carbs: acc.carbs + food.totalCarbs,
        fat: acc.fat + food.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedFoods]);

  // 运动总消耗
  const exerciseTotals = useMemo(() => {
    const w = parseFloat(weight) || 60;
    return selectedExercises.reduce((total, ex) => {
      return total + (ex.caloriesPer30Min * (ex.duration / 30) * (w / 60));
    }, 0);
  }, [selectedExercises, weight]);

  // 添加食物
  const addFood = (food, category) => {
    const newFood = {
      ...food,
      id: Date.now(),
      amount: 100,
      totalCalories: food.calories,
      totalProtein: food.protein,
      totalCarbs: food.carbs,
      totalFat: food.fat,
    };
    setSelectedFoods([...selectedFoods, newFood]);
  };

  // 更新食物数量
  const updateFoodAmount = (id, amount) => {
    setSelectedFoods(selectedFoods.map(food => {
      if (food.id === id) {
        const ratio = amount / 100;
        return {
          ...food,
          amount,
          totalCalories: Math.round(food.calories * ratio),
          totalProtein: Math.round(food.protein * ratio * 10) / 10,
          totalCarbs: Math.round(food.carbs * ratio * 10) / 10,
          totalFat: Math.round(food.fat * ratio * 10) / 10,
        };
      }
      return food;
    }));
  };

  // 删除食物
  const removeFood = (id) => {
    setSelectedFoods(selectedFoods.filter(food => food.id !== id));
  };

  // 添加运动
  const addExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      id: Date.now(),
      duration: 30,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  // 更新运动时长
  const updateExerciseDuration = (id, duration) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === id) {
        return { ...ex, duration };
      }
      return ex;
    }));
  };

  // 删除运动
  const removeExercise = (id) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== id));
  };

  const handleCalculate = () => {
    if (height && weight && age) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setGender('male');
    setAge('');
    setHeight('');
    setWeight('');
    setActivityLevel(1.55);
    setGoal('maintain');
    setMacroPlan('balanced');
    setSelectedFoods([]);
    setSelectedExercises([]);
    setShowResult(false);
  };

  // 搜索食物
  const searchResults = useMemo(() => {
    if (!foodSearch.trim()) return [];
    const query = foodSearch.toLowerCase();
    const results = [];
    Object.entries(FOOD_DATABASE).forEach(([category, data]) => {
      data.foods.forEach(food => {
        if (food.name.toLowerCase().includes(query)) {
          results.push({ ...food, category });
        }
      });
    });
    return results.slice(0, 8);
  }, [foodSearch]);

  return (
    <div className={styles.calculator}>
      {/* Tab 导航 */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'calculator' ? styles.active : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          🧮 热量计算
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'food' ? styles.active : ''}`}
          onClick={() => setActiveTab('food')}
        >
          🍽️ 食物热量
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'exercise' ? styles.active : ''}`}
          onClick={() => setActiveTab('exercise')}
        >
          🏃 运动消耗
        </button>
      </div>

      {/* 热量计算器 Tab */}
      {activeTab === 'calculator' && (
        <>
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
                    <span className={styles.activityIcon}>{level.icon}</span>
                    <div className={styles.activityText}>
                      <span className={styles.activityLabel}>{level.label}</span>
                      <span className={styles.activityDesc}>{level.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 目标选择 */}
            <div className={styles.inputGroup}>
              <label>您的目标</label>
              <div className={styles.goalOptions}>
                {GOALS.map((g) => (
                  <label
                    key={g.value}
                    className={`${styles.goalOption} ${goal === g.value ? styles.active : ''}`}
                    style={{ '--goal-color': g.color }}
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

            {/* 饮食方案 */}
            <div className={styles.inputGroup}>
              <label>饮食方案</label>
              <div className={styles.macroOptions}>
                {Object.entries(MACRO_PLANS).map(([key, plan]) => (
                  <label
                    key={key}
                    className={`${styles.macroOption} ${macroPlan === key ? styles.active : ''}`}
                  >
                    <input
                      type="radio"
                      name="macro"
                      value={key}
                      checked={macroPlan === key}
                      onChange={() => setMacroPlan(key)}
                    />
                    <span className={styles.macroName}>{plan.name}</span>
                    <span className={styles.macroDesc}>{plan.description}</span>
                    <div className={styles.macroPreview}>
                      <span>蛋白质 {plan.protein * 100}%</span>
                      <span>碳水 {plan.carbs * 100}%</span>
                      <span>脂肪 {plan.fat * 100}%</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.primaryBtn} onClick={handleCalculate}>
                计算每日热量
              </button>
              <button className={styles.secondaryBtn} onClick={handleReset}>
                重置
              </button>
            </div>
          </div>

          {/* 计算结果 */}
          {showResult && result && (
            <div className={styles.resultSection}>
              <h3>📋 计算结果</h3>

              {/* 主要热量指标 */}
              <div className={styles.calorieCards}>
                <div className={styles.calorieCard}>
                  <span className={styles.calorieIcon}>🔥</span>
                  <span className={styles.calorieLabel}>基础代谢 (BMR)</span>
                  <span className={styles.calorieValue}>{result.bmr}</span>
                  <span className={styles.calorieUnit}>千卡/天</span>
                </div>
                <div className={styles.calorieCard}>
                  <span className={styles.calorieIcon}>⚡</span>
                  <span className={styles.calorieLabel}>每日消耗 (TDEE)</span>
                  <span className={styles.calorieValue}>{result.tdee}</span>
                  <span className={styles.calorieUnit}>千卡/天</span>
                </div>
                <div 
                  className={`${styles.calorieCard} ${styles.target}`}
                  style={{ borderColor: result.goalData.color }}
                >
                  <span className={styles.calorieIcon}>{result.goalData.icon}</span>
                  <span className={styles.calorieLabel}>目标摄入</span>
                  <span 
                    className={styles.calorieValue}
                    style={{ color: result.goalData.color }}
                  >
                    {result.targetCalories}
                  </span>
                  <span className={styles.calorieUnit}>千卡/天</span>
                  <span className={styles.calorieChange}>
                    {result.goalData.deficit > 0 ? '+' : ''}{result.goalData.deficit} kcal
                  </span>
                </div>
              </div>

              {/* 热量差可视化 */}
              <div className={styles.calorieVisual}>
                <div className={styles.visualBar}>
                  <div 
                    className={styles.bmrBar}
                    style={{ width: `${(result.bmr / result.tdee) * 100}%` }}
                  >
                    <span>BMR</span>
                  </div>
                  <div 
                    className={styles.activityBar}
                    style={{ width: `${((result.tdee - result.bmr) / result.tdee) * 100}%` }}
                  >
                    <span>活动</span>
                  </div>
                </div>
                <div 
                  className={styles.targetLine}
                  style={{ 
                    left: `${(result.targetCalories / result.tdee) * 100}%`,
                    borderColor: result.goalData.color 
                  }}
                >
                  <span>目标</span>
                </div>
              </div>

              {/* 预期变化 */}
              {result.goalData.deficit !== 0 && (
                <div className={styles.predictionCard}>
                  <h4>📈 预期变化</h4>
                  <div className={styles.predictionGrid}>
                    <div className={styles.predictionItem}>
                      <span className={styles.predictionLabel}>每周</span>
                      <span className={styles.predictionValue}>
                        {result.weeklyChange > 0 ? '+' : ''}{result.weeklyChange} kg
                      </span>
                    </div>
                    <div className={styles.predictionItem}>
                      <span className={styles.predictionLabel}>每月</span>
                      <span className={styles.predictionValue}>
                        {result.weeklyChange > 0 ? '+' : ''}{(result.weeklyChange * 4.3).toFixed(1)} kg
                      </span>
                    </div>
                    <div className={styles.predictionItem}>
                      <span className={styles.predictionLabel}>三个月</span>
                      <span className={styles.predictionValue}>
                        {result.weeklyChange > 0 ? '+' : ''}{(result.weeklyChange * 13).toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                  {result.goalData.warning && (
                    <p className={styles.warning}>⚠️ {result.goalData.warning}</p>
                  )}
                </div>
              )}

              {/* 宏量营养素 */}
              <div className={styles.macrosSection}>
                <h4>🥗 宏量营养素分配 - {result.macroData.name}</h4>
                <div className={styles.macrosCards}>
                  <div className={styles.macroCard} style={{ '--macro-color': '#ef4444' }}>
                    <div className={styles.macroHeader}>
                      <span className={styles.macroTitle}>蛋白质</span>
                      <span className={styles.macroPercent}>{result.macros.protein.percentage}%</span>
                    </div>
                    <div className={styles.macroValue}>{result.macros.protein.grams}g</div>
                    <div className={styles.macroCalories}>{result.macros.protein.calories} kcal</div>
                    <div className={styles.macroBar}>
                      <div style={{ width: `${result.macros.protein.percentage}%` }}></div>
                    </div>
                  </div>
                  <div className={styles.macroCard} style={{ '--macro-color': '#22c55e' }}>
                    <div className={styles.macroHeader}>
                      <span className={styles.macroTitle}>碳水化合物</span>
                      <span className={styles.macroPercent}>{result.macros.carbs.percentage}%</span>
                    </div>
                    <div className={styles.macroValue}>{result.macros.carbs.grams}g</div>
                    <div className={styles.macroCalories}>{result.macros.carbs.calories} kcal</div>
                    <div className={styles.macroBar}>
                      <div style={{ width: `${result.macros.carbs.percentage}%` }}></div>
                    </div>
                  </div>
                  <div className={styles.macroCard} style={{ '--macro-color': '#f59e0b' }}>
                    <div className={styles.macroHeader}>
                      <span className={styles.macroTitle}>脂肪</span>
                      <span className={styles.macroPercent}>{result.macros.fat.percentage}%</span>
                    </div>
                    <div className={styles.macroValue}>{result.macros.fat.grams}g</div>
                    <div className={styles.macroCalories}>{result.macros.fat.calories} kcal</div>
                    <div className={styles.macroBar}>
                      <div style={{ width: `${result.macros.fat.percentage}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* 饼图可视化 */}
                <div className={styles.pieChart}>
                  <svg viewBox="0 0 100 100" className={styles.pie}>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#ef4444"
                      strokeWidth="20"
                      strokeDasharray={`${result.macros.protein.percentage * 2.51} 251`}
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#22c55e"
                      strokeWidth="20"
                      strokeDasharray={`${result.macros.carbs.percentage * 2.51} 251`}
                      strokeDashoffset={`${-result.macros.protein.percentage * 2.51}`}
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray={`${result.macros.fat.percentage * 2.51} 251`}
                      strokeDashoffset={`${-(result.macros.protein.percentage + result.macros.carbs.percentage) * 2.51}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className={styles.pieCenter}>
                    <span>{result.targetCalories}</span>
                    <small>kcal</small>
                  </div>
                </div>
              </div>

              {/* 每餐分配 */}
              <div className={styles.mealSection}>
                <h4>🍽️ 每餐热量建议</h4>
                <div className={styles.mealCards}>
                  <div className={styles.mealCard}>
                    <span className={styles.mealIcon}>🌅</span>
                    <span className={styles.mealName}>早餐</span>
                    <span className={styles.mealValue}>{result.mealCalories.breakfast} kcal</span>
                    <span className={styles.mealPercent}>30%</span>
                  </div>
                  <div className={styles.mealCard}>
                    <span className={styles.mealIcon}>☀️</span>
                    <span className={styles.mealName}>午餐</span>
                    <span className={styles.mealValue}>{result.mealCalories.lunch} kcal</span>
                    <span className={styles.mealPercent}>35%</span>
                  </div>
                  <div className={styles.mealCard}>
                    <span className={styles.mealIcon}>🌙</span>
                    <span className={styles.mealName}>晚餐</span>
                    <span className={styles.mealValue}>{result.mealCalories.dinner} kcal</span>
                    <span className={styles.mealPercent}>35%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 食物热量 Tab */}
      {activeTab === 'food' && (
        <div className={styles.foodTab}>
          <div className={styles.foodHeader}>
            <h3>🍽️ 食物热量计算</h3>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="搜索食物..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map((food, index) => (
                    <div
                      key={index}
                      className={styles.searchItem}
                      onClick={() => {
                        addFood(food, food.category);
                        setFoodSearch('');
                      }}
                    >
                      <span>{food.name}</span>
                      <span>{food.calories} kcal/{food.serving}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 食物分类 */}
          <div className={styles.foodCategories}>
            {Object.entries(FOOD_DATABASE).map(([key, category]) => (
              <div key={key} className={styles.foodCategory}>
                <div className={styles.categoryHeader}>
                  <span>{category.icon} {category.name}</span>
                </div>
                <div className={styles.foodList}>
                  {category.foods.map((food, index) => (
                    <div key={index} className={styles.foodItem}>
                      <div className={styles.foodInfo}>
                        <span className={styles.foodName}>{food.name}</span>
                        <span className={styles.foodServing}>{food.serving}</span>
                      </div>
                      <div className={styles.foodNutrition}>
                        <span className={styles.foodCalories}>{food.calories} kcal</span>
                      </div>
                      <button
                        className={styles.addBtn}
                        onClick={() => addFood(food, key)}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 已选食物 */}
          {selectedFoods.length > 0 && (
            <div className={styles.selectedFoods}>
              <h4>📝 已添加食物</h4>
              <div className={styles.selectedList}>
                {selectedFoods.map((food) => (
                  <div key={food.id} className={styles.selectedItem}>
                    <span className={styles.selectedName}>{food.name}</span>
                    <div className={styles.amountControl}>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        step="10"
                        value={food.amount}
                        onChange={(e) => updateFoodAmount(food.id, parseInt(e.target.value) || 0)}
                      />
                      <span>g</span>
                    </div>
                    <span className={styles.selectedCalories}>{food.totalCalories} kcal</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFood(food.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* 总计 */}
              <div className={styles.foodTotals}>
                <div className={styles.totalItem}>
                  <span>总热量</span>
                  <span className={styles.totalValue}>{Math.round(foodTotals.calories)} kcal</span>
                </div>
                <div className={styles.totalItem}>
                  <span>蛋白质</span>
                  <span>{foodTotals.protein.toFixed(1)}g</span>
                </div>
                <div className={styles.totalItem}>
                  <span>碳水</span>
                  <span>{foodTotals.carbs.toFixed(1)}g</span>
                </div>
                <div className={styles.totalItem}>
                  <span>脂肪</span>
                  <span>{foodTotals.fat.toFixed(1)}g</span>
                </div>
              </div>

              {/* 与目标对比 */}
              {result && (
                <div className={styles.comparison}>
                  <div className={styles.comparisonBar}>
                    <div
                      className={styles.comparisonFill}
                      style={{
                        width: `${Math.min((foodTotals.calories / result.targetCalories) * 100, 100)}%`,
                        backgroundColor: foodTotals.calories > result.targetCalories ? '#ef4444' : '#22c55e'
                      }}
                    ></div>
                  </div>
                  <div className={styles.comparisonText}>
                    {foodTotals.calories < result.targetCalories ? (
                      <span>还可摄入 <strong>{result.targetCalories - Math.round(foodTotals.calories)}</strong> kcal</span>
                    ) : (
                      <span style={{ color: '#ef4444' }}>
                        超出目标 <strong>{Math.round(foodTotals.calories) - result.targetCalories}</strong> kcal
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 运动消耗 Tab */}
      {activeTab === 'exercise' && (
        <div className={styles.exerciseTab}>
          <div className={styles.exerciseHeader}>
            <h3>🏃 运动热量消耗</h3>
            <p className={styles.exerciseNote}>
              基于 {weight || 60}kg 体重计算
            </p>
          </div>

          {/* 运动列表 */}
          <div className={styles.exerciseGrid}>
            {EXERCISE_DATABASE.map((exercise, index) => (
              <div
                key={index}
                className={`${styles.exerciseCard} ${styles[exercise.intensity]}`}
                onClick={() => addExercise(exercise)}
              >
                <span className={styles.exerciseIcon}>{exercise.icon}</span>
                <span className={styles.exerciseName}>{exercise.name}</span>
                <span className={styles.exerciseCalories}>
                  ~{Math.round(exercise.caloriesPer30Min * ((parseFloat(weight) || 60) / 60))} kcal/30min
                </span>
              </div>
            ))}
          </div>

          {/* 已选运动 */}
          {selectedExercises.length > 0 && (
            <div className={styles.selectedExercises}>
              <h4>📝 今日运动</h4>
              <div className={styles.exerciseList}>
                {selectedExercises.map((exercise) => (
                  <div key={exercise.id} className={styles.exerciseItem}>
                    <span className={styles.exerciseItemIcon}>{exercise.icon}</span>
                    <span className={styles.exerciseItemName}>{exercise.name}</span>
                    <div className={styles.durationControl}>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        step="5"
                        value={exercise.duration}
                        onChange={(e) => updateExerciseDuration(exercise.id, parseInt(e.target.value) || 0)}
                      />
                      <span>分钟</span>
                    </div>
                    <span className={styles.exerciseItemCalories}>
                      {Math.round(exercise.caloriesPer30Min * (exercise.duration / 30) * ((parseFloat(weight) || 60) / 60))} kcal
                    </span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeExercise(exercise.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* 总消耗 */}
              <div className={styles.exerciseTotals}>
                <div className={styles.exerciseTotalCard}>
                  <span className={styles.exerciseTotalIcon}>🔥</span>
                  <span className={styles.exerciseTotalLabel}>今日运动消耗</span>
                  <span className={styles.exerciseTotalValue}>{Math.round(exerciseTotals)}</span>
                  <span className={styles.exerciseTotalUnit}>千卡</span>
                </div>
                {result && (
                  <div className={styles.exerciseBalance}>
                    <p>
                      目标摄入 <strong>{result.targetCalories}</strong> kcal
                      + 运动消耗 <strong>{Math.round(exerciseTotals)}</strong> kcal
                      = 可摄入 <strong style={{ color: '#22c55e' }}>{result.targetCalories + Math.round(exerciseTotals)}</strong> kcal
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 知识区域 */}
      <div className={styles.knowledgeSection}>
        <h3>📚 热量知识</h3>
        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>什么是 TDEE？</h4>
            <p>
              TDEE (Total Daily Energy Expenditure) 是每日总能量消耗，由基础代谢 (BMR)、
              食物热效应 (TEF) 和活动消耗组成。了解 TDEE 是管理体重的基础。
            </p>
          </div>
          <div className={styles.knowledgeCard}>
            <h4>热量缺口原理</h4>
            <p>
              减重的核心是制造热量缺口。每减少 7700 千卡约减轻 1kg 体重。
              建议每日缺口 300-500 千卡，过大的缺口会导致代谢下降。
            </p>
          </div>
          <div className={styles.knowledgeCard}>
            <h4>宏量营养素</h4>
            <ul>
              <li><strong>蛋白质：</strong>4 kcal/g，增加饱腹感，保护肌肉</li>
              <li><strong>碳水：</strong>4 kcal/g，主要能量来源</li>
              <li><strong>脂肪：</strong>9 kcal/g，必需营养素，不可过低</li>
            </ul>
          </div>
          <div className={styles.knowledgeCard}>
            <h4>健康减重原则</h4>
            <ul>
              <li>每周减重不超过 0.5-1kg</li>
              <li>保证充足蛋白质摄入</li>
              <li>配合适量运动</li>
              <li>保证睡眠质量</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}