const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weather-card");

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showMessage("Please enter a city name.");
    return;
  }

  showMessage("Loading weather...");
  weatherCard.classList.add("hidden");

  try {
    // Step 1: Convert the city name into latitude and longitude.
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) throw new Error("Could not search for this city.");

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Check the spelling and try again.");
    }

    const place = geoData.results[0];

    // Step 2: Get current weather using the location coordinates.
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) throw new Error("Weather information is unavailable.");

    const weatherData = await weatherResponse.json();
    displayWeather(place, weatherData.current);

    showMessage("");
  } catch (error) {
    showMessage(error.message || "Something went wrong. Please try again.");
  }
});

function displayWeather(place, current) {
  document.getElementById("city-name").textContent =
    `${place.name}${place.country ? ", " + place.country : ""}`;

  document.getElementById("date-text").textContent =
    `Updated: ${current.time.replace("T", " ")}`;

  document.getElementById("temperature").textContent =
    `${Math.round(current.temperature_2m)}°C`;

  document.getElementById("feels-like").textContent =
    `${Math.round(current.apparent_temperature)}°C`;

  document.getElementById("humidity").textContent =
    `${current.relative_humidity_2m}%`;

  document.getElementById("wind").textContent =
    `${current.wind_speed_10m} km/h`;

  const weather = getWeatherInfo(current.weather_code, current.is_day);
  document.getElementById("condition").textContent = weather.description;
  document.getElementById("weather-icon").textContent = weather.icon;

  weatherCard.classList.remove("hidden");
}

function getWeatherInfo(code, isDay) {
  if (code === 0) return { description: "Clear sky", icon: isDay ? "☀️" : "🌙" };
  if ([1, 2, 3].includes(code)) return { description: "Partly cloudy", icon: "⛅" };
  if ([45, 48].includes(code)) return { description: "Foggy", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) return { description: "Drizzle", icon: "🌦️" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { description: "Rain", icon: "🌧️" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { description: "Snow", icon: "❄️" };
  if ([95, 96, 99].includes(code)) return { description: "Thunderstorm", icon: "⛈️" };
  return { description: "Unknown condition", icon: "🌡️" };
}

function showMessage(text) {
  message.textContent = text;
}
