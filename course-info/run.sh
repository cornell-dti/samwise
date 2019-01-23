#!/bin/bash

set -x # Turn this on to debug

### Dependencies
### - JDK 8+
### - Gradle 4+
### - Python 3

# Outcome: produce a JSON file sp19-courses.json with all the courses in SP19.
function createCourseInfoJson {
    git clone https://github.com/SamChou19815/cornell-api-libs.git
    cd cornell-api-libs
    gradle build -x test
    cd ../
    java -jar cornell-api-libs/build/libs/cornell-api-lib-kotlin-0.4-all.jar \
    print-all-courses-in SP19 | python simplify-json.py > ./sp19-courses.json
    rm -rf ./cornell-api-libs
}

# Outcome: produce JSON files final-exams.json and prelim-exams.json.
function createExamInfoJson {
    python3 fetch-exam.py
}

# Outcome: produce a single JSON file that has course and exam info.
function mergeJson {
    python3 merge-json.py
}

# Outcome: Cleanup all the intermediate json files.
function cleanup {
    rm sp19-courses.json
    rm final-exams.json
    rm prelim-exams.json
}

# Comment out those parts you don't need

createCourseInfoJson
createExamInfoJson
mergeJson
cleanup
