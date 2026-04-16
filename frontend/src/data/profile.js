export const profile = {
  name: '김건희',
  nameEn: 'Kim Gunhui',
  title: '풀스택 개발자 / AI 엔지니어',
  email: 'k1212gh@tukorea.ac.kr',
  bio: '자연어로 소프트웨어를 설계하고, 에이전틱 AI와 함께 구현합니다. 로컬 LLM 서빙부터 Web OS까지, 터미널 하나로 모든 것을 만듭니다.',
  links: [
    { label: 'GitHub', url: 'https://github.com/k1212gh' },
    { label: 'Blog', url: 'https://k1212gh.tistory.com/' },
    { label: 'Email', url: 'mailto:k1212gh@tukorea.ac.kr' },
  ],
  skills: [
    { name: 'Claude Code / AI Tooling', level: 90, color: '#ff6b6b' },
    { name: 'Next.js / React', level: 85, color: '#3b82f6' },
    { name: 'Python / FastAPI', level: 80, color: '#22c55e' },
    { name: 'Supabase / PostgreSQL', level: 80, color: '#3ecf8e' },
    { name: 'TypeScript', level: 75, color: '#3178c6' },
    { name: 'PyTorch / ML', level: 70, color: '#fbbf24' },
    { name: 'Git / CI·CD', level: 80, color: '#888' },
    { name: 'Docker / Linux', level: 65, color: '#60a5fa' },
    { name: 'LangChain / RAG', level: 65, color: '#7c3aed' },
    { name: 'ROCm / GPU Infra', level: 55, color: '#ef4444' },
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
      description: 'Java/Python 풀스택 교육, 프로젝트 3회 수행 (관통PJ, 핀테크PJ 등)',
      icon: '🏫',
    },
    {
      institution: '한컴 AI 아카데미',
      detail: 'AWS + AI 부트캠프',
      period: '2024',
      description: 'EC2 인프라 구축, Transfer Learning, LangChain 활용 실습',
      icon: '🧑‍💻',
    },
  ],
  certifications: [
    // 향후 추가
  ],
  awards: [
    { title: 'Hecto AI Challenge 2025', detail: '딥페이크 탐지 모델 개발', icon: '🏆' },
  ],
  stackCategories: {
    Frontend: ['Next.js 15', 'React 18', 'Tailwind CSS', 'TypeScript', 'Vite'],
    Backend: ['FastAPI', 'Supabase', 'PostgreSQL (pgvector)', 'Redis (Upstash)', 'Node.js'],
    'AI/ML': ['Claude API', 'Voyage-3 Embeddings', 'EfficientNet', 'PyTorch', 'LangChain', 'Ollama'],
    Infra: ['Docker', 'GitHub Actions', 'Vercel', 'WSL', 'ROCm', 'Tailscale', 'systemd'],
    Tools: ['Claude Code', 'Git', 'VS Code', 'MCP Protocol'],
  },
}
