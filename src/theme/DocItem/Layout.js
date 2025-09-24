// src/theme/DocItem/Layout.js
import React from 'react';
import DocItem from '@theme-original/DocItem';
import GiscusComments from '@site/src/components/GiscusComments';

export default function DocItemLayout(props) {
  const { content: DocContent } = props;
  const { frontMatter } = DocContent;

  // 可选：通过 frontMatter 控制是否显示评论
  const hideComment = frontMatter.hide_comment || false;

  return (
    <>
      <DocItem {...props} />
      {!hideComment && (
        <div className="margin-vert--xl">
          <GiscusComments />
        </div>
      )}
    </>
  );
}