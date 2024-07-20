import { useState } from 'react';
import { useMovies } from './useMovies';
import { useLocalStorageState } from './useLocalStorageState';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';
import { NavBar } from './NavBar';
import { Search } from './Search';
import { NumResults } from './NumResults';
import { Main } from './Main';
import { Box } from './Box';
import { MovieList } from './MovieList';
import { SelectedMovie } from './SelectedMovie';
import { WatchedSummary } from './WatchedSummary';
import { WatchedList } from './WatchedList';

export const average = arr =>
  arr.reduce((acc, cur, _i, arr) => acc + cur / arr.length, 0);

export const KEY = '23f20639';

export default function App() {
  const [query, setQuery] = useState('');

  const [selectedID, setSelectedID] = useState(null);

  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], 'watched');

  // select movie
  function handleSelectMovie(id) {
    // setSelectedID(id);
    setSelectedID(selectedID => (selectedID === id ? null : id));
  }

  // close selected movie
  function handleCloseMovie() {
    setSelectedID(null);
  }

  // add movie to watched list
  function handleAddMovie(movie) {
    setWatched(watched => [...watched, movie]);

    // Add movie to local storage (method 1)
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  // delete movie from watched list
  function handleDeleteMovie(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />

        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* isLoading ? <Loader /> : <MovieList movies={movies} /> */}

          {/* {isLoading && <Loader />}
          {isLoading && !error && <MovieList movies={movies} />}
          {error && <ErrorMessage message={error} />} */}

          {isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
        </Box>
        <Box>
          {selectedID ? (
            <SelectedMovie
              selectedID={selectedID}
              onCloseMovie={handleCloseMovie}
              onAddWatchedMovie={handleAddMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                onDeleteWatched={handleDeleteMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
