/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import "weather-icons/css/weather-icons.min.css";
import "./index.css"; // Import Tailwind CSS
import CountryFlag from "react-country-flag";
import Spinner from "./components/Spinner";
function FlagImoji({ countryCode }) {
  return (
    <div>
      <CountryFlag
        countryCode={countryCode}
        style={{
          fontSize: "2em",
        }}
        svg
      />
    </div>
  );
}

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

// function MyComponent({ wmo }) {
//   return (
//     <div>
//       <WeatherIcon name="owm" iconId={wmo} flip="horizontal" rotate="90" />
//     </div>
//   );
// }

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

function App() {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMetro, setIsLoadingMetro] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);

  const [displayLocation, setDisplayLocation] = useState("");
  const [locationImoji, setLocationImoji] = useState("");
  const [weather, setWeather] = useState({});
  const [currentWeather, setCurrentWeather] = useState({});
  const [cityName, setCityName] = useState("");
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [weatherCode, setWeatherCode] = useState("");
  const [flagImoji, setFlagImoji] = useState("");
  const [position, setMapPosition] = useState({});

  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    getPosition,
  } = useGeolocation();

  useEffect(() => {
    const storedLocation = localStorage.getItem("location") || "";
    setLocation(storedLocation);
  }, []);

  useEffect(() => {
    if (location.length < 2) return setWeather({});

    const fetchWeather = async () => {
      try {
        setIsLoading(true);

        // 1) Getting location (geocoding)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        );
        const geoData = await geoRes.json();

        if (!geoData.results) throw new Error("Location not found");

        const { latitude, longitude, timezone, name, country_code } =
          geoData.results[0];

        setDisplayLocation(`${name}`);
        setLocationImoji(country_code);

        // 2) Getting actual weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
        );
        const weatherData = await weatherRes.json();
        console.log(weatherData);
        setWeather(weatherData.daily);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    localStorage.setItem("location", location);
  }, [location]);

  const lat = geolocationPosition?.lat || 9.3124;
  const long = geolocationPosition?.lng || 42.1218;
  // setMapPosition({ lat, long });
  const limit = 5;

  let kalua = "1067e18a06d794e8f34b40aea99e6dab";
  // const currentGeoRes = await fetch(
  //   `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=${limit}&appid=${kalua}`
  // );
  // const currentGeoData = await currentGeoRes.json();
  // console.log(currentGeoData);

  useEffect(() => {
    if (!lat && !long) return;

    const fetchCityData = async () => {
      try {
        setIsLoadingGeo(true);

        // 2) Getting actual weather
        const currentGeoRes = await fetch(
          `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=${limit}&appid=${kalua}`
        );
        const currentGeoData = await currentGeoRes.json();
        console.log(currentGeoData);
        setCityName(currentGeoData[0].name);
        // setCurrentWeather(currentWeatherData.current);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingGeo(false);
      }
    };

    fetchCityData();
    localStorage.setItem("location", location);
  }, [lat, long]);

  useEffect(() => {
    if (!lat && !long) return;

    const fetchCurrentWeather = async () => {
      try {
        setIsLoadingMetro(true);

        // 2) Getting actual weather
        const currentWeatherRes = await fetch(
          `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${kalua}`
        );
        const currentWeatherData = await currentWeatherRes.json();
        console.log(currentWeatherData);
        setTemp(currentWeatherData.main.temp);
        setHumidity(currentWeatherData.main.humidity);
        setWindSpeed(currentWeatherData.wind.speed);
        setWeatherCode(currentWeatherData.weather[0].icon);
        setFlagImoji(currentWeatherData.sys.country);
        setMapPosition(
          currentWeatherData.coord.lat,
          currentWeatherData.coord.lon
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMetro(false);
      }
    };

    fetchCurrentWeather();
    localStorage.setItem("location", location);
  }, [cityName]);
  console.log(position);

  function removeDecimalPoints(inputString) {
    // Split the input string into an array of substrings
    const substrings = inputString.split(".");

    // Remove the decimal points and their following digits from each substring
    const outputString = substrings
      .map((substring) => {
        const indexOfDecimal = substring.indexOf(".");
        if (indexOfDecimal !== -1) {
          return substring.slice(0, indexOfDecimal);
        } else {
          return substring;
        }
      })
      .join("");

    return outputString;
  }

  const degreeSymbol = "\u00B0";
  let weatherIcon;
  if (weatherCode === "01d" || weatherCode === "01n") {
    weatherIcon = "sunny.png";
  } else if (weatherCode === "02d" || weatherCode === "02n") {
    weatherIcon = "clouds.png";
  } else if (weatherCode === "03d" || weatherCode === "03n") {
    weatherIcon = "drizle.png";
  } else if (weatherCode === "04d" || weatherCode === "04n") {
    weatherIcon = "drizle.png";
  } else if (weatherCode === "09d" || weatherCode === "09n") {
    weatherIcon = "rainy.png";
  } else if (weatherCode === "10d" || weatherCode === "10n") {
    weatherIcon = "rainy.png";
  } else if (weatherCode === "11d" || weatherCode === "11n") {
    weatherIcon = "sowy.png";
  } else if (weatherCode === "13d" || weatherCode === "13n") {
    weatherIcon = "thunder.png";
  } else {
    weatherIcon = "sunny.png";
  }

  return (
    <div className="app bg-blue-950 h-full w-full py-4 m-auto">
      <p className="text-white text-7xl phone:text-normal tablet:text-normal ">
        Afro Weather
      </p>
      <div className="w-6/12 flex gap-x-4 phone:flex-col gap-4 items-center laptop:flex-row w-5/12">
        <button
          onClick={getPosition}
          className="w-11/12 pointer:cursor bg-sky-400 hover:bg-sky-200 py-2  rounded text-black phone:w-10/12 py-4 p-tab:w-7/12 text-md tablet:text-2xl py-4 w-5/12 laptop:py-4 w-5/12  desktop:text-4xl w-6/12 bigdesktop:w-5/12"
        >
          use position
        </button>
        <Input location={location} onChangeLocation={setLocation} />
      </div>
      {isLoadingGeo && <p className="loader">Loading...</p>}
      <CurrentWeather
        weatherCode={weatherCode}
        weatherIcon={weatherIcon}
        lat={lat}
        flagImoji={flagImoji}
        cityName={cityName}
        temp={temp}
        humidity={humidity}
        windSpeed={windSpeed}
      />

      {isLoading && <p className="loader">Loading...</p>}

      {weather.weathercode && (
        <Weather
          weather={weather}
          location={displayLocation}
          locationImoji={locationImoji}
        />
      )}
    </div>
  );
}

function CurrentWeather({
  weatherCode,
  weatherIcon,
  flagImoji,
  cityName,
  temp,
  humidity,
  windSpeed,
  lat,
}) {
  return (
    <div className="text-center bg-blue-900 w-2/5 rounded-none py-2 pb-20 shadow-sm shadow-blue-900 phone:w-11/12 px-1 rounded p-tab:w-3/5 tablet:w-2/4 laptop:w-2/5 bigdesktop:mb-16">
      {weatherCode && (
        <img
          src={weatherIcon}
          alt="humidity"
          width="70px"
          height="70px"
          className="inline-block phone:w-3/12 p-tab:w-3/12  tablet:w-4/12 laptop:w-3/12 desktop:w-3/12"
        />
      )}
      <div className="text-center mt-2">
        {lat && (
          <>
            <div className="flex items-center justify-center gap-x-6 text-white mb-16">
              <span>
                <FlagImoji countryCode={flagImoji} />
              </span>
              <p className="phone:text-xl tablet:text-4xl">
                {" "}
                {cityName}, {Math.floor(temp)}&deg;C
              </p>
            </div>
            <div className="flex gap-x-16 items-center justify-center phone:gap-x-2 tablet:gap-x-10 laptop:gap-x-0">
              <div className="flex flex-col items-center">
                <div className="flex gap-x-4 items-center justify-center">
                  <img
                    src="humidy.png"
                    alt="humidity"
                    width="70px"
                    height="70px"
                    className="phone:w-4/12 p-tab:w-5/12 tablet:w-4/12 desktop:w-6/12"
                  />
                  <p className="text-white phone:text-xl tablet:text-2xl desktop:text-4xl">
                    {humidity}%
                  </p>
                </div>
                <div>
                  <p className="text-white phone:text-xl tablet:text-2xl desktop:text-4xl">
                    Humidity
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex gap-x-4 items-center justify-center">
                  <img
                    src="windspid.png"
                    alt="storm"
                    width="70px"
                    height="70px"
                    className="phone:w-4/12 p-tab:w-5/12 tablet:w-4/12 desktop:w-6/12"
                  />
                  <p className="text-white phone:text-xl tablet:text-2xl desktop:text-4xl">
                    {Math.floor(windSpeed)}km/hr
                  </p>
                </div>
                <div>
                  <p className="text-white phone:text-xl tablet:text-2xl desktop:text-4xl">
                    wind speed
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// function Button({ onClick }) {
//   return (
//     <div>

//     </div>
//   );
// }

function Input({ location, onChangeLocation }) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if the pressed key is 'Enter'
      if (event.key === "Enter") {
        // Scroll to the bottom of the page
        window.scrollTo(0, document.body.scrollHeight);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []); // Empty dependency array ensures that this effect runs only once when the component mounts

  return (
    <div className="inline-block text-center">
      <input
        type="text"
        placeholder="search from location..."
        value={location}
        onChange={(e) => onChangeLocation(e.target.value)}
        className="border border-4 border-black-950 bg-sky-400 hover:bg-sky-200 py-2 px-10 rounded placeholder:text-black  focus:outline-none shadow-lg w-11/12 phone:py-4 text-2xl tablet:text-3xl laptop:w-full destop:text-3xl"
      />
    </div>
  );
}

function Weather({ weather, location, locationImoji }) {
  return (
    <div className="pb-20 phone:w-full px-4 laptop:w-11/12">
      <h2 className="mb-4 flex justify-center items-center gap-x-4 text-white font-serif desktop:mb-8">
        <p className="phone:text-xl tracking-widest tablet:mr-10 tracking-wide text-xl laptop:text-4xl">
          Weather {location}{" "}
        </p>
        <span>
          <FlagImoji countryCode={locationImoji} />
        </span>
      </h2>
      <ul className="weather phone:grid grid-cols-2 w-full tablet:grid-cols-3 laptop:grid-cols-7 bigdesktop:grid-cols-4 gap-8">
        {weather.time.map((date, i) => (
          <Day
            date={date}
            max={weather.temperature_2m_max[i]}
            min={weather.temperature_2m_min[i]}
            code={weather.weathercode[i]}
            key={date}
            isToday={i === 0}
          />
        ))}
      </ul>
    </div>
  );
}

function Day({ date, max, min, code, isToday }) {
  console.log(code);
  return (
    <li className="day bg-sky-300 rounded-md shadow-lg phone:w-full gap-8 bigdesktop:w-3/4 gap-2">
      <span>{getWeatherIcon(code)}</span>
      <p className="phone:text-2xl laptop:text-2xl bigdesktop:text-4xl">
        {isToday ? "Today" : formatDay(date)}
      </p>
      <p className="phone:text-2xl laptop:text-2xl bigdesktop:text-4xl">
        {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
      </p>
    </li>
  );
}

export default App;
