// SpinnerLoader.jsx
import React from "react";

const SpinnerLoader = ({
  size = 40,          // diameter in px
  thickness = 4,      // border thickness
  color = "#4f46e5",  // spinner color (indigo)
  trackColor = "#e5e7eb", // track color (gray-200)
  label = "Loading...",
}) => {
  const style = {
    width: size,
    height: size,
    borderWidth: thickness,
    borderStyle: "solid",
    borderColor: trackColor,
    borderTopColor: color,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  };

  return (
    <div role="status" aria-label={label} style={{ display: "inline-block" }}>
      <span style={style}></span>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SpinnerLoader;
