const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const fallPrelimUrl = 'https://registrar.cornell.edu/exams/fall-prelim-exam-schedule';
const fallFinalUrl = 'https://registrar.cornell.edu/exams/fall-final-exam-schedule';

const currentYear = new Date().getFullYear();

async function fetchExamText(url) {
  const resp = await fetch(url);
  const html = await resp.text();
  const dom = new JSDOM(html);
  const preNode = dom.window.document.querySelector('pre');
  return preNode.innerHTML;
}

function parsePrelimLine(line) {
  const segments = line.split(' ');
  const subject = segments[0];
  const courseNumber = segments[1];
  let datetimeString = '';
  for (let i = 2; i < segments.length; i += 1) {
    const s = segments[i];
    if (s !== '') {
      datetimeString = s;
      break;
    }
  }
  const date = new Date(datetimeString);
  date.setFullYear(currentYear);
  date.setHours(19, 30); // 7:30 prelim time
  return {
    subject,
    courseNumber,
    sectionNumber: '',
    time: date.getTime(),
  };
}

function parseFinalLine(line) {
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

function getExamInfoList(rawText, isFinal) {
  const lines = rawText.split('\n');
  const infoList = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line !== '' && !line.startsWith('Class')) {
      const info = isFinal ? parseFinalLine(line) : parsePrelimLine(line);
      infoList.push(info);
    }
  }
  return infoList;
}

function createJson(url, isFinal, outFilename) {
  fetchExamText(url)
    .then((rawText) => getExamInfoList(rawText, isFinal))
    .then((json) => fs.writeFile(outFilename, JSON.stringify(json), () => {}));
}

function main() {
  createJson(fallFinalUrl, true, 'final-exams.json');
  createJson(fallPrelimUrl, false, 'prelim-exams.json');
}

main();
