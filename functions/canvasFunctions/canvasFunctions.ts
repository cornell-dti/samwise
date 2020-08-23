import fetch, { Response } from 'node-fetch';
import { parse } from 'json-bigint';

function getUri(path: string, token: string): string {
  return `https://canvas.instructure.com/api/v1/${path}?access_token=${token}`;
}

type Course = { readonly id: number };

async function getAssignments(token: string, data: readonly Course[]): Promise<void> {
  const assignmentList: JSON[] = [];
  await data.forEach((course) => {
    fetch(getUri(`courses/${course.id.toString()}/assignments`, token), {
      method: 'GET',
    }).then((response: Response) => response.text())
      .then((json) => {
        assignmentList.push(parse(json));
      });
  });
}

async function canvasGetAssignments(token: string): Promise<void> {
  const response = await fetch(getUri('courses', token), {
    method: 'GET',
  });
  const json = await response.text();
  await getAssignments(token, parse(json));
}

canvasGetAssignments('9713~v6sFYkNFHbgXE3Bgo1JBLP7LO18t2aFCs6cvgbcLAOGPA6ejv51ozK8fV92Jq3Hs');
