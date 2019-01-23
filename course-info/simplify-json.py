import json
import sys


if __name__ == "__main__":
    simplified_course_list = [
        dict(
            courseId=course_json['crseId'],
            subject=course_json['subject'],
            courseNumber=course_json['catalogNbr'],
            title=course_json['titleShort']
        ) for course_json in json.load(sys.stdin)
    ]
    json.dump(simplified_course_list, sys.stdout, indent=2, sort_keys=True)
