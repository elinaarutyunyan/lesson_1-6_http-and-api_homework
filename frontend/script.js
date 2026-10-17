const API_URL = "http://localhost:3000/movies";

function renderMovies(movies) {
  const collection = document.querySelector('[data-ui="collection"]');
  collection.textContent = "";

  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = movie.title;

    const meta = document.createElement("div");
    meta.className = "card__meta";

    const director = document.createElement("span");
    director.textContent = `Режиссёр: ${movie.director}`;

    const year = document.createElement("span");
    year.textContent = `Год: ${movie.releaseYear}`;

    const rating = document.createElement("span");
    rating.textContent = `Рейтинг: ${movie.rating}`;

    meta.append(director, year, rating);
    card.append(title, meta);
    collection.append(card);
  });
}

async function loadMovies() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const movies = await response.json();
    renderMovies(movies);
  } catch (error) {
    console.error("Не удалось загрузить фильмы:", error);
  }
}

loadMovies();