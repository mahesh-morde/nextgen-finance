export const REPORT_DATA = {
  perf: Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC.PERF_${i + 1}`),
  tax: Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC.TAX_${i + 1}`),
  div: Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC.DIV_${i + 1}`),
  ai: Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC.AI_${i + 1}`)
};

export function generateRealisticParagraphs(type: string, count: number): string[] {
  const source = REPORT_DATA[type as keyof typeof REPORT_DATA] || REPORT_DATA.perf;
  const result: string[] = [];
  let index = 0;
  
  // Randomize the starting point for variety
  const startIndex = Math.floor(Math.random() * source.length);
  
  for (let i = 0; i < count; i++) {
    // Generate thick paragraphs by combining 2-3 sentences from the source
    let paragraph = "";
    const sentencesPerParagraph = Math.floor(Math.random() * 2) + 2; // 2 to 3 sentences
    
    for (let j = 0; j < sentencesPerParagraph; j++) {
      const sentence = source[(startIndex + index) % source.length];
      paragraph += sentence + " ";
      index++;
    }
    
    result.push(paragraph.trim());
  }
  
  return result;
}
