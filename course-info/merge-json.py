import json
from typing import Dict, Set


class Info(object):
    course_id: int
    subject: str
    course_number: str
    title: str
    time: Set[str]

    def __init__(self, course_id: int, subject: str, course_number: str,
                 title: str):
        self.course_id = course_id
        self.subject = subject
        self.course_number = course_number
        self.title = title
        self.time = set()

    def identifier(self) -> str:
        return f'{self.subject}{self.course_number}'

    def to_dict(self):
        return dict(
            courseId=self.course_id,
            subject=self.subject,
            courseNumber=self.course_number,
            title=self.title,
            times=[t for t in self.time]
        )


def process_courses_info_json(dictionary: Dict[str, Info], courses_info_json):
    for one_course in courses_info_json:
        info = Info(
            course_id=one_course['courseId'],
            subject=one_course['subject'],
            course_number=one_course['courseNumber'],
            title=one_course['title']
        )
        dictionary[info.identifier()] = info


def process_exam_info_json(dictionary: Dict[str, Info], exam_info_json):
    for one_exam in exam_info_json:
        subject = one_exam['subject']
        course_number = one_exam['courseNumber']
        time = one_exam['time']
        identifier = f'{subject}{course_number}'
        info = dictionary.get(identifier)
        if info is None:
            print(f'Warning: the exam at {time} for {identifier} is not found '
                  f'in course info!')
            continue
        info.time.add(time)


if __name__ == '__main__':
    d: Dict[str, Info] = dict()
    with open('sp19-courses.json') as f:
        process_courses_info_json(dictionary=d, courses_info_json=json.load(f))
    with open('final-exams.json') as f:
        process_exam_info_json(dictionary=d, exam_info_json=json.load(f))
    with open('prelim-exams.json') as f:
        process_exam_info_json(dictionary=d, exam_info_json=json.load(f))
    values = [info.to_dict() for info in d.values()]
    with open('../backend/app/sp19-courses-with-exams.json', 'w') as outfile:
        json.dump(values, outfile, indent=2, sort_keys=True)
    with open('../backend/app/sp19-courses-with-exams-min.json', 'w') as outfile:
        json.dump(values, outfile)

