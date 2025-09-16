export function Button({ children, color = "purple", className = "", style = {}, ...props }) {
  
  let bgColor = "#4F46E5"; 

  if (color === "green") bgColor = "#22c55e"; 
  if (color === "red") bgColor = "#ef4444";   

  if (style.backgroundColor) bgColor = style.backgroundColor;

  return (
    <button
      {...props}
      className={className}
      style={{
        ...style,
        padding: "8px 16px",
        backgroundColor: bgColor,
        color: "#fff",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.2s"
      }}
    >
      {children}
    </button>
  );
}