import axios from 'axios'
import {WEATHER_API_KEY} from 'config'

export async function getCurrentWeather(): Promise<{
  temp: number
  nextHourForecast: string
} | null> {
  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=48.1374&lon=11.5755&appid=${WEATHER_API_KEY}&units=metric&exclude=minutely,daily,alerts`,
    )

    // console.warn('res.data', res.data)

    return {
      temp: res.data.current.temp,
      nextHourForecast: res.data.hourly[0].weather[0].description,
    }
  } catch (e) {
    console.warn('weather error', e)
    return null
  }
}
