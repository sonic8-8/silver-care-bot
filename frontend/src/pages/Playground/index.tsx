/**
 * 🎨 Playground - 디자인 작업용 단일 파일
 * impl.html 기반 전체 화면 + 딥블루 테마 + 다크 모드
 */
import { useState, useEffect } from 'react';
import { useThemeStore } from '../../shared/store/themeStore';
import RobotLCD from './RobotLCD';
import {
  Bell, ChevronRight, Home, Bot, Pill, Calendar,
  Settings, User, LogOut, Battery, Wifi, AlertCircle,
  CheckCircle2, Plus, ChevronLeft, Mail, Lock,
  Phone, MapPin, Activity, Camera, ArrowRight,
  Sofa, Utensils, Bed, Bath, Zap, Mic,
  Monitor, X, CloudSun, Sun, Moon,
  FileText, BatteryCharging, Siren,
  Key, Hash, Hand, Flame, DoorClosed, Smile,
  Stethoscope, Sunrise
} from 'lucide-react';

// ============================================
// 🧱 Shared Components
// ============================================
const Button = ({ children, variant = 'primary', size = 'lg', className = '', ...props }: any) => {
  const baseStyle = "w-full min-h-[48px] font-semibold transition-all active:scale-[0.98] flex items-center justify-center";
  const sizes: Record<string, string> = {
    sm: "py-2.5 px-3 text-xs rounded-md",
    md: "py-3 px-4 text-sm rounded-lg",
    lg: "py-4 px-4 text-[15px] rounded-lg"
  };
  const variants: Record<string, string> = {
    primary: "bg-primary-500 text-white hover:bg-primary-600 ring-1 ring-primary-200/70 dark:ring-2 dark:ring-primary-400/40",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
    danger: "bg-danger text-white hover:bg-danger/90",
    white: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700",
    dark: "bg-gray-900 text-white hover:bg-black dark:bg-primary-600 dark:hover:bg-primary-500"
  };
  const variantClass = variants[variant] || "text-primary-500 dark:text-primary-400";
  return (
    <button className={`${baseStyle} ${sizes[size]} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-[24px] p-5 shadow-card border border-gray-100 dark:border-gray-600 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}>
    {children}
  </div>
);

const Header = ({ title, leftIcon, rightIcon, onLeftClick, onRightClick, transparent = false }: any) => (
  <div className={`sticky top-0 z-50 flex items-center justify-between px-4 min-h-[56px] transition-all ${transparent ? 'bg-transparent text-white' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white'}`}>
    <div className="w-12 flex items-center">
      {leftIcon && (
        <button onClick={onLeftClick} className={`w-12 h-12 -ml-2 flex items-center justify-center rounded-full transition-colors ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          {leftIcon}
        </button>
      )}
    </div>
    <div className="font-bold text-[17px]">{title}</div>
    <div className="w-12 flex justify-end items-center">
      {rightIcon && (
        <button onClick={onRightClick} className={`w-12 h-12 -mr-2 relative flex items-center justify-center rounded-full transition-colors ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          {rightIcon}
        </button>
      )}
    </div>
  </div>
);

const Badge = ({ status, text }: any) => {
  const styles: Record<string, any> = {
    safe: { className: "bg-safe-bg text-safe", icon: CheckCircle2 },
    warning: { className: "bg-warning-bg text-warning", icon: AlertCircle },
    danger: { className: "bg-danger-bg text-danger", icon: AlertCircle },
    neutral: { className: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-200", icon: Activity }
  };
  const s = styles[status] || styles.neutral;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-[8px] text-[11px] font-bold ${s.className}`}>
      <Icon size={12} className="mr-1" />{text}
    </span>
  );
};

const Input = ({ label, type = "text", placeholder, value, icon, className }: any) => (
  <div className={`bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-600 focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all ${className}`}>
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-200 mb-1.5">{label}</label>
    <div className="flex items-center">
      <input type={type} placeholder={placeholder} defaultValue={value} className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-semibold placeholder-gray-300 dark:placeholder-gray-600 text-[15px]" />
      {icon && <span className="text-gray-400 dark:text-gray-300 ml-2">{icon}</span>}
    </div>
  </div>
);

const SectionHeader = ({ title, action }: any) => (
  <div className="flex justify-between items-center mb-3 mt-2 px-1">
    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
    {action && action}
  </div>
);

// ============================================
// 📱 Guardian App Screens
// ============================================
const LoginScreen = ({ onLogin, onSignup }: any) => {
  const [role, setRole] = useState('guardian');
  const { setMode: setThemeMode, resolvedTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center p-6">
      {/* 테마 토글 (설정 미리보기용) */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-[28px] mx-auto mb-6 flex items-center justify-center text-white shadow-[0_10px_40px_rgba(30,58,95,0.25)] bg-primary-500">
          <Bot size={36} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI 반려로봇</h1>
        <p className="text-gray-500 dark:text-gray-200">어르신의 안전한 하루를 지켜드려요</p>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex mb-8">
        <button onClick={() => setRole('guardian')} className={`flex-1 min-h-[48px] py-3 rounded-xl text-sm font-bold transition-all duration-200 ${role === 'guardian' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-300'}`}>보호자/가족</button>
        <button onClick={() => setRole('robot')} className={`flex-1 min-h-[48px] py-3 rounded-xl text-sm font-bold transition-all duration-200 ${role === 'robot' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-300'}`}>로봇 본체</button>
      </div>

      <div className="space-y-4">
        {role === 'guardian' ? (
          <>
            <Input label="이메일" type="email" value="worker@toss.im" icon={<Mail size={18} />} />
            <Input label="비밀번호" type="password" value="12341234" icon={<Lock size={18} />} />
            <div className="pt-2"><Button onClick={() => onLogin('guardian')}>로그인</Button></div>
            <div className="flex justify-center mt-2">
              <button className="min-h-[44px] px-3 text-xs text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100">비밀번호를 잊으셨나요?</button>
            </div>
            <div className="flex justify-center items-center space-x-2">
              <span className="text-xs text-gray-400 dark:text-gray-300">계정이 없으신가요?</span>
              <button onClick={onSignup} className="min-h-[44px] px-3 text-xs font-bold text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-100">회원가입</button>
            </div>
          </>
        ) : (
          <>
            <Input label="기기 시리얼 넘버" type="text" value="ROBOT-2026-X82" icon={<Hash size={18} />} />
            <Input label="인증 코드" type="password" value="9999" icon={<Key size={18} />} />
            <div className="pt-2"><Button onClick={() => onLogin('robot')}>로봇 시작하기</Button></div>
            <div className="h-[44px] mt-2"></div>
            <div className="flex justify-center items-center min-h-[44px]">
              <p className="text-xs text-gray-400 dark:text-gray-200">로봇의 LCD 화면에서 실행되는 모드입니다.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SignupScreen = ({ onBack, onComplete }: any) => (
  <div className="min-h-screen bg-white dark:bg-gray-900 p-6 pb-safe">
    <div className="flex items-center mb-8">
      <button onClick={onBack} className="w-12 h-12 -ml-2 flex items-center justify-center text-gray-800 dark:text-white"><ChevronLeft size={24} /></button>
      <span className="font-bold text-lg ml-2 dark:text-white">회원가입</span>
    </div>
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
          <Hand size={18} className="mr-2 text-primary-500 dark:text-primary-400" />
          환영합니다!
        </h2>
        <p className="text-gray-500 dark:text-gray-200 text-sm">보호자(복지사) 계정을 생성합니다.</p>
      </div>
      <div className="space-y-3">
        <Input label="이름 *" placeholder="실명을 입력하세요" />
        <Input label="이메일 *" placeholder="example@email.com" />
        <div>
          <Input label="비밀번호 *" type="password" placeholder="8자 이상 입력" />
          <p className="text-[11px] text-gray-400 dark:text-gray-300 flex items-center ml-1 mt-1"><AlertCircle size={10} className="mr-1" /> 8자 이상, 영문/숫자 조합</p>
        </div>
        <Input label="연락처" placeholder="010-0000-0000" />
      </div>
      <div className="pt-4"><Button onClick={onComplete}>가입하기</Button></div>
    </div>
  </div>
);

const ElderSelectScreen = ({ onSelect, onSettings, onEmergency }: any) => {
  const elders = [
    { id: 1, name: '박영자', age: 82, status: 'danger', lastCheck: '5분 전', location: '낙상 감지됨' },
    { id: 2, name: '김옥분', age: 80, status: 'safe', lastCheck: '10분 전', location: '안전' },
    { id: 3, name: '이순희', age: 78, status: 'safe', lastCheck: '25분 전', location: '안전' },
    { id: 4, name: '최영수', age: 85, status: 'warning', lastCheck: '2시간 전', location: '외출 중' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-safe">
      <Header title="관리 대상 선택" rightIcon={<Settings size={20} />} onRightClick={onSettings} />
      <div className="p-5 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-600">
          <h2 className="text-[20px] font-bold text-gray-900 dark:text-white mb-1 flex items-center">
            <Hand size={18} className="mr-2 text-primary-500 dark:text-primary-400" />
            안녕하세요, 김복지사님
          </h2>
          <p className="text-gray-500 dark:text-gray-200 text-[14px]">오늘 관리 대상: <span className="font-bold text-primary-500 dark:text-primary-400">4명</span></p>
        </div>

        {elders.some(e => e.status === 'danger') && (
          <div className="animate-pulse">
            <div className="mb-2 font-bold text-sm flex items-center ml-1 text-danger">
              <div className="w-2 h-2 rounded-full mr-2 animate-ping bg-danger"></div>긴급 상황 (1명)
            </div>
            {elders.filter(e => e.status === 'danger').map(elder => (
              <Card key={elder.id} onClick={() => onEmergency(elder)} className="border-2 relative overflow-hidden cursor-pointer shadow-md border-danger/30 bg-danger-bg">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-danger"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{elder.name} 님</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-200">· {elder.age}세</span>
                    </div>
                    <p className="font-bold mt-1 text-[15px] flex items-center text-danger">
                      <Siren size={16} className="mr-1" /> {elder.location}
                    </p>
                  </div>
                  <Badge status="danger" text="긴급" />
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center border-danger/30">
                  <span className="text-xs font-medium text-danger">{elder.lastCheck}</span>
                  <span className="text-sm font-bold flex items-center bg-white/60 dark:bg-gray-700/60 px-3 py-1.5 rounded-lg shadow-sm text-danger">즉시 확인 <ChevronRight size={16} /></span>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-200">정상 목록 ({elders.filter(e => e.status !== 'danger').length}명)</p>
          </div>
          {elders.filter(e => e.status !== 'danger').map(elder => (
            <Card key={elder.id} onClick={() => onSelect(elder)} className="active:scale-[0.98] transition-transform hover:shadow-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${elder.status === 'safe' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30'}`}>{elder.name[0]}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">{elder.name} 님</h3>
                      <Badge status={elder.status} text={elder.status === 'safe' ? '안전' : '외출'} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-200 mt-0.5 flex items-center">
                      {elder.lastCheck}
                      <span className="mx-1">·</span>
                      {elder.status === 'safe' ? (
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 rounded-full bg-safe mr-1"></span>정상 활동 중
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 rounded-full bg-warning mr-1"></span>병원 예약
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 dark:text-gray-300" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardScreen = ({ elder, onBack, onNoti, onHistory }: any) => {
  if (!elder) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-200">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Header
        leftIcon={<ChevronLeft size={24} />}
        onLeftClick={onBack}
        title={<div className="flex items-center space-x-1"><span>{elder.name} 님</span><span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-200">▼</span></div>}
        rightIcon={<Bell size={24} />}
        onRightClick={onNoti}
      />
      <div className="p-5 space-y-6">
        <Card className="text-center py-8">
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full shadow-md bg-primary-50 dark:bg-primary-500/20">
            <Smile size={36} className="text-primary-500 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">"{elder.name} 님은 안전합니다"</h2>
          <p className="text-sm text-gray-500 dark:text-gray-200 mb-6 flex items-center justify-center">
            마지막 확인: 오전 10:23
            <span className="font-bold ml-2 inline-flex items-center text-safe">
              <span className="w-2 h-2 rounded-full bg-safe mr-1"></span>정상
            </span>
          </p>
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-600 pt-6">
            <div onClick={onHistory} className="cursor-pointer active:opacity-70">
              <div className="text-sm text-gray-400 dark:text-gray-300 mb-1 flex items-center justify-center">
                <Sunrise size={14} className="mr-1" /> 기상
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">07:30</div>
            </div>
            <div className="border-l border-gray-100 dark:border-gray-600">
              <div className="text-sm text-gray-400 dark:text-gray-300 mb-1 flex items-center justify-center">
                <Pill size={14} className="mr-1" /> 복약
              </div>
              <div className="text-lg font-bold text-primary-500 dark:text-primary-400">1/2</div>
            </div>
            <div className="border-l border-gray-100 dark:border-gray-600">
              <div className="text-sm text-gray-400 dark:text-gray-300 mb-1 flex items-center justify-center">
                <Activity size={14} className="mr-1" /> 활동
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">보통</div>
            </div>
          </div>
        </Card>

        <section>
          <SectionHeader title="안심 지도" action={<button className="min-h-[48px] px-2 text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-100">전체보기 →</button>} />
          <Card className="h-56 relative overflow-hidden border border-gray-200 dark:border-gray-600 !p-0 bg-gray-50 dark:bg-gray-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2 w-3/4 h-3/4 opacity-50">
                {['침실', '거실', '화장실', '주방'].map(r => (
                  <div key={r} className="border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-xs text-gray-400 dark:text-gray-300 bg-white dark:bg-gray-800">{r}</div>
                ))}
              </div>
              <div className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-ping absolute opacity-75 bg-primary-500"></div>
                <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg relative z-10 bg-primary-500"></div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow-sm absolute -top-8 -left-4 whitespace-nowrap flex items-center">
                  <Bot size={12} className="mr-1" /> 로봇 (거실)
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeader title="순찰 피드" />
          <div className="flex justify-center gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
            {[{ label: '가스밸브', status: '정상', time: '09:30', icon: Flame }, { label: '현관문', status: '잠김', time: '09:32', icon: DoorClosed }, { label: '콘센트', status: '정상', time: '09:35', icon: Zap }].map((item, idx) => (
              <div key={idx} className="flex-shrink-0 w-32 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 flex flex-col items-center text-center">
                <div className="text-2xl mb-2 flex items-center justify-center">
                  <item.icon size={24} className={item.icon === Zap ? 'text-warning' : 'text-gray-700 dark:text-gray-200'} />
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">{item.label}</div>
                <div className="text-xs font-medium mb-2 flex items-center justify-center text-safe">
                  <div className="w-1.5 h-1.5 rounded-full mr-1 bg-safe"></div>
                  {item.status}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-300">{item.time}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="로봇 상태" />
          <Card className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2"><Battery className="text-safe" size={20} /><span className="font-bold text-gray-900 dark:text-white">85%</span></div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center space-x-2"><Wifi className="text-primary-500 dark:text-primary-400" size={20} /><span className="font-bold text-gray-900 dark:text-white">연결됨</span></div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center space-x-2"><Pill className="text-peach" size={20} /><span className="font-bold text-gray-900 dark:text-white">3개 남음</span></div>
          </Card>
        </section>
      </div>
    </div>
  );
};

// 더보기 화면 (설정)
const SettingsScreen = ({ onBack, onLogout }: any) => {
  const { mode, setMode, resolvedTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Header leftIcon={<ChevronLeft size={24} />} onLeftClick={onBack} title="설정" />
      <div className="p-5 space-y-6">
        {/* 프로필 */}
        <section>
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center text-base"><User size={18} className="mr-2 text-gray-500 dark:text-gray-300" /> 내 정보</h3>
          </div>
          <Card className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User size={22} className="text-gray-600 dark:text-gray-200" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">김복지 (복지사)</h4>
                <p className="text-sm text-gray-500 dark:text-gray-200">welfare@example.com</p>
              </div>
            </div>
            <button className="min-h-[48px] text-sm font-bold px-4 rounded-lg text-primary-500 bg-primary-50 dark:bg-primary-500/20 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-500/30 border border-primary-200 dark:border-primary-400/40">수정</button>
          </Card>
        </section>

        {/* 테마 설정 */}
        <section>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1 flex items-center text-base">
            {resolvedTheme === 'dark' ? <Moon size={18} className="mr-2 text-gray-500 dark:text-gray-300" /> : <Sun size={18} className="mr-2 text-gray-500 dark:text-gray-300" />}
            화면 테마
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-100 dark:border-gray-600 overflow-hidden shadow-sm">
            {[
              { value: 'system', label: '시스템 설정', desc: '기기 설정에 따라 자동 변경' },
              { value: 'light', label: '라이트 모드', desc: '항상 밝은 화면' },
              { value: 'dark', label: '다크 모드', desc: '항상 어두운 화면' }
            ].map((item, i) => (
              <div
                key={item.value}
                onClick={() => setMode(item.value as any)}
                className={`flex justify-between items-center p-4 ${i !== 2 ? 'border-b border-gray-50 dark:border-gray-600' : ''} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`}
              >
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-[15px]">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">{item.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode === item.value ? 'border-primary-500 dark:border-primary-400' : 'border-gray-300 dark:border-gray-600'}`}>
                  {mode === item.value && <div className="w-3 h-3 rounded-full bg-primary-500 dark:bg-primary-400"></div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 알림 설정 */}
        <section>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1 flex items-center text-base">
            <Bell size={18} className="mr-2 text-gray-500 dark:text-gray-300" /> 알림 설정
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-100 dark:border-gray-600 overflow-hidden shadow-sm">
            {[
              { label: '긴급 알림', desc: '낙상, 미활동 등 위험 감지', on: true },
              { label: '복약 알림', desc: '약 복용/미복용 확인', on: true },
              { label: '일상 알림', desc: '기상, 식사 등 생활 패턴', on: false },
              { label: '이메일 알림', desc: '중요 알림을 이메일로 전송', on: false }
            ].map((item, i) => (
              <div key={i} className={`flex justify-between items-center p-4 ${i !== 3 ? 'border-b border-gray-50 dark:border-gray-600' : ''} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-[15px]">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">{item.desc}</div>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${item.on ? 'bg-primary-500 dark:bg-primary-400' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${item.on ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 로봇 설정 */}
        <section>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1 flex items-center text-base">
            <Bot size={18} className="mr-2 text-gray-500 dark:text-gray-300" /> 로봇 설정
          </h3>
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-[15px]">아침 약 알림 시간</div>
                <div className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">매일 반복</div>
              </div>
                <div className="min-h-[48px] flex items-center px-4 py-2 rounded-lg font-bold text-primary-500 bg-primary-50 dark:bg-primary-500/20 dark:text-primary-100 border border-primary-200 dark:border-primary-400/40">08:00</div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-[15px]">저녁 약 알림 시간</div>
                  <div className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">매일 반복</div>
                </div>
                <div className="min-h-[48px] flex items-center px-4 py-2 rounded-lg font-bold text-primary-500 bg-primary-50 dark:bg-primary-500/20 dark:text-primary-100 border border-primary-200 dark:border-primary-400/40">19:00</div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-[15px]">TTS 볼륨</div>
                  <div className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">음성 안내 크기</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-primary-500 dark:bg-primary-400"></div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm min-w-[35px]">70%</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-[15px]">순찰 시간대</div>
                  <div className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">자동 순찰 활성화</div>
                </div>
                <div className="min-h-[48px] flex items-center px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 text-sm">09:00-18:00</div>
              </div>
            </div>
          </Card>
        </section>

        {/* 긴급 연락처 */}
        <section>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1 flex items-center text-base">
            <Phone size={18} className="mr-2 text-gray-500 dark:text-gray-300" /> 긴급 연락처
          </h3>
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-[15px]">1순위</div>
                <div className="text-sm text-gray-500 dark:text-gray-200 mt-0.5">010-1234-5678 (자녀)</div>
              </div>
              <button className="min-h-[48px] text-sm font-bold px-4 rounded-lg text-primary-500 bg-primary-50 dark:bg-primary-500/20 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-500/30 border border-primary-200 dark:border-primary-400/40">수정</button>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-[15px]">2순위</div>
                  <div className="text-sm text-gray-500 dark:text-gray-200 mt-0.5">010-8765-4321 (복지사)</div>
                </div>
                <button className="min-h-[48px] text-sm font-bold px-4 rounded-lg text-primary-500 bg-primary-50 dark:bg-primary-500/20 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-500/30 border border-primary-200 dark:border-primary-400/40">수정</button>
              </div>
            </div>
          </Card>
        </section>

        <div className="pt-4 pb-8">
          <button onClick={onLogout} className="w-full min-h-[48px] py-4 text-gray-400 dark:text-gray-300 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors">로그아웃</button>
        </div>
      </div>
    </div>
  );
};

// 일정 관리 화면
const ScheduleScreen = ({ onBack }: any) => {
  const dates = [
    { d: '월', v: 18 }, { d: '화', v: 19 }, { d: '수', v: 20, today: true },
    { d: '목', v: 21 }, { d: '금', v: 22 }, { d: '토', v: 23 }, { d: '일', v: 24 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Header leftIcon={<ChevronLeft size={24} />} onLeftClick={onBack} title="일정 관리" />
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-600 pb-4">
        <div className="flex justify-between items-center px-6 py-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">2026년 1월</span>
          <div className="flex space-x-4 text-gray-400 dark:text-gray-300">
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronLeft size={20} /></button>
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="flex justify-between px-4 mt-1 text-center">
          {dates.map((item, i) => (
            <div key={i} className={`flex flex-col items-center w-10 py-2 rounded-xl transition-colors cursor-pointer ${item.today ? 'bg-primary-50 dark:bg-primary-400/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <span className={`text-xs mb-1 ${item.today ? 'text-primary-500 font-bold dark:text-primary-100' : 'text-gray-400 dark:text-gray-300'}`}>{item.d}</span>
              <span className={`text-[15px] ${item.today ? 'font-bold text-primary-600 dark:text-primary-100' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>{item.v}</span>
              {item.today && <div className="w-1 h-1 rounded-full mt-1.5 bg-primary-500 dark:bg-primary-300"></div>}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-[20px] shadow-sm border border-blue-100 dark:border-primary-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 dark:bg-primary-400"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2 font-bold text-sm text-primary-500 dark:text-primary-400">
              <div className="p-1 rounded-full bg-primary-50 dark:bg-primary-500/20"><Mic size={12} className="text-primary-500 dark:text-primary-100" /></div>
              <span>음성으로 등록된 일정 (1건)</span>
            </div>
          </div>
          <div className="pl-1">
            <div className="flex items-center mb-1">
              <Mic size={18} className="mr-2 text-primary-500 dark:text-primary-400" />
              <p className="text-[15px] font-bold text-gray-900 dark:text-white">"손자 생일 케이크 사기"</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-200 pl-7">01/22 (수) · 어르신이 직접 등록</p>
          </div>
        </div>
        <div className="pt-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1월 20일 (월) - 오늘</h3>
          <Card className="mb-3 flex items-start space-x-4 border-l-0">
            <div className="flex flex-col items-center space-y-1 pt-1">
              <div className="text-2xl bg-gray-50 dark:bg-gray-700 p-2 rounded-xl">
                <Stethoscope size={20} className="text-gray-600 dark:text-gray-200" />
              </div>
            </div>
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-900 dark:text-white text-[16px]">병원 예약</h4>
                <span className="text-xs font-bold px-2 py-1 rounded bg-warning-bg text-warning">2시간 전</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">오후 2:00 · 내과 정기검진</p>
              <p className="text-xs text-gray-400 dark:text-gray-300 mt-0.5 flex items-center"><MapPin size={10} className="mr-1" /> 서울대병원</p>
            </div>
          </Card>
          <Card className="flex items-start space-x-4 opacity-50">
            <div className="flex flex-col items-center space-y-1 pt-1">
              <div className="text-2xl bg-gray-50 dark:bg-gray-700 p-2 rounded-xl">
                <Pill size={20} className="text-gray-600 dark:text-gray-200" />
              </div>
            </div>
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 dark:text-white text-[16px] line-through">아침 약 복용</h4>
                <CheckCircle2 size={16} className="text-safe" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">오전 8:00 · 완료</p>
            </div>
          </Card>
        </div>
        <Button variant="primary" className="mt-4 shadow-[0_4px_14px_rgba(30,58,95,0.25)]">
          <Plus size={18} className="mr-2" /> 일정 추가
        </Button>
      </div>
    </div>
  );
};

// 로봇 제어 화면
const RobotControlScreen = ({ onBack, onLcd }: any) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
    <Header leftIcon={<ChevronLeft size={24} />} onLeftClick={onBack} title="로봇 제어" />
    <div className="p-5 space-y-6">
      <section>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">로봇 상태</h3>
        <Card className="relative pt-8">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-500 dark:text-gray-200 border border-gray-200 dark:border-gray-600">48분 전 동기화</div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="flex flex-col items-center">
              <Battery className="mb-2 text-safe" size={24} />
              <span className="text-xs text-gray-400 dark:text-gray-300 mb-0.5">배터리</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg mb-2">85%</span>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-safe"></div>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-r border-gray-100 dark:border-gray-600 px-2">
              <Wifi className="mb-2 text-primary-500 dark:text-primary-400" size={24} />
              <span className="text-xs text-gray-400 dark:text-gray-300 mb-0.5">네트워크</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg mb-2">연결됨</span>
              <div className="flex items-center justify-center h-1.5">
                <div className="w-2 h-2 rounded-full animate-pulse bg-safe"></div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Pill className="mb-2 text-warning" size={24} />
              <span className="text-xs text-gray-400 dark:text-gray-300 mb-0.5">약 잔량</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg mb-2">3개</span>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full w-[40%] bg-warning"></div>
              </div>
            </div>
          </div>
        </Card>
      </section>
      <section>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">원격 제어</h3>
        <Card className="p-4">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-200 mb-3">로봇 이동 명령</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ n: '거실', i: Sofa }, { n: '주방', i: Utensils }, { n: '침실', i: Bed }, { n: '화장실', i: Bath }, { n: '현관', i: LogOut }, { n: '충전기', i: Zap }].map((r, idx) => (
              <button key={idx} className="flex flex-col items-center justify-center min-h-[64px] bg-gray-50 dark:bg-gray-700 py-4 rounded-2xl active:bg-primary-50 dark:active:bg-primary-500/20 active:scale-95 transition-all">
                <r.i size={24} className="text-gray-700 dark:text-gray-200 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{r.n}</span>
              </button>
            ))}
          </div>
        </Card>
        <Button variant="primary" className="mt-4 shadow-[0_4px_14px_rgba(30,58,95,0.25)]">
          <Camera size={20} className="mr-2" /> 즉시 순찰 시작
        </Button>
      </section>
      <section>
        <SectionHeader title="LCD 미러링" action={<button onClick={onLcd} className="min-h-[48px] px-2 text-sm font-medium flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-100">전체화면 <ArrowRight size={14} className="ml-1" /></button>} />
        <Card onClick={onLcd} className="bg-gray-900 text-white relative overflow-hidden aspect-[1024/600] !rounded-[24px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-transform">
          <div className="absolute top-3 left-3 flex items-center space-x-2 bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
            <Monitor size={12} /><span className="text-[10px] font-medium">실시간 화면</span>
          </div>
          <div className="scale-[0.6] origin-center">
            <div className="flex justify-center">
              <Smile size={96} className="text-cyan-300 animate-pulse" />
            </div>
            <div className="text-center mt-4">
              <h1 className="text-4xl font-bold">14:30</h1>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 dark:text-gray-300">Tap to expand</div>
        </Card>
      </section>
    </div>
  </div>
);

// 약 관리 화면
const MedicationScreen = ({ onBack }: any) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
    <Header leftIcon={<ChevronLeft size={24} />} onLeftClick={onBack} title="약 관리" />
    <div className="p-5 space-y-6">
      <Card className="overflow-visible">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">이번 주 복약 현황</h3>
            <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">총 6회 중 <span className="font-bold text-primary-500 dark:text-primary-400">5회 복용</span></p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-500 dark:text-primary-400">83%</div>
          </div>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
          <div className="h-full rounded-full w-[83%] bg-primary-500 dark:bg-primary-400"></div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
            <div key={d} className="flex flex-col items-center space-y-3">
              <span className="text-xs text-gray-400 dark:text-gray-300 font-medium">{d}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < 3 ? 'bg-green-100 dark:bg-green-400/20 text-green-600 dark:text-green-200' : i === 3 ? 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-200' : 'bg-transparent text-gray-200 dark:text-gray-200 border border-gray-100 dark:border-gray-600'}`}>
                {i < 3 ? <CheckCircle2 size={18} /> : i === 3 ? '-' : ''}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <section>
        <SectionHeader title="등록된 약 목록" />
        <div className="space-y-3">
          <Card className="flex justify-between items-center py-5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-warning-bg text-warning"><Pill size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">고혈압약 (아침)</h4>
                <p className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">1정 · 아침 식후 30분</p>
              </div>
            </div>
            <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-300"><ChevronRight size={20} /></button>
          </Card>
          <Card className="flex justify-between items-center py-5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary-50 dark:bg-primary-400/25 text-primary-500 dark:text-primary-100"><Pill size={24} /></div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">당뇨약 (아침/저녁)</h4>
              <p className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">1정씩 · 식후 30분</p>
            </div>
            </div>
            <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-300"><ChevronRight size={20} /></button>
          </Card>
        </div>
        <Button variant="primary" className="mt-4 shadow-[0_4px_14px_rgba(30,58,95,0.25)]">
          <Plus size={18} className="mr-2" /> 약 추가하기
        </Button>
      </section>
      <Card className="bg-gray-900 text-white border border-white/10 shadow-xl">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h4 className="font-bold text-lg">디스펜서 잔량</h4>
            <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">Bot-Care-V3 · <span className="text-safe">연결됨</span></p>
          </div>
          <div className="px-3 py-1 rounded-lg text-xs font-bold border bg-warning/20 text-warning border-warning/50">보충 필요</div>
        </div>
        <div className="flex space-x-1.5 mb-4 h-10 items-end">
          {[1, 1, 1, 0, 0, 0, 0].map((v, i) => (
            <div key={i} className={`flex-1 rounded-md transition-all duration-500 ${v ? 'h-full bg-safe' : 'h-2 bg-gray-700'}`}></div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 dark:text-gray-300">남은 용량: 3일분</span>
          <button className="min-h-[48px] text-white font-bold text-xs bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600">주문하기</button>
        </div>
      </Card>
    </div>
  </div>
);

// 기록/리포트 화면
const HistoryScreen = ({ onBack }: any) => {
  const [tab, setTab] = useState('report');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Header leftIcon={<ChevronLeft size={24} />} onLeftClick={onBack} title="기록" />
      <div className="bg-white dark:bg-gray-800 px-5 pt-2 pb-4 border-b border-gray-100 dark:border-gray-600 sticky top-[52px] z-40">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 relative">
          <div className={`absolute top-1 bottom-1 w-[49%] bg-white dark:bg-gray-600 rounded-lg shadow-sm transition-all duration-300 ${tab === 'log' ? 'left-[50%]' : 'left-1'}`}></div>
          <button onClick={() => setTab('report')} className={`flex-1 min-h-[48px] py-2.5 rounded-lg text-sm font-bold z-10 transition-colors ${tab === 'report' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-300'}`}>AI 리포트</button>
          <button onClick={() => setTab('log')} className={`flex-1 min-h-[48px] py-2.5 rounded-lg text-sm font-bold z-10 transition-colors ${tab === 'log' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-300'}`}>활동 로그</button>
        </div>
      </div>
      <div className="p-5 space-y-6">
        {tab === 'report' ? (
          <div className="space-y-5 animate-fade-in-up">
            <div className="text-white p-6 rounded-[24px] shadow-lg relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="flex items-center mb-4 opacity-90"><Bot size={18} className="mr-2" /><span className="text-sm font-bold tracking-wide">AI 주간 분석</span></div>
              <h3 className="font-bold text-xl mb-3 leading-snug">"이번 주는 전반적으로<br />안정적인 상태입니다."</h3>
              <p className="opacity-80 text-sm leading-relaxed">복약 순응도가 지난주 대비 5% 상승했습니다. 감정 상태도 긍정적이며, 활동량은 평균 수준을 유지하고 있습니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-6">
                <div className="text-sm text-gray-500 dark:text-gray-200 mb-1 font-medium">복약률</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">92%</div>
                <div className="text-xs font-bold inline-block px-2 py-0.5 rounded-full bg-danger-bg text-danger">▼ 1.2%</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-sm text-gray-500 dark:text-gray-200 mb-1 font-medium">감정 상태</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">긍정</div>
                <div className="text-xs font-bold inline-flex items-center px-2 py-0.5 rounded-full bg-safe-bg text-safe">
                  <Smile size={12} className="mr-1" /> 평온함
                </div>
              </Card>
            </div>
            <Card>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><FileText size={18} className="mr-2 text-gray-400 dark:text-gray-300" />자주 사용한 단어</h4>
              <div className="flex flex-wrap gap-2">
                {['#손자 (23회)', '#건강 (18회)', '#날씨 (12회)', '#식사 (8회)'].map((tag, i) => (
                  <span key={tag} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${i === 0 ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-200'}`}>{tag}</span>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-2"><span className="font-bold text-lg text-gray-900 dark:text-white">1월 20일 (오늘)</span></div>
            <div className="relative border-l-2 border-gray-200 dark:border-gray-600 ml-4 space-y-8 pl-8 pb-4">
              {[
                { time: '10:00', icon: LogOut, bgClass: 'bg-warning-bg', textClass: 'text-warning', title: '외출 감지', desc: '현관문 열림 확인됨' },
                { time: '09:30', icon: Camera, bgClass: 'bg-primary-50 dark:bg-primary-500/20', textClass: 'text-primary-500 dark:text-primary-400', title: '순찰 완료', desc: '가스밸브, 전열기구 정상' },
                { time: '08:15', icon: Pill, bgClass: 'bg-safe-bg', textClass: 'text-safe', title: '아침 약 복용', desc: '디스펜서 작동 완료' },
                { time: '07:30', icon: Activity, bgClass: 'bg-warning-bg', textClass: 'text-warning', title: '기상 감지', desc: '침실에서 움직임 감지' }
              ].map((log, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[39px] top-1 w-3 h-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-full group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-colors"></div>
                  <div className={`absolute -left-[54px] top-0 w-9 h-9 rounded-full flex items-center justify-center ring-4 ring-gray-50 dark:ring-gray-900 z-10 ${log.bgClass}`}>
                    <log.icon size={16} className={log.textClass} />
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">{log.title}</h4>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-300">{log.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-200">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 알림 화면
const NotificationScreen = ({ onBack }: any) => {
  const notifications = [
    { id: 1, type: 'danger', title: '낙상 감지', msg: '거실에서 낙상 감지됨. 즉시 확인이 필요합니다.', time: '방금 전', read: false },
    { id: 2, type: 'success', title: '약 복용 완료', msg: '아침 약(고혈압약) 복용을 완료했습니다.', time: '2시간 전', read: false },
    { id: 3, type: 'info', title: '기상 알림', msg: '오전 7:30 기상 확인됨', time: '3시간 전', read: true },
    { id: 4, type: 'warning', title: '일정 알림', msg: '병원 예약 2시간 전입니다. 준비해주세요.', time: '어제', read: true }
  ];

  const getIcon = (type: string) => {
    if (type === 'danger') return <div className="p-2 rounded-full bg-danger-bg text-danger"><AlertCircle size={20} /></div>;
    if (type === 'success') return <div className="p-2 rounded-full bg-safe-bg text-safe"><Pill size={20} /></div>;
    if (type === 'info') return <div className="p-2 rounded-full bg-primary-50 dark:bg-primary-500/20 text-primary-500 dark:text-primary-100"><Activity size={20} /></div>;
    return <div className="p-2 rounded-full bg-warning-bg text-warning"><Calendar size={20} /></div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Header leftIcon={<ChevronLeft size={24} />} onLeftClick={onBack} title="알림" rightIcon={<span className="text-xs text-gray-500 dark:text-gray-200 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white">모두 읽음</span>} />
      <div className="p-5 space-y-4">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-300 px-1">오늘</p>
        {notifications.map((noti) => (
          <div key={noti.id} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl border transition-all ${!noti.read ? 'border-primary-200 dark:border-primary-500/40 shadow-sm' : 'border-gray-100 dark:border-gray-600'}`}>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex-shrink-0">{getIcon(noti.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-[15px] font-bold ${noti.type === 'danger' ? 'text-danger' : 'text-gray-900 dark:text-white'} ${noti.read ? 'opacity-80' : ''}`}>{noti.title}</h4>
                  <span className="text-xs text-gray-400 dark:text-gray-300 font-medium whitespace-nowrap ml-2">{noti.time}</span>
                </div>
                <p className={`text-[13px] leading-snug ${noti.read ? 'text-gray-400 dark:text-gray-200' : 'text-gray-600 dark:text-gray-200'}`}>{noti.msg}</p>
                {noti.type === 'danger' && (
                  <button className="mt-3 w-full min-h-[48px] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center transition-colors bg-danger-bg text-danger hover:bg-danger/10">
                    <Camera size={14} className="mr-1.5" /> 현장 화면 확인하기
                  </button>
                )}
              </div>
              {!noti.read && <div className="w-2 h-2 rounded-full mt-1.5 bg-primary-500 dark:bg-primary-400"></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 긴급 상황 화면
const EmergencyScreen = ({ onBack }: any) => (
  <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-gray-900">
    <div className="absolute inset-0 animate-pulse bg-danger/20"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-danger/40"></div>
    <div className="relative z-10 w-full max-w-sm flex flex-col h-full justify-center">
      <div className="mb-8">
        <div className="inline-flex p-5 rounded-full animate-bounce mb-4 border-2 box-content bg-danger/20 text-danger border-danger/50">
          <Siren size={56} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">긴급 상황 발생</h1>
        <p className="text-lg font-medium text-danger/80">낙상이 감지되었습니다.</p>
      </div>
      <div className="bg-gray-800 rounded-2xl overflow-hidden mb-8 border border-gray-700 shadow-2xl relative">
        <div className="aspect-video bg-gray-700 flex items-center justify-center relative">
          <Camera size={48} className="text-gray-600 dark:text-gray-200" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-300 text-sm font-medium">카메라 연결 중...</span>
          </div>
        </div>
        <div className="p-4 text-left bg-gray-800 border-t border-gray-700">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white font-bold text-lg">거실</span>
            <span className="text-xs font-bold px-2 py-1 rounded bg-danger/20 text-danger">충격 감지 1분 전</span>
          </div>
          <p className="text-gray-400 dark:text-gray-300 text-sm">로봇이 현장으로 이동 중입니다.</p>
        </div>
      </div>
      <div className="space-y-3 w-full">
        <Button className="py-4 text-lg shadow-[0_4px_20px_rgba(239,68,68,0.3)] animate-pulse bg-danger hover:bg-danger/90">
          <Phone className="mr-2" /> 119 신고하기
        </Button>
        <Button variant="white" onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white border-transparent backdrop-blur-md">
          보호자 직접 통화
        </Button>
      </div>
      <button onClick={onBack} className="mt-8 min-h-[48px] px-3 text-gray-500 dark:text-gray-200 text-sm underline hover:text-gray-300 dark:hover:text-gray-100 transition-colors">오인 감지로 알림 끄기</button>
    </div>
  </div>
);

// LCD 미러링 전체화면
const RobotLCDScreen = ({ onBack }: any) => (
  <div className="min-h-screen bg-gray-900 flex flex-col">
    <Header leftIcon={<X size={24} />} onLeftClick={onBack} title="로봇 화면 미러링" transparent />
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div
        className="w-[90vw] max-w-[1024px] aspect-[1024/600] bg-black rounded-[32px] border-[12px] border-gray-800 shadow-2xl overflow-hidden relative flex items-center justify-center ring-4 ring-gray-700/50"
        style={{ width: 'min(90vw, 1024px, calc(70vh * 1024 / 600))' }}
      >
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <div className="text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse bg-danger">REC</div>
          <div className="text-white text-[10px] font-bold px-2 py-0.5 rounded bg-safe">BAT 85%</div>
        </div>
        <RobotLCD isPreview={true} />
      </div>
      <p className="text-gray-400 dark:text-gray-300 text-sm mt-8 animate-pulse">실시간 로봇 화면 수신 중...</p>
    </div>
  </div>
);

const GuardianAppContainer = ({ onLogout }: any) => {
  const [currentScreen, setCurrentScreen] = useState('elders');
  const [selectedElder, setSelectedElder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');

  const goBack = () => {
    if (['dashboard', 'elders'].includes(currentScreen)) setCurrentScreen('elders');
    else setCurrentScreen('dashboard');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'home') setCurrentScreen('dashboard');
    if (tabId === 'robot') setCurrentScreen('robot');
    if (tabId === 'pill') setCurrentScreen('medication');
    if (tabId === 'cal') setCurrentScreen('schedule');
    if (tabId === 'settings') setCurrentScreen('settings');
  };

  if (currentScreen === 'elders') {
    return (
      <ElderSelectScreen
        onSelect={(elder: any) => { setSelectedElder(elder); setCurrentScreen('dashboard'); }}
        onSettings={() => setCurrentScreen('settings')}
        onEmergency={() => setCurrentScreen('emergency')}
      />
    );
  }

  // 전체화면 (탭바 없음)
  if (currentScreen === 'emergency') {
    return <EmergencyScreen onBack={goBack} />;
  }
  if (currentScreen === 'lcd') {
    return <RobotLCDScreen onBack={() => setCurrentScreen('robot')} />;
  }

  return (
    <div className="pb-24">
      {currentScreen === 'dashboard' && <DashboardScreen elder={selectedElder} onBack={() => setCurrentScreen('elders')} onNoti={() => setCurrentScreen('notifications')} onHistory={() => setCurrentScreen('history')} />}
      {currentScreen === 'settings' && <SettingsScreen onBack={!selectedElder ? () => setCurrentScreen('elders') : goBack} onLogout={onLogout} />}
      {currentScreen === 'robot' && <RobotControlScreen onBack={goBack} onLcd={() => setCurrentScreen('lcd')} />}
      {currentScreen === 'medication' && <MedicationScreen onBack={goBack} />}
      {currentScreen === 'schedule' && <ScheduleScreen onBack={goBack} />}
      {currentScreen === 'history' && <HistoryScreen onBack={goBack} />}
      {currentScreen === 'notifications' && <NotificationScreen onBack={goBack} />}

      {/* Bottom Nav */}
      {selectedElder && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 pt-2 pb-safe min-h-[72px] z-50 rounded-t-[20px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center h-[56px]">
            {[
              { id: 'home', icon: Home, label: '홈' },
              { id: 'robot', icon: Bot, label: '로봇' },
              { id: 'pill', icon: Pill, label: '약' },
              { id: 'cal', icon: Calendar, label: '일정' },
              { id: 'settings', icon: Settings, label: '설정' }
            ].map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-all duration-200 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-100'}`}
                >
                  <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[11px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🚀 Main Export
// ============================================
export default function Playground() {
  const [authMode, setAuthMode] = useState<'none' | 'guardian' | 'robot'>('none');
  const [showSignup, setShowSignup] = useState(false);
  const { updateResolvedTheme } = useThemeStore();

  useEffect(() => {
    updateResolvedTheme();
  }, []);

  const handleLogin = (role: 'guardian' | 'robot') => {
    setAuthMode(role);
  };

  const handleLogout = () => {
    setAuthMode('none');
  };

  const isRobotMode = authMode === 'robot';

  return (
    <div className={isRobotMode
      ? "mx-auto my-6 w-full max-w-5xl aspect-[1024/600] bg-black shadow-2xl overflow-hidden font-sans relative"
      : "max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-2xl overflow-hidden font-sans text-gray-900 dark:text-white relative"
    }>
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wobble { 0% { transform: rotate(0deg); } 15% { transform: rotate(-5deg); } 30% { transform: rotate(3deg); } 45% { transform: rotate(-3deg); } 100% { transform: rotate(0deg); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-wobble { animation: wobble 2s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>

      {authMode === 'none' && !showSignup && <LoginScreen onLogin={handleLogin} onSignup={() => setShowSignup(true)} />}
      {authMode === 'none' && showSignup && <SignupScreen onBack={() => setShowSignup(false)} onComplete={() => { setShowSignup(false); setAuthMode('guardian'); }} />}
      {authMode === 'robot' && <RobotLCD onLogout={handleLogout} />}
      {authMode === 'guardian' && <GuardianAppContainer onLogout={handleLogout} />}
    </div>
  );
}
