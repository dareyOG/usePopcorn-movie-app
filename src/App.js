import { useEffect, useState } from 'react';
import StarRating from './StarRating';

const tempMovieData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0133093',
    Title: 'The Matrix',
    Year: '1999',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt6751668',
    Title: 'Parasite',
    Year: '2019',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
  },
];

const tempWatchedData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: 'tt0088763',
    Title: 'Back to the Future',
    Year: '1985',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = arr =>
  arr.reduce((acc, cur, _i, arr) => acc + cur / arr.length, 0);

const KEY = '23f20639';

export default function App() {
  // render logic
  const [movies, setMovies] = useState([]);
  // watched movies
  const [watched, setWatched] = useState([]);

  const [query, setQuery] = useState('');

  // set loading state
  const [isLoading, setIsLoading] = useState(false);

  // set error state
  const [error, setError] = useState('');

  const [selectedID, setSelectedID] = useState(null);

  // const tempQuery = 'fast&furious';

  /*   useEffect(() => {
    console.log('After initial render');
  }, []);

  useEffect(() => {
    console.log('After every render');
  });

  useEffect(() => {
    console.log('render as state(s) update(s)');
  }, [query]);

  console.log('During render'); */

  /*   useEffect(function () {
    fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=fast&furious`)
      .then(res => res.json())
      .then(data => setMovies(data.Search));
  }, []); */

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
  }

  // delete movie from watched list
  function handleDeleteMovie(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id));
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?s=${query}&apikey=${KEY}`
          );

          // handling errors
          if (!res.ok) throw new Error('something went wrong');

          // else
          const data = await res.json();

          if (data.Response === 'False') throw new Error('movie not found');

          setMovies(data.Search);
        } catch (err) {
          // console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }

        if (query.length < 3) {
          setMovies([]);
          setError('');
          return;
        }
      }
      fetchMovies();
    },
    [query]
  );

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
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
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
    const newlyWatchedMovie = {
      title,
      imdbID: selectedID,
      imdbRating: +imdbRating,
      runtime: +runtime.split(' ').at(0),
      poster,
      userRating,
    };
    // add newly watched movie
    onAddWatchedMovie(newlyWatchedMovie);
    // render watched list
    onCloseMovie();
  }

  // changing page title
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie: ${title}`;
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
