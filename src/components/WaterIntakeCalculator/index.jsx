import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 活动水平
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: '久坐不动', factor: 1.0, icon: '🪑', description: '办公室工作，几乎不运动' },
  { value: 'light', label: '轻度活动', factor: 1.1, icon: '🚶', description: '每天步行或轻度活动' },
  { value: 'moderate', label: '中度活动', factor: 1.2, icon: '🏃', description: '每周运动3-5次' },
  { value: 'active', label: '高度活动', factor: 1.4, icon: '🏋️', description: '每天高强度运动' },
  { value: 'athlete', label: '专业运动', factor: 1.6, icon: '🏆', description: '职业运动员级别' },
];

// 气候环境
const CLIMATE_OPTIONS = [
  { value: 'cold', label: '寒冷', factor: 0.9, icon: '❄️', description: '冬季或空调环境' },
  { value: 'mild', label: '温和', factor: 1.0, icon: '🌤️', description: '春秋季节' },
  { value: 'warm', label: '温暖', factor: 1.1, icon: '☀️', description: '夏季或温暖地区' },
  { value: 'hot', label: '炎热', factor: 1.3, icon: '🔥', description: '高温或热带地区' },
  { value: 'humid', label: '湿热', factor: 1.4, icon: '💦', description: '高温高湿环境' },
];

// 特殊情况
const SPECIAL_CONDITIONS = [
  { id: 'pregnant', label: '孕期', extra: 300, icon: '🤰', description: '增加约300ml' },
  { id: 'breastfeeding', label: '哺乳期', extra: 700, icon: '🤱', description: '增加约700ml' },
  { id: 'illness', label: '生病/发烧', extra: 500, icon: '🤒', description: '增加约500ml' },
  { id: 'altitude', label: '高海拔', extra: 400, icon: '🏔️', description: '增加约400ml' },
  { id: 'airplane', label: '飞机旅行', extra: 250, icon: '✈️', description: '每2小时增加250ml' },
  { id: 'alcohol', label: '饮酒后', extra: 300, icon: '🍺', description: '每杯酒增加一杯水' },
  { id: 'coffee', label: '喝咖啡', extra: 150, icon: '☕', description: '每杯咖啡补充150ml' },
];

// 饮品含水量参考
const BEVERAGE_WATER_CONTENT = [
  { name: '纯净水/矿泉水', percent: 100, icon: '💧', serving: '250ml', water: 250 },
  { name: '茶（无糖）', percent: 99, icon: '🍵', serving: '250ml', water: 248 },
  { name: '黑咖啡', percent: 98, icon: '☕', serving: '250ml', water: 245 },
  { name: '牛奶', percent: 87, icon: '🥛', serving: '250ml', water: 218 },
  { name: '果汁', percent: 85, icon: '🧃', serving: '250ml', water: 213 },
  { name: '运动饮料', percent: 94, icon: '🥤', serving: '500ml', water: 470 },
  { name: '可乐/汽水', percent: 90, icon: '🥤', serving: '330ml', water: 297 },
  { name: '啤酒', percent: 92, icon: '🍺', serving: '330ml', water: 304 },
  { name: '西瓜', percent: 92, icon: '🍉', serving: '200g', water: 184 },
  { name: '黄瓜', percent: 96, icon: '🥒', serving: '100g', water: 96 },
  { name: '番茄', percent: 94, icon: '🍅', serving: '150g', water: 141 },
  { name: '橙子', percent: 87, icon: '🍊', serving: '200g', water: 174 },
];

// 每日饮水时间建议
const DRINKING_SCHEDULE = [
  { time: '07:00', event: '起床后', amount: 250, tip: '空腹一杯温水，唤醒身体', icon: '🌅' },
  { time: '09:00', event: '上午工作', amount: 250, tip: '补充水分，提升专注力', icon: '💼' },
  { time: '11:00', event: '午餐前', amount: 200, tip: '餐前30分钟，帮助消化', icon: '⏰' },
  { time: '13:00', event: '午餐后', amount: 200, tip: '餐后半小时适量饮水', icon: '🍱' },
  { time: '15:00', event: '下午茶', amount: 250, tip: '下午疲劳时补水提神', icon: '☕' },
  { time: '17:00', event: '下班前', amount: 200, tip: '离开办公室前补水', icon: '🏠' },
  { time: '19:00', event: '晚餐后', amount: 200, tip: '晚餐后适量饮水', icon: '🌙' },
  { time: '21:00', event: '睡前', amount: 150, tip: '睡前1-2小时少量饮水', icon: '😴' },
];

// 缺水信号
const DEHYDRATION_SIGNS = [
  { level: 'mild', label: '轻度缺水', signs: ['口渴', '嘴唇干燥', '尿液偏黄'], color: '#f59e0b' },
  { level: 'moderate', label: '中度缺水', signs: ['头痛', '疲劳', '注意力下降', '尿量减少'], color: '#f97316' },
  { level: 'severe', label: '重度缺水', signs: ['头晕', '心跳加快', '皮肤干燥无弹性', '尿液深黄'], color: '#ef4444' },
];

// 尿液颜色对照
const URINE_COLORS = [
  { color: '#f5f5dc', label: '透明/淡黄', status: '水分充足', icon: '✅' },
  { color: '#f0e68c', label: '淡黄色', status: '正常', icon: '👍' },
  { color: '#daa520', label: '黄色', status: '需要补水', icon: '⚠️' },
  { color: '#cd853f', label: '深黄色', status: '缺水', icon: '🚨' },
  { color: '#8b4513', label: '琥珀色', status: '严重缺水', icon: '⛔' },
];

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('light');
  const [climate, setClimate] = useState('mild');
  const [specialConditions, setSpecialConditions] = useState([]);
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [caffeineCount, setCaffeineCount] = useState('0');
  const [showResult, setShowResult] = useState(false);

  // 饮水记录
  const [waterLog, setWaterLog] = useState([]);
  const [customAmount, setCustomAmount] = useState('250');

  const toggleSpecialCondition = (id) => {
    setSpecialConditions(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // 计算结果
  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;

    // 基础饮水量（ml）= 体重(kg) × 30-35ml
    let baseWater = w * 33;

    // 年龄调整
    const a = parseFloat(age);
    if (a) {
      if (a > 65) baseWater *= 0.95; // 老年人稍减
      if (a < 18) baseWater *= 1.05; // 青少年稍增
    }

    // 性别调整
    if (gender === 'female') {
      baseWater *= 0.95;
    }

    // 活动水平调整
    const activityFactor = ACTIVITY_LEVELS.find(l => l.value === activityLevel)?.factor || 1.0;
    let adjustedWater = baseWater * activityFactor;

    // 气候调整
    const climateFactor = CLIMATE_OPTIONS.find(c => c.value === climate)?.factor || 1.0;
    adjustedWater *= climateFactor;

    // 运动额外补水（每30分钟运动增加350ml）
    const exerciseMins = parseFloat(exerciseMinutes) || 0;
    const exerciseExtra = Math.round((exerciseMins / 30) * 350);
    adjustedWater += exerciseExtra;

    // 特殊情况增加
    let specialExtra = 0;
    specialConditions.forEach(id => {
      const condition = SPECIAL_CONDITIONS.find(c => c.id === id);
      if (condition) specialExtra += condition.extra;
    });
    adjustedWater += specialExtra;

    // 咖啡因补充
    const caffeineExtra = parseInt(caffeineCount) * 150;
    adjustedWater += caffeineExtra;

    // 取整
    const totalWater = Math.round(adjustedWater);

    // 计算杯数（每杯250ml）
    const glasses = Math.ceil(totalWater / 250);

    // 最低和最高建议
    const minWater = Math.round(w * 30);
    const maxWater = Math.round(w * 40);

    // 生成饮水时间表
    const schedule = generateDrinkingSchedule(totalWater);

    return {
      totalWater,
      glasses,
      minWater,
      maxWater,
      baseWater: Math.round(baseWater),
      exerciseExtra,
      specialExtra,
      caffeineExtra,
      schedule,
    };
  }, [weight, age, gender, activityLevel, climate, specialConditions, exerciseMinutes, caffeineCount]);

  // 生成个性化饮水时间表
  function generateDrinkingSchedule(total) {
    const baseSchedule = [...DRINKING_SCHEDULE];
    const totalBase = baseSchedule.reduce((sum, item) => sum + item.amount, 0);
    const ratio = total / totalBase;

    return baseSchedule.map(item => ({
      ...item,
      amount: Math.round(item.amount * ratio),
    }));
  }

  // 添加饮水记录
  const addWaterLog = (amount) => {
    const now = new Date();
    setWaterLog(prev => [...prev, {
      id: Date.now(),
      amount,
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  // 删除饮水记录
  const removeWaterLog = (id) => {
    setWaterLog(prev => prev.filter(item => item.id !== id));
  };

  // 今日饮水总量
  const todayTotal = waterLog.reduce((sum, item) => sum + item.amount, 0);

  // 完成百分比
  const completionPercent = result ? Math.min(100, Math.round((todayTotal / result.totalWater) * 100)) : 0;

  const handleCalculate = () => {
    if (weight && parseFloat(weight) > 0) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setWeight('');
    setAge('');
    setGender('male');
    setActivityLevel('light');
    setClimate('mild');
    setSpecialConditions([]);
    setExerciseMinutes('');
    setCaffeineCount('0');
    setShowResult(false);
  };

  return (
    <div className={styles.calculator}>
      {/* 输入区域 */}
      <div className={styles.inputSection}>
        <h3>💧 每日饮水量计算</h3>
        <p className={styles.sectionDesc}>
          根据您的身体状况和生活方式，计算每日最佳饮水量
        </p>

        {/* 基础信息 */}
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="weight">体重 (kg) *</label>
            <input
              id="weight"
              type="number"
              min="30"
              max="200"
              step="0.1"
              placeholder="例如：65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
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
            <label>性别</label>
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
                <span className={styles.activityLabel}>{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 气候环境 */}
        <div className={styles.inputGroup}>
          <label>气候/环境</label>
          <div className={styles.climateOptions}>
            {CLIMATE_OPTIONS.map((c) => (
              <label
                key={c.value}
                className={`${styles.climateOption} ${climate === c.value ? styles.active : ''}`}
              >
                <input
                  type="radio"
                  name="climate"
                  value={c.value}
                  checked={climate === c.value}
                  onChange={() => setClimate(c.value)}
                />
                <span className={styles.climateIcon}>{c.icon}</span>
                <span className={styles.climateLabel}>{c.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 运动时间和咖啡因 */}
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="exercise">今日运动时间（分钟）</label>
            <input
              id="exercise"
              type="number"
              min="0"
              max="300"
              placeholder="例如：60"
              value={exerciseMinutes}
              onChange={(e) => setExerciseMinutes(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="caffeine">咖啡/茶饮用量（杯）</label>
            <select
              id="caffeine"
              value={caffeineCount}
              onChange={(e) => setCaffeineCount(e.target.value)}
            >
              {[0, 1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} 杯</option>
              ))}
            </select>
          </div>
        </div>

        {/* 特殊情况 */}
        <div className={styles.inputGroup}>
          <label>特殊情况（可多选）</label>
          <div className={styles.specialOptions}>
            {SPECIAL_CONDITIONS.map((condition) => (
              <label
                key={condition.id}
                className={`${styles.specialOption} ${specialConditions.includes(condition.id) ? styles.active : ''}`}
              >
                <input
                  type="checkbox"
                  checked={specialConditions.includes(condition.id)}
                  onChange={() => toggleSpecialCondition(condition.id)}
                />
                <span className={styles.specialIcon}>{condition.icon}</span>
                <span className={styles.specialLabel}>{condition.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            className={styles.primaryBtn} 
            onClick={handleCalculate}
            disabled={!weight || parseFloat(weight) <= 0}
          >
            计算饮水量 💧
          </button>
          <button className={styles.secondaryBtn} onClick={handleReset}>
            重置
          </button>
        </div>
      </div>

      {/* 结果区域 */}
      {showResult && result && (
        <div className={styles.resultSection}>
          {/* 主要结果 */}
          <div className={styles.mainResult}>
            <div className={styles.waterCard}>
              <div className={styles.waterIcon}>💧</div>
              <div className={styles.waterContent}>
                <span className={styles.waterLabel}>每日建议饮水量</span>
                <div className={styles.waterValue}>
                  <span className={styles.waterNum}>{result.totalWater}</span>
                  <span className={styles.waterUnit}>毫升</span>
                </div>
                <div className={styles.waterExtra}>
                  约 <strong>{result.glasses}</strong> 杯（每杯250ml）
                </div>
              </div>
            </div>

            <div className={styles.rangeCard}>
              <span className={styles.rangeLabel}>建议范围</span>
              <span className={styles.rangeValue}>
                {result.minWater} - {result.maxWater} ml
              </span>
              <span className={styles.rangeNote}>根据体重计算</span>
            </div>
          </div>

          {/* 饮水量构成 */}
          <div className={styles.breakdownSection}>
            <h4>📊 饮水量构成</h4>
            <div className={styles.breakdownItems}>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>基础需求</span>
                <span className={styles.breakdownValue}>{result.baseWater} ml</span>
              </div>
              {result.exerciseExtra > 0 && (
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>运动补充</span>
                  <span className={styles.breakdownValue}>+{result.exerciseExtra} ml</span>
                </div>
              )}
              {result.specialExtra > 0 && (
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>特殊情况</span>
                  <span className={styles.breakdownValue}>+{result.specialExtra} ml</span>
                </div>
              )}
              {result.caffeineExtra > 0 && (
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>咖啡因补充</span>
                  <span className={styles.breakdownValue}>+{result.caffeineExtra} ml</span>
                </div>
              )}
            </div>
          </div>

          {/* 饮水进度跟踪 */}
          <div className={styles.trackerSection}>
            <h4>📝 今日饮水记录</h4>
            
            {/* 进度环 */}
            <div className={styles.progressRing}>
              <svg viewBox="0 0 120 120" className={styles.ringSvg}>
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e5e5"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={completionPercent >= 100 ? '#22c55e' : '#3b82f6'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${completionPercent * 3.39} 339`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.ringCenter}>
                <span className={styles.ringPercent}>{completionPercent}%</span>
                <span className={styles.ringTotal}>{todayTotal} / {result.totalWater} ml</span>
              </div>
            </div>

            {/* 快速添加按钮 */}
            <div className={styles.quickAdd}>
              <span className={styles.quickLabel}>快速添加：</span>
              <div className={styles.quickButtons}>
                {[100, 200, 250, 500].map(amount => (
                  <button
                    key={amount}
                    className={styles.quickBtn}
                    onClick={() => addWaterLog(amount)}
                  >
                    +{amount}ml
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义添加 */}
            <div className={styles.customAdd}>
              <input
                type="number"
                min="50"
                max="1000"
                step="50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className={styles.customInput}
              />
              <span className={styles.customUnit}>ml</span>
              <button
                className={styles.customBtn}
                onClick={() => addWaterLog(parseInt(customAmount) || 250)}
              >
                添加
              </button>
            </div>

            {/* 饮水记录列表 */}
            {waterLog.length > 0 && (
              <div className={styles.logList}>
                {waterLog.map((log) => (
                  <div key={log.id} className={styles.logItem}>
                    <span className={styles.logTime}>{log.time}</span>
                    <span className={styles.logAmount}>{log.amount} ml</span>
                    <button
                      className={styles.logDelete}
                      onClick={() => removeWaterLog(log.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  className={styles.clearBtn}
                  onClick={() => setWaterLog([])}
                >
                  清空记录
                </button>
              </div>
            )}
          </div>

          {/* 饮水时间表 */}
          <div className={styles.scheduleSection}>
            <h4>⏰ 建议饮水时间表</h4>
            <div className={styles.scheduleList}>
              {result.schedule.map((item, index) => (
                <div key={index} className={styles.scheduleItem}>
                  <div className={styles.scheduleTime}>
                    <span className={styles.scheduleIcon}>{item.icon}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className={styles.scheduleContent}>
                    <span className={styles.scheduleEvent}>{item.event}</span>
                    <span className={styles.scheduleTip}>{item.tip}</span>
                  </div>
                  <div className={styles.scheduleAmount}>
                    {item.amount} ml
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 尿液颜色参考 */}
          <div className={styles.urineSection}>
            <h4>🚽 尿液颜色参考</h4>
            <p className={styles.urineDesc}>尿液颜色是判断水分摄入是否充足的简单方法</p>
            <div className={styles.urineColors}>
              {URINE_COLORS.map((item, index) => (
                <div key={index} className={styles.urineItem}>
                  <div 
                    className={styles.urineColor}
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className={styles.urineLabel}>{item.label}</span>
                  <span className={styles.urineStatus}>
                    {item.icon} {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 缺水信号 */}
          <div className={styles.signsSection}>
            <h4>⚠️ 缺水信号</h4>
            <div className={styles.signsList}>
              {DEHYDRATION_SIGNS.map((item, index) => (
                <div 
                  key={index} 
                  className={styles.signCard}
                  style={{ borderLeftColor: item.color }}
                >
                  <span 
                    className={styles.signLevel}
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                  <div className={styles.signItems}>
                    {item.signs.map((sign, i) => (
                      <span key={i} className={styles.signItem}>{sign}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 饮品含水量参考 */}
      <div className={styles.beverageSection}>
        <h3>🥤 常见饮品/食物含水量</h3>
        <div className={styles.beverageGrid}>
          {BEVERAGE_WATER_CONTENT.map((item, index) => (
            <div key={index} className={styles.beverageCard}>
              <span className={styles.beverageIcon}>{item.icon}</span>
              <span className={styles.beverageName}>{item.name}</span>
              <span className={styles.beverageServing}>{item.serving}</span>
              <span className={styles.beverageWater}>≈ {item.water} ml 水</span>
            </div>
          ))}
        </div>
      </div>

      {/* 知识区域 */}
      <div className={styles.knowledgeSection}>
        <h3>📚 饮水知识</h3>

        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>为什么水很重要？</h4>
            <ul>
              <li>人体约60%由水组成</li>
              <li>调节体温，维持血压</li>
              <li>帮助消化和营养吸收</li>
              <li>排出代谢废物</li>
              <li>润滑关节和保护器官</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>正确的饮水方式</h4>
            <ul>
              <li>少量多次，不要一次喝太多</li>
              <li>不要等到口渴才喝水</li>
              <li>早起空腹喝一杯温水</li>
              <li>运动前中后都要补水</li>
              <li>避免睡前大量饮水</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>哪些情况需要多喝水？</h4>
            <ul>
              <li>运动或体力劳动后</li>
              <li>天气炎热或干燥</li>
              <li>发烧、腹泻、呕吐时</li>
              <li>饮酒或喝咖啡后</li>
              <li>孕期和哺乳期</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>喝水的常见误区</h4>
            <ul>
              <li>❌ 8杯水适合所有人</li>
              <li>❌ 渴了才需要喝水</li>
              <li>❌ 咖啡茶不算水分</li>
              <li>❌ 喝水越多越好</li>
              <li>✅ 根据个人情况调整</li>
            </ul>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 注意事项：</strong></p>
          <ul>
            <li>心脏病、肾病患者应遵医嘱控制饮水量</li>
            <li>过量饮水可能导致水中毒（低钠血症）</li>
            <li>本计算器仅供参考，具体需求因人而异</li>
            <li>如有特殊健康状况，请咨询医生</li>
          </ul>
        </div>
      </div>
    </div>
  );
}