function wait(ms, maxErr = 250) {
  const time = Math.floor(ms + (Math.random() - 0.5) * 2 * maxErr);
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function secondsToMs(seconds) {
  return seconds * 1000;
}

function minutesToMs(minutes) {
  return secondsToMs(minutes * 60);
}

function hoursToMs(hours) {
  return hours * minutesToMs(60);
}

function timeDiff(time) {
  return Math.floor(
    Math.abs(new Date().valueOf() - time.valueOf()) / 1000 / 60
  );
}

module.exports = {
  wait,
  secondsToMs,
  minutesToMs,
  hoursToMs,
  timeDiff,
};
