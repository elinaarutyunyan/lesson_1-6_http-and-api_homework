const API_URL = "http://localhost:3000/movies";
const collectionEl = document.querySelector('[data-ui="collection"]');
const statusEl = document.querySelector('[data-ui="status"]');
const statusTitleEl = statusEl.querySelector(".status__title");
const statusTextEl = statusEl.querySelector(".status__text");
const reloadBtn = document.querySelector('[data-action="reload"]');
const formEl = document.querySelector('[data-form="entry"]');
const submitBtn = document.querySelector('[data-action="submit"]');
const cancelEditBtn = document.querySelector('[data-action="cancel-edit"]');
const formTitle = document.getElementById("form-title");

let editingId = null;

function updateUI(state, title, text) {
  statusEl.className = "status";
  if (state === "loading") statusEl.classList.add("status--loading");
  else if (state === "success") statusEl.classList.add("status--success");
  else statusEl.classList.add("status--error");

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
    card.dataset.id = movie.id;

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

    const actions = document.createElement("div");
    actions.className = "card__actions";

    const editBtn = document.createElement("button");
    editBtn.className = "button button--secondary";
    editBtn.style.marginTop = "12px";
    editBtn.style.padding = "6px 12px";
    editBtn.style.fontSize = "0.8rem";
    editBtn.style.marginRight = "8px";
    editBtn.textContent = "Редактировать";
    editBtn.addEventListener("click", () => startEdit(movie));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "button button--danger";
    deleteBtn.style.marginTop = "12px";
    deleteBtn.style.padding = "6px 12px";
    deleteBtn.style.fontSize = "0.8rem";
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", () => deleteMovie(movie.id, card));

    actions.append(editBtn, deleteBtn);
    meta.append(director, year, rating, isClassic);
    card.append(title, meta, actions);
    collectionEl.append(card);
  });
}

function startEdit(movie) {
  editingId = movie.id;
  formEl.elements.title.value = movie.title;
  formEl.elements.director.value = movie.director;
  formEl.elements.releaseYear.value = movie.releaseYear;
  formEl.elements.rating.value = movie.rating;
  formEl.elements.isClassic.value = movie.isClassic.toString();

  submitBtn.textContent = "Сохранить изменения";
  cancelEditBtn.hidden = false;
  formTitle.textContent = "Редактирование фильма";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editingId = null;
  formEl.reset();
  submitBtn.textContent = "Отправить в API";
  cancelEditBtn.hidden = true;
  formTitle.textContent = "Добавить фильм";
}

async function deleteMovie(id, cardElement) {
  cardElement.remove();
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
  } catch (error) {
    console.error("Не удалось удалить фильм:", error);
    collectionEl.prepend(cardElement);
    alert("Не удалось удалить фильм. Сервер недоступен.");
  }
}

async function loadMovies() {
  updateUI("loading", "Загрузка...", "Запрашиваем данные из API.");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    const movies = await response.json();
    
    if (movies.length === 0) {
      updateUI("empty", "Список пуст", "В коллекции пока нет фильмов.");
    } else {
      renderMovies(movies);
      updateUI("success", "Успешно", "Данные загружены.");
    }
  } catch (error) {
    console.error("Не удалось загрузить фильмы:", error);
    updateUI("error", "Ошибка", "Не удалось загрузить данные.");
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  submitBtn.disabled = true;
  
  const formData = new FormData(formEl);
  const movieData = {
    title: formData.get("title"),
    director: formData.get("director"),
    releaseYear: Number(formData.get("releaseYear")),
    rating: Number(formData.get("rating")),
    isClassic: formData.get("isClassic") === "true"
  };

  const url = editingId ? `${API_URL}/${editingId}` : API_URL;
  const method = editingId ? "PATCH" : "POST";

  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieData)
    });

    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

    cancelEdit();
    await loadMovies();
  } catch (error) {
    console.error("Не удалось сохранить фильм:", error);
    alert("Не удалось сохранить данные. Сервер недоступен.");
  } finally {
    submitBtn.disabled = false;
  }
}

reloadBtn.addEventListener("click", loadMovies);
formEl.addEventListener("submit", handleSubmit);
cancelEditBtn.addEventListener("click", cancelEdit);

loadMovies();