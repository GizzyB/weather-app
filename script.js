const API_KEY = "YOUR_API_KEY";

const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("city");
const unitInputs = document.querySelectorAll("input[name='unit']");

const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const forecastEl = document.getElementById("forecast");
const forecastGrid = document.getElementById("forecastGrid");

// Current weather UI elements
const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const windUnitEl = document.getElementById("windUnit");
const coordsEl = document.getElementById("coords");

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#b91c1c" : "";
}

function showCurrentWeather(data, unit) {
  resultEl.classList.remove("hidden");

  locationEl.textContent = `${data.name}, ${data.sys.country}`;
  descEl.textContent = data.weather[0].description;
  humidityEl.textContent = data.main.humidity;
  coordsEl.textContent = `${data.coord.lat.toFixed(2)}, ${data.coord.lon.toFixed(2)}`;

  if (unit === "metric") {
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    windUnitEl.textContent = "m/s";
  } else {
    tempEl.textContent = `${Math.round(data.main.temp)}°F`;
    windUnitEl.textContent = "mph";
  }

  windEl.textContent = data.wind.speed;
}

function showForecast(data, unit) {
  forecastGrid.innerHTML = "";
  forecastEl.classList.remove("hidden");

  // Filter forecast to one result per day (around noon)
  const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  daily.forEach(day => {
    const date = new Date(day.dt_txt);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

    const temp = Math.round(day.main.temp);
    const desc = day.weather[0].description;
    const icon = day.weather[0].icon;

    const card = document.createElement("div");
    card.classList.add("forecast-card");

    card.innerHTML = `
      <h3>${weekday}</h3>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
      <p>${temp}°${unit === "metric" ? "C" : "F"}</p>
      <small>${desc}</small>
    `;

    forecastGrid.appendChild(card);
  });
}

async function fetchWeather(city, unit) {
  setStatus("Loading...");

  try {
    // Current weather
    const resCurrent = await fetch(
      `${CURRENT_URL}?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`
    );

    if (!resCurrent.ok) throw new Error("City not found.");

    const currentData = await resCurrent.json();
    showCurrentWeather(currentData, unit);

    // Forecast
    const resForecast = await fetch(
      `${FORECAST_URL}?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`
    );

    const forecastData = await resForecast.json();
    showForecast(forecastData, unit);

    setStatus("Updated.");

  } catch (err) {
    setStatus(err.message, true);
    resultEl.classList.add("hidden");
    forecastEl.classList.add("hidden");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  const unit = document.querySelector("input[name='unit']:checked").value;

  if (!city) {
    setStatus("Enter a city name.", true);
    return;
  }

  fetchWeather(city, unit);
});
