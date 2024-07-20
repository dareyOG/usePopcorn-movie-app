import { useEffect } from 'react';

export function useKey(key, handlerFunc) {
  useEffect(
    function () {
      const callback = e => {
        if (e.key.toLowerCase() === key.toLowerCase()) {
          handlerFunc();
        }
      };

      document.addEventListener('keydown', callback);

      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [key, handlerFunc]
  );
  return;
}
