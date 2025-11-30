import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

// 计算方式
const CALC_METHODS = {
  lmp: { id: 'lmp', label: '末次月经', icon: '📅', description: '最常用的计算方式' },
  conception: { id: 'conception', label: '受孕日期', icon: '🌟', description: '如果确切知道受孕日' },
  ultrasound: { id: 'ultrasound', label: 'B超结果', icon: '🔬', description: '根据B超孕周推算' },
  ivf: { id: 'ivf', label: '试管婴儿', icon: '🧬', description: 'IVF移植日期' },
};

// 孕期里程碑
const MILESTONES = [
  { week: 4, title: '着床完成', description: '受精卵完成着床，开始发育', icon: '🌱' },
  { week: 5, title: '心脏开始跳动', description: '胚胎心脏开始形成并跳动', icon: '💓' },
  { week: 8, title: '胚胎期结束', description: '主要器官已开始形成', icon: '👶' },
  { week: 10, title: '进入胎儿期', description: '从胚胎正式成为胎儿', icon: '✨' },
  { week: 12, title: '第一次产检', description: 'NT检查，建立孕期档案', icon: '🏥' },
  { week: 13, title: '进入孕中期', description: '早孕反应通常开始缓解', icon: '🌈' },
  { week: 16, title: '可能感到胎动', description: '初产妇可能稍晚感受到', icon: '🦋' },
  { week: 18, title: '大排畸检查', description: '四维/三维超声检查', icon: '📋' },
  { week: 20, title: '孕程过半', description: '胎儿约25cm，可明显感到胎动', icon: '🎯' },
  { week: 24, title: '存活可能', description: '早产存活率开始提高', icon: '💪' },
  { week: 28, title: '进入孕晚期', description: '胎儿各器官基本成熟', icon: '🌟' },
  { week: 32, title: '胎位检查', description: '关注胎位是否正常', icon: '🔍' },
  { week: 36, title: '每周产检', description: '增加产检频率', icon: '📆' },
  { week: 37, title: '足月', description: '胎儿已足月，随时可能分娩', icon: '🎉' },
  { week: 40, title: '预产期', description: '预计分娩日期', icon: '👼' },
];

// 孕期阶段
const TRIMESTERS = [
  { 
    name: '孕早期', 
    weeks: '1-12周', 
    range: [1, 12],
    color: '#f472b6',
    symptoms: ['早孕反应', '乳房胀痛', '疲倦嗜睡', '尿频'],
    tips: ['补充叶酸', '避免剧烈运动', '远离有害物质', '定期产检'],
    development: '主要器官形成期，最关键的发育阶段'
  },
  { 
    name: '孕中期', 
    weeks: '13-27周', 
    range: [13, 27],
    color: '#a78bfa',
    symptoms: ['食欲增加', '胎动明显', '腰背酸痛', '皮肤变化'],
    tips: ['均衡营养', '适度运动', '进行产检筛查', '开始准备待产包'],
    development: '胎儿快速生长，各器官逐渐成熟'
  },
  { 
    name: '孕晚期', 
    weeks: '28-40周', 
    range: [28, 40],
    color: '#60a5fa',
    symptoms: ['呼吸困难', '水肿', '假宫缩', '尿频加重'],
    tips: ['注意胎动', '准备待产', '学习分娩知识', '保持良好心态'],
    development: '胎儿器官成熟，为出生做准备'
  },
];

// 胎儿大小参考（按周）
const FETAL_SIZE = {
  4: { size: '罂粟籽', length: '0.1cm', weight: '<1g' },
  5: { size: '芝麻', length: '0.2cm', weight: '<1g' },
  6: { size: '扁豆', length: '0.5cm', weight: '<1g' },
  7: { size: '蓝莓', length: '1cm', weight: '<1g' },
  8: { size: '覆盆子', length: '1.6cm', weight: '1g' },
  9: { size: '葡萄', length: '2.3cm', weight: '2g' },
  10: { size: '金桔', length: '3cm', weight: '4g' },
  11: { size: '无花果', length: '4cm', weight: '7g' },
  12: { size: '青柠', length: '5.4cm', weight: '14g' },
  13: { size: '豌豆荚', length: '7.4cm', weight: '23g' },
  14: { size: '柠檬', length: '8.7cm', weight: '43g' },
  15: { size: '苹果', length: '10cm', weight: '70g' },
  16: { size: '牛油果', length: '12cm', weight: '100g' },
  17: { size: '洋葱', length: '13cm', weight: '140g' },
  18: { size: '甜椒', length: '14cm', weight: '190g' },
  19: { size: '芒果', length: '15cm', weight: '240g' },
  20: { size: '香蕉', length: '26cm', weight: '300g' },
  21: { size: '胡萝卜', length: '27cm', weight: '360g' },
  22: { size: '木瓜', length: '28cm', weight: '430g' },
  23: { size: '葡萄柚', length: '29cm', weight: '500g' },
  24: { size: '玉米', length: '30cm', weight: '600g' },
  25: { size: '花椰菜', length: '35cm', weight: '660g' },
  26: { size: '葱', length: '36cm', weight: '760g' },
  27: { size: '菜花', length: '37cm', weight: '875g' },
  28: { size: '茄子', length: '38cm', weight: '1kg' },
  29: { size: '南瓜', length: '39cm', weight: '1.15kg' },
  30: { size: '卷心菜', length: '40cm', weight: '1.3kg' },
  31: { size: '椰子', length: '41cm', weight: '1.5kg' },
  32: { size: '哈密瓜', length: '42cm', weight: '1.7kg' },
  33: { size: '菠萝', length: '44cm', weight: '1.9kg' },
  34: { size: '蜜瓜', length: '45cm', weight: '2.1kg' },
  35: { size: '蜜瓜', length: '46cm', weight: '2.4kg' },
  36: { size: '长生菜', length: '47cm', weight: '2.6kg' },
  37: { size: '冬瓜', length: '48cm', weight: '2.9kg' },
  38: { size: '冬瓜', length: '50cm', weight: '3.0kg' },
  39: { size: '小西瓜', length: '51cm', weight: '3.2kg' },
  40: { size: '西瓜', length: '52cm', weight: '3.4kg' },
};

// 产检时间表
const PRENATAL_VISITS = [
  { week: '6-8', checkup: '确认怀孕', items: ['验孕', 'B超确认宫内孕', '建档'] },
  { week: '11-14', checkup: 'NT检查', items: ['NT超声', '早期唐筛', '建立档案'] },
  { week: '15-20', checkup: '中期筛查', items: ['唐氏筛查', '无创DNA（可选）', '羊水穿刺（高危）'] },
  { week: '20-24', checkup: '大排畸', items: ['四维/三维超声', '系统筛查胎儿结构'] },
  { week: '24-28', checkup: '糖耐检查', items: ['糖耐量测试(OGTT)', '血常规', '尿常规'] },
  { week: '28-32', checkup: '孕晚期检查', items: ['胎位检查', '胎心监护', '血压体重'] },
  { week: '32-36', checkup: '两周一次', items: ['胎心监护', '评估分娩方式', 'B超'] },
  { week: '37-40', checkup: '每周一次', items: ['胎心监护', '宫颈检查', '待产准备'] },
];

// 格式化日期
function formatDate(date, format = 'long') {
  if (!date) return '';
  const d = new Date(date);
  if (format === 'long') {
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  }
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 计算两个日期之间的天数
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

// 添加天数到日期
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function PregnancyCalculator() {
  const [calcMethod, setCalcMethod] = useState('lmp');
  const [lmpDate, setLmpDate] = useState('');
  const [conceptionDate, setConceptionDate] = useState('');
  const [ultrasoundDate, setUltrasoundDate] = useState('');
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState('');
  const [ultrasoundDays, setUltrasoundDays] = useState('0');
  const [ivfDate, setIvfDate] = useState('');
  const [ivfType, setIvfType] = useState('day5');
  const [cycleLength, setCycleLength] = useState('28');
  const [showResult, setShowResult] = useState(false);

  // 计算结果
  const result = useMemo(() => {
    let dueDate = null;
    let conceptionDay = null;
    let gestationalAge = null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (calcMethod === 'lmp' && lmpDate) {
      // 末次月经法：预产期 = LMP + 280天（调整月经周期）
      const lmp = new Date(lmpDate);
      const cycleAdjustment = parseInt(cycleLength) - 28;
      dueDate = addDays(lmp, 280 + cycleAdjustment);
      conceptionDay = addDays(lmp, 14 + cycleAdjustment);
    } else if (calcMethod === 'conception' && conceptionDate) {
      // 受孕日法：预产期 = 受孕日 + 266天
      const conception = new Date(conceptionDate);
      dueDate = addDays(conception, 266);
      conceptionDay = conception;
    } else if (calcMethod === 'ultrasound' && ultrasoundDate && ultrasoundWeeks) {
      // B超法：根据B超日期和孕周反推
      const usDate = new Date(ultrasoundDate);
      const weeksInDays = parseInt(ultrasoundWeeks) * 7 + parseInt(ultrasoundDays || 0);
      const estimatedLmp = addDays(usDate, -weeksInDays);
      dueDate = addDays(estimatedLmp, 280);
      conceptionDay = addDays(estimatedLmp, 14);
    } else if (calcMethod === 'ivf' && ivfDate) {
      // 试管婴儿法
      const ivf = new Date(ivfDate);
      if (ivfType === 'day3') {
        // Day3胚胎：预产期 = 移植日 + 263天
        dueDate = addDays(ivf, 263);
        conceptionDay = addDays(ivf, -3);
      } else {
        // Day5囊胚：预产期 = 移植日 + 261天
        dueDate = addDays(ivf, 261);
        conceptionDay = addDays(ivf, -5);
      }
    }

    if (!dueDate) return null;

    // 计算当前孕周
    const estimatedLmp = addDays(dueDate, -280);
    const daysPregnant = daysBetween(estimatedLmp, today);
    const weeksPregnant = Math.floor(daysPregnant / 7);
    const daysExtra = daysPregnant % 7;

    // 确保孕周在有效范围内
    if (weeksPregnant < 0 || weeksPregnant > 45) {
      return null;
    }

    // 剩余天数
    const daysRemaining = daysBetween(today, dueDate);
    const daysUntilDue = dueDate > today ? daysRemaining : -daysRemaining;

    // 当前孕期阶段
    const currentTrimester = TRIMESTERS.find(t => 
      weeksPregnant >= t.range[0] && weeksPregnant <= t.range[1]
    ) || TRIMESTERS[2];

    // 进度百分比
    const progressPercent = Math.min(100, Math.max(0, (daysPregnant / 280) * 100));

    // 已完成和即将到来的里程碑
    const completedMilestones = MILESTONES.filter(m => weeksPregnant >= m.week);
    const upcomingMilestones = MILESTONES.filter(m => weeksPregnant < m.week).slice(0, 3);
    const currentMilestone = completedMilestones[completedMilestones.length - 1];

    // 胎儿大小
    const fetalSize = FETAL_SIZE[Math.min(40, Math.max(4, weeksPregnant))] || FETAL_SIZE[4];

    // 重要日期
    const importantDates = [
      { label: '孕早期结束', date: addDays(estimatedLmp, 12 * 7), week: 12 },
      { label: '孕中期结束', date: addDays(estimatedLmp, 27 * 7), week: 27 },
      { label: '足月', date: addDays(estimatedLmp, 37 * 7), week: 37 },
      { label: '预产期', date: dueDate, week: 40 },
    ];

    // 安全分娩期（37-42周）
    const safeDeliveryStart = addDays(estimatedLmp, 37 * 7);
    const safeDeliveryEnd = addDays(estimatedLmp, 42 * 7);

    // 星座预测
    const zodiacSign = getZodiacSign(dueDate);

    // 生肖预测
    const chineseZodiac = getChineseZodiac(dueDate);

    return {
      dueDate,
      conceptionDay,
      estimatedLmp,
      weeksPregnant,
      daysExtra,
      daysPregnant,
      daysUntilDue,
      currentTrimester,
      progressPercent,
      completedMilestones,
      upcomingMilestones,
      currentMilestone,
      fetalSize,
      importantDates,
      safeDeliveryStart,
      safeDeliveryEnd,
      zodiacSign,
      chineseZodiac,
    };
  }, [calcMethod, lmpDate, conceptionDate, ultrasoundDate, ultrasoundWeeks, ultrasoundDays, ivfDate, ivfType, cycleLength]);

  const handleCalculate = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setCalcMethod('lmp');
    setLmpDate('');
    setConceptionDate('');
    setUltrasoundDate('');
    setUltrasoundWeeks('');
    setUltrasoundDays('0');
    setIvfDate('');
    setIvfType('day5');
    setCycleLength('28');
    setShowResult(false);
  };

  return (
    <div className={styles.calculator}>
      {/* 输入区域 */}
      <div className={styles.inputSection}>
        <h3>👶 孕期计算器</h3>
        <p className={styles.sectionDesc}>
          计算预产期、当前孕周及重要孕期信息
        </p>

        {/* 计算方式选择 */}
        <div className={styles.methodSelector}>
          {Object.values(CALC_METHODS).map((method) => (
            <label
              key={method.id}
              className={`${styles.methodOption} ${calcMethod === method.id ? styles.active : ''}`}
            >
              <input
                type="radio"
                name="calcMethod"
                value={method.id}
                checked={calcMethod === method.id}
                onChange={() => setCalcMethod(method.id)}
              />
              <span className={styles.methodIcon}>{method.icon}</span>
              <div className={styles.methodText}>
                <span className={styles.methodLabel}>{method.label}</span>
                <span className={styles.methodDesc}>{method.description}</span>
              </div>
            </label>
          ))}
        </div>

        {/* 根据计算方式显示不同输入 */}
        <div className={styles.inputFields}>
          {calcMethod === 'lmp' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="lmpDate">末次月经第一天</label>
                <input
                  id="lmpDate"
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="cycleLength">月经周期长度（天）</label>
                <select
                  id="cycleLength"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                >
                  {Array.from({ length: 21 }, (_, i) => i + 21).map(days => (
                    <option key={days} value={days}>
                      {days} 天 {days === 28 ? '(标准)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {calcMethod === 'conception' && (
            <div className={styles.inputGroup}>
              <label htmlFor="conceptionDate">受孕日期</label>
              <input
                id="conceptionDate"
                type="date"
                value={conceptionDate}
                onChange={(e) => setConceptionDate(e.target.value)}
              />
            </div>
          )}

          {calcMethod === 'ultrasound' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="ultrasoundDate">B超检查日期</label>
                <input
                  id="ultrasoundDate"
                  type="date"
                  value={ultrasoundDate}
                  onChange={(e) => setUltrasoundDate(e.target.value)}
                />
              </div>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="ultrasoundWeeks">B超显示孕周</label>
                  <input
                    id="ultrasoundWeeks"
                    type="number"
                    min="4"
                    max="40"
                    placeholder="周"
                    value={ultrasoundWeeks}
                    onChange={(e) => setUltrasoundWeeks(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="ultrasoundDays">加</label>
                  <select
                    id="ultrasoundDays"
                    value={ultrasoundDays}
                    onChange={(e) => setUltrasoundDays(e.target.value)}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(day => (
                      <option key={day} value={day}>{day} 天</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {calcMethod === 'ivf' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="ivfDate">胚胎移植日期</label>
                <input
                  id="ivfDate"
                  type="date"
                  value={ivfDate}
                  onChange={(e) => setIvfDate(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>移植胚胎类型</label>
                <div className={styles.ivfTypes}>
                  <label className={`${styles.ivfType} ${ivfType === 'day3' ? styles.active : ''}`}>
                    <input
                      type="radio"
                      name="ivfType"
                      value="day3"
                      checked={ivfType === 'day3'}
                      onChange={() => setIvfType('day3')}
                    />
                    <span>Day3 胚胎</span>
                  </label>
                  <label className={`${styles.ivfType} ${ivfType === 'day5' ? styles.active : ''}`}>
                    <input
                      type="radio"
                      name="ivfType"
                      value="day5"
                      checked={ivfType === 'day5'}
                      onChange={() => setIvfType('day5')}
                    />
                    <span>Day5 囊胚</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button 
            className={styles.primaryBtn} 
            onClick={handleCalculate}
            disabled={
              (calcMethod === 'lmp' && !lmpDate) ||
              (calcMethod === 'conception' && !conceptionDate) ||
              (calcMethod === 'ultrasound' && (!ultrasoundDate || !ultrasoundWeeks)) ||
              (calcMethod === 'ivf' && !ivfDate)
            }
          >
            计算预产期 🍼
          </button>
          <button className={styles.secondaryBtn} onClick={handleReset}>
            重置
          </button>
        </div>
      </div>

      {/* 结果区域 */}
      {showResult && result && (
        <div className={styles.resultSection}>
          {/* 预产期主卡片 */}
          <div className={styles.dueDateCard}>
            <div className={styles.dueDateHeader}>
              <span className={styles.dueDateIcon}>👶</span>
              <span className={styles.dueDateLabel}>预产期</span>
            </div>
            <div className={styles.dueDateValue}>
              {formatDate(result.dueDate)}
            </div>
            <div className={styles.dueDateExtra}>
              <span className={styles.zodiacBadge}>
                {result.zodiacSign.icon} {result.zodiacSign.name}
              </span>
              <span className={styles.zodiacBadge}>
                🐾 {result.chineseZodiac}
              </span>
            </div>
          </div>

          {/* 当前孕周 */}
          <div className={styles.currentStatus}>
            <div className={styles.weekDisplay}>
              <span className={styles.weekLabel}>当前孕周</span>
              <div className={styles.weekValue}>
                <span className={styles.weekNum}>{result.weeksPregnant}</span>
                <span className={styles.weekUnit}>周</span>
                {result.daysExtra > 0 && (
                  <span className={styles.weekDays}>+{result.daysExtra}天</span>
                )}
              </div>
            </div>
            <div className={styles.trimesterBadge} style={{ backgroundColor: result.currentTrimester.color }}>
              {result.currentTrimester.name}
            </div>
            <div className={styles.countdown}>
              {result.daysUntilDue > 0 ? (
                <>距离预产期还有 <strong>{result.daysUntilDue}</strong> 天</>
              ) : result.daysUntilDue === 0 ? (
                <>🎉 今天是预产期！</>
              ) : (
                <>已超过预产期 <strong>{Math.abs(result.daysUntilDue)}</strong> 天</>
              )}
            </div>
          </div>

          {/* 进度条 */}
          <div className={styles.progressSection}>
            <h4>🗓️ 孕期进度</h4>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${result.progressPercent}%` }}
              >
                <span className={styles.progressText}>
                  {result.progressPercent.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className={styles.progressLabels}>
              <span>第1周</span>
              <span>第13周</span>
              <span>第28周</span>
              <span>第40周</span>
            </div>
            <div className={styles.trimesterBar}>
              {TRIMESTERS.map((t, i) => (
                <div 
                  key={i}
                  className={styles.trimesterSegment}
                  style={{ backgroundColor: t.color }}
                >
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 胎儿发育信息 */}
          <div className={styles.fetalInfo}>
            <h4>👶 宝宝现在</h4>
            <div className={styles.fetalCards}>
              <div className={styles.fetalCard}>
                <span className={styles.fetalIcon}>📏</span>
                <span className={styles.fetalLabel}>大约像</span>
                <span className={styles.fetalValue}>{result.fetalSize.size}</span>
              </div>
              <div className={styles.fetalCard}>
                <span className={styles.fetalIcon}>📐</span>
                <span className={styles.fetalLabel}>身长</span>
                <span className={styles.fetalValue}>{result.fetalSize.length}</span>
              </div>
              <div className={styles.fetalCard}>
                <span className={styles.fetalIcon}>⚖️</span>
                <span className={styles.fetalLabel}>体重</span>
                <span className={styles.fetalValue}>{result.fetalSize.weight}</span>
              </div>
            </div>
          </div>

          {/* 当前阶段信息 */}
          <div className={styles.trimesterInfo}>
            <h4 style={{ color: result.currentTrimester.color }}>
              📋 {result.currentTrimester.name}（{result.currentTrimester.weeks}）
            </h4>
            <div className={styles.trimesterContent}>
              <div className={styles.trimesterCol}>
                <h5>🤰 常见症状</h5>
                <ul>
                  {result.currentTrimester.symptoms.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.trimesterCol}>
                <h5>💡 注意事项</h5>
                <ul>
                  {result.currentTrimester.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 里程碑 */}
          <div className={styles.milestonesSection}>
            <h4>🎯 孕期里程碑</h4>
            <div className={styles.milestoneTimeline}>
              {MILESTONES.map((milestone, index) => {
                const isPast = result.weeksPregnant >= milestone.week;
                const isCurrent = result.weeksPregnant >= milestone.week && 
                  result.weeksPregnant < (MILESTONES[index + 1]?.week || 41);
                return (
                  <div 
                    key={index}
                    className={`${styles.milestoneItem} ${isPast ? styles.past : ''} ${isCurrent ? styles.current : ''}`}
                  >
                    <div className={styles.milestoneMarker}>
                      <span className={styles.milestoneIcon}>{milestone.icon}</span>
                    </div>
                    <div className={styles.milestoneContent}>
                      <span className={styles.milestoneWeek}>第 {milestone.week} 周</span>
                      <span className={styles.milestoneTitle}>{milestone.title}</span>
                      <span className={styles.milestoneDesc}>{milestone.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 重要日期 */}
          <div className={styles.importantDates}>
            <h4>📅 重要日期</h4>
            <div className={styles.dateGrid}>
              <div className={styles.dateCard}>
                <span className={styles.dateIcon}>🌟</span>
                <span className={styles.dateLabel}>受孕日（估计）</span>
                <span className={styles.dateValue}>{formatDate(result.conceptionDay, 'short')}</span>
              </div>
              {result.importantDates.map((date, index) => (
                <div key={index} className={styles.dateCard}>
                  <span className={styles.dateIcon}>
                    {date.week === 40 ? '👶' : date.week === 37 ? '✅' : '📌'}
                  </span>
                  <span className={styles.dateLabel}>{date.label}</span>
                  <span className={styles.dateValue}>{formatDate(date.date, 'short')}</span>
                </div>
              ))}
              <div className={styles.dateCard}>
                <span className={styles.dateIcon}>🏥</span>
                <span className={styles.dateLabel}>安全分娩期</span>
                <span className={styles.dateValue}>
                  {formatDate(result.safeDeliveryStart, 'short')} - {formatDate(result.safeDeliveryEnd, 'short')}
                </span>
              </div>
            </div>
          </div>

          {/* 产检时间表 */}
          <div className={styles.prenatalSection}>
            <h4>🏥 产检时间表</h4>
            <div className={styles.prenatalTable}>
              {PRENATAL_VISITS.map((visit, index) => {
                const weekNum = parseInt(visit.week.split('-')[0]);
                const isPast = result.weeksPregnant > weekNum + 4;
                const isCurrent = result.weeksPregnant >= weekNum - 2 && result.weeksPregnant <= weekNum + 4;
                return (
                  <div 
                    key={index}
                    className={`${styles.prenatalItem} ${isPast ? styles.past : ''} ${isCurrent ? styles.current : ''}`}
                  >
                    <div className={styles.prenatalWeek}>{visit.week}周</div>
                    <div className={styles.prenatalContent}>
                      <span className={styles.prenatalCheckup}>{visit.checkup}</span>
                      <div className={styles.prenatalItems}>
                        {visit.items.map((item, i) => (
                          <span key={i} className={styles.prenatalItem}>{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 知识区域 */}
      <div className={styles.knowledgeSection}>
        <h3>📚 孕期知识</h3>

        <div className={styles.knowledgeGrid}>
          <div className={styles.knowledgeCard}>
            <h4>预产期准确吗？</h4>
            <p>
              预产期只是一个估计值，实际上只有约 5% 的婴儿在预产期当天出生。
              大多数婴儿在预产期前后两周内出生（37-42周）都属于正常范围。
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>孕周怎么计算？</h4>
            <p>
              医学上的孕周从末次月经第一天开始计算，而非受孕日。
              这意味着在受孕时，您已经"怀孕"约2周了。整个孕期约为40周（280天）。
            </p>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>什么时候做第一次产检？</h4>
            <ul>
              <li>确认怀孕后尽早就诊</li>
              <li>通常在6-8周做第一次B超</li>
              <li>11-14周完成NT检查</li>
              <li>建立孕期保健档案</li>
            </ul>
          </div>

          <div className={styles.knowledgeCard}>
            <h4>需要立即就医的情况</h4>
            <ul>
              <li>阴道出血</li>
              <li>剧烈腹痛</li>
              <li>胎动明显减少</li>
              <li>破水</li>
              <li>严重头痛或视力模糊</li>
            </ul>
          </div>
        </div>

        <div className={styles.note}>
          <p><strong>⚠️ 重要提示：</strong></p>
          <ul>
            <li>本计算器仅供参考，具体孕周和预产期请以医生诊断为准</li>
            <li>每次产检时医生可能会根据B超结果调整预产期</li>
            <li>如有任何不适或疑问，请及时咨询医疗专业人员</li>
            <li>保持规律产检，关注胎动变化</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 获取星座
function getZodiacSign(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const zodiacSigns = [
    { name: '摩羯座', icon: '♑', start: [1, 1], end: [1, 19] },
    { name: '水瓶座', icon: '♒', start: [1, 20], end: [2, 18] },
    { name: '双鱼座', icon: '♓', start: [2, 19], end: [3, 20] },
    { name: '白羊座', icon: '♈', start: [3, 21], end: [4, 19] },
    { name: '金牛座', icon: '♉', start: [4, 20], end: [5, 20] },
    { name: '双子座', icon: '♊', start: [5, 21], end: [6, 21] },
    { name: '巨蟹座', icon: '♋', start: [6, 22], end: [7, 22] },
    { name: '狮子座', icon: '♌', start: [7, 23], end: [8, 22] },
    { name: '处女座', icon: '♍', start: [8, 23], end: [9, 22] },
    { name: '天秤座', icon: '♎', start: [9, 23], end: [10, 23] },
    { name: '天蝎座', icon: '♏', start: [10, 24], end: [11, 22] },
    { name: '射手座', icon: '♐', start: [11, 23], end: [12, 21] },
    { name: '摩羯座', icon: '♑', start: [12, 22], end: [12, 31] },
  ];

  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return sign;
    }
  }
  
  return { name: '摩羯座', icon: '♑' };
}

// 获取生肖
function getChineseZodiac(date) {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const year = date.getFullYear();
  return zodiacs[(year - 1900) % 12];
}