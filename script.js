document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('form[role="search"]');
  const cityInput = document.querySelector('input[type="search"]');
  const cityName = document.getElementById('cityName');
  const temperature = document.getElementById('temperature');
  const weatherDescription = document.getElementById('weatherDescription');
  const weatherDescriptionText = document.getElementById('weatherDescriptionText');
  const weatherIcon = document.getElementById('weatherIcon');
  const humidity = document.getElementById('humidity');
  const windSpeed = document.getElementById('windSpeed');
  const pressure = document.getElementById('pressure');
  const historyContainer = document.getElementById('historyContainer');
  const forecastContainer = document.getElementById('forecastContainer');
  const alertsContainer = document.getElementById('alertsContainer');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  // Your WeatherAPI.com API key
  const API_KEY = 'c103ef6ff2mshcfdb6f84288e32bp176c38jsne7e0176ded76';

  // Weather condition to emoji mapping
  const weatherIcons = {
    'Sunny': '☀️',
    'Clear': '☀️',
    'Partly cloudy': '⛅',
    'Cloudy': '☁️',
    'Overcast': '☁️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Rain': '🌧️',
    'Drizzle': '🌧️',
    'Shower': '🌧️',
    'Thunder': '⛈️',
    'Snow': '❄️',
    'Sleet': '🌨️',
  };

  // Load default city (Ahmedabad) on page load
  fetchWeatherData('Ahmedabad');

  // Handle form submission
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
      alert('Please enter a city name');
      return;
    }
    fetchWeatherData(city);
    cityInput.value = ''; // Clear input after search
  });

  // Handle dropdown city selection
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const city = e.target.getAttribute('data-city');
      fetchWeatherData(city);
    });
  });

  async function fetchWeatherData(city) {
    try {
      // Get current date and dates for past 3 days
      const today = new Date();
      const pastDates = [];
      for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        pastDates.push(date.toISOString().split('T')[0]);
      }

      // Fetch current weather, forecast, alerts, and historical data
      const [currentWeather, forecast, alerts, ...history] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city),
        fetchAlerts(city),
        ...pastDates.map(date => fetchHistory(city, date))
      ]);
      updateCurrentWeather(currentWeather);
      updateForecast(forecast);
      updateAlerts(alerts);
      updateHistory(history, pastDates);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      alert('Could not find city or failed to fetch data. Try another city.');
    }
  }

  async function fetchCurrentWeather(city) {
    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/current.json?q=${encodeURIComponent(city)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch current weather');
    return await response.json();
  }

  async function fetchForecast(city) {
    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${encodeURIComponent(city)}&days=3`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return await response.json();
  }

  async function fetchAlerts(city) {
    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/alerts.json?q=${encodeURIComponent(city)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  }

  async function fetchHistory(city, date) {
    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/history.json?q=${encodeURIComponent(city)}&dt=${date}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        },
      }
    );
    if (!response.ok) throw new Error(`Failed to fetch history for ${date}`);
    return await response.json();
  }

  function getWeatherIcon(condition) {
    return weatherIcons[condition] || '🌤️';
  }

  function updateCurrentWeather(data) {
    cityName.textContent = data.location.name;
    temperature.textContent = Math.round(data.current.temp_c);
    const condition = data.current.condition.text;
    weatherDescription.textContent = condition;
    weatherDescriptionText.textContent = condition;
    weatherIcon.textContent = getWeatherIcon(condition);
    humidity.textContent = data.current.humidity;
    windSpeed.textContent = data.current.wind_kph;
    pressure.textContent = data.current.pressure_mb;
  }

  function updateForecast(data) {
    forecastContainer.innerHTML = '';
    data.forecast.forecastday.forEach((day, index) => {
      const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const condition = day.day.condition.text;
      const card = `
        <div class="col">
          <div class="card forecast-card">
            <div class="card-body">
              <h5 class="card-title">${date}</h5>
              <p class="card-text">Temp: <span>${Math.round(day.day.avgtemp_c)}</span>°C</p>
              <p class="card-text condition">Condition: <span>${condition} ${getWeatherIcon(condition)}</span></p>
            </div>
          </div>
        </div>
      `;
      forecastContainer.insertAdjacentHTML('beforeend', card);
    });
  }

  function updateHistory(data, dates) {
    historyContainer.innerHTML = '';
    data.forEach((day, index) => {
      const date = new Date(dates[index]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const condition = day.forecast.forecastday[0].day.condition.text;
      const card = `
        <div class="col">
          <div class="card history-card">
            <div class="card-body">
              <h5 class="card-title">${date}</h5>
              <p class="card-text">Temp: <span>${Math.round(day.forecast.forecastday[0].day.avgtemp_c)}</span>°C</p>
              <p class="card-text condition">Condition: <span>${condition} ${getWeatherIcon(condition)}</span></p>
            </div>
          </div>
        </div>
      `;
      historyContainer.insertAdjacentHTML('beforeend', card);
    });
  }

  function updateAlerts(data) {
    alertsContainer.innerHTML = '';
    if (data.alerts && data.alerts.alert && data.alerts.alert.length > 0) {
      data.alerts.alert.forEach(alert => {
        const alertItem = `
          <div class="alert-item">
            <strong>${alert.headline}</strong>
            <p>Severity: ${alert.severity}</p>
            <p>${alert.desc}</p>
            <p>Effective: ${new Date(alert.effective).toLocaleString()}</p>
          </div>
        `;
        alertsContainer.insertAdjacentHTML('beforeend', alertItem);
      });
    } else {
      alertsContainer.innerHTML = '<p>No active weather alerts.</p>';
    }
  }
});