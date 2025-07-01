// /components/ui/input.jsx
export function Input(props) {
    return (
      <input
        {...props}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          width: "100%",
          boxSizing: "border-box",
          marginBottom: "12px"
        }}
      />
    );
  }
  