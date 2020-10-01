import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { ExamInfo } from './types';

const prelimUrl = 'https://registrar.cornell.edu/exams/fall-prelim-exam-schedule';
const finalUrl = 'https://registrar.cornell.edu/exams/fall-final-exam-schedule';

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
  const date = new Date(dateTimeString);
  date.setFullYear(currentYear);
  date.setHours(19, 30); // 7:30 prelim time
  return {
    subject,
    courseNumber,
    sectionNumber: '',
    time: date.getTime(),
  };
}

function parseFinalLine(line: string): ExamInfo {
  const segments = line.split(' ').filter((part) => part !== '');
  const subject = segments[0];
  const courseNumber = segments[1];
  const sectionNumber = segments[2];
  let datetimeString = '';
  for (let i = 3; i < segments.length; i += 1) {
    const s = segments[i];
    if (s === 'final') {
      break;
    }
    if (s !== '') {
      datetimeString += ` ${s}`;
    }
  }
  datetimeString = datetimeString.trim();
  const date = new Date(datetimeString);
  date.setFullYear(currentYear);
  return {
    subject,
    courseNumber,
    sectionNumber,
    time: date.getTime(),
  };
}

function getExamInfoList(rawText: string, isFinal: boolean): readonly ExamInfo[] {
  const lines = rawText.split('\n');
  const infoList: ExamInfo[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line !== '' && !line.startsWith('Course') && !line.startsWith('final exam')) {
      const info = isFinal ? parseFinalLine(line) : parsePrelimLine(line);
      infoList.push(info);
    }
  }
  return infoList;
}

const createJson = (url: string, isFinal: boolean): Promise<readonly ExamInfo[]> =>
  fetchExamText(url).then((rawText) => getExamInfoList(rawText, isFinal));

export const createFinalJson = (): Promise<readonly ExamInfo[]> => createJson(finalUrl, true);
export const createPrelimJson = (): Promise<readonly ExamInfo[]> => createJson(prelimUrl, false);
