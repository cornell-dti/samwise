import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { ExamInfo } from './types';

const prelimUrl = 'https://registrar.cornell.edu/exams/fall-prelim-exam-schedule';
const semiFinalUrl = 'https://registrar.cornell.edu/calendars-exams/semifinal-exam-schedule';

const currentYear = new Date().getFullYear();

async function fetchExamText(url: string): Promise<string> {
  const resp = await fetch(url);
  const html = await resp.text();
  const dom = new JSDOM(html);
  const preNode = dom.window.document.querySelector('pre');
  return preNode.innerHTML;
}

function parsePrelimLine(line: string): ExamInfo {
  const segments = line.split(/\s+/);
  const subject = segments[0];
  const courseNumber = segments[1];
  const dateTimeString = `${segments[3]} ${segments[4]} ${currentYear}`;
  const dateHours = parseInt(segments[5].substring(0, 2), 10);
  const dateMinutes = parseInt(segments[5].substring(3, 5), 10);
  const date = new Date(dateTimeString);
  date.setFullYear(currentYear);
  date.setHours(segments[6] === 'PM' ? dateHours + 12 : dateHours, dateMinutes);
  return {
    subject,
    courseNumber,
    sectionNumber: '',
    time: date.getTime(),
  };
}

function parseSemiFinalLine(line: string): ExamInfo {
  // Adapted for FA20 semifinals.
  const segments = line.split(/\s+/);
  const subject = segments[0];
  const courseNumber = segments[1];
  const sectionNumber = segments[2];
  if (subject === 'CS' && courseNumber === '2800') {
    return {
      subject,
      courseNumber,
      sectionNumber,
      time: new Date(2020, 10, 17, 19, 30).getTime(),
    };
  }
  const dateFormat = segments[3];
  const dateData = dateFormat.split('-');
  let dateTimeString = '';
  switch (dateData[1]) {
    case 'Oct':
      dateTimeString += '10';
      break;
    case 'Nov':
      dateTimeString += '11';
      break;
    case 'Dec':
      dateTimeString += '12';
      break;
    default:
      throw new Error(`Invalid month of final ${dateData[1]}`);
  }
  dateTimeString += `/${dateData[0]}/${currentYear}`;

  const date = new Date(dateTimeString);
  const time12Hr = segments[4];
  const dateHours = parseInt(time12Hr.substring(0, time12Hr.indexOf(':')), 10);
  const dateMinutes = parseInt(time12Hr.substring(time12Hr.indexOf(':') + 1, time12Hr.length), 10);
  date.setHours(segments[5] === 'PM' ? dateHours + 12 : dateHours, dateMinutes);
  return {
    subject,
    courseNumber,
    sectionNumber,
    time: date.getTime(),
  };
}

function getExamInfoList(rawText: string, isSemiFinal: boolean): readonly ExamInfo[] {
  const lines = rawText.split('\n');
  const infoList: ExamInfo[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (
      line !== '' &&
      !line.startsWith('<b>class') &&
      !line.startsWith('final exam') &&
      !line.startsWith('Course')
    ) {
      const info = isSemiFinal ? parseSemiFinalLine(line) : parsePrelimLine(line);
      infoList.push(info);
    }
  }
  return infoList;
}

const createJson = (url: string, isFinal: boolean): Promise<readonly ExamInfo[]> =>
  fetchExamText(url).then((rawText) => getExamInfoList(rawText, isFinal));

export const createSemiFinalJson = (): Promise<readonly ExamInfo[]> =>
  createJson(semiFinalUrl, true);
export const createPrelimJson = (): Promise<readonly ExamInfo[]> => createJson(prelimUrl, false);
