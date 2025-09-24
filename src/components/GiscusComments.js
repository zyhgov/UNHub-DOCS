// src/components/GiscusComments.js
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function GiscusComments() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();

  const giscusConfig = siteConfig.themeConfig.giscus;

  if (!giscusConfig?.repo || !giscusConfig?.repoId || !giscusConfig?.categoryId) {
    console.warn('Giscus is not configured. Please check themeConfig.giscus in docusaurus.config.js');
    return null;
  }

  const theme = colorMode === 'dark' ? 'dark_dimmed' : 'light';

  return (
    <BrowserOnly fallback={<div>Loading comments...</div>}>
      {() => (
        <Giscus
          repo={giscusConfig.repo}
          repoId={giscusConfig.repoId}
          category={giscusConfig.category}
          categoryId={giscusConfig.categoryId}
          mapping="pathname"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={theme}
          lang="zh-CN"
        />
      )}
    </BrowserOnly>
  );
}