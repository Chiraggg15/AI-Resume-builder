import { useEffect, useRef } from 'react';

export default function AutoResizeTextarea({ value, onChange, className = '', ...props }) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to calculate the new scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Handle manual input in case onChange doesn't trigger a re-render immediately or value is stale
  const handleChange = (e) => {
    if (onChange) onChange(e);
    adjustHeight();
  };

  return (
    <textarea
      {...props}
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      className={`${className} overflow-hidden`}
    />
  );
}
