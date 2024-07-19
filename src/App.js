import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { useRef } from 'react';
import { useMovies } from './useMovies';
import { useLocalStorageState } from './useLocalStorageState';

const average = arr =>
  arr.reduce((acc, cur, _i, arr) => acc + cur / arr.length, 0);

const KEY = '23f20639';

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

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🚫</span>
      {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  // const inputEl = useRef(null);
  const inputEl = useRef('');

  useEffect(
    function () {
      // console.log(inputEl.current);

      const callback = e => {
        // console.log(e);
        if (document.activeElement === inputEl.current) return;
        if (e.key === 'Enter') {
          inputEl.current.focus();
          setQuery('');
        }
      };

      document.addEventListener('keydown', callback);
      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [setQuery]
  );

  /*  useEffect(function () {
    const el = document.querySelector('.search');
    console.log(el);
    el.focus();
  }, []); */

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

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen(open => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map(movie => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </div>
    </li>
  );
}

function SelectedMovie({
  selectedID,
  onCloseMovie,
  onAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  // set user rating
  const [userRating, setUserRating] = useState('');

  // persisting data between renders using ref
  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) {
        countRef.current++;
      }
    },
    [userRating]
  );

  // test for watched movie
  const isWatched = watched.map(movie => movie.imdbID).includes(selectedID);

  // user rating
  const watchedRating = watched.find(
    movie => movie.imdbID === selectedID
  )?.userRating;

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    // movie object
    const newlyWatchedMovie = {
      title,
      imdbID: selectedID,
      imdbRating: +imdbRating,
      runtime: +runtime.split(' ').at(0),
      poster,
      userRating,
      countRatingDecisions: countRef.current,
    };
    // add newly watched movie
    onAddWatchedMovie(newlyWatchedMovie);

    // render watched list
    onCloseMovie();
  }

  // change page title on select movie
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie: ${title}`;

      // clean up title
      return function () {
        document.title = 'usePopcorn';
        // console.log(`clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`
          );

          const data = await res.json();
          setMovie(data);
          // console.log(data);
        } catch (error) {
          return;
        } finally {
          setIsLoading(false);
        }
      }
      getMovieDetails();
    },
    [selectedID]
  );

  useEffect(
    function () {
      const callback = e => {
        if (e.key === 'Escape') {
          onCloseMovie();
        }
      };

      document.addEventListener('keydown', callback);

      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [onCloseMovie]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <em>{plot}</em>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
            <div className="rating">
              {isWatched ? (
                <p>
                  You rated this movie {watchedRating}
                  <span>⭐</span>
                </p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />

                  {userRating >= 1 && (
                    <button
                      className="btn-add"
                      onClick={() => handleAdd(movie)}
                    >
                      +Add to list
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map(movie => movie.imdbRating));
  const avgUserRating = average(watched.map(movie => movie.userRating));
  const avgRuntime = average(watched.map(movie => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{+avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{+avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{+avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map(movie => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
