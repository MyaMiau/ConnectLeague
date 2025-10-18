export function Button({ children, color = "purple", className = "", style = {}, ...props }) {
  // Se className inclui uma classe bg- (Tailwind), não aplica bgColor inline!
  let applyBgColor = !className.includes("bg-");
  let bgColor = "#4F46E5"; // padrão purple

  if (color === "green") bgColor = "#22c55e";
  if (color === "red") bgColor = "#ef4444";
  if (style.backgroundColor) bgColor = style.backgroundColor;

  return (
    <button
      {...props}
      className={className}
      style={{
        ...style,
        ...(applyBgColor ? { backgroundColor: bgColor, color: "#fff" } : {}),
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