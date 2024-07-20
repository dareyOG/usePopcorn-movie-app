import { useEffect } from 'react';

export function useKey(key, handlerFunc) {
  useEffect(
    function () {
      const callback = e => {
        // key = key.at(0).toUpperCase() + key.substring(1).toLowerCase();
        // if (e.key === key) {
        //   handlerFunc();
        // }

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
