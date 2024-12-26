// Здесь мы реализуем функцию для вычисления косинусного сходства
// и функцию getRecommendedCourses.

function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, current, i) => sum + current * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  export function getRecommendedCourses(userVector, courses, topN = 5) {
    const scoredCourses = courses.map(course => {
      const sim = cosineSimilarity(userVector, course.embedding);
      return { ...course, similarity: sim };
    });
  
    scoredCourses.sort((a, b) => b.similarity - a.similarity);
    return scoredCourses.slice(0, topN);
  }
  