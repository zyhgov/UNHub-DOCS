// src/theme/DocSidebarItem/Link/index.js
import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import * as LucideIcons from 'lucide-react'; // 👈 导入 Lucide
import styles from './styles.module.css';

// 👇 渲染 Lucide 图标
function LucideIcon({ name, className }) {
  if (!name) return null;
  const IconComponent = LucideIcons[name];
  if (!IconComponent) {
    console.warn(`Lucide icon "${name}" not found.`);
    return null;
  }
  return <IconComponent className={className} size={16} />;
}

// 👇 自定义 LinkLabel，支持图标
function LinkLabel({ label, icon }) {
  return (
    <>
      {icon && (
        <span className="sidebar-icon-wrapper">
          <LucideIcon name={icon} className="sidebar-icon" />
        </span>
      )}
      <span title={label} className={styles.linkLabel}>
        {label}
      </span>
    </>
  );
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) {
  const { href, label, className, autoAddBaseUrl, customProps } = item;
  const sidebar_icon = customProps?.sidebar_icon; // 👈 从 customProps 读取图标
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        <LinkLabel label={label} icon={sidebar_icon} />
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}