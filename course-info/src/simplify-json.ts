import { readFile } from 'fs';
import { CourseInfo } from './types';

function main(): void {
  readFile(0 /* stdin */, 'utf8', (err, data) => {
    if (err) { throw err; }
    const complexCourseList = JSON.parse(data);
    const simplifiedCourseList = complexCourseList.map(
      ({ crseId: courseId, subject, catalogNbr: courseNumber, titleShort: title }): CourseInfo => ({
        courseId,
        subject,
        courseNumber,
        title,
      }),
    );
    // Need console.log to output to stdout.
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(simplifiedCourseList));
  });
}

main();
