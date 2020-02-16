import fetch from 'node-fetch';

export default function icalParse(text: string): Array<Record<string, string>> {
  const lines = text.split('\n');
  let eventState = false;
  let uid = '';
  let date = '';
  let name = '';
  const events = [];
  // console.log(lines);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].replace(/\s/g, '');
    if (line === 'BEGIN:VEVENT') {
      eventState = true;
      uid = '';
      date = '';
      name = '';
    }
    if (line === 'END:VEVENT') {
      eventState = false;
      events.push({
        uid,
        date,
        name,
      });
    }
    if (eventState) {
      const tokens = line.split(':');
      const [head, tail] = tokens;
      switch (head) {
        case 'UID':
          uid = tail;
          break;
        case 'DTEND':
          date = tail;
          break;
        case 'DTEND;VALUE=DATE':
          date = tail + (tail[-1] === 'Z' ? '' : 'Z');
          break;
        case 'SUMMARY':
          name = tail;
          break;
        default:
          console.log(`Unexpected tokens: ${tokens}`);
          break;
      }
    }
  }
  return events;
}
