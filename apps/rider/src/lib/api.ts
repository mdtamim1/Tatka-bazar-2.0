const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rider_token");
}

export function setToken(token: string) {
  localStorage.setItem("rider_token", token);
}

export function clearToken() {
  localStorage.removeItem("rider_token");
  localStorage.removeItem("rider_user");
}

// ---------------------------------------------------------------------------
// Client Mock / Fallback Storage (when API backend is offline or on cloud HTTPS)
// ---------------------------------------------------------------------------
const DEFAULT_USER: RiderUser = {
  id: "rider-demo-01",
  name: "তামীম ইকবাল",
  email: "singersujonkhan9@gmail.com",
  phone: "01700000001",
  role: "rider",
};

const DEFAULT_PROFILE: RiderProfile = {
  id: "rider-demo-01",
  name: "তামীম ইকবাল",
  email: "singersujonkhan9@gmail.com",
  phone: "01700000001",
  vehicleType: "MOTORCYCLE",
  vehicleNumber: "ঢাকা মেট্রো-হ-৪৫-১২৩৪",
  status: "AVAILABLE",
  balance: 2450,
  totalEarned: 14850,
  kycStatus: "SUBMITTED",
  kycSubmittedAt: new Date().toISOString(),
  fatherName: "মোঃ রফিকুল ইসলাম",
  motherName: "মোসাঃ পারভীন আক্তার",
  dateOfBirth: "1998-05-14",
  presentAddress: "বাড়ি #২৪, রোড #৩, মিরপুর-১০, ঢাকা",
  permanentAddress: "গ্রাম: কৃষ্ণপুর, থানা: সদর, জেলা: বগুড়া",
  nidNumber: "১৯৯৮২৬৯১২২৩০০০৪৫৬",
  paymentMethod: "BKASH",
  paymentAccount: "01700000001",
  paymentAccountLocked: true,
  createdAt: new Date().toISOString(),
};

const SAMPLE_NOTIFICATIONS: RiderNotification[] = [
  { id: "n-1", type: "TASK", title: "নতুন ডেলিভারি টাস্ক", body: "অর্ডার #TB-8942 আপনার জন্য অপেক্ষা করছে", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: "n-2", type: "PAYMENT", title: "পেমেন্ট অ্যাপ্রুভড", body: "৳ ৫০০ আপনার ব্যালেন্সে যোগ হয়েছে", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "n-3", type: "SYSTEM", title: "স্বাগতম!", body: "Tatka Rider প্যানেলে আপনাকে স্বাগত জানাই", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
];

const SAMPLE_AVAILABLE_TASKS: Task[] = [
  {
    id: "task-01",
    orderNumber: "TB-8942",
    customerName: "তানভীর আহমেদ",
    customerPhone: "01812345678",
    deliveryAddress: "রোড #৭, বাড়ি #১২, ধানমন্ডি, ঢাকা",
    vendorName: "সাদিক এগ্রো ফ্রেশ মার্কেট",
    itemCount: 4,
    subtotal: 1390,
    deliveryFee: 60,
    total: 1450,
    earnings: 30,
    items: [
      { name: "দেশি শিং মাছ (১ কেজি)", qty: 1, price: 650, total: 650 },
      { name: "তাজা লাল শাক (২ আঁটি)", qty: 2, price: 30, total: 60 },
      { name: "ফার্মের ডিম (১ ডজন)", qty: 1, price: 150, total: 150 },
      { name: "চাষের তাজা রুই মাছ (২ কেজি)", qty: 1, price: 530, total: 530 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "task-02",
    orderNumber: "TB-8945",
    customerName: "নুসরাত জাহান",
    customerPhone: "01798765432",
    deliveryAddress: "সেক্টর #১১, রোড #৪, উত্তরা, ঢাকা",
    vendorName: "তাজা দেশি মাছ ও মাংসের আড়ত",
    itemCount: 6,
    subtotal: 2120,
    deliveryFee: 80,
    total: 2200,
    earnings: 40,
    items: [
      { name: "দেশি গরুর মাংস (১ কেজি)", qty: 1, price: 780, total: 780 },
      { name: "ফার্মের মুরগি (২ কেজি)", qty: 1, price: 360, total: 360 },
      { name: "দেশি আলু (৫ কেজি)", qty: 1, price: 250, total: 250 },
      { name: "দেশি পেঁয়াজ (২ কেজি)", qty: 1, price: 180, total: 180 },
      { name: "তাজা বেগুন (১ কেজি)", qty: 1, price: 90, total: 90 },
      { name: "কাঁচামরিচ ও ধনেপাতা প্যাক", qty: 1, price: 60, total: 60 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
  {
    id: "task-03",
    orderNumber: "TB-8949",
    customerName: "মাহমুদুল হাসান",
    customerPhone: "01911223344",
    deliveryAddress: "ব্লক #ডি, বাড়ি #৯, বনশ্রী, ঢাকা",
    vendorName: "গ্রিন ভ্যালি অর্গানিক সবজি",
    itemCount: 3,
    subtotal: 830,
    deliveryFee: 60,
    total: 890,
    earnings: 30,
    items: [
      { name: "অর্গানিক মিষ্টি কুমড়া (১টি)", qty: 1, price: 120, total: 120 },
      { name: "তাজা লাউ (১টি)", qty: 1, price: 80, total: 80 },
      { name: "খাঁটি গাওয়া ঘি (২৫০ গ্রাম)", qty: 1, price: 630, total: 630 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "task-04",
    orderNumber: "TB-8952",
    customerName: "আরিফুর রহমান",
    customerPhone: "01715566778",
    deliveryAddress: "রোড #২৩, বাড়ি #৫, গুলশান-১, ঢাকা",
    vendorName: "প্রিমিয়াম সি ফুড ও ডেইরি",
    itemCount: 3,
    subtotal: 2850,
    deliveryFee: 100,
    total: 2950,
    earnings: 50,
    items: [
      { name: "পদ্মার তাজা ইলিশ (১ কেজি)", qty: 1, price: 1800, total: 1800 },
      { name: "গলদা চিংড়ি (৫০০ গ্রাম)", qty: 1, price: 750, total: 750 },
      { name: "খাঁটি গরুর দুধ (৩ লিটার)", qty: 3, price: 100, total: 300 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: "task-05",
    orderNumber: "TB-8955",
    customerName: "ফারহানা শারমিন",
    customerPhone: "01622334455",
    deliveryAddress: "সেকশন #১০, ব্লক #সি, মিরপুর, ঢাকা",
    vendorName: "ভাই ভাই জেনারেল স্টোর",
    itemCount: 4,
    subtotal: 1620,
    deliveryFee: 60,
    total: 1680,
    earnings: 30,
    items: [
      { name: "মিনিকেট চাল (১০ কেজি)", qty: 1, price: 720, total: 720 },
      { name: "তীর সয়াবিন তেল (৫ লিটার)", qty: 1, price: 680, total: 680 },
      { name: "মসুর ডাল দেশি (১ কেজি)", qty: 1, price: 140, total: 140 },
      { name: "সাদা চিনি (১ কেজি)", qty: 1, price: 80, total: 80 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "task-06",
    orderNumber: "TB-8958",
    customerName: "সাজিদ মাহমুদ",
    customerPhone: "01844556677",
    deliveryAddress: "তাজমহল রোড, মোহাম্মদপুর, ঢাকা",
    vendorName: "টাটকা অর্গানিক ফার্ম",
    itemCount: 5,
    subtotal: 620,
    deliveryFee: 60,
    total: 680,
    earnings: 30,
    items: [
      { name: "তাজা করলা (১ কেজি)", qty: 1, price: 90, total: 90 },
      { name: "দেশি শসা (২ কেজি)", qty: 2, price: 60, total: 120 },
      { name: "পাকা টমেটো (২ কেজি)", qty: 2, price: 80, total: 160 },
      { name: "কাঁচা পেঁপে (২ কেজি)", qty: 1, price: 120, total: 120 },
      { name: "টাটকা ধনেপাতা (৩ আঁটি)", qty: 3, price: 43, total: 130 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: "task-07",
    orderNumber: "TB-8961",
    customerName: "ড. কামরুল ইসলাম",
    customerPhone: "01711224466",
    deliveryAddress: "রোড #৯, বারিধারা ডিওএইচএস, ঢাকা",
    vendorName: "নেচারস বাস্কেট ফ্রুটস",
    itemCount: 4,
    subtotal: 2450,
    deliveryFee: 100,
    total: 2550,
    earnings: 50,
    items: [
      { name: "ড্রাগন ফ্রুট (২ কেজি)", qty: 2, price: 380, total: 760 },
      { name: "ইম্পোর্টেড মাল্টা (২ কেজি)", qty: 2, price: 290, total: 580 },
      { name: "মিষ্টি বেদানা (১ কেজি)", qty: 1, price: 480, total: 480 },
      { name: "ফুজি আপেল (২ কেজি)", qty: 2, price: 315, total: 630 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "task-08",
    orderNumber: "TB-8964",
    customerName: "মেহজাবিন চৌধুরী",
    customerPhone: "01533445566",
    deliveryAddress: "ব্লক #জি, বসুন্ধরা আবাসিক এলাকা, ঢাকা",
    vendorName: "ঢাকা ফার্ম ফ্রেশ",
    itemCount: 4,
    subtotal: 1840,
    deliveryFee: 80,
    total: 1920,
    earnings: 40,
    items: [
      { name: "সোনালী মুরগি (২ পিস)", qty: 2, price: 380, total: 760 },
      { name: "লাল ডিম (২ ডজন)", qty: 2, price: 155, total: 310 },
      { name: "আড়ং বাটার (২০০ গ্রাম)", qty: 2, price: 240, total: 480 },
      { name: "দেশি পনির (২৫০ গ্রাম)", qty: 1, price: 290, total: 290 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    id: "task-09",
    orderNumber: "TB-8967",
    customerName: "শফিক আহমেদ",
    customerPhone: "01988776655",
    deliveryAddress: "খিলগাঁও তিলপাপাড়া, ঢাকা",
    vendorName: "দেশি মশলা ও ড্রিমস",
    itemCount: 5,
    subtotal: 1140,
    deliveryFee: 60,
    total: 1200,
    earnings: 30,
    items: [
      { name: "খাঁটি হলুদ গুঁড়া (৫০০ গ্রাম)", qty: 1, price: 180, total: 180 },
      { name: "ঝাল মরিচ গুঁড়া (৫০০ গ্রাম)", qty: 1, price: 240, total: 240 },
      { name: "আস্ত জিরা (২৫০ গ্রাম)", qty: 1, price: 220, total: 220 },
      { name: "সবুজ এলাচ (৫০ গ্রাম)", qty: 1, price: 280, total: 280 },
      { name: "দারুচিনি ও লবঙ্গ প্যাক", qty: 1, price: 220, total: 220 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
  {
    id: "task-10",
    orderNumber: "TB-8970",
    customerName: "রুমানা আক্তার",
    customerPhone: "01855667788",
    deliveryAddress: "ব্লক #বি, লালমাটিয়া, ঢাকা",
    vendorName: "ফ্রেশ গার্ডেন মার্ট",
    itemCount: 5,
    subtotal: 680,
    deliveryFee: 60,
    total: 740,
    earnings: 30,
    items: [
      { name: "পালং শাক (৩ আঁটি)", qty: 3, price: 35, total: 105 },
      { name: "তাজা ফুলকপি (২টি)", qty: 2, price: 60, total: 120 },
      { name: "পাতাকপি / বাঁধাকপি (২টি)", qty: 2, price: 50, total: 100 },
      { name: "দেশি শিম (১ কেজি)", qty: 1, price: 135, total: 135 },
      { name: "তাজা গাজর (২ কেজি)", qty: 2, price: 110, total: 220 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 36).toISOString(),
  },
  {
    id: "task-11",
    orderNumber: "TB-8973",
    customerName: "জিয়াউর রহমান",
    customerPhone: "01722338899",
    deliveryAddress: "কুনিপাড়া, তেজগাঁও, ঢাকা",
    vendorName: "বিসমিল্লাহ মিট হাউজ",
    itemCount: 3,
    subtotal: 3100,
    deliveryFee: 80,
    total: 3180,
    earnings: 40,
    items: [
      { name: "দেশি খাসির মাংস (২ কেজি)", qty: 2, price: 1150, total: 2300 },
      { name: "খাসির কলিজা (৫০০ গ্রাম)", qty: 1, price: 480, total: 480 },
      { name: "গরুর চর্বিহীন সলিড মাংস (৫০০ গ্রাম)", qty: 1, price: 320, total: 320 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "task-12",
    orderNumber: "TB-8976",
    customerName: "নাজমা বেগম",
    customerPhone: "01677889900",
    deliveryAddress: "সিদ্ধেশ্বরী রোড, শান্তিনগর, ঢাকা",
    vendorName: "ক্যাপিটাল ফ্রেশ ফুডস",
    itemCount: 4,
    subtotal: 1950,
    deliveryFee: 70,
    total: 2020,
    earnings: 35,
    items: [
      { name: "তাজা রূপচাঁদা মাছ (৫০০ গ্রাম)", qty: 1, price: 850, total: 850 },
      { name: "নদীর পাবদা মাছ (১ কেজি)", qty: 1, price: 780, total: 780 },
      { name: "দেশি রসুন বাটা (২৫০ গ্রাম)", qty: 1, price: 160, total: 160 },
      { name: "আদা বাটা (২৫০ গ্রাম)", qty: 1, price: 160, total: 160 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "task-13",
    orderNumber: "TB-8979",
    customerName: "ইমরান খান",
    customerPhone: "01933441122",
    deliveryAddress: "দক্ষিণ বাড্ডা, ঢাকা",
    vendorName: "অর্গানিক ভিলেজ বাংলাদেশ",
    itemCount: 3,
    subtotal: 2350,
    deliveryFee: 70,
    total: 2420,
    earnings: 35,
    items: [
      { name: "সুন্দরবনের প্রাকৃতিক মধু (৫০০ গ্রাম)", qty: 1, price: 850, total: 850 },
      { name: "গাওয়া ঘি প্রিমিয়াম (৫০০ গ্রাম)", qty: 1, price: 950, total: 950 },
      { name: "সুগন্ধি কাটারিভোগ চাল (৫ কেজি)", qty: 1, price: 550, total: 550 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "task-14",
    orderNumber: "TB-8982",
    customerName: "তাহমিনা সুলতানা",
    customerPhone: "01811992233",
    deliveryAddress: "মৌচাক মোড়, মালিবাগ, ঢাকা",
    vendorName: "সুপার ফ্রেশ ডিপার্টমেন্টাল",
    itemCount: 4,
    subtotal: 1250,
    deliveryFee: 60,
    total: 1310,
    earnings: 30,
    items: [
      { name: "ম্যাগি নুডুলস ফ্যামিলি প্যাক", qty: 2, price: 230, total: 460 },
      { name: "কোয়েকার ওটস (১ কেজি)", qty: 1, price: 390, total: 390 },
      { name: "মিল্ক ভিটা তরল দুধ (২ লিটার)", qty: 2, price: 100, total: 200 },
      { name: "লেকসাস বিস্কুট জাম্বো প্যাক", qty: 1, price: 200, total: 200 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: "task-15",
    orderNumber: "TB-8985",
    customerName: "রাশেদ চৌধুরী",
    customerPhone: "01744558811",
    deliveryAddress: "বনশ্রী মেইন রোড, রামপুরা, ঢাকা",
    vendorName: "ফ্রেশ ফল ভাণ্ডার",
    itemCount: 4,
    subtotal: 1120,
    deliveryFee: 60,
    total: 1180,
    earnings: 30,
    items: [
      { name: "সাগর কলা (১ ডজন)", qty: 1, price: 140, total: 140 },
      { name: "থাই পেয়ারা (২ কেজি)", qty: 2, price: 110, total: 220 },
      { name: "মিষ্টি পেঁপে (২ কেজি)", qty: 1, price: 160, total: 160 },
      { name: "আম্রপালি আম (৩ কেজি)", qty: 1, price: 600, total: 600 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

function getLocalStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`tb_demo_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStore(key: string, val: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`tb_demo_${key}`, JSON.stringify(val));
  } catch {}
}

function handleMockFallback<T>(path: string, options: RequestInit): { success: boolean; data?: T; error?: string } {
  const method = (options.method || "GET").toUpperCase();
  const cleanPath = path.split("?")[0] || "";
  const queryString = path.includes("?") ? (path.split("?")[1] || "") : "";
  const params = new URLSearchParams(queryString);

  // 1. Login
  if (cleanPath === "/auth/rider/login" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const identifier = body.email || body.phone || "01700000001";
    const user: RiderUser = {
      id: "rider-demo-01",
      name: "তামীম ইকবাল",
      email: identifier.includes("@") ? identifier : `${identifier}@tatkabazar.com`,
      phone: identifier.replace(/[^0-9]/g, "") || "01700000001",
      role: "rider",
    };
    setToken("mock-jwt-token-rider-partner");
    localStorage.setItem("rider_user", JSON.stringify(user));
    return { success: true, data: { accessToken: "mock-jwt-token-rider-partner", user } as any };
  }

  // 2. Register
  if (cleanPath === "/auth/rider/register" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const user: RiderUser = {
      id: "rider-demo-" + Date.now(),
      name: body.name || "নতুন রাইডার",
      email: body.email || `${body.phone}@tatkabazar.com`,
      phone: body.phone || "01700000000",
      role: "rider",
    };
    setToken("mock-jwt-token-rider-partner");
    localStorage.setItem("rider_user", JSON.stringify(user));
    return { success: true, data: { accessToken: "mock-jwt-token-rider-partner", user } as any };
  }

  // 3. Balance
  if (cleanPath === "/rider-portal/balance") {
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    return {
      success: true,
      data: {
        balance: profile.balance,
        totalEarned: profile.totalEarned,
        todayEarning: 480,
        todayDeliveries: 6,
        weekEarning: 3450,
      } as any,
    };
  }

  // 4. Available Tasks (15 Demo Tasks)
  if (cleanPath === "/rider-portal/tasks" && method === "GET") {
    let tasks = getLocalStore<Task[]>("available_tasks", SAMPLE_AVAILABLE_TASKS);
    if (!tasks || tasks.length < 5) {
      setLocalStore("available_tasks", SAMPLE_AVAILABLE_TASKS);
      tasks = SAMPLE_AVAILABLE_TASKS;
    }
    return { success: true, data: tasks as any };
  }

  // 5. Active Tasks
  if (cleanPath === "/rider-portal/tasks/active") {
    const activeTasks = getLocalStore<ActiveTask[]>("active_tasks", []);
    return { success: true, data: activeTasks as any };
  }

  // 6. Single Task Detail
  if (cleanPath.startsWith("/rider-portal/tasks/") && !cleanPath.includes("/accept") && !cleanPath.includes("/pickup") && !cleanPath.includes("/deliver")) {
    const taskId = cleanPath.split("/").pop();
    const available = getLocalStore("available_tasks", SAMPLE_AVAILABLE_TASKS);
    const task = available.find((t) => t.id === taskId) || SAMPLE_AVAILABLE_TASKS[0];
    const deliveryFee = task?.deliveryFee || 60;
    const earnings = task?.earnings || Math.round(deliveryFee * 0.5);
    const items = task?.items || [
      { name: "দেশি শিং মাছ (১ কেজি)", qty: 1, price: 650, total: 650 },
      { name: "তাজা লাল শাক (২ আঁটি)", qty: 2, price: 30, total: 60 },
      { name: "ফার্মের ডিম (১ ডজন)", qty: 1, price: 150, total: 150 },
      { name: "চাষের তাজা রুই মাছ (২ কেজি)", qty: 1, price: 530, total: 530 },
    ];
    const subtotal = task?.subtotal || items.reduce((s, it) => s + (it.total || it.qty * (it.price || 0)), 0);
    const total = task?.total || (subtotal + deliveryFee);
    return {
      success: true,
      data: {
        id: task?.id || taskId,
        orderNumber: task?.orderNumber || "TB-8942",
        customerName: task?.customerName || "তানভীর আহমেদ",
        customerPhone: task?.customerPhone || "01812345678",
        deliveryAddress: task?.deliveryAddress || "ধানমন্ডি, ঢাকা",
        vendorName: task?.vendorName || "সাদিক এগ্রো ফ্রেশ",
        items,
        subtotal,
        deliveryFee,
        total,
        earnings,
      } as any,
    };
  }

  // 7. Accept Task
  if (cleanPath.includes("/accept") && method === "POST") {
    const taskId = cleanPath.split("/")[3];
    const available = getLocalStore("available_tasks", SAMPLE_AVAILABLE_TASKS);
    const accepted = available.find((t) => t.id === taskId) || SAMPLE_AVAILABLE_TASKS[0];
    if (accepted) {
      const remaining = available.filter((t) => t.id !== taskId);
      setLocalStore("available_tasks", remaining);

      const deliveryFee = accepted.deliveryFee || 60;
      const earnings = accepted.earnings || Math.round(deliveryFee * 0.5);
      const items = accepted.items || [
        { name: "অর্গানিক তাজা শাকসবজি", qty: 2, price: 120, total: 240 },
        { name: "দেশি ডিম ও খাঁটি দুধ", qty: 1, price: 350, total: 350 },
      ];
      const subtotal = accepted.subtotal || items.reduce((s, it) => s + (it.total || it.qty * (it.price || 0)), 0);
      const total = accepted.total || (subtotal + deliveryFee);

      const active = getLocalStore<ActiveTask[]>("active_tasks", []);
      active.push({
        assignmentId: "asgn-" + Date.now(),
        status: "ASSIGNED",
        assignedAt: new Date().toISOString(),
        order: {
          id: accepted.id,
          orderNumber: accepted.orderNumber,
          customerName: accepted.customerName,
          customerPhone: accepted.customerPhone,
          deliveryAddress: accepted.deliveryAddress,
          vendorName: accepted.vendorName,
          items,
          subtotal,
          deliveryFee,
          total,
          earnings,
        },
      });
      setLocalStore("active_tasks", active);
    }
    return { success: true, data: { message: "Task accepted" } as any };
  }

  // 8. Pickup / Deliver Task
  if ((cleanPath.includes("/pickup") || cleanPath.includes("/deliver")) && method === "POST") {
    const isDeliver = cleanPath.includes("/deliver");
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    let earned = 30;
    let orderTotal = 0;
    if (isDeliver && active.length > 0) {
      const done = active.shift();
      setLocalStore("active_tasks", active);

      const deliveryFee = Number(done?.order.deliveryFee ?? 60);
      earned = done?.order.earnings ?? Math.round(deliveryFee * 0.5);
      orderTotal = Number(done?.order.total ?? 1450);

      // update profile balance:
      // + 50% delivery charge added to rider account
      // - total order bill deducted from rider account
      const profile = getLocalStore("profile", DEFAULT_PROFILE);
      profile.balance = profile.balance + earned - orderTotal;
      profile.totalEarned += earned;
      setLocalStore("profile", profile);

      // add history entries
      const allHistory = getLocalStore<HistoryItem[]>("history", [
        { id: "h-1", type: "income", amount: 80, description: "অর্ডার #TB-8940 সফল ডেলিভারি", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: "h-2", type: "income", amount: 110, description: "অর্ডার #TB-8935 সফল ডেলিভারি", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: "h-3", type: "withdrawal", amount: 1000, description: "bKash উইথড্রয়াল সম্পন্ন", status: "COMPLETED", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      ]);
      allHistory.unshift({
        id: "h-" + Date.now(),
        type: "income",
        amount: earned,
        description: `অর্ডার #${done?.order.orderNumber} ডেলিভারি আয় (৫০% ডেলিভারি ফি)`,
        createdAt: new Date().toISOString(),
      });
      allHistory.unshift({
        id: "h-deduct-" + Date.now(),
        type: "withdrawal",
        amount: orderTotal,
        description: `অর্ডার #${done?.order.orderNumber} সংগৃহীত বিল সমন্বয় (অ্যাকাউন্ট থেকে কর্তন)`,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      });
      setLocalStore("history", allHistory);

      // add notification
      const notifs = getLocalStore<RiderNotification[]>("notifications", SAMPLE_NOTIFICATIONS);
      notifs.unshift({
        id: "n-" + Date.now(),
        type: "PAYMENT",
        title: "ডেলিভারি সম্পন্ন ও ব্যালেন্স সমন্বয়",
        body: `অর্ডার #${done?.order.orderNumber}: আয় ৳ ${earned} যোগ হয়েছে এবং বিল ৳ ${orderTotal} সমন্বয় হয়েছে`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setLocalStore("notifications", notifs);
    }
    return { success: true, data: { earning: earned, orderTotal, message: "ডেলিভারি সম্পন্ন" } as any };
  }

  // 9. Profile / Me
  if (cleanPath === "/rider-portal/me" && method === "GET") {
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    const user = getLocalStore<RiderUser>("user", DEFAULT_USER);
    profile.name = user.name || profile.name;
    profile.email = user.email || profile.email;
    profile.phone = user.phone || profile.phone;
    return { success: true, data: profile as any };
  }

  // 10. KYC Submit
  if (cleanPath === "/rider-portal/kyc" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    Object.assign(profile, body, { kycStatus: "SUBMITTED", kycSubmittedAt: new Date().toISOString() });
    setLocalStore("profile", profile);
    return { success: true, data: { kycStatus: "SUBMITTED" } as any };
  }

  // 11. Payment Account
  if (cleanPath === "/rider-portal/payment-account" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    profile.paymentMethod = body.paymentMethod;
    profile.paymentAccount = body.paymentAccount;
    profile.paymentAccountLocked = true;
    setLocalStore("profile", profile);
    return { success: true, data: profile as any };
  }

  // 12. History
  if (cleanPath === "/rider-portal/history") {
    const filterType = params.get("type") || "all";
    const allHistory: HistoryItem[] = [
      { id: "h-1", type: "income", amount: 80, description: "অর্ডার #TB-8940 সফল ডেলিভারি", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: "h-2", type: "income", amount: 110, description: "অর্ডার #TB-8935 সফল ডেলিভারি", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
      { id: "h-3", type: "withdrawal", amount: 1000, description: "bKash উইথড্রয়াল সম্পন্ন", status: "COMPLETED", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: "h-4", type: "income", amount: 95, description: "অর্ডার #TB-8921 সফল ডেলিভারি", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() },
    ];
    const filtered = filterType === "all" ? allHistory : allHistory.filter((h) => h.type === filterType);
    return { success: true, data: filtered as any };
  }

  // 13. Deposit / Recharge Request
  if (cleanPath === "/rider-portal/deposit" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const amount = Number(body.amount) || 0;
    const lastFour = body.lastFour || "";
    if (!amount || amount <= 0) return { success: false, error: "সঠিক পরিমাণ দিন" };
    if (!lastFour || lastFour.length !== 4) return { success: false, error: "শেষ ৪ সংখ্যা সঠিক নয়" };
    // In demo: auto-approve — clear due first, then add to balance
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    const due = profile.due || 0;
    if (due > 0) {
      const deducted = Math.min(amount, due);
      profile.due = due - deducted;
      profile.balance += amount - deducted;
    } else {
      profile.balance += amount;
    }
    setLocalStore("profile", profile);
    // Save deposit request history
    const deposits = getLocalStore<DepositRequest[]>("deposit_requests", []);
    deposits.unshift({ id: "dep-" + Date.now(), amount, lastFour, status: "APPROVED", createdAt: new Date().toISOString() });
    setLocalStore("deposit_requests", deposits);
    // Add notification
    const notifs = getLocalStore<RiderNotification[]>("notifications", SAMPLE_NOTIFICATIONS);
    notifs.unshift({ id: "n-" + Date.now(), type: "PAYMENT", title: "রিচার্জ সম্পন্ন", body: `৳ ${amount} আপনার ব্যালেন্সে যোগ হয়েছে`, isRead: false, createdAt: new Date().toISOString() });
    setLocalStore("notifications", notifs);
    return { success: true, data: { message: "ডিপোজিট সম্পন্ন হয়েছে", newBalance: profile.balance } as any };
  }

  // 14. Notifications — GET
  if (cleanPath === "/rider-portal/notifications" && method === "GET") {
    const notifs = getLocalStore<RiderNotification[]>("notifications", SAMPLE_NOTIFICATIONS);
    return { success: true, data: notifs as any };
  }

  // 15. Notifications — Mark all read
  if (cleanPath === "/rider-portal/notifications/read" && method === "POST") {
    const notifs = getLocalStore<RiderNotification[]>("notifications", SAMPLE_NOTIFICATIONS);
    notifs.forEach(n => n.isRead = true);
    setLocalStore("notifications", notifs);
    return { success: true, data: { message: "সব নোটিফিকেশন পড়া হয়েছে" } as any };
  }

  // 16. Withdraw Request
  if (cleanPath === "/rider-portal/withdraw" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    const amount = Number(body.amount) || 500;
    if (profile.balance >= amount) {
      profile.balance -= amount;
      setLocalStore("profile", profile);
    }
    return { success: true, data: { message: "উইথড্রয়াল রিকোয়েস্ট জমা হয়েছে" } as any };
  }

  if (cleanPath.includes("tasks") || cleanPath.includes("history")) {
    return { success: true, data: [] as any };
  }

  return { success: true, data: {} as any };
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    // Only attempt real fetch if API_BASE is reachable and not localhost over https
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const isLocalhostApi = API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1");

    // Browsers block HTTPS -> HTTP localhost (Mixed Content)
    if (isHttps && isLocalhostApi) {
      return handleMockFallback<T>(path, options);
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const json = await res.json();
    return json;
  } catch {
    // Graceful fallback to demo mode on network failure or offline backend
    return handleMockFallback<T>(path, options);
  }
}

export async function login(email: string, password: string) {
  const res = await apiFetch<{ accessToken: string; user: RiderUser }>("/auth/rider/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res.success && res.data) {
    setToken(res.data.accessToken);
    localStorage.setItem("rider_user", JSON.stringify(res.data.user));
  }
  return res;
}

export async function registerRider(data: {
  name: string;
  phone: string;
  email?: string | undefined;
  password: string;
  vehicleType?: "BICYCLE" | "MOTORCYCLE" | "VAN" | undefined;
}) {
  const res = await apiFetch<{ accessToken: string; user: RiderUser }>("/auth/rider/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success && res.data) {
    setToken(res.data.accessToken);
    localStorage.setItem("rider_user", JSON.stringify(res.data.user));
  }
  return res;
}

export interface RiderUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface BalanceData {
  balance: number;
  totalEarned: number;
  todayEarning: number;
  todayDeliveries: number;
  weekEarning: number;
}

export interface TaskItem {
  name: string;
  qty: number;
  price?: number;
  total?: number;
}

export interface Task {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  vendorName: string;
  itemCount: number;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  earnings: number;
  items?: TaskItem[];
  createdAt: string;
}

export interface ActiveTask {
  assignmentId: string;
  status: string;
  assignedAt: string;
  pickedAt?: string;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    vendorName: string;
    items: TaskItem[];
    subtotal?: number;
    deliveryFee?: number;
    total?: number;
    earnings: number;
  };
}

export interface RiderNotification {
  id: string;
  type: "TASK" | "PAYMENT" | "SYSTEM";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  amount: number;
  lastFour: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  type: "income" | "withdrawal";
  amount: number;
  description: string;
  status?: string;
  createdAt: string;
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber?: string;
  status: string;
  balance: number;
  totalEarned: number;
  kycStatus: string;
  kycSubmittedAt?: string;
  kycApprovedAt?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  presentAddress?: string;
  permanentAddress?: string;
  nidNumber?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  photoUrl?: string;
  paymentMethod?: string;
  paymentAccount?: string;
  paymentAccountLocked?: boolean;
  due?: number;
  createdAt: string;
}
