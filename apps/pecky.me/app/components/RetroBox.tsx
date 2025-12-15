"use client";

import { css } from "@/styled-system/css";
import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface RetroBoxContextType {
  isOpen: boolean;
  toggleOpen: () => void;
}

const RetroBoxContext = createContext<RetroBoxContextType | undefined>(
  undefined,
);

interface RetroBoxProps {
  children: ReactNode;
  className?: string;
  startOpen?: boolean;
}

export function RetroBox({
  children,
  className,
  startOpen = true,
}: RetroBoxProps) {
  const [isOpen, setIsOpen] = useState(startOpen);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const baseStyles = css({
    w: "100%",
    margin: "10px auto",
    p: "16px",
    bg: "white",
    border: "2px solid #f3c35b",
    borderRadius: "14px",
    boxShadow: "0 4px 0 #f1b24a",
    boxSizing: "border-box",
  });

  return (
    <RetroBoxContext.Provider value={{ isOpen, toggleOpen }}>
      <div className={className ? `${baseStyles} ${className}` : baseStyles}>
        {children}
      </div>
    </RetroBoxContext.Provider>
  );
}

interface RetroBoxTitleProps {
  children: ReactNode;
  showToggle?: boolean;
}

function RetroBoxTitle({ children, showToggle = false }: RetroBoxTitleProps) {
  const context = useContext(RetroBoxContext);

  if (!context) {
    throw new Error("RetroBox.Title must be used within RetroBox");
  }

  const { isOpen, toggleOpen } = context;

  return (
    <div
      onClick={showToggle ? toggleOpen : undefined}
      className={css({
        textAlign: "center",
        position: "relative",
        cursor: showToggle ? "pointer" : "default",
        _hover: showToggle ? { opacity: 0.8 } : {},
        transition: "opacity 0.2s",
      })}
    >
      <h2
        className={css({
          fontSize: "24px",
          fontWeight: "700",
          color: "#a06500",
          margin: 0,
        })}
      >
        {children}
      </h2>
      {showToggle && (
        <div
          style={{
            transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
          }}
          className={css({
            position: "absolute",
            right: "-8px",
            top: "50%",
            color: "#f3c35b",
            fontSize: "20px",
            lineHeight: 1,
            transition: "transform 0.3s ease-in-out",
          })}
          aria-label={isOpen ? "Hide content" : "Show content"}
        >
          ▼
        </div>
      )}
    </div>
  );
}

interface RetroBoxContentProps {
  children: ReactNode;
}

function RetroBoxContent({ children }: RetroBoxContentProps) {
  const context = useContext(RetroBoxContext);

  if (!context) {
    throw new Error("RetroBox.Content must be used within RetroBox");
  }

  const { isOpen } = context;
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [enableTransition, setEnableTransition] = useState(false);
  const initialHeightSet = useRef(false);

  // Measure content height whenever it changes or mounts
  useEffect(() => {
    if (contentRef.current) {
      // Get the natural height of the content
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);

      // Only enable transitions after the initial height has been set and rendered
      if (!initialHeightSet.current && height > 0) {
        initialHeightSet.current = true;
        // Wait for next frame to ensure the initial height is rendered
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setEnableTransition(true);
          });
        });
      }
    }
  }, [children, isOpen]);

  // Re-measure on window resize
  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        height: isOpen ? `${contentHeight}px` : "0px",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: enableTransition
          ? "height 0.3s ease-in-out, opacity 0.3s ease-in-out"
          : "none",
      }}
    >
      <div
        ref={contentRef}
        style={{
          paddingTop: "0.1px",
          paddingBottom: "0.1px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

RetroBox.Title = RetroBoxTitle;
RetroBox.Content = RetroBoxContent;
