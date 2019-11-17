import fetch, {Response} from 'node-fetch';
import {parse, stringify} from 'json-bigint';

// export const scheduledFunctionCrontab = (): void => functions.pubsub.schedule('0 0 * * *')
//   .timeZone('America/New_York')
//   .onRun(() => {
//     // stuff
//   });

function getUri(path: string, token: string) {
    return `https://canvas.instructure.com/api/v1/${path}?access_token=${token}`;
}

async function canvasGetAssignments(token: string): Promise<any> {
    await fetch(getUri("courses", token), {
        method: 'GET'
    }).then((response: Response) => response.text())
        .then(json => {
            getAssignments(token, parse(json));
        }).catch((err) => {
            console.log(err);
        });
}

async function getAssignments(token: string, data: JSON[]) {
    let assignmentList = [];
    await data.forEach(course => {
        fetch(getUri(`courses/${course["id"].toString()}/assignments`, token), {
            method: 'GET'
        }).then((response: Response) => response.text())
            .then(json => {
                // console.log(getUri(`courses/${course["id"]}/assignments`, token));
                assignmentList.push(parse(json));
                // console.log(parse(json));
            }).catch((err) => {
            console.log(err);
        });
    });
    console.log(assignmentList);
};

canvasGetAssignments('9713~v6sFYkNFHbgXE3Bgo1JBLP7LO18t2aFCs6cvgbcLAOGPA6ejv51ozK8fV92Jq3Hs');