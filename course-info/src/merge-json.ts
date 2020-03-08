import { readFileSync, writeFileSync } from 'fs';
import { CourseInfo, ExamInfo, ExamType, ExamTimeType, FullInfo } from './types';
import { createFinalJson, createPrelimJson } from './fetch-exam';

class Course {
  public readonly examTimes: Map<number, ExamType> = new Map();

  constructor(
    private readonly courseId: number,
    private readonly subject: string,
    private readonly courseNumber: string,
    private readonly title: string,
  ) {}

  get identifier(): string {
    return `${this.subject}${this.courseNumber}`;
  }

  get plainJs(): FullInfo {
    const examTimes: ExamTimeType[] = [];
    this.examTimes.forEach((type, time) => {
      examTimes.push({ type, time });
    });
    return {
      courseId: this.courseId,
      subject: this.subject,
      courseNumber: this.courseNumber,
      title: this.title,
      examTimes,
    };
  }
}

function processCourseInfoJson(map: Map<string, Course>, json: CourseInfo[]): void {
  json.forEach(({ courseId, subject, courseNumber, title }) => {
    const course = new Course(courseId, subject, courseNumber, title);
    map.set(course.identifier, course);
  });
}

function processExamInfoJson(
  map: Map<string, Course>,
  json: readonly ExamInfo[],
  type: ExamType,
): void {
  json.forEach(({ subject, courseNumber, time }) => {
    const identifier = `${subject}${courseNumber}`;
    const course = map.get(identifier);
    if (course == null) {
      // eslint-disable-next-line no-console
      console.warn(`Warning: the exam at ${time} for ${identifier} is not found in course info.`);
      return;
    }
    course.examTimes.set(time, type);
  });
}

async function main(): Promise<void> {
  const map = new Map<string, Course>();
  processCourseInfoJson(map, JSON.parse(readFileSync('sp20-courses.json', 'utf8')));
  processExamInfoJson(map, await createFinalJson(), 'final');
  processExamInfoJson(map, await createPrelimJson(), 'prelim');
  const result = Array.from(map.values()).map((course) => course.plainJs);
  writeFileSync('sp20-courses-with-exams-min.json', JSON.stringify(result));
}

main();