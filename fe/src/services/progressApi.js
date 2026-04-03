import api from './api';

export const updateVideoProgress = (courseId, lessonId, percent) => {
  return api.post(`/progress/course/${courseId}/lesson/${lessonId}/video`, {
    videoPercent: percent,
  });
};

export const updateTextProgress = (courseId, lessonId, seconds) => {
  return api.post(`/progress/course/${courseId}/lesson/${lessonId}/text`, {
    textReadSeconds: seconds,
  });
};