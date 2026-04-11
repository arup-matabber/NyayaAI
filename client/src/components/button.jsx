const Button = ({ children, variant = "primary", className = "" }) => {
  const base = "px-5 py-2 rounded text-sm font-medium transition";

  const styles = {
    primary: "bg-ink text-white hover:bg-black",
    outline: "border border-gray-300 hover:bg-gray-100",
    gold: "bg-yellow-500 text-white hover:bg-yellow-600",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;