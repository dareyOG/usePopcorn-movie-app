import { useState, useEffect } from 'react';

const KEY = '23f20639';

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError('');
          const res = await fetch(
            `http://www.omdbapi.com/?s=${query}&apikey=${KEY}`,

            { signal: controller.signal }
          );
          if (!res.ok) throw new Error('something went wrong');

          const data = await res.json();

          if (data.Response === 'False') throw new Error('movie not found');

          setMovies(data.Search);
        } catch (err) {
          if (err.name !== 'AbortError') setError(err.message);
        } finally {
          setIsLoading(false);
        }

        if (query.length < 3) {
          setMovies([]);
          setError('');
          return;
        }
      }
      // handleCloseMovie();

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
