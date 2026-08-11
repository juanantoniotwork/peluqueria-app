import { useEffect, useRef } from 'react';

export default function ConflictConfirm({ message, onConfirm, onDismiss }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onDismiss();
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onDismiss]);

  return (
    <div className="conflict-popover" ref={ref}>
      <p>{message}</p>
      <div className="conflict-popover-actions">
        <button type="button" onClick={onConfirm}>
          Sí, continuar
        </button>
        <button type="button" className="ghost muted" onClick={onDismiss}>
          No
        </button>
      </div>
    </div>
  );
}
