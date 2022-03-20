import axios from 'axios'

export async function getWeather(
  apiKey: string,
  lat: string,
  lon: string,
  lang: string
): Promise<{
  temp: number
  nextHourForecast: string
} | null> {
  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=minutely,daily,alerts&lang=${lang}`,
    )

    return {
      temp: res.data.current.temp,
      nextHourForecast: res.data.hourly[0].weather[0].description,
    }
  } catch (e) {
    console.warn('weather error', e)
    return null
  }
}
