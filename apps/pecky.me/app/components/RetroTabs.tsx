"use client";

import { css } from "@/styled-system/css";
import { ReactNode, useState } from "react";

export interface Tab {
  title: string;
  content: ReactNode;
}

interface RetroTabsProps {
  tabs: Tab[];
  className?: string;
  defaultTabIndex?: number;
}

export function RetroTabs({
  tabs,
  className,
  defaultTabIndex = 0,
}: RetroTabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultTabIndex);

  const containerStyles = css({
    w: "100%",
    margin: "10px auto",
    display: "flex",
    flexDir: "column",
    gap: "4px",
  });

  const tabHeaderContainerStyles = css({
    w: "100%",
    bg: "white",
    border: "2px solid #f3c35b",
    borderRadius: "14px",
    boxShadow: "0 4px 0 #f1b24a",
    boxSizing: "border-box",
    overflow: "hidden",
  });

  const tabHeaderStyles = css({
    display: "flex",
    bg: "#fffbe8",
  });

  const tabButtonStyles = (isActive: boolean) =>
    css({
      flex: "1",
      py: "12px",
      px: "16px",
      fontSize: "14px",
      fontWeight: "600",
      color: isActive ? "#a06500" : "#b48512",
      bg: isActive ? "white" : "transparent",
      border: "none",
      borderRight: "1px solid #f3c35b",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative",
      _hover: {
        bg: isActive ? "white" : "#fff9f0",
        color: "#a06500",
      },
      _last: {
        borderRight: "none",
      },
    });

  const activeIndicatorStyles = css({
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    height: "3px",
    bg: "#ff7700",
  });

  return (
    <div className={className ? `${containerStyles} ${className}` : containerStyles}>
      {/* Tab Headers with RetroBox styling */}
      <div className={tabHeaderContainerStyles}>
        <div className={tabHeaderStyles}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={tabButtonStyles(activeIndex === index)}
            >
              {tab.title}
              {activeIndex === index && <div className={activeIndicatorStyles} />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Clean, no styling */}
      <div>{tabs[activeIndex]?.content}</div>
    </div>
  );
}
