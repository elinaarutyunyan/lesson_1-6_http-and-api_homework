const API_URL = "http://localhost:3000/movies";
const collectionEl = document.querySelector('[data-ui="collection"]');
const statusEl = document.querySelector('[data-ui="status"]');
const statusTitleEl = statusEl.querySelector(".status__title");
const statusTextEl = statusEl.querySelector(".status__text");
const reloadBtn = document.querySelector('[data-action="reload"]');
const formEl = document.querySelector('[data-form="entry"]');
const submitBtn = document.querySelector('[data-action="submit"]');

function updateUI(state, title, text) {
  statusEl.className = "status";
  
  if (state === "loading") {
    statusEl.classList.add("status--loading");
  } else if (state === "success") {
    statusEl.classList.add("status--success");
  } else if (state === "error" || state === "empty") {
    statusEl.classList.add("status--error");
  }

  statusTitleEl.textContent = title;
  statusTextEl.textContent = text;

  if (state === "success") {
    collectionEl.hidden = false;
    statusEl.hidden = true;
  } else {
    collectionEl.hidden = true;
    statusEl.hidden = false;
  }
}

function renderMovies(movies) {
  collectionEl.textContent = "";

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

    const isClassic = document.createElement("span");
    isClassic.textContent = `Классика: ${movie.isClassic ? "Да" : "Нет"}`;

    meta.append(director, year, rating, isClassic);
    card.append(title, meta);
    collectionEl.append(card);
  });
}

async function loadMovies() {
  updateUI("loading", "Загрузка...", "Запрашиваем данные из API.");
  
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const movies = await response.json();
    
    if (movies.length === 0) {
      updateUI("empty", "Список пуст", "В коллекции пока нет фильмов.");
    } else {
      renderMovies(movies);
      updateUI("success", "Успешно", "Данные загружены.");
    }
  } catch (error) {
    console.error("Не удалось загрузить фильмы:", error);
    updateUI("error", "Ошибка", "Не удалось загрузить данные. Проверьте подключение к серверу.");
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  submitBtn.disabled = true;
  
  const formData = new FormData(formEl);
  
  const newMovie = {
    title: formData.get("title"),
    director: formData.get("director"),
    releaseYear: Number(formData.get("releaseYear")),
    rating: Number(formData.get("rating")),
    isClassic: formData.get("isClassic") === "true"
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newMovie)
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    formEl.reset();
    await loadMovies();
  } catch (error) {
    console.error("Не удалось добавить фильм:", error);
    alert("Не удалось добавить фильм. Сервер недоступен.");
  } finally {
    submitBtn.disabled = false;
  }
}

reloadBtn.addEventListener("click", loadMovies);
formEl.addEventListener("submit", handleSubmit);

loadMovies();