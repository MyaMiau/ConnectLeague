export function Card({ children, ...props }) {
    return (
      <div
        {...props}
        style={{
          backgroundColor: "#1F2937",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          padding: "16px",
          width: "100%",
        }}
      >
        {children}
      </div>
    );
  }
  
  export function CardContent({ children, ...props }) {
    return (
      <div {...props} style={{ padding: "8px" }}>
        {children}
      </div>
    );
  }
  