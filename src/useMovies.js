import { useState, useEffect } from 'react';

const KEY = '23f20639';

export function useMovies(query) {
  // render logic
  const [movies, setMovies] = useState([]);

  // set loading state
  const [isLoading, setIsLoading] = useState(false);

  // set error state
  const [error, setError] = useState('');

  useEffect(
    function () {
      // clean up data fetching
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError('');
          const res = await fetch(
            `http://www.omdbapi.com/?s=${query}&apikey=${KEY}`,

            { signal: controller.signal }
          );
          // console.log(res);
          // handling errors
          if (!res.ok) throw new Error('something went wrong');

          // else
          const data = await res.json();

          // console.log(data);

          // console.log(data.Search);
          if (data.Response === 'False') throw new Error('movie not found');

          setMovies(data.Search);
        } catch (err) {
          // console.log(err.message);

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
