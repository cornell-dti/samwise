import { CourseInfo, ExamInfo, ExamType, ExamTimeType, FullInfo } from './types';

class Course {
  public readonly examTimes: Map<number, ExamType> = new Map();

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly courseId: number,
    private readonly subject: string,
    private readonly courseNumber: string,
    private readonly title: string
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

function processCourseInfoJson(map: Map<string, Course>, json: readonly CourseInfo[]): void {
  json.forEach(({ courseId, subject, courseNumber, title }) => {
    const course = new Course(courseId, subject, courseNumber, title);
    map.set(course.identifier, course);
  });
}

function processExamInfoJson(
  map: Map<string, Course>,
  json: readonly ExamInfo[],
  type: ExamType
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

export default function mergeCoursesAndExamJson(
  courses: readonly CourseInfo[],
  prelimExams: readonly ExamInfo[]
  // finalExams: readonly ExamInfo[]
): readonly FullInfo[] {
  const map = new Map<string, Course>();
  processCourseInfoJson(map, courses);
  processExamInfoJson(map, prelimExams, 'prelim');
  // processExamInfoJson(map, finalExams, 'final');
  return Array.from(map.values()).map((course) => course.plainJs);
}
