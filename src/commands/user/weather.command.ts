import axios from "axios";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:погода|weather)\s?(.+)?/i,
  name: "погода",
  description: "Получить текущую погоду",

  handler: async (context, bot) => {
    const apiKey = "b0dee5f3af9974cf901ce359aff63c2f";

    const { sub: city } = await helpers.getAfterSplit(context.text!);

    if (!city) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} Не указан город. Пример: .н погода <город>`,
      });

      return;
    }

    try {
      const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`;

      const { data } = await axios.get(url);

      const weatherDescription = data.weather[0].description;
      const temperature = Math.round(data.main.temp);
      const feelsLike = Math.round(data.main.feels_like);
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const sunrise = new Date(
        (data.sys.sunrise + 3 * 3600) * 1000
      ).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      const sunset = new Date(
        (data.sys.sunset + 3 * 3600) * 1000
      ).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

      const message = `
${emojis.lightning} Текущая погода в ${city}:
${emojis.sunWithCloud} ${weatherDescription}.
${emojis.temp} Температура: ${temperature}°C (ощущается как ${feelsLike}°C).
${emojis.blob} Влажность: ${humidity}%.
${emojis.wind} Скорость ветра: ${windSpeed} м/c.
${emojis.sun} Время восхода: ${sunrise}
${emojis.waxingCrescentMoon} Время заката: ${sunset}.`;

      await methods.editMessage({
        api: bot.api,
        context,
        message,
      });
    } catch {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.error} Не удалось получить погоду.`,
      });
    }
  },
});
