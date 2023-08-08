import countdown from 'countdown';
import dayjs from 'dayjs';

const to = dayjs('2023-10-08T06:00').toDate();

countdown(
  (ts) => { document.getElementById('countdown').innerHTML = ts.toHTML("strong"); },
  to,
  countdown.DAYS|countdown.HOURS|countdown.MINUTES
);
