interface Countdown {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/**
 * Creates a countdown primitive based on supplied dates and interval.
 */
const createCountdown = (start: Date, end?: () => Date, interval = 1000): Countdown => {
  const [data, setData] = createStore<Countdown>({});
  const calculate = () => {
    const difference = Math.abs(+(end ? end() : new Date()) - +start);
    setData({
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      milliseconds: difference % 1000
    });
  };
  calculate();
  createTimer(calculate, interval, Schedule.Interval);
  return data;
};
