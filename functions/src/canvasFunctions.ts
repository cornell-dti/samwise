import fetch, { Response } from 'node-fetch';
// @ts-ignore
import { parse } from 'json-bigint';

function getUri(path: string, token: string): string {
  return `https://canvas.instructure.com/api/v1/${path}?access_token=${token}`;
}

async function canvasGetAssignments(token: string): Promise<any> {
  await fetch(getUri('courses', token), {
    method: 'GET',
  }).then((response: Response) => response.text())
    .then((json) => {
      getAssignments(token, parse(json));
    }).catch((err) => {
      console.log(err);
    });
}

async function getAssignments(token: string, data: JSON[]): Promise<void> {
  const assignmentList: JSON[] = [];
  await data.forEach((course) => {
    // @ts-ignore
    fetch(getUri(`courses/${course.id.toString()}/assignments`, token), {
      method: 'GET',
    }).then((response: Response) => response.text())
      .then((json) => {
        assignmentList.push(parse(json));
      }).catch((err) => {
        console.log(err);
      });
  });
  console.log(assignmentList);
}

canvasGetAssignments('9713~v6sFYkNFHbgXE3Bgo1JBLP7LO18t2aFCs6cvgbcLAOGPA6ejv51ozK8fV92Jq3Hs');
