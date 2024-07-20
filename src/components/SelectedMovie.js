import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { useRef } from 'react';
import { useKey } from './useKey';
import { Loader } from './Loader';
import { KEY } from './App';

export function SelectedMovie({
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

  useKey('eSCApe', onCloseMovie);

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
