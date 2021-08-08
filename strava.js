const dayjs = require("dayjs");
const _ = require("lodash");

module.exports = async (context, ...args) => {
  let payload
  try {
    payload = await context.strava.athlete.listActivities({
      after: dayjs().startOf("month").unix(),
    });
  } catch (err) {
    console.error("Failed to make strava api request");
    return;
  }
  const data = _.map(_.filter(payload, { type: "Run" }), (a) => {
    return {
      distance: a.distance / 1000,
      start: dayjs(a.start_date),
    };
  });
  const distance = (data, period) => {
    return _.reduce(
      _.filter(data, (a) => a.start.isAfter(dayjs().startOf(period))),
      (sum, a) => sum + a.distance,
      0
    ).toFixed(2);
  };
  await context.chat.say(
    context.channel.displayName,
    "Annie runs!"
  );
  await context.chat.say(
    context.channel.displayName,
    `Today: ${distance(data, "day")} km, ` +
      `Week: ${distance(data, "week")} km, ` +
      `Month: ${distance(data, "month")} km`
  );
};
