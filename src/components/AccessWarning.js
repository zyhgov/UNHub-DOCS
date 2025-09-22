import React from 'react';
import styles from './AccessWarning.module.css';

export default function AccessWarning() {
  return (
    <div className={styles.banner}>
      ⚠️ 您正在访问受保护的内部文档，所有访问行为将被记录并审计。
    </div>
  );
}