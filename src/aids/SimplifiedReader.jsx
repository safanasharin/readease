import React from "react";

/**
 * A wrapper component that simplifies its text content
 * by increasing line height, tracking, and breaking paragraphs if needed.
 */
const SimplifiedReader = ({ children, isActive, severityLevel = "moderate" }) => {
  if (!isActive) return <>{children}</>;

  const styles = {
    mild: "leading-relaxed tracking-wide",
    moderate: "leading-loose tracking-wider text-lg",
    severe: "leading-loose tracking-widest text-xl space-y-4",
  };

  const styleClass = styles[severityLevel] || styles.moderate;

  return (
    <div className={`simplified-reader ${styleClass}`}>
      {children}
    </div>
  );
};

export default SimplifiedReader;
