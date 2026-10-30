import thumb2008Archival from "@/assets/thumb-2008-archival.jpg";
import thumb2008Motion from "@/assets/thumb-2008-motion.jpg";
import thumbInflationMotion from "@/assets/thumb-inflation-motion.jpg";
import thumbDotcomArchival from "@/assets/thumb-dotcom-archival.jpg";

// ---------- Types ----------

export type Lang = "EN" | "VI";
export type StyleKind = "A" | "B";

export type VideoStatus =
  | "producing"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "error"
  | "changes_requested"
  | "rejected";

export type PageStatus =
  | "connected"
  | "token_expiring"
  | "token_expired"
  | "not_linked";

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  /** The Review step is the only manual step. */
  manual?: boolean;
}

export interface Domain {
  id: string;
  name: string;
  status: "active" | "not_setup";
  pipelineName: string;
  pipeline: PipelineStep[];
  pageIds: string[];
}

export interface FacebookPage {
  id: string;
  domainId: string;
  lang: Lang;
  name: string;
  status: PageStatus;
  timezone: string;
  voice: string;
  monetization: "enabled" | "not_eligible" | "unknown";
  postsLast24h: number;
  /** Posts per 24h allowed by Meta before throttling. */
  dailyLimit: number;
  slotsPerDay?: string;
  nextSlot?: string;
  tokenExpires?: string;
  brandKit?: BrandKit;
}

export interface BrandKit {
  primaryColor: string;
  subtitleColor: string;
  footerText: string;
  hasLogo: boolean;
}

export interface ScriptSection {
  id: string;
  label: string;
  start: number;
  end: number;
  text: Record<Lang, string>;
}

export interface SourceItem {
  subject: string;
  usedIn: string;
  sourceName: string;
  url: string;
  license: string;
}

export interface Video {
  id: string;
  title: string;
  topic: string;
  domainId: string;
  status: VideoStatus;
  style: StyleKind;
  lengthSec: number;
  formats: Array<"reel" | "text_post">;
  langs: Lang[];
  thumbs: Partial<Record<StyleKind, string>>;
  /** Producing state */
  stepIndex?: number;
  stepDetail?: string;
  /** Error state */
  errorReason?: string;
  errorActions?: string[];
  /** Full review content (pending videos) */
  script?: ScriptSection[];
  sources?: SourceItem[];
  captions?: Record<Lang, string>;
  aiLabelNeeded?: boolean;
  /** Non-pending states */
  scheduleNote?: string;
  postedNote?: string;
  reviewNote?: string;
}

export interface Topic {
  id: string;
  domainId: string;
  title: string;
  source: "system" | "you";
  kind: "trending" | "evergreen";
}

// ---------- Pipeline (config-driven — step count varies per domain) ----------

const financePipeline: PipelineStep[] = [
  { id: "topic", name: "Topic", description: "Picked from the queue" },
  { id: "research", name: "Research", description: "Facts + licensed sources" },
  { id: "script", name: "Script", description: "5-part structure, EN + VI" },
  { id: "voice", name: "Voice EN + VI", description: "Two narration tracks" },
  { id: "visuals", name: "Visuals (A/B)", description: "Archival photos or motion graphics" },
  { id: "render", name: "Render", description: "9:16 vertical master" },
  { id: "review", name: "Review", description: "You check and approve", manual: true },
  { id: "publish", name: "Publish", description: "Into the next free slot" },
];

// ---------- Domains ----------

export const domains: Domain[] = [
  {
    id: "finance",
    name: "Finance & Investing",
    status: "active",
    pipelineName: "Explainer video v1",
    pipeline: financePipeline,
    pageIds: ["fin-en", "fin-vi"],
  },
  { id: "real-estate", name: "Real Estate", status: "not_setup", pipelineName: "Not designed yet", pipeline: [], pageIds: ["re-en", "re-vi"] },
  { id: "technology", name: "Technology", status: "not_setup", pipelineName: "Not designed yet", pipeline: [], pageIds: ["tech-en", "tech-vi"] },
  { id: "business", name: "Business", status: "not_setup", pipelineName: "Not designed yet", pipeline: [], pageIds: ["biz-en", "biz-vi"] },
];

// ---------- Facebook pages ----------

export const pages: FacebookPage[] = [
  {
    id: "fin-en",
    domainId: "finance",
    lang: "EN",
    name: "Money Histories",
    status: "token_expiring",
    timezone: "US Eastern (ET)",
    voice: "Atlas · calm male",
    monetization: "enabled",
    postsLast24h: 9,
    dailyLimit: 30,
    slotsPerDay: "2 slots/day · 9:00 & 16:00",
    nextSlot: "Mon 9:00 AM ET",
    tokenExpires: "in 4 days",
    brandKit: { primaryColor: "#1F2937", subtitleColor: "#E9A23B", footerText: "Follow for more money history", hasLogo: true },
  },
  {
    id: "fin-vi",
    domainId: "finance",
    lang: "VI",
    name: "Câu Chuyện Tiền Bạc",
    status: "connected",
    timezone: "GMT+7",
    voice: "Mai · warm female",
    monetization: "enabled",
    postsLast24h: 6,
    dailyLimit: 30,
    slotsPerDay: "2 slots/day · 8:00 & 19:00",
    nextSlot: "Mon 8:00 PM GMT+7",
    tokenExpires: "in 3 weeks",
    brandKit: { primaryColor: "#1F2937", subtitleColor: "#E9A23B", footerText: "Theo dõi để xem thêm chuyện tiền bạc", hasLogo: true },
  },
  { id: "re-en", domainId: "real-estate", lang: "EN", name: "Not linked", status: "not_linked", timezone: "US Eastern (ET)", voice: "—", monetization: "unknown", postsLast24h: 0, dailyLimit: 30 },
  { id: "re-vi", domainId: "real-estate", lang: "VI", name: "Not linked", status: "not_linked", timezone: "GMT+7", voice: "—", monetization: "unknown", postsLast24h: 0, dailyLimit: 30 },
  { id: "tech-en", domainId: "technology", lang: "EN", name: "Not linked", status: "not_linked", timezone: "US Eastern (ET)", voice: "—", monetization: "unknown", postsLast24h: 0, dailyLimit: 30 },
  { id: "tech-vi", domainId: "technology", lang: "VI", name: "Not linked", status: "not_linked", timezone: "GMT+7", voice: "—", monetization: "unknown", postsLast24h: 0, dailyLimit: 30 },
  { id: "biz-en", domainId: "business", lang: "EN", name: "Not linked", status: "not_linked", timezone: "US Eastern (ET)", voice: "—", monetization: "unknown", postsLast24h: 0, dailyLimit: 30 },
  { id: "biz-vi", domainId: "business", lang: "VI", name: "Not linked", status: "not_linked", timezone: "GMT+7", voice: "—", monetization: "unknown", postsLast24h: 0, dailyLimit: 30 },
];

// ---------- Topic queue ----------

export const topics: Topic[] = [
  { id: "t1", domainId: "finance", title: "How the Fed Controls Your Mortgage", source: "system", kind: "trending" },
  { id: "t2", domainId: "finance", title: "3 Bank Runs That Changed Banking", source: "system", kind: "evergreen" },
  { id: "t3", domainId: "finance", title: "What Really Caused Hyperinflation in Weimar Germany", source: "system", kind: "trending" },
  { id: "t4", domainId: "finance", title: "Gold vs. Bitcoin: The Honest Comparison", source: "you", kind: "evergreen" },
  { id: "t5", domainId: "finance", title: "The Hidden Cost of Credit Card Points", source: "system", kind: "evergreen" },
  { id: "t6", domainId: "finance", title: "Why Countries Default on Their Debt", source: "you", kind: "evergreen" },
];

// ---------- Videos ----------

const moneyHistoryFooter = {
  en: "Follow for more money history.",
  vi: "Theo dõi để xem thêm những câu chuyện tiền bạc.",
};

export const videos: Video[] = [
  {
    id: "v-2008",
    title: "The 2008 Crisis, Explained in 90 Seconds",
    topic: "Khủng hoảng 2008",
    domainId: "finance",
    status: "pending_review",
    style: "A",
    lengthSec: 88,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumb2008Archival, B: thumb2008Motion },
    aiLabelNeeded: false,
    script: [
      {
        id: "s1",
        label: "Hook",
        start: 0,
        end: 8,
        text: {
          en: "In 2008, a Lehman Brothers employee walked out of a skyscraper carrying a cardboard box — and 25 million jobs disappeared with it.",
          vi: "Năm 2008, một nhân viên Lehman Brothers bước ra khỏi tòa nhà chọc trời với một thùng các-tông — và 25 triệu việc làm biến mất cùng nó.",
        },
      },
      {
        id: "s2",
        label: "Question",
        start: 8,
        end: 16,
        text: {
          en: "But how did a housing market take down the entire global economy?",
          vi: "Nhưng tại sao một cơn khủng hoảng nhà ở lại hạ gục cả nền kinh tế toàn cầu?",
        },
      },
      {
        id: "s3",
        label: "Explanation",
        start: 16,
        end: 64,
        text: {
          en: "Banks bundled risky mortgages into securities rated as safe as government bonds. Insurance giant AIG sold protection on those bundles without the cash to pay claims. When homeowners defaulted, the dominoes fell: Lehman collapsed, credit froze, and the government spent $700 billion to stop the bleeding.",
          vi: "Các ngân hàng gói những khoản vay thế chấp rủi ro thành chứng khoán được xếp hạng an toàn như trái phiếu chính phủ. AIG — gã khổng lồ bảo hiểm — bán bảo hiểm cho các gói đó mà không có tiền chi trả. Khi người dân vỡ nợ, quân bài đổ nhào: Lehman sụp đổ, tín dụng đóng băng, và chính phủ phải chi 700 tỷ đô la để cầm máu.",
        },
      },
      {
        id: "s4",
        label: "Conclusion",
        start: 64,
        end: 80,
        text: {
          en: "The lesson? When everyone believes prices only go up, that's exactly when they crash.",
          vi: "Bài học? Khi ai cũng tin rằng giá chỉ có thể tăng, đó chính là lúc nó sụp đổ.",
        },
      },
      { id: "s5", label: "Footer", start: 80, end: 88, text: moneyHistoryFooter },
    ],
    sources: [
      { subject: "NYSE trading floor, September 2008", usedIn: "Hook", sourceName: "Library of Congress", url: "https://www.loc.gov/pictures/", license: "Public domain" },
      { subject: "Lehman Brothers headquarters photo", usedIn: "Hook", sourceName: "Wikimedia Commons", url: "https://commons.wikimedia.org/", license: "Public domain" },
      { subject: "US unemployment 2008–2010 (BLS series)", usedIn: "Explanation", sourceName: "Bureau of Labor Statistics", url: "https://www.bls.gov/", license: "Public domain (US gov work)" },
      { subject: "Case–Shiller home price index chart", usedIn: "Explanation", sourceName: "FRED, St. Louis Fed", url: "https://fred.stlouisfed.org/", license: "Public domain" },
      { subject: "AIG headquarters photo", usedIn: "Explanation", sourceName: "Wikimedia Commons", url: "https://commons.wikimedia.org/", license: "CC BY-SA 4.0" },
    ],
    captions: {
      en: "The cardboard box that started it all 📦 From Lehman to a $700B bailout — how 2008 changed your money forever. #finance #history #2008crisis",
      vi: "Chiếc thùng các-tông khởi nguồn tất cả 📦 Từ Lehman đến gói cứu trợ 700 tỷ — vì sao 2008 thay đổi tiền của bạn mãi mãi. #taichinh #lichsu #khunghoang2008",
    },
  },
  {
    id: "v-inflation",
    title: "Why Inflation Never Really Stops",
    topic: "Vòng xoáy lương – giá",
    domainId: "finance",
    status: "pending_review",
    style: "B",
    lengthSec: 54,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumbInflationMotion, B: thumbInflationMotion },
    aiLabelNeeded: true,
    script: [
      {
        id: "s1",
        label: "Hook",
        start: 0,
        end: 7,
        text: {
          en: "Your coffee costs 40% more than five years ago — and no, it's not just greedy companies.",
          vi: "Cà phê của bạn đắt hơn 40% so với năm năm trước — và không, không phải chỉ vì các công ty tham lam.",
        },
      },
      {
        id: "s2",
        label: "Question",
        start: 7,
        end: 14,
        text: {
          en: "So where does inflation actually come from?",
          vi: "Vậy lạm phát thực sự đến từ đâu?",
        },
      },
      {
        id: "s3",
        label: "Explanation",
        start: 14,
        end: 40,
        text: {
          en: "Inflation is money chasing goods: print more dollars and each one buys less. But it's also expectations — when workers expect 5% price rises, they demand 5% raises, and businesses raise prices to pay for them. Central banks call this a wage-price spiral, and it's why 'temporary' inflation rarely is.",
          vi: "Lạm phát là tiền đuổi theo hàng hóa: in thêm tiền, mỗi đồng mua được ít hơn. Nhưng nó còn đến từ kỳ vọng — khi người lao động kỳ vọng giá tăng 5%, họ đòi tăng lương 5%, và doanh nghiệp tăng giá để trả. Ngân hàng trung ương gọi đây là vòng xoáy lương – giá, và đó là lý do lạm phát 'tạm thời' hiếm khi tạm thời.",
        },
      },
      {
        id: "s4",
        label: "Conclusion",
        start: 40,
        end: 50,
        text: {
          en: "That's why your raise this year can still leave you poorer than last year.",
          vi: "Vì vậy, tăng lương năm nay vẫn có thể khiến bạn nghèo hơn năm ngoái.",
        },
      },
      { id: "s5", label: "Footer", start: 50, end: 54, text: moneyHistoryFooter },
    ],
    sources: [
      { subject: "US CPI data series", usedIn: "Explanation", sourceName: "Bureau of Labor Statistics", url: "https://www.bls.gov/cpi/", license: "Public domain (US gov work)" },
      { subject: "Wage–price spiral diagram", usedIn: "Explanation", sourceName: "Original illustration (generated)", url: "https://commons.wikimedia.org/", license: "CC0" },
      { subject: "M2 money supply chart", usedIn: "Explanation", sourceName: "FRED, St. Louis Fed", url: "https://fred.stlouisfed.org/", license: "Public domain" },
    ],
    captions: {
      en: "Why a raise can still leave you poorer 📈 The wage–price spiral, in 50 seconds. #inflation #moneyexplained #finance",
      vi: "Vì sao tăng lương vẫn nghèo hơn 📈 Vòng xoáy lương – giá trong 50 giây. #lamphat #taichinh #tienbac",
    },
  },
  {
    id: "v-dotcom",
    title: "The Dot-Com Bubble: A Story of Hype",
    topic: "Bong bóng dot-com",
    domainId: "finance",
    status: "pending_review",
    style: "A",
    lengthSec: 76,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumbDotcomArchival, B: thumbDotcomArchival },
    aiLabelNeeded: false,
    script: [
      {
        id: "s1",
        label: "Hook",
        start: 0,
        end: 8,
        text: {
          en: "In 1999, a company called Pets.com raised $82 million to sell dog food online. Eighteen months later, it was gone.",
          vi: "Năm 1999, công ty Pets.com gọi vốn 82 triệu đô để bán thức ăn cho chó online. Mười tám tháng sau, nó biến mất.",
        },
      },
      {
        id: "s2",
        label: "Question",
        start: 8,
        end: 15,
        text: {
          en: "How did an entire market fall for the same trick?",
          vi: "Làm sao cả một thị trường có thể cùng sập bẫy như vậy?",
        },
      },
      {
        id: "s3",
        label: "Explanation",
        start: 15,
        end: 56,
        text: {
          en: "Wall Street stopped asking about profits and started asking about 'eyeballs'. Any company with a dot in its name could go public and double on day one. The Nasdaq tripled in 18 months. Then the money ran out: 48% of dot-coms folded, and $5 trillion of market value evaporated by 2002.",
          vi: "Phố Wall ngừng hỏi về lợi nhuận và bắt đầu hỏi về 'lượt xem'. Công ty nào có chữ dot trong tên cũng lên sàn và tăng gấp đôi ngay ngày đầu. Nasdaq tăng gấp ba trong 18 tháng. Rồi tiền cạn: 48% công ty dot-com phá sản, và 5.000 tỷ đô giá trị thị trường bốc hơi vào năm 2002.",
        },
      },
      {
        id: "s4",
        label: "Conclusion",
        start: 56,
        end: 68,
        text: {
          en: "The internet survived. The hype didn't. Every bubble ends the same way: people confusing a good story with a good business.",
          vi: "Internet sống sót. Cơn cuồng nhiệt thì không. Mọi bong bóng đều kết thúc như nhau: người ta nhầm câu chuyện hay với doanh nghiệp tốt.",
        },
      },
      { id: "s5", label: "Footer", start: 68, end: 76, text: moneyHistoryFooter },
    ],
    sources: [
      { subject: "1990s startup office with CRT monitors", usedIn: "Hook", sourceName: "Wikimedia Commons", url: "https://commons.wikimedia.org/", license: "CC BY 2.0" },
      { subject: "Pets.com sock puppet mascot photo", usedIn: "Hook", sourceName: "Wikimedia Commons", url: "https://commons.wikimedia.org/", license: "CC BY-SA 3.0" },
      { subject: "Nasdaq Composite 1995–2003 chart", usedIn: "Explanation", sourceName: "FRED, St. Louis Fed", url: "https://fred.stlouisfed.org/", license: "Public domain" },
    ],
    captions: {
      en: "The sock puppet that burned $300 million 🐶 The dot-com bubble, in 76 seconds. #dotcom #startuphistory #finance",
      vi: "Con rối vải thiêu 300 triệu đô 🐶 Bong bóng dot-com trong 76 giây. #dotcom #lichsu #taichinh",
    },
  },
  {
    id: "v-fed",
    title: "How the Fed Controls Your Mortgage",
    topic: "Fed và lãi suất thế chấp",
    domainId: "finance",
    status: "producing",
    style: "A",
    lengthSec: 60,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumb2008Archival },
    stepIndex: 5,
    stepDetail: "Rendering EN master · 60% · about 4 min left",
  },
  {
    id: "v-bankruns",
    title: "3 Bank Runs That Changed Banking",
    topic: "Những cuộc đột breakdown ngân hàng",
    domainId: "finance",
    status: "producing",
    style: "B",
    lengthSec: 45,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { B: thumb2008Motion },
    stepIndex: 3,
    stepDetail: "Voice VI · Mai · 2 of 4 segments done",
  },
  {
    id: "v-weimar",
    title: "What Really Caused Hyperinflation in Weimar Germany",
    topic: "Siêu lạm phát Weimar",
    domainId: "finance",
    status: "producing",
    style: "A",
    lengthSec: 90,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumb2008Archival },
    stepIndex: 1,
    stepDetail: "Research · 14 licensed photos found so far",
  },
  {
    id: "v-goldbtc",
    title: "Gold vs. Bitcoin: The Honest Comparison",
    topic: "Vàng hay Bitcoin?",
    domainId: "finance",
    status: "error",
    style: "A",
    lengthSec: 52,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumb2008Archival },
    stepIndex: 4,
    stepDetail: "Visuals (A/B)",
    errorReason: "Only 2 licensed photos found for style A — not enough for a 52s archival edit",
    errorActions: ["Switch to style B", "Upload photos"],
  },
  {
    id: "v-enron",
    title: "The Rise and Fall of Enron",
    topic: "Enron",
    domainId: "finance",
    status: "approved",
    style: "A",
    lengthSec: 72,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumbDotcomArchival },
    scheduleNote: "Approved today · enters the next free slot",
  },
  {
    id: "v-buffett",
    title: "How Warren Buffett Reads a Balance Sheet",
    topic: "Cách Buffett đọc bảng cân đối",
    domainId: "finance",
    status: "scheduled",
    style: "B",
    lengthSec: 65,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { B: thumbInflationMotion },
    scheduleNote: "EN: Mon 9:00 AM ET · VI: Mon 8:00 PM GMT+7",
  },
  {
    id: "v-traders",
    title: "Why 90% of Traders Lose Money",
    topic: "90% trader thua lỗ",
    domainId: "finance",
    status: "published",
    style: "A",
    lengthSec: 58,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumb2008Archival },
    postedNote: "Posted 5h ago · EN 12.4k views · VI 8.1k views",
  },
  {
    id: "v-ccpoints",
    title: "The Hidden Cost of Credit Card Points",
    topic: "Chi phí ẩn của điểm thưởng",
    domainId: "finance",
    status: "changes_requested",
    style: "B",
    lengthSec: 48,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { B: thumbInflationMotion },
    reviewNote: "\"Make the hook punchier — start with the $500 mistake.\" Regenerating Hook and re-rendering.",
  },
  {
    id: "v-debt",
    title: "Why Countries Default on Their Debt",
    topic: "Vì sao quốc gia vỡ nợ",
    domainId: "finance",
    status: "rejected",
    style: "A",
    lengthSec: 83,
    formats: ["reel"],
    langs: ["EN", "VI"],
    thumbs: { A: thumbDotcomArchival },
    reviewNote: "Rejected — topic overlaps with the Argentina video published in September.",
  },
];

// ---------- External services (Settings) ----------

export interface ServiceStatus {
  name: string;
  purpose: string;
  status: "connected" | "not_set_up";
  detail?: string;
}

export const services: ServiceStatus[] = [
  { name: "Claude API", purpose: "Research · scriptwriting · translation", status: "connected", detail: "Last call 12 min ago" },
  { name: "ElevenLabs", purpose: "EN narration · VI voiceover", status: "connected", detail: "Atlas (EN) · Mai (VI)" },
  { name: "Wikimedia Commons", purpose: "Licensed archival images", status: "connected" },
  { name: "Library of Congress", purpose: "Licensed archival images", status: "connected" },
  { name: "Notify me when a video is ready for review", purpose: "Email · Telegram · push", status: "not_set_up", detail: "Channel not chosen yet — open question" },
];

// ---------- Helpers ----------

export const getDomain = (id: string) => domains.find((d) => d.id === id);
export const getVideo = (id: string) => videos.find((v) => v.id === id);
export const getPagesForDomain = (domainId: string) =>
  pages.filter((p) => p.domainId === domainId);
export const getPage = (id: string) => pages.find((p) => p.id === id);

export const reviewQueue = videos.filter((v) => v.status === "pending_review");
export const producingVideos = videos.filter(
  (v) => v.status === "producing" || v.status === "error" || v.status === "changes_requested",
);
export const activeDomain = domains.find((d) => d.status === "active")!;

export function domainCounts(domainId: string) {
  return {
    queued: topics.filter((t) => t.domainId === domainId).length,
    producing: videos.filter(
      (v) => v.domainId === domainId && (v.status === "producing" || v.status === "error"),
    ).length,
    pendingReview: videos.filter(
      (v) => v.domainId === domainId && v.status === "pending_review",
    ).length,
  };
}

export function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const statusLabels: Record<VideoStatus, string> = {
  producing: "Producing",
  pending_review: "Waiting for your review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  error: "Needs attention",
  changes_requested: "Changes requested",
  rejected: "Rejected",
};
