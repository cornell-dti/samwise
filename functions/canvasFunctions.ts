import fetch, { Response } from 'node-fetch';

// export const scheduledFunctionCrontab = (): void => functions.pubsub.schedule('0 0 * * *')
//   .timeZone('America/New_York')
//   .onRun(() => {
//     // stuff
//   });

async function canvasGet(path: string, token: string): Promise<any>{
    const uri = `https://canvas.instructure.com/api/v1/${path}?access_token=${token}`;
    await fetch(uri, {
        method: 'GET'
    }).then((response: Response) => response.json())
        .then(json => {
            console.log(json);
        }).catch((err) => {
        console.log(err);
    });
}

canvasGet('courses', '9713~v6sFYkNFHbgXE3Bgo1JBLP7LO18t2aFCs6cvgbcLAOGPA6ejv51ozK8fV92Jq3Hs');