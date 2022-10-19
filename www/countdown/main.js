import countdown from 'countdown';
import dayjs from 'dayjs';

const to = dayjs('2023-03-19T10:30').toDate();

countdown(
  (ts) => { document.getElementById('countdown').innerHTML = ts.toHTML("strong"); },
  to,
  countdown.DAYS|countdown.HOURS|countdown.MINUTES
);
