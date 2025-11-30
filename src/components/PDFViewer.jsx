import React from 'react';

export default function PDFViewer({ url, height = '800px', title = 'PDF 文档' }) {
  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <iframe
        src={url}
        width="100%"
        height={height}
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        title={title}
      />
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          📥 下载 PDF 文件
        </a>
      </p>
    </div>
  );
}