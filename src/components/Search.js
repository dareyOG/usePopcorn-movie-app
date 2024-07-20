import { useRef } from 'react';
import { useKey } from './useKey';

export function Search({ query, setQuery }) {
  // const inputEl = useRef(null);
  const inputEl = useRef('');

  useKey('Enter', function () {
    inputEl.current.focus();
    setQuery('');

    if (document.activeElement === inputEl.current) return;
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
