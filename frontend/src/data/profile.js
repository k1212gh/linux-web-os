export const profile = {
  name: '김건희',
  nameEn: 'Kim Gunhui',
  title: '풀스택 개발자 / AI 엔지니어',
  email: 'k1212gh@tukorea.ac.kr',
  bio: '자연어로 소프트웨어를 설계하고, 에이전틱 AI와 함께 구현합니다.',
  links: [
    { label: 'GitHub', url: 'https://github.com/k1212gh' },
    { label: 'Email', url: 'mailto:k1212gh@tukorea.ac.kr' },
  ],
  skills: [
    { name: 'Claude Code / AI Tooling', level: 90, color: '#ff6b6b' },
    { name: 'Next.js / React', level: 85, color: '#3b82f6' },
    { name: 'Supabase / PostgreSQL', level: 80, color: '#22c55e' },
    { name: 'Git / GitHub', level: 80, color: '#888' },
    { name: 'TypeScript', level: 75, color: '#3178c6' },
    { name: 'Tailwind CSS', level: 75, color: '#38bdf8' },
    { name: 'Python / ML', level: 65, color: '#fbbf24' },
    { name: 'Docker / DevOps', level: 55, color: '#60a5fa' },
  ],
}

export const resume = {
  education: [
    { institution: '한국공학대학교', degree: '컴퓨터공학과', period: '2019.03 ~', icon: '🎓' },
  ],
  training: [
    {
      institution: '삼성 청년 SW 아카데미 (SSAFY)',
      detail: '14기 서울 캠퍼스',
      period: '2024.07 ~ 2025.06',
      description: 'Java/Python 풀스택 교육, 팀 프로젝트 3회 수행',
      icon: '🏫',
    },
  ],
  stackCategories: {
    Frontend: ['Next.js 15', 'React', 'Tailwind CSS', 'TypeScript'],
    Backend: ['Supabase', 'PostgreSQL', 'Redis (Upstash)', 'Node.js'],
    'AI/ML': ['Claude API', 'Voyage-3', 'EfficientNet', 'PyTorch'],
    DevOps: ['Vercel', 'Docker', 'GitHub Actions'],
    Tools: ['Claude Code', 'Git', 'Figma', 'VS Code'],
  },
}
