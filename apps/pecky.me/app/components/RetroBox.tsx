import { css } from "@/styled-system/css";
import { ReactNode } from "react";

interface RetroBoxProps {
  children: ReactNode;
  className?: string;
}

export function RetroBox({ children, className }: RetroBoxProps) {
  const baseStyles = css({
    w: "100%",
    margin: "20px auto",
    p: "16px",
    bg: "white",
    border: "2px solid #f3c35b",
    borderRadius: "14px",
    boxShadow: "0 4px 0 #f1b24a",
    mb: "30px",
    boxSizing: "border-box",
  });

  return (
    <div className={className ? `${baseStyles} ${className}` : baseStyles}>
      {children}
    </div>
  );
}
