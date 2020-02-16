export type CourseInfo = {
  readonly courseId: number;
  readonly subject: string;
  readonly courseNumber: string;
  readonly title: string;
};

export type ExamInfo = {
  readonly subject: string;
  readonly courseNumber: string;
  readonly sectionNumber: string;
  readonly time: number;
};

export type ExamType = 'prelim' | 'final';

export type ExamTimeType = { readonly type: ExamType; readonly time: number };

export type FullInfo = {
  readonly courseId: number;
  readonly subject: string;
  readonly courseNumber: string;
  readonly title: string;
  readonly examTimes: readonly ExamTimeType[];
};
