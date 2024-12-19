import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NewsCard, NewsSkeleton } from "../components/newsCard";
import { NotesCard } from "../components/notesCard";
import { TimerCard } from "../components/timerCard";
import { UserCard } from "../components/userCard";
import { WeatherCard, WeatherSkeleton } from "../components/weatherCard";

import styles from "./dashboard.module.css";

// API Keys
import { NYTAPIKEY, OPENWEATHERMAP_KEY } from "../secrets";

const DashboardPage = () => {
  // User-related states
  const [user, setUser] = useState({
    name: "Not logged in",
    username: "guest",
    email: "guest@example.com",
    mobile: "",
    shareData: false,
    categories: ["Horror", "Thriller", "Action"],
  });

  // Weather-related states
  const [weather, setWeather] = useState(null);
  const [weatherDate, setWeatherDate] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // News-related states
  const [news, setNews] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);

  // Timer-related states
  const [timerTime, setTimerTime] = useState({
    hours: 0,
    minutes: 1,
    seconds: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const totalTime = useRef(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Sign-out functionality
  const signOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const browseEntertainment = () => {
    navigate("/entertainment");
  };

  // Fetch news data from API
  const fetchNewsData = async () => {
    try {
      const response = await fetch(
        `https://api.nytimes.com/svc/topstories/v2/world.json?api-key=${NYTAPIKEY}`
      );
      if (!response.ok) throw new Error(`News API error: ${response.status}`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setNews(data.results[0]); // Use the first news item
      } else {
        console.error("No news data available");
        setNews(null);
      }
    } catch (error) {
      console.error("Error fetching news data:", error);
      setNews(null);
    } finally {
      setNewsLoading(false);
    }
  };

  // Fetch weather data from API
  const fetchWeatherData = async () => {
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHERMAP_KEY}`
      );
      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();
      setWeather(data);
      setWeatherDate(new Date(data.dt * 1000));
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWeatherData();
    fetchNewsData();
    const timer = setInterval(() => new Date(), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update total time when timer state changes
  useEffect(() => {
    totalTime.current =
      timerTime.hours * 3600 + timerTime.minutes * 60 + timerTime.seconds;
  }, [timerTime]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prevElapsed) => {
          if (prevElapsed >= totalTime.current) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return totalTime.current;
          }
          return prevElapsed + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Check user login status
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user !== null) {
      setUser(JSON.parse(user));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <UserCard user={user} signOut={signOut} />

        {weatherLoading ? (
          <WeatherSkeleton />
        ) : weather ? (
          <WeatherCard weather={weather} weatherDate={weatherDate} />
        ) : (
          <p>Error fetching weather data</p>
        )}

        <NotesCard
          note={"This is how I am going to learn MERN Stack in next 3 months."}
        />

        {newsLoading ? (
          <NewsSkeleton />
        ) : news ? (
          <NewsCard news={news} />
        ) : (
          <p>No news available</p>
        )}

        <TimerCard
          timerTime={timerTime}
          setTimerTime={setTimerTime}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          elapsedTime={elapsedTime}
          setElapsedTime={setElapsedTime}
          totalTime={totalTime}
        />
      </div>

      <div className={styles.footer} onClick={browseEntertainment}>
        <button className={styles.browseButton}>Browse</button>
      </div>
    </div>
  );
};

export default DashboardPage;
