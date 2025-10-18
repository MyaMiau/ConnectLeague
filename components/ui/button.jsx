export function Button({
  children,
  color = "purple",
  className = "",
  style = {},
  type = "button", 
  ...props
}) {

  const hasTailwindBg = /\bbg-[^\s]+\b/.test(className);
  let bgColor;

  if (!hasTailwindBg) {
    bgColor = "#4F46E5"; 
    if (color === "green") bgColor = "#22c55e";
    if (color === "red") bgColor = "#ef4444";
    if (style.backgroundColor) bgColor = style.backgroundColor;
  }

  return (
    <button
      type={type}
      {...props}
      className={className}
      style={{
        ...style,
        ...(bgColor ? { backgroundColor: bgColor, color: "#fff" } : {}),
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.2s"
      }}
    >
      {children}
    </button>
  );
}