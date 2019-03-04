const fs = require('fs');

function main() {
  fs.readFile(0 /* stdin */, 'utf8', (err, data) => {
    if (err) { throw err; }
    const complexCourseList = JSON.parse(data);
    const simplifiedCourseList = complexCourseList.map(
      ({ crseId: courseId, subject, catalogNbr: courseNumber, titleShort: title }) => ({
        courseId,
        subject,
        courseNumber,
        title,
      }),
    );
    console.log(JSON.stringify(simplifiedCourseList));
  });
}

main();
