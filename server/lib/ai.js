import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function fallback(item) {
  const title = item.title || '오늘의 콘텐츠';
  return {
    score: 70,
    title,
    slides: [
      { heading: title, body: '오늘 주목할 만한 핵심 이슈입니다.' },
      { heading: '무엇이 중요한가', body: item.summary || '원문 내용을 바탕으로 핵심 맥락을 정리합니다.' },
      { heading: '핵심 포인트', body: '사람들이 궁금해할 내용을 짧고 명확하게 설명합니다.' },
      { heading: '실행 팁', body: '바로 적용할 수 있는 관점과 체크포인트를 제시합니다.' },
      { heading: '마무리', body: '저장해두고 다시 확인하세요.' }
    ],
    caption: `${title}\n\n핵심만 정리했습니다. 저장해두고 필요할 때 다시 확인하세요.`,
    hashtags: ['#피드자동화', '#콘텐츠운영', '#인스타그램', '#정보정리']
  };
}

export async function makePostPlan(item, brand = {}) {
  if (!client) return fallback(item);
  const prompt = `너는 개인용 인스타 피드 자동화 편집자다. 아래 원문을 보고 카드뉴스 5장을 만든다. JSON만 출력한다. 필드: score, title, slides[{heading,body}], caption, hashtags[]. 브랜드명:${brand.name || 'FeedFlow Auto'} 톤:${brand.tone || '명확하고 신뢰감 있는 전문가 톤'} 제목:${item.title} 요약:${item.summary || ''} 원문:${item.raw || ''}`;
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return fallback(item);
  }
}
