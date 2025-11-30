import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 睡眠周期时长（分钟）
const SLEEP_CYCLE_DURATION = 90;

// 入睡所需时间（分钟）
const FALL_ASLEEP_TIME = 15;

// 年龄段睡眠建议
const AGE_SLEEP_RECOMMENDATIONS = [
  { minAge: 0, maxAge: 3, group: '婴儿', recommended: '14-17', min: 14, max: 17, icon: '👶' },
  { minAge: 4, maxAge: 11, group: '婴幼儿', recommended: '12-15', min: 12, max: 15, icon: '💒' },
  { minAge: 1, maxAge: 2, group: '幼儿', recommended: '11-14', min: 11, max: 14, icon: '👧' },
  { minAge: 3, maxAge: 5, group: '学龄前', recommended: '10-13', min: 10, max: 13, icon: '💒' },
  { minAge: 6, maxAge: 13, group: '学龄儿童', recommended: '9-11', min: 9, max: 11, icon: '🧒' },
  { minAge: 14, maxAge: 17, group: '青少年', recommended: '8-10', min: 8, max: 10, icon: '🧑' },
  { minAge: 18, maxAge: 25, group: '青年', recommended: '7-9', min: 7, max: 9, icon: '👨' },
  { minAge: 26, maxAge: 64, group: '成年人', recommended: '7-9', min: 7, max: 9, icon: '🧑‍💼' },
  { minAge: 65, maxAge: 120, group: '老年人', recommended: '7-8', min: 7, max: 8, icon: '👴' },
];

// 睡眠质量因素
const SLEEP_QUALITY_FACTORS = {
  caffeine: {
    name: '咖啡因摄入',
    icon: '☕',
    options: [
      { value: 'none', label: '不喝', description: '从不或很少', score: 10 },
      { value: 'morning', label: '仅早上', description: '中午前', score: 8 },
      { value: 'afternoon', label: '下午也喝', description: '下午3点后', score: 4 },
      { value: 'evening', label: '晚上也喝', description: '睡前6小时内', score: 0 },
    ],
  },
  screen: {
    name: '睡前屏幕',
    icon: '📱',
    options: [
      { value: 'none', label: '不看', description: '睡前1小时无屏幕', score: 10 },
      { value: 'little', label: '少量', description: '睡前30分钟停止', score: 7 },
      { value: 'some', label: '一般', description: '睡前才放下手机', score: 3 },
      { value: 'heavy', label: '频繁', description: '躺床上还在看', score: 0 },
    ],
  },
  exercise: {
    name: '运动习惯',
    icon: '🏃',
    options: [
      { value: 'regular', label: '规律运动', description: '每周3次以上', score: 10 },
      { value: 'some', label: '偶尔运动', description: '每周1-2次', score: 7 },
      { value: 'little', label: '很少运动', description: '偶尔走走', score: 4 },
      { value: 'none', label: '不运动', description: '久坐生活', score: 1 },
    ],
  },
  environment: {
    name: '睡眠环境',
    icon: '🛏️',
    options: [
      { value: 'excellent', label: '非常好', description: '安静、黑暗、凉爽', score: 10 },
      { value: 'good', label: '较好', description: '基本安静黑暗', score: 7 },
      { value: 'fair', label: '一般', description: '有些噪音或光线', score: 4 },
      { value: 'poor', label: '较差', description: '嘈杂或光线强', score: 1 },
    ],
  },
  stress: {
    name: '压力水平',
    icon: '😰',
    options: [
      { value: 'low', label: '轻松', description: '几乎无压力', score: 10 },
      { value: 'moderate', label: '一般', description: '正常工作压力', score: 7 },
      { value: 'high', label: '较大', description: '经常焦虑', score: 3 },
      { value: 'severe', label: '很大', description: '严重影响睡眠', score: 0 },
    ],
  },
  schedule: {
    name: '作息规律',
    icon: '⏰',
    options: [
      { value: 'very_regular', label: '非常规律', description: '固定时间睡醒', score: 10 },
      { value: 'regular', label: '比较规律', description: '偶尔波动', score: 7 },
      { value: 'irregular', label: '不太规律', description: '经常变化', score: 3 },
      { value: 'chaotic', label: '很不规律', description: '完全没规律', score: 0 },
    ],
  },
  nap: {
    name: '午睡习惯',
    icon: '😴',
    options: [
      { value: 'short', label: '短午睡', description: '20-30分钟', score: 10 },
      { value: 'none', label: '不午睡', description: '从不午睡', score: 8 },
      { value: 'long', label: '长午睡', description: '1小时以上', score: 4 },
      { value: 'late', label: '下午晚些', description: '下午3点后', score: 2 },
    ],
  },
  dinner: {
    name: '晚餐习惯',
    icon: '🍽️',
    options: [
      { value: 'early_light', label: '早且清淡', description: '睡前3小时', score: 10 },
      { value: 'moderate', label: '适中', description: '睡前2小时', score: 7 },
      { value: 'late', label: '较晚', description: '睡前1小时内', score: 3 },
      { value: 'heavy_late', label: '晚且油腻', description: '睡前吃很多', score: 0 },
    ],
  },
};

// 睡眠质量等级
const SLEEP_QUALITY_LEVELS = [
  { min: 80, max: 100, level: 'excellent', label: '优秀', color: '#22c55e', icon: '🌟', description: '您的睡眠习惯非常好！' },
  { min: 60, max: 80, level: 'good', label: '良好', color: '#84cc16', icon: '👍', description: '睡眠习惯不错，可以更好' },
  { min: 40, max: 60, level: 'fair', label: '一般', color: '#eab308', icon: '😐', description: '有改善空间' },
  { min: 20, max: 40, level: 'poor', label: '较差', color: '#f97316', icon: '😟', description: '建议改善睡眠习惯' },
  { min: 0, max: 20, level: 'bad', label: '很差', color: '#ef4444', icon: '😫', description: '睡眠习惯需要重视' },
];

// 计算模式
const CALC_MODES = {
  wakeTime: { id: 'wakeTime', label: '我想在这个时间醒来', icon: '⏰', description: '计算最佳入睡时间' },
  sleepTime: { id: 'sleepTime', label: '我想在这个时间睡觉', icon: '🌙', description: '计算最佳起床时间' },
  sleepNow: { id: 'sleepNow', label: '我现在就想睡', icon: '😴', description: '计算最佳起床时间' },
};

// 格式化时间
function formatTime(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// 解析时间字符串
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// 计算睡眠周期
function calculateSleepCycles(targetTime, mode, fallAsleepTime = FALL_ASLEEP_TIME) {
  const cycles = [];
  const cycleCount = [6, 5, 4, 3]; // 推荐的睡眠周期数

  if (mode === 'wakeTime' || mode === 'sleepNow') {
    // 计算入睡时间
    cycleCount.forEach((count) => {
      const sleepDuration = count * SLEEP_CYCLE_DURATION;
      const sleepTime = new Date(targetTime.getTime() - sleepDuration * 60000 - fallAsleepTime * 60000);
      cycles.push({
        count,
        sleepTime,
        wakeTime: targetTime,
        duration: sleepDuration / 60,
        quality: count >= 5 ? 'optimal' : count >= 4 ? 'good' : 'minimum',
      });
    });
  } else {
    // 计算起床时间
    cycleCount.forEach((count) => {
      const sleepDuration = count * SLEEP_CYCLE_DURATION;
      const wakeTime = new Date(targetTime.getTime() + sleepDuration * 60000 + fallAsleepTime * 60000);
      cycles.push({
        count,
        sleepTime: targetTime,
        wakeTime,
        duration: sleepDuration / 60,
        quality: count >= 5 ? 'optimal' : count >= 4 ? 'good' : 'minimum',
      });
    });
  }

  return cycles;
}

// 获取年龄段建议
function getAgeRecommendation(age) {
  return AGE_SLEEP_RECOMMENDATIONS.find(r => age >= r.minAge && age <= r.maxAge) || AGE_SLEEP_RECOMMENDATIONS[7];
}

// 获取睡眠质量等级
function getSleepQualityLevel(score) {
  return SLEEP_QUALITY_LEVELS.find(l => score >= l.min && score < l.max) || SLEEP_QUALITY_LEVELS[4];
}

// 生成睡眠建议
function generateSleepAdvice(qualityFactors) {
  const advice = [];
  
  Object.entries(qualityFactors).forEach(([key, value]) => {
    const factor = SLEEP_QUALITY_FACTORS[key];
    const option = factor.options.find(o => o.value === value);
    
    if (option && option.score < 5) {
      const tips = {
        caffeine: '尽量在中午前完成咖啡因摄入，下午避免咖啡、茶和可乐',
        screen: '睡前1小时放下手机，可以阅读纸质书或听轻音乐',
        exercise: '增加运动量，但避免睡前2小时内剧烈运动',
        environment: '改善卧室环境：使用遮光窗帘、耳塞或白噪音',
        stress: '尝试睡前冥想、深呼吸或写日记来放松',
        schedule: '固定每天的睡眠和起床时间，包括周末',
        nap: '午睡控制在20-30分钟，且在下午3点前',
        dinner: '晚餐清淡，睡前3小时内避免进食',
      };
      
      advice.push({
        icon: factor.icon,
        title: factor.name,
        current: option.label,
        tip: tips[key],
        priority: option.score === 0 ? 'high' : 'medium',
      });
    }
  });

  return advice.sort((a, b) => (a.priority === 'high' ? -1 : 1));
}

export default function SleepCalculator() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calcMode, setCalcMode] = useState('wakeTime');
  const [targetTime, setTargetTime] = useState('07:00');
  const [fallAsleepTime, setFallAsleepTime] = useState(15);
  const [age, setAge] = useState('');
  const [showResult, setShowResult] = useState(false);
  
  // 睡眠质量评估
  const [qualityFactors, setQualityFactors] = useState({
    caffeine: 'morning',
    screen: 'some',
    exercise: 'some',
    environment: 'good',
    stress: 'moderate',
    schedule: 'regular',
    nap: 'none',
    dinner: 'moderate',
  });

  const updateQualityFactor = (factor, value) => {
    setQualityFactors(prev => ({ ...prev, [factor]: value }));
  };

  // 计算结果
  const result = useMemo(() => {
    let target;
    if (calcMode === 'sleepNow') {
      target = new Date();
    } else {
      target = parseTime(targetTime);
      // 如果目标时间是过去，加一天
      if (target < new Date() && calcMode === 'wakeTime') {
        target.setDate(target.getDate() + 1);
      }
    }

    const cycles = calculateSleepCycles(
      target,
      calcMode === 'sleepNow' ? 'sleepTime' : calcMode,
      fallAsleepTime
    );

    // 年龄建议
    const ageRec = age ? getAgeRecommendation(parseInt(age)) : null;

    return {
      cycles,
      ageRecommendation: ageRec,
      targetTime: target,
    };
  }, [calcMode, targetTime, fallAsleepTime, age]);

  // 睡眠质量评分
  const qualityResult = useMemo(() => {
    let totalScore = 0;
    let maxScore = 0;

    Object.entries(qualityFactors).forEach(([key, value]) => {
      const factor = SLEEP_QUALITY_FACTORS[key];
      const option = factor.options.find(o => o.value === value);
      if (option) {
        totalScore += option.score;
      }
      maxScore += 10;
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    const level = getSleepQualityLevel(percentage);
    const advice = generateSleepAdvice(qualityFactors);

    return {
      score: percentage,
      level,
      advice,
    };
  }, [qualityFactors]);

  const handleCalculate = () => {
    setShowResult(true);
  };

  return (
    <div className={styles.calculator}>
      {/* Tab 导航 */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'calculator' ? styles.active : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          ⏰ 睡眠时间计算
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'quality' ? styles.active : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          📊 睡眠质量评估
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'cycles' ? styles.active : ''}`}
          onClick={() => setActiveTab('cycles')}
        >
          🔄 睡眠周期知识
        </button>
      </div>

      {/* 睡眠时间计算器 Tab */}
      {activeTab === 'calculator' && (
        <>
          <div className={styles.inputSection}>
            <h3>⏰ 睡眠时间计算</h3>
            <p className={styles.sectionDesc}>
              基于90分钟睡眠周期理论，帮您找到最佳入睡/起床时间
            </p>

            {/* 计算模式选择 */}
            <div className={styles.modeSelector}>
              {Object.values(CALC_MODES).map((mode) => (
                <label
                  key={mode.id}
                  className={`${styles.modeOption} ${calcMode === mode.id ? styles.active : ''}`}
                >
                  <input
                    type="radio"
                    name="calcMode"
                    value={mode.id}
                    checked={calcMode === mode.id}
                    onChange={() => setCalcMode(mode.id)}
                  />
                  <span className={styles.modeIcon}>{mode.icon}</span>
                  <div className={styles.modeText}>
                    <span className={styles.modeLabel}>{mode.label}</span>
                    <span className={styles.modeDesc}>{mode.description}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* 时间输入 */}
            {calcMode !== 'sleepNow' && (
              <div className={styles.timeInput}>
                <label htmlFor="targetTime">
                  {calcMode === 'wakeTime' ? '目标起床时间' : '计划入睡时间'}
                </label>
                <input
                  id="targetTime"
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                />
              </div>
            )}

            {/* 附加选项 */}
            <div className={styles.optionsGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="fallAsleep">入睡所需时间（分钟）</label>
                <input
                  id="fallAsleep"
                  type="number"
                  min="5"
                  max="60"
                  value={fallAsleepTime}
                  onChange={(e) => setFallAsleepTime(parseInt(e.target.value) || 15)}
                />
                <span className={styles.inputHint}>大多数人需要10-20分钟</span>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="age">年龄（可选）</label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="获取个性化建议"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <button className={styles.primaryBtn} onClick={handleCalculate}>
              计算最佳睡眠时间 🌙
            </button>
          </div>

          {/* 计算结果 */}
          {showResult && (
            <div className={styles.resultSection}>
              <h3>
                {calcMode === 'wakeTime' ? '🌙 建议入睡时间' : '⏰ 建议起床时间'}
              </h3>

              {/* 睡眠周期选项 */}
              <div className={styles.cycleResults}>
                {result.cycles.map((cycle, index) => (
                  <div 
                    key={index}
                    className={`${styles.cycleCard} ${styles[cycle.quality]}`}
                  >
                    <div className={styles.cycleHeader}>
                      <span className={styles.cycleCount}>{cycle.count} 个周期</span>
                      <span className={styles.cycleDuration}>{cycle.duration} 小时</span>
                    </div>
                    <div className={styles.cycleTime}>
                      {calcMode === 'wakeTime' || calcMode === 'sleepNow' ? (
                        <>
                          <span className={styles.timeLabel}>入睡</span>
                          <span className={styles.timeValue}>
                            {formatTime(cycle.sleepTime)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={styles.timeLabel}>起床</span>
                          <span className={styles.timeValue}>
                            {formatTime(cycle.wakeTime)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className={styles.cycleQuality}>
                      {cycle.quality === 'optimal' && '✨ 最佳选择'}
                      {cycle.quality === 'good' && '👍 推荐'}
                      {cycle.quality === 'minimum' && '⚠️ 最低需求'}
                    </div>
                  </div>
                ))}
              </div>

              {/* 睡眠周期可视化 */}
              <div className={styles.cycleVisual}>
                <h4>🔄 睡眠周期示意</h4>
                <div className={styles.cycleChart}>
                  {[1, 2, 3, 4, 5, 6].map((cycle) => (
                    <div key={cycle} className={styles.cycleBlock}>
                      <div className={styles.cycleWave}>
                        <div className={styles.lightSleep}>浅睡</div>
                        <div className={styles.deepSleep}>深睡</div>
                        <div className={styles.remSleep}>REM</div>
                      </div>
                      <span className={styles.cycleNum}>周期 {cycle}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.cycleTimeline}>
                  <span>入睡</span>
                  <span>1.5h</span>
                  <span>3h</span>
                  <span>4.5h</span>
                  <span>6h</span>
                  <span>7.5h</span>
                  <span>9h</span>
                </div>
              </div>

              {/* 年龄建议 */}
              {result.ageRecommendation && (
                <div className={styles.ageRecommendation}>
                  <div className={styles.ageIcon}>{result.ageRecommendation.icon}</div>
                  <div className={styles.ageContent}>
                    <span className={styles.ageGroup}>{result.ageRecommendation.group}</span>
                    <span className={styles.ageHours}>
                      建议睡眠时长：<strong>{result.ageRecommendation.recommended} 小时</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* 小贴士 */}
              <div className={styles.tipCard}>
                <h4>💡 小贴士</h4>
                <ul>
                  <li>在周期结束时醒来会感觉更清醒</li>
                  <li>深度睡眠主要在前半夜，尽量早睡</li>
                  <li>保持固定的睡眠时间比睡眠时长更重要</li>
                  <li>如果一直无法入睡，起床做些放松活动</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* 睡眠质量评估 Tab */}
      {activeTab === 'quality' && (
        <>
          <div className={styles.inputSection}>
            <h3>📊 睡眠质量评估</h3>
            <p className={styles.sectionDesc}>
              评估影响睡眠质量的各项因素，获取个性化改善建议
            </p>

            <div className={styles.qualityGrid}>
              {Object.entries(SLEEP_QUALITY_FACTORS).map(([key, factor]) => (
                <div key={key} className={styles.qualityCard}>
                  <div className={styles.qualityHeader}>
                    <span className={styles.qualityIcon}>{factor.icon}</span>
                    <span className={styles.qualityName}>{factor.name}</span>
                  </div>
                  <div className={styles.qualityOptions}>
                    {factor.options.map((option) => (
                      <label
                        key={option.value}
                        className={`${styles.qualityOption} ${qualityFactors[key] === option.value ? styles.active : ''}`}
                      >
                        <input
                          type="radio"
                          name={key}
                          value={option.value}
                          checked={qualityFactors[key] === option.value}
                          onChange={() => updateQualityFactor(key, option.value)}
                        />
                        <span className={styles.qOptionLabel}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 质量评估结果 */}
          <div className={styles.resultSection}>
            <h3>📋 评估结果</h3>

            {/* 评分展示 */}
            <div className={styles.scoreDisplay}>
              <div 
                className={styles.scoreCircle}
                style={{ '--score-color': qualityResult.level.color }}
              >
                <svg viewBox="0 0 100 100" className={styles.scoreSvg}>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={qualityResult.level.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${qualityResult.score * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className={styles.scoreInner}>
                  <span className={styles.scoreNum}>{qualityResult.score}</span>
                  <span className={styles.scoreLabel}>分</span>
                </div>
              </div>
              <div className={styles.scoreInfo}>
                <span 
                  className={styles.scoreLevel}
                  style={{ color: qualityResult.level.color }}
                >
                  {qualityResult.level.icon} {qualityResult.level.label}
                </span>
                <span className={styles.scoreDesc}>{qualityResult.level.description}</span>
              </div>
            </div>

            {/* 分项评分 */}
            <div className={styles.factorScores}>
              <h4>📈 分项评分</h4>
              <div className={styles.factorBars}>
                {Object.entries(SLEEP_QUALITY_FACTORS).map(([key, factor]) => {
                  const option = factor.options.find(o => o.value === qualityFactors[key]);
                  const score = option ? option.score : 0;
                  return (
                    <div key={key} className={styles.factorBar}>
                      <span className={styles.factorLabel}>
                        {factor.icon} {factor.name}
                      </span>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.barFill}
                          style={{ 
                            width: `${score * 10}%`,
                            backgroundColor: score >= 7 ? '#22c55e' : score >= 4 ? '#eab308' : '#ef4444'
                          }}
                        ></div>
                      </div>
                      <span className={styles.factorScore}>{score}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 改善建议 */}
            {qualityResult.advice.length > 0 && (
              <div className={styles.adviceSection}>
                <h4>💡 改善建议</h4>
                <div className={styles.adviceList}>
                  {qualityResult.advice.map((item, index) => (
                    <div 
                      key={index}
                      className={`${styles.adviceCard} ${styles[item.priority]}`}
                    >
                      <div className={styles.adviceHeader}>
                        <span className={styles.adviceIcon}>{item.icon}</span>
                        <span className={styles.adviceTitle}>{item.title}</span>
                        {item.priority === 'high' && (
                          <span className={styles.priorityTag}>优先</span>
                        )}
                      </div>
                      <div className={styles.adviceCurrent}>
                        当前：{item.current}
                      </div>
                      <div className={styles.adviceTip}>{item.tip}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 睡眠周期知识 Tab */}
      {activeTab === 'cycles' && (
        <div className={styles.knowledgeSection}>
          <h3>🔄 睡眠周期知识</h3>

          {/* 睡眠阶段介绍 */}
          <div className={styles.stagesSection}>
            <h4>睡眠的四个阶段</h4>
            <div className={styles.stagesGrid}>
              <div className={styles.stageCard}>
                <div className={styles.stageHeader} style={{ backgroundColor: '#93c5fd' }}>
                  <span className={styles.stageNum}>N1</span>
                  <span className={styles.stageName}>入睡期</span>
                </div>
                <div className={styles.stageContent}>
                  <p className={styles.stageDuration}>约 5% 的睡眠时间</p>
                  <ul>
                    <li>从清醒到睡眠的过渡</li>
                    <li>容易被唤醒</li>
                    <li>眼球缓慢移动</li>
                    <li>持续 1-7 分钟</li>
                  </ul>
                </div>
              </div>

              <div className={styles.stageCard}>
                <div className={styles.stageHeader} style={{ backgroundColor: '#60a5fa' }}>
                  <span className={styles.stageNum}>N2</span>
                  <span className={styles.stageName}>浅睡期</span>
                </div>
                <div className={styles.stageContent}>
                  <p className={styles.stageDuration}>约 45% 的睡眠时间</p>
                  <ul>
                    <li>体温下降</li>
                    <li>心率减慢</li>
                    <li>大脑开始产生睡眠纺锤波</li>
                    <li>持续 10-25 分钟</li>
                  </ul>
                </div>
              </div>

              <div className={styles.stageCard}>
                <div className={styles.stageHeader} style={{ backgroundColor: '#3b82f6' }}>
                  <span className={styles.stageNum}>N3</span>
                  <span className={styles.stageName}>深睡期</span>
                </div>
                <div className={styles.stageContent}>
                  <p className={styles.stageDuration}>约 25% 的睡眠时间</p>
                  <ul>
                    <li>最难被唤醒</li>
                    <li>身体修复和恢复</li>
                    <li>生长激素释放</li>
                    <li>免疫系统增强</li>
                  </ul>
                </div>
              </div>

              <div className={styles.stageCard}>
                <div className={styles.stageHeader} style={{ backgroundColor: '#8b5cf6' }}>
                  <span className={styles.stageNum}>REM</span>
                  <span className={styles.stageName}>快速眼动期</span>
                </div>
                <div className={styles.stageContent}>
                  <p className={styles.stageDuration}>约 25% 的睡眠时间</p>
                  <ul>
                    <li>做梦的主要阶段</li>
                    <li>大脑高度活跃</li>
                    <li>记忆巩固和学习</li>
                    <li>情绪调节</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 睡眠周期详解 */}
          <div className={styles.cycleExplain}>
            <h4>90分钟睡眠周期</h4>
            <div className={styles.cycleInfo}>
              <div className={styles.cycleInfoCard}>
                <span className={styles.cycleInfoIcon}>⏱️</span>
                <span className={styles.cycleInfoTitle}>一个完整周期</span>
                <span className={styles.cycleInfoValue}>约 90 分钟</span>
                <p>包含从浅睡到深睡再到REM的完整过程</p>
              </div>
              <div className={styles.cycleInfoCard}>
                <span className={styles.cycleInfoIcon}>🔄</span>
                <span className={styles.cycleInfoTitle}>每晚周期数</span>
                <span className={styles.cycleInfoValue}>4-6 个</span>
                <p>健康成人每晚经历4-6个完整周期</p>
              </div>
              <div className={styles.cycleInfoCard}>
                <span className={styles.cycleInfoIcon}>📈</span>
                <span className={styles.cycleInfoTitle}>周期变化</span>
                <span className={styles.cycleInfoValue}>前深后浅</span>
                <p>前半夜深睡多，后半夜REM睡眠多</p>
              </div>
            </div>
          </div>

          {/* 年龄睡眠建议表 */}
          <div className={styles.ageTable}>
            <h4>各年龄段睡眠建议</h4>
            <table className={styles.recommendTable}>
              <thead>
                <tr>
                  <th>年龄段</th>
                  <th>建议睡眠时长</th>
                  <th>睡眠周期数</th>
                </tr>
              </thead>
              <tbody>
                {AGE_SLEEP_RECOMMENDATIONS.slice(3).map((rec, index) => (
                  <tr key={index}>
                    <td>{rec.icon} {rec.group}</td>
                    <td><strong>{rec.recommended}</strong> 小时</td>
                    <td>{Math.round(rec.min / 1.5)}-{Math.round(rec.max / 1.5)} 个</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 常见问题 */}
          <div className={styles.faqSection}>
            <h4>❓ 常见问题</h4>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqQ}>为什么在周期结束时醒来更好？</div>
                <div className={styles.faqA}>
                  在睡眠周期结束时，大脑处于浅睡眠状态，更容易自然醒来，不会感到昏沉。
                  如果在深睡期被闹钟吵醒，会出现"睡眠惯性"，导致起床后长时间感到困倦。
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqQ}>睡眠时长和睡眠质量哪个更重要？</div>
                <div className={styles.faqA}>
                  两者都重要，但睡眠质量可能更关键。高质量的7小时睡眠可能比低质量的9小时睡眠更有益。
                  深度睡眠和REM睡眠的比例是评估睡眠质量的重要指标。
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqQ}>周末多睡能弥补工作日睡眠不足吗？</div>
                <div className={styles.faqA}>
                  短期来说可能有些帮助，但"睡眠债务"并不能完全偿还。
                  长期睡眠不足会对健康产生累积影响，最好保持规律的睡眠时间。
                </div>
              </div>
            </div>
          </div>

          <div className={styles.note}>
            <p><strong>⚠️ 注意事项：</strong></p>
            <ul>
              <li>睡眠周期时长因人而异，90分钟只是平均值</li>
              <li>如果长期存在睡眠问题，建议咨询专业医生</li>
              <li>睡眠追踪设备可以帮助了解个人睡眠模式</li>
              <li>本计算器仅供参考，不能替代专业医疗建议</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}