import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { ExamInfo } from './types';

type ExamType = 'final' | 'prelim';

const prelimUrl = 'https://registrar.cornell.edu/exams/spring-prelim-schedule';
const finalUrl = 'https://registrar.cornell.edu/exams/spring-final-exam-schedule'; // not published yet.

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
  const dateHours = parseInt(segments[5].substring(0, segments[5].indexOf(':')), 10);
  const dateMinutes = parseInt(
    segments[5].substring(segments[5].indexOf(':') + 1, segments[5].length - 2),
    10
  );
  const date = new Date(dateTimeString);
  date.setFullYear(currentYear);
  date.setHours(segments[5].slice(-2) === 'pm' ? dateHours + 12 : dateHours, dateMinutes);
  return {
    subject,
    courseNumber,
    sectionNumber: '',
    time: date.getTime(),
  };
}

function parseFinalLine(line: string): ExamInfo {
  // TODO: Finals not published for SP21, update this when they're out
  const segments = line.split(/\s+/);
  const subject = segments[0];
  const courseNumber = segments[1];
  const sectionNumber = segments[2];
  const dateMonth = segments[3];
  const dateDay = segments[4];
  const dateTime = segments[5];
  const dateTimeString = `${dateMonth} ${dateDay} ${currentYear} ${dateTime}`;

  const date = new Date(dateTimeString);
  date.setHours(segments[6] === 'PM' ? date.getHours() + 12 : date.getHours());
  return {
    subject,
    courseNumber,
    sectionNumber,
    time: date.getTime(),
  };
}

function getExamInfoList(rawText: string, examType: ExamType): readonly ExamInfo[] {
  const lines = rawText.split('\n');
  const infoList: ExamInfo[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (
      line !== '' &&
      !line.startsWith('<b>class') &&
      !line.startsWith('final exam') &&
      !line.startsWith('course')
    ) {
      let info: ExamInfo;
      switch (examType) {
        case 'final':
          info = parseFinalLine(line);
          break;
        case 'prelim':
          info = parsePrelimLine(line);
          break;
        default:
          throw new Error('Invalid exam type!');
      }
      infoList.push(info);
    }
  }
  return infoList;
}

const createJson = (url: string, examType: ExamType): Promise<readonly ExamInfo[]> =>
  fetchExamText(url).then((rawText) => getExamInfoList(rawText, examType));
export const createPrelimJson = (): Promise<readonly ExamInfo[]> => createJson(prelimUrl, 'prelim');
export const createFinalJson = (): Promise<readonly ExamInfo[]> => createJson(finalUrl, 'final');
