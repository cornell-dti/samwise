const fs = require('fs');

class Course {
  constructor(courseId, subject, courseNumber, title) {
    this.courseId = courseId;
    this.subject = subject;
    this.courseNumber = courseNumber;
    this.title = title;
    this.examTimes = new Map();
  }

  get identifier() {
    return `${this.subject}${this.courseNumber}`;
  }

  get plainJs() {
    const examTimes = [];
    this.examTimes.forEach((time, type) => {
      examTimes.push({
        type,
        time,
      });
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

function processCourseInfoJson(map, json) {
  json.forEach(({ courseId, subject, courseNumber, title }) => {
    const course = new Course(courseId, subject, courseNumber, title);
    map.set(course.identifier, course);
  });
}

function processExamInfoJson(map, json, type) {
  json.forEach(({ subject, courseNumber, time }) => {
    const identifier = `${subject}${courseNumber}`;
    const course = map.get(identifier);
    if (course == null) {
      console.log(`Warning: the exam at ${time} for ${identifier} is not found in course info.`);
      return;
    }
    course.examTimes.set(identifier, { type, time });
  });
}

function main() {
  const map = new Map();
  processCourseInfoJson(map, JSON.parse(fs.readFileSync('sp19-courses.json', 'utf8')));
  processExamInfoJson(map, JSON.parse(fs.readFileSync('final-exams.json', 'utf8')), 'final');
  processExamInfoJson(map, JSON.parse(fs.readFileSync('prelim-exams.json', 'utf8')), 'prelim');
  const result = Array.from(map.values()).map(it => it.plainJs);
  fs.writeFile('sp19-courses-with-exams-min.json', JSON.stringify(result), () => {
    console.log('Done');
  });
}

main();
