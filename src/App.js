import React, { useState, useRef } from "react";
import axios from "axios";

export default function App() {
  const [currentTemp, setCurrentTemp] = useState(null);
  const [icon, setIcon] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [degreeType, setDegreeType] = useState("F");
  const locationRef = useRef(null);

  // WeatherBit
  const api_key = process.env.REACT_APP_WEATHERBIT_API_KEY;
  const base_url = process.env.REACT_APP_WEATHERBIT_BASE_URL;
  const image_path = process.env.REACT_APP_WEATHERBIT_IMAGE_PATH;

  function getWeekday(date) {
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    date = new Date(date.concat("T00:00:00"));
    return weekday[date.getDay()];
  }

  function getTime() {
    var time = new Date();
    var hour = time.getHours();

    if (hour <= 11) {
      if (hour === 0) hour = 12;

      return addZero(hour) + ":00 AM";
    } else {
      if (hour === 12) return addZero(hour) + ":00 PM";
      else return addZero(hour - 12) + ":00 PM";
    }

    function addZero(i) {
      if (i < 10) i = "0" + i;

      return i;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = {
      key: api_key,
      city: locationRef.current.value,
      units: "I", // Default to Fahrenheit
    };

    forecastWeather(params);
  };

  function forecastWeather(params) {
    // Get Forecast Weather
    // https://www.weatherbit.io/api/weather-forecast-16-day

    axios
      .get(base_url + "forecast/daily", { params })
      .then((response) => {
        if (response.status === 200) {
          // Valid response
          setError(null);
          const data = response.data;

          setLocation(data.city_name + ", " + data.state_code); // Set Location

          // Set Current Info
          setCurrentTemp(data.data[0].temp);
          setIcon(data.data[0].weather.icon);
          setHumidity(data.data[0].rh);
          setWind(data.data[0].wind_spd);
          setDescription(data.data[0].weather.description);
          setDate(getWeekday(data.data[0].datetime) + " " + getTime());

          // Set Forecast
          var forecast = [];
          for (let index = 0; index <= 7; index++) {
            // Only use next 7 days

            var response_date = getWeekday(data.data[index].datetime);

            var day = {
              id: index,
              active: false,
              date: response_date,
              day: response_date.substring(0, 3),
              icon: data.data[index].weather.icon,
              description: data.data[index].weather.description,
              humidity: data.data[index].rh,
              wind: data.data[index].wind_spd,
              temp: data.data[index].temp,
              high_temp: data.data[index].high_temp,
              low_temp: data.data[index].low_temp,
            };

            if (index === 0) {
              day.active = true;
              day.date = day.date + " " + getTime();
            }

            forecast.push(day);
          }

          setForecast(forecast);
        } else {
          // Error response
          const error = response.statusText;
          setError(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const toggleDegree = (e) => {
    // Convert Current Degree
    setCurrentTemp(convertDegree(currentTemp, degreeType));

    // Convert Forecast Degrees
    var forecastTemp = [];

    forecast.forEach((day) => {
      const dayTemp = {
        id: day.id,
        active: day.active,
        date: day.date,
        day: day.day,
        icon: day.icon,
        description: day.description,
        humidity: day.humidity,
        wind: day.wind,
        temp: convertDegree(day.temp, degreeType),
        high_temp: convertDegree(day.high_temp, degreeType),
        low_temp: convertDegree(day.low_temp, degreeType),
      };

      forecastTemp.push(dayTemp);
    });

    setForecast(forecastTemp);

    // Toggle Degree Type
    const target = e.target.id;

    document.getElementById(degreeType).classList.toggle("active");
    document.getElementById(target).classList.toggle("active");

    setDegreeType(target);
  };

  function convertDegree(degree, degreeType) {
    if (degreeType === "F") {
      // Convert To Celsius
      return convertToCelsius(degree);
    } else {
      // Convert To Fahrenheit
      return convertToFahrenheit(degree);
    }
  }

  function convertToCelsius(degree) {
    return (degree - 32) / 1.8;
  }

  function convertToFahrenheit(degree) {
    return degree * 1.8 + 32;
  }

  const switchCurrent = (day) => {
    if (!day.active) {
      // Only proceed if the current selected day is not active
      const index = forecast.findIndex((findDay) => findDay.active === true);

      var forecastTemp = forecast.slice();

      forecastTemp[index].active = false;
      forecastTemp[day.id].active = true;

      // Set Current Info
      setCurrentTemp(forecastTemp[day.id].temp);
      setIcon(forecastTemp[day.id].icon);
      setHumidity(forecastTemp[day.id].humidity);
      setWind(forecastTemp[day.id].wind);
      setDescription(forecastTemp[day.id].description);
      setDate(forecastTemp[day.id].date);

      setForecast(forecastTemp); // Set Forecast
    }
  };

  return (
    <div className="overlay">
      <div className="App">
        <div className="form_container">
          <form
            id="location_form"
            onSubmit={handleSubmit}
            className="location_form"
          >
            <input
              ref={locationRef}
              name="location"
              required
              className="location_input"
              placeholder="Please enter city name"
            />
            <button
              type="submit"
              id="location_send"
              className="location_button button"
            >
              Submit
            </button>
          </form>
        </div>

        <div className="weather_container">
          <div className="current_weather_container">
            {error ? (
              <span className="error">{error}. Please try again.</span>
            ) : currentTemp ? (
              <div className="current_weather">
                <div className="current_weather_details">
                  <div className="current_weather_icon">
                    <img
                      src={image_path + icon + ".png"}
                      alt={description}
                      title={description}
                    />
                  </div>

                  <div className="current_weather_temp">
                    <span>{Math.round(currentTemp)}</span>
                  </div>

                  <div className="degree_toggle">
                    <span
                      id="F"
                      className="degree_type active"
                      onClick={degreeType === "F" ? null : toggleDegree}
                    >
                      F
                    </span>
                    <span>|</span>
                    <span
                      id="C"
                      className="degree_type"
                      onClick={degreeType === "C" ? null : toggleDegree}
                    >
                      C
                    </span>
                  </div>

                  <div className="current_weather_temp_details">
                    <ul>
                      <li>Humidity: {humidity}%</li>
                      <li>Wind: {Math.round(wind)} mph</li>
                    </ul>
                  </div>
                </div>

                <div className="local_info">
                  <p className="city_info">{location}</p>
                  <p className="date_info">{date}</p>
                  <p className="weather_description">{description}</p>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="forecast_weather_container">
            {error
              ? ""
              : forecast
              ? forecast.map((day, index) => (
                  <div
                    key={index}
                    className={"daily_weather " + (day.active ? "active" : "")}
                    onClick={() => switchCurrent(day)}
                  >
                    <p>{day.day}</p>

                    <img
                      src={image_path + day.icon + ".png"}
                      alt={day.description}
                      title={day.description}
                    />

                    <div className="daily_temp">
                      <span className="high_temp">
                        {Math.round(day.high_temp)}&#176;
                      </span>
                      <span className="low_temp">
                        {Math.round(day.low_temp)}&#176;
                      </span>
                    </div>
                  </div>
                ))
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
