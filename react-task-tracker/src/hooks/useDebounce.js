import { useState, useEffect } from "react";

// Custom hook for debouncing a function
const useDebounce = (func, delay) => {
  const [debouncedFunction, setDebouncedFunction] = useState(() => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  });

  useEffect(() => {
    setDebouncedFunction(() => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    });
  }, [func, delay]);

  return debouncedFunction;
};

export default useDebounce;
