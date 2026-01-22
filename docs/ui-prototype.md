📂 1. 디렉토리 구조 (Folder Structure)
확장성을 고려하여 도메인 중심의 구조를 제안합니다.

Plaintext

src/
├── components/
│   ├── dashboard/           # 대시보드 전용 컴포넌트
│   │   ├── StatusHeader.tsx # 실시간 상태 요약
│   │   ├── LiveMap.tsx      # SVG 맵 렌더러
│   │   ├── PatrolFeed.tsx   # 순찰 스냅샷 피드
│   │   └── QuickStats.tsx   # 복약/기기 상태 카드
│   └── shared/              # 공통 UI 컴포넌트 (Button, Card 등)
├── hooks/
│   ├── useWebSocket.ts      # 실시간 데이터 구독 훅
│   └── useFCM.ts            # 푸시 알림 설정 훅
├── store/
│   └── useRobotStore.ts     # 상태 관리 (Zustand 등)
└── types/
    └── robot.ts             # 데이터 타입 정의
🏗️ 2. 핵심 컴포넌트 설계 (Component Design)
A. 상태 관리 (State Management)
로봇의 실시간 위치, 배터리, 복약 상태를 전역적으로 관리합니다.

TypeScript

// src/store/useRobotStore.ts
import { create } from 'zustand';

interface RobotState {
  status: 'safe' | 'alert' | 'emergency';
  location: { x: number; y: number };
  battery: number;
  medicationCount: number;
  lastPatrolSnapshots: string[]; // S3 이미지 URL 리스트
  setRobotData: (data: Partial<RobotState>) => void;
}

export const useRobotStore = create<RobotState>((set) => ({
  status: 'safe',
  location: { x: 0, y: 0 },
  battery: 100,
  medicationCount: 0,
  lastPatrolSnapshots: [],
  setRobotData: (data) => set((state) => ({ ...state, ...data })),
}));
B. 실시간 대시보드 메인 (Dashboard Page)
TDS(Toss Design System) 스타일의 여백과 카드 레이아웃을 적용합니다.

TypeScript

// src/pages/Dashboard.tsx
import { StatusHeader } from '../components/dashboard/StatusHeader';
import { LiveMap } from '../components/dashboard/LiveMap';
import { PatrolFeed } from '../components/dashboard/PatrolFeed';
import { QuickStats } from '../components/dashboard/QuickStats';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* 1. 실시간 상태 요약 */}
      <StatusHeader />

      {/* 2. SVG 실시간 맵 */}
      <section className="bg-white rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">어머니 위치</h2>
        <LiveMap />
      </section>

      {/* 3. 순찰 스냅샷 피드 */}
      <PatrolFeed />

      {/* 4. 퀵 정보 (복약/기기) */}
      <QuickStats />
    </main>
  );
}
🖼️ 3. 주요 컴포넌트 상세 구현 가이드
LiveMap.tsx (SVG 맵 렌더러)
Gemini를 통해 생성된 SVG 집 구조 위에 로봇 좌표를 매핑합니다.

구현 포인트: 맵의 좌표계와 로봇의 실제 좌표계를 1:1로 매칭하는 viewBox 설정이 핵심입니다.

컴포넌트 특징: 로봇 아이콘에 transition을 주어 위치 이동을 부드럽게 시각화합니다.

PatrolFeed.tsx (순찰 스냅샷)
최신 순찰 사진을 가로 스크롤 형태로 나열합니다.

Toss UX: 사진 하단에 "10분 전 확인"과 같은 타임스탬프를 배치하여 신뢰도를 높입니다.

기능: 이미지 클릭 시 모달로 크게 보여주며, "현재 상태 이상 없음" 버튼으로 보호자의 인지 여부를 기록합니다.

📡 4. 실시간 통신 전략 (WebSocket Hooks)
백엔드(Spring Boot)로부터 로봇의 상태를 실시간으로 전달받는 커스텀 훅입니다.

TypeScript

// src/hooks/useWebSocket.ts
import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useRobotStore } from '../store/useRobotStore';

export const useWebSocket = (robotId: string) => {
  const setRobotData = useRobotStore((state) => state.setRobotData);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://your-api-url/ws',
      onConnect: () => {
        client.subscribe(`/topic/robot/${robotId}`, (message) => {
          const data = JSON.parse(message.body);
          setRobotData(data); // 전역 상태 업데이트
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [robotId, setRobotData]);
};
✅ 개발 체크리스트 (프론트엔드)
[ ] PWA 설정: 브라우저를 닫아도 알림을 받을 수 있도록 service-worker.js 구성

[ ] FCM 연동: 긴급 상황 발생 시 푸시 알림 수신 로직 구현

[ ] SVG 최적화: Gemini가 생성한 SVG의 path 데이터를 리액트 컴포넌트로 변환