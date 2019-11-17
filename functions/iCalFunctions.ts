import {fromURL} from 'ical'

let calLink: string = '';
function parseICal(link:string):void{
    fromURL(link, {}, function (err, data) {
        // console.log(err);
        // console.log(data);
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                var ev = data[k];
                if (data[k].type == 'VEVENT') {
                    console.log(ev['summary']);
                    console.log(new Date(ev['end']));
                }
            }
        }
    });
}

parseICal(calLink);