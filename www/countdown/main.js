import countdown from 'countdown';
import dayjs from 'dayjs';

const to = dayjs('2024-03-17T09:00').toDate();

countdown(
  (ts) => { document.getElementById('countdown').innerHTML = ts.toHTML("strong"); },
  to,
  countdown.DAYS|countdown.HOURS|countdown.MINUTES
);
