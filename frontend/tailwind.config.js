/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // 다크 모드: class 기반 (시스템 설정 연동)
  theme: {
    extend: {
      colors: {
        // === 보호자 웹앱: 딥블루 테마 ===
        primary: {
          DEFAULT: '#1E3A5F',   // 네이비 딥블루
          50: '#E8F4FC',        // 아이스 블루 (배경)
          100: '#C5E1F7',
          400: '#6B9BD2',       // 다크 모드용 밝은 블루
          500: '#1E3A5F',       // 메인
          600: '#2D5A87',       // 호버
        },
        accent: {
          DEFAULT: '#D4A574',   // 웜 골드
          light: '#F5E6D3',     // 크림
        },

        // === 로봇 LCD: 피치 테마 ===
        peach: {
          DEFAULT: '#FFAB91',   // 피치 오렌지
          light: '#FFCCBC',     // 라이트 피치
          bg: '#FFF8F5',        // 크림 배경
          text: '#5D4E37',      // 웜 브라운
        },

        // === 시맨틱 컬러 (상태) ===
        safe: {
          DEFAULT: '#22C55E',
          bg: '#E8F9F0',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FFF4E5',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: '#FFEFEF',
        },

        // === 그레이스케일 ===
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'large-number': ['48px', { lineHeight: '1.0', fontWeight: '700' }],
        // 로봇 LCD용 (큰 글씨)
        'lcd-title': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'lcd-body': ['32px', { lineHeight: '1.4', fontWeight: '400' }],
        'lcd-caption': ['24px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '20px',
        'space-6': '24px',
        'space-8': '32px',
        'space-10': '40px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.07)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.04)',
        'danger': '0 0 0 4px rgba(239,68,68,0.2)',
      },
    },
  },
  plugins: [],
};

