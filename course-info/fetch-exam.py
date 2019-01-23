import requests
import pytz
import json
from typing import List
from datetime import datetime
from bs4 import BeautifulSoup

local_tz = pytz.timezone('America/New_York')
now = datetime.now()


class ExamInfo(object):
    subject: str
    course_number: str
    section_number: str
    time: str

    def __init__(self, subject: str, course_number: str,
                 section_number: str, time: str):
        self.subject = subject
        self.course_number = course_number
        self.section_number = section_number
        self.time = time

    def to_dict(self) -> dict:
        return dict(
            subject=self.subject, courseNumber=self.course_number,
            sectionNumber=self.section_number, time=self.time
        )

    @classmethod
    def parse_prelim_line(cls, line: str) -> 'ExamInfo':
        segments = line.split(sep=' ')
        datetime_str = ''
        for i in range(2, len(segments)):
            s = segments[i]
            if s == '':
                continue
            else:
                datetime_str = s
                break
        datetime_str += ' 7:30 PM'

        datetime_without_tz = datetime.strptime(
            datetime_str, '%m/%d/%Y %I:%M %p')
        datetime_with_tz = local_tz.localize(datetime_without_tz)
        datetime_in_utc: datetime = datetime_with_tz.astimezone(pytz.utc)

        return ExamInfo(
            subject=segments[0],
            course_number=segments[1],
            section_number='',
            time=datetime_in_utc.__str__().split('+')[0]
        )

    @classmethod
    def parse_final_line(cls, line: str) -> 'ExamInfo':
        segments = line.split(sep=' ')
        datetime_str = f'{now.year}'
        for i in range(3, len(segments)):
            s = segments[i]
            if s == '':
                continue
            datetime_str += ' '
            datetime_str += s
        datetime_str = datetime_str.strip()

        datetime_without_tz = datetime.strptime(
            datetime_str, '%Y %a, %b %d %I:%M %p')
        datetime_with_tz = local_tz.localize(datetime_without_tz)
        datetime_in_utc: datetime = datetime_with_tz.astimezone(pytz.utc)

        return ExamInfo(
            subject=segments[0],
            course_number=segments[1],
            section_number=segments[2],
            time=datetime_in_utc.__str__().split('+')[0]
        )


def get_exam_block(url: str) -> str:
    return BeautifulSoup(requests.get(url=url).text, 'html.parser').pre.string


def get_exam_info_list(url: str, is_final: bool) -> List[ExamInfo]:
    exam_block = get_exam_block(url=url)
    lines = exam_block.splitlines()
    info_list = []
    for line in lines:
        if line == '' or line.startswith('Class'):
            continue
        info = ExamInfo.parse_final_line(line) \
            if is_final \
            else ExamInfo.parse_prelim_line(line)
        info_list.append(info)
    return info_list


def create_json(url: str, is_final: bool, filename: str):
    exam_info_list = [
        info.to_dict()
        for info in get_exam_info_list(url=url, is_final=is_final)
    ]
    with open(filename, 'w') as outfile:
        json.dump(exam_info_list, outfile, indent=2, sort_keys=True)


if __name__ == '__main__':
    create_json(
        url='https://registrar.cornell.edu/exams/spring-final-exam-schedule',
        is_final=True,
        filename='final-exams.json'
    )
    create_json(
        url='https://registrar.cornell.edu/exams/spring-prelim-schedule',
        is_final=False,
        filename='prelim-exams.json'
    )
