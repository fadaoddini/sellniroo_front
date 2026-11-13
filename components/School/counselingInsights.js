/**
 * پیشنهادهای رشدی / شغلی بر اساس نتایج آزمون‌های مشاوره
 * هرچه آزمون‌های بیشتری تکمیل شود، پیشنهادها دقیق‌تر و کامل‌تر می‌شوند.
 */

const KIND_META = {
  iq: {
    label: 'هوش تحلیلی (IQ)',
    short: 'تحلیلی',
    talent: 'توانایی حل مسئله، استدلال و یادگیری مفاهیم پیچیده',
    careers: [
      'علوم پایه و مهندسی',
      'برنامه‌نویسی و تحلیل داده',
      'ریاضی، فیزیک و پژوهش',
      'پزشکی و علوم آزمایشگاهی',
    ],
    life: [
      'مسیرهای چالش‌برانگیز فکری',
      'یادگیری مستقل و پروژه‌محور',
    ],
    cover: [
      'هر روز یک معما یا مسئله کوتاه حل کنید',
      'مفهوم‌های سخت را با مثال واقعی تمرین کنید',
      'از روش «توضیح برای دیگری» برای تثبیت یادگیری استفاده کنید',
      'زمان‌بندی مطالعه را کوتاه و منظم نگه دارید',
    ],
  },
  eq: {
    label: 'هوش هیجانی (EQ)',
    short: 'هیجانی',
    talent: 'همدلی، مدیریت احساس و ارتباط مؤثر با دیگران',
    careers: [
      'مشاوره، روان‌شناسی و مددکاری',
      'مدیریت تیم و منابع انسانی',
      'آموزش و مربیگری',
      'فروش مشاوره‌ای و خدمات مشتری',
    ],
    life: [
      'نقش‌های گروهی و رهبری نرم',
      'روابط پایدار خانوادگی و اجتماعی',
    ],
    cover: [
      'احساسات خود را روزانه در چند جمله بنویسید',
      'قبل از پاسخ، ۳ نفس عمیق و مکث کوتاه بگیرید',
      'هفته‌ای یک گفت‌وگوی همدلانه بدون قضاوت تمرین کنید',
      'بازخورد دوستانه از همکلاسی یا مشاور بگیرید',
    ],
  },
  personality: {
    label: 'شخصیت',
    short: 'شخصیت',
    talent: 'شناخت سبک رفتاری، انگیزه و شیوه کار کردن با دیگران',
    careers: [
      'نقش‌های متناسب با برون‌گرایی/درون‌گرایی شما',
      'کار تیمی یا تخصصی فردی (بسته به پروفایل)',
      'رهبری، اجرا یا ایده‌پردازی',
    ],
    life: [
      'انتخاب محیط‌هایی که با انرژی شما سازگارند',
      'تعادل بین کار فردی و گروهی',
    ],
    cover: [
      'نقاط کور رفتاری را با بازخورد قابل‌اعتماد پیدا کنید',
      'در موقعیت‌های ناآشنا، یک مهارت اجتماعی کوچک تمرین کنید',
      'سبک تصمیم‌گیری خود را آگاهانه تنظیم کنید (سریع/دقیق)',
      'با مشاور درباره تیپ شخصیتی‌تان گفتگو کنید',
    ],
  },
  career: {
    label: 'هدایت شغلی / تحصیلی',
    short: 'شغلی',
    talent: 'تصویر روشن‌تر از مسیر تحصیل و شغل آینده',
    careers: [
      'رشته‌های هم‌راستا با علاقه و نمرات شما',
      'کارآموزی و پروژه‌های کوتاه‌مدت مرتبط',
      'مهارت‌های بازار کار (زبان، نرم‌افزار، ارائه)',
    ],
    life: [
      'هدف‌گذاری سالانه تحصیلی و مهارتی',
      'ساخت رزومه تجربی از همین حالا',
    ],
    cover: [
      '۳ شغل موردعلاقه را تحقیق و با واقعیت مقایسه کنید',
      'با یک فرد شاغل در آن حوزه گفت‌وگوی کوتاه داشته باشید',
      'مهارت‌های پایه همان مسیر را در ترم جاری تمرین کنید',
      'هر ماه یک mini-project مرتبط انجام دهید',
    ],
  },
  interest: {
    label: 'علاقه‌مندی',
    short: 'علاقه',
    talent: 'انرژی و انگیزه در حوزه‌هایی که واقعاً دوست دارید',
    careers: [
      'ترکیب علاقه با مهارت قابل‌فروش',
      'فعالیت‌های فوق‌برنامه و باشگاه‌های مرتبط',
      'مسیرهای خلاقانه، ورزشی یا علمی مطابق علاقه',
    ],
    life: [
      'حفظ شور و پیوستگی در یادگیری',
      'تبدیل علاقه به عادت هفتگی',
    ],
    cover: [
      'علاقه را به برنامه هفتگی ثابت وصل کنید (حتی ۳۰ دقیقه)',
      'یک مهارت مکمل برای همان علاقه یاد بگیرید',
      'نتیجه علاقه را قابل‌نمایش کنید (نمونه کار / ارائه)',
      'از مشاور برای هم‌راستا کردن علاقه و رشته کمک بگیرید',
    ],
  },
  custom: {
    label: 'سایر آزمون‌ها',
    short: 'سایر',
    talent: 'تصویر تکمیلی از توانایی‌ها و سبک یادگیری شما',
    careers: ['ترکیب نتایج با مسیرهای اصلی تحصیلی/شغلی'],
    life: ['گسترش خودآگاهی و تصمیم‌گیری آگاهانه'],
    cover: [
      'نتیجه را با مشاور مرور کنید',
      'یک هدف کوچک و قابل‌اندازه‌گیری برای ماه آینده بنویسید',
    ],
  },
}

const STRONG = 70
const MID = 45

function pctOf(score, max) {
  const m = Number(max) || 0
  if (!m) return 0
  return Math.round((Number(score) / m) * 100)
}

function levelOf(pct) {
  if (pct >= STRONG) return 'strong'
  if (pct >= MID) return 'mid'
  return 'weak'
}

function uniq(list, limit = 6) {
  const seen = new Set()
  const out = []
  for (const item of list) {
    const k = String(item).trim()
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(k)
    if (out.length >= limit) break
  }
  return out
}

/**
 * توضیح ساده و قابل‌فهم برای یک نتیجه آزمون (برای مشاور / دانش‌آموز)
 * @param {object} attempt
 * @param {{ personName?: string }} [opts]
 */
export function explainAttempt(attempt, opts = {}) {
  if (!attempt) return null
  const kind = attempt.test_kind || 'custom'
  const meta = KIND_META[kind] || KIND_META.custom
  const pct = pctOf(attempt.score, attempt.max_score)
  const level = levelOf(pct)
  const name = (opts.personName || '').trim() || 'این فرد'
  const testTitle = attempt.test_title || meta.label
  const date = attempt.completed_at
    ? String(attempt.completed_at).slice(0, 10)
    : null

  const meaningByLevel = {
    strong: {
      iq: `${name} در حل مسئله و استدلال نمره خوبی گرفته؛ یعنی مفاهیم سخت را نسبتاً سریع می‌فهمد.`,
      eq: `${name} در همدلی و مدیریت احساس وضعیت خوبی دارد؛ ارتباط با دیگران برایش آسان‌تر است.`,
      personality: `سبک رفتاری ${name} نسبتاً پایدار و قابل‌اتکا دیده می‌شود؛ محیط مناسب با انرژی‌اش مهم است.`,
      career: `${name} تصویر نسبتاً روشنی از مسیر تحصیل/شغل دارد یا علاقه‌اش با واقعیت هم‌خوانی دارد.`,
      interest: `علاقه‌مندی‌های ${name} واضح‌تر مشخص شده؛ می‌توان روی همان حوزه انرژی گذاشت.`,
      custom: `نتیجهٔ «${testTitle}» برای ${name} در سطح خوب است.`,
    },
    mid: {
      iq: `${name} در هوش تحلیلی در محدوده متوسط است؛ با تمرین منظم مسئله‌حل‌کنی پیشرفت می‌کند.`,
      eq: `${name} در هوش هیجانی متوسط است؛ تمرین گفت‌وگو و مدیریت هیجان کمک می‌کند.`,
      personality: `شخصیت ${name} متعادل دیده می‌شود؛ هنوز نقاط کور رفتاری ممکن است نیاز به گفتگو داشته باشد.`,
      career: `مسیر شغلی/تحصیلی ${name} نیمه‌روشن است؛ تحقیق بیشتر درباره رشته‌ها مفید است.`,
      interest: `علاقه‌ها هنوز کاملاً تثبیت نشده‌اند؛ چند حوزه را باید بیشتر تجربه کند.`,
      custom: `نتیجهٔ «${testTitle}» برای ${name} متوسط است و جای رشد دارد.`,
    },
    weak: {
      iq: `${name} در این آزمون تحلیلی نمره پایین‌تری گرفته؛ بهتر است با تمرین کوتاه روزانه تقویت شود — نه فشار ناگهانی.`,
      eq: `${name} در مهارت‌های هیجانی/ارتباطی نیاز به حمایت دارد؛ گفت‌وگوی مشاوره‌ای و تمرین همدلی پیشنهاد می‌شود.`,
      personality: `در آزمون شخصیت، ${name} نشانه‌هایی از نیاز به بازخورد و تنظیم سبک برخورد دارد.`,
      career: `مسیر آینده برای ${name} هنوز مبهم است؛ هدایت شغلی قدم‌به‌قدم لازم است.`,
      interest: `علاقه‌مندی‌ها کم‌رنگ یا پراکنده‌اند؛ کشف علاقه با فعالیت‌های کوتاه هفتگی کمک می‌کند.`,
      custom: `نتیجهٔ «${testTitle}» برای ${name} پایین‌تر از انتظار است و پیگیری مشاور توصیه می‌شود.`,
    },
  }

  const toneLabel = {
    strong: 'وضعیت خوب',
    mid: 'نیاز به تقویت ملایم',
    weak: 'نیاز به پیگیری',
  }

  const counselorHint = {
    strong: `نقطه قوت را در پرونده برجسته کنید و یک پروژه کوچک واقعی به ${name} پیشنهاد دهید.`,
    mid: `یک هدف کوچک ماهانه برای «${meta.short}» بنویسید و در یادداشت بعدی پیگیری کنید.`,
    weak: `این نتیجه را با لحن حمایتی به ${name}/اولیا توضیح دهید و ۲ تمرین از لیست زیر را شروع کنید.`,
  }

  const plain = (meaningByLevel[level] && meaningByLevel[level][kind])
    || meaningByLevel[level].custom

  return {
    kind,
    meta,
    pct,
    level,
    toneLabel: toneLabel[level],
    testTitle,
    resultLabel: attempt.result_label || toneLabel[level],
    scoreLine: `${pct}٪ · نمره ${Number(attempt.score) || 0} از ${Number(attempt.max_score) || 0}`,
    date,
    whatItMeasures: meta.talent,
    plainMeaning: plain,
    counselorHint: counselorHint[level],
    personTip: (meta.cover || []).slice(0, level === 'strong' ? 2 : 3),
    careersHint: level === 'weak' ? [] : (meta.careers || []).slice(0, 3),
    rawSummary: attempt.result_summary || '',
  }
}

/**
 * خلاصه پرونده یک نفر برای مشاور — زبان ساده
 */
export function buildCounselorPersonBrief(attempts = [], personName = 'این فرد') {
  const insights = buildCounselingInsights(attempts)
  const name = (personName || '').trim() || 'این فرد'
  const explained = (attempts || [])
    .map((a) => explainAttempt(a, { personName: name }))
    .filter(Boolean)

  if (!explained.length) {
    return {
      ...insights,
      personName: name,
      explained: [],
      dossierHeadline: `هنوز آزمونی برای ${name} ثبت نشده.`,
      dossierBody: 'با انجام اولین آزمون مشاوره، تصویر قابل‌فهم از وضعیت این فرد اینجا ساخته می‌شود.',
      followUps: ['یک آزمون IQ یا EQ را برای شروع پیشنهاد کنید.'],
      riskNote: '',
    }
  }

  const strong = explained.filter((e) => e.level === 'strong')
  const weak = explained.filter((e) => e.level === 'weak')
  const mid = explained.filter((e) => e.level === 'mid')

  let dossierHeadline = insights.headline
  if (strong.length && weak.length) {
    dossierHeadline = `${name}: نقطه قوت در «${strong[0].meta.short}» و نیاز به حمایت در «${weak[0].meta.short}».`
  } else if (strong.length) {
    dossierHeadline = `${name} در «${strong[0].meta.short}» عملکرد خوبی داشته است.`
  } else if (weak.length) {
    dossierHeadline = `${name} فعلاً در «${weak[0].meta.short}» نیاز به پیگیری دارد.`
  } else if (mid.length) {
    dossierHeadline = `وضعیت ${name} متعادل است؛ فرصت رشد در «${mid[0].meta.short}» دیده می‌شود.`
  }

  const dossierBody = [
    insights.maturityInfo?.text,
    strong.length
      ? `نقاط قوت قابل اتکا: ${strong.map((e) => e.meta.short).join('، ')}.`
      : null,
    weak.length
      ? `حوزه‌های نیازمند حمایت: ${weak.map((e) => e.meta.short).join('، ')}.`
      : 'حوزهٔ بحرانی مشخصی از روی نمرات دیده نشد.',
  ].filter(Boolean).join(' ')

  const followUps = []
  if (weak[0]) {
    followUps.push(`جلسه بعدی را روی «${weak[0].testTitle}» متمرکز کنید.`)
    ;(weak[0].personTip || []).slice(0, 2).forEach((t) => followUps.push(t))
  } else if (strong[0]) {
    followUps.push(`قدرت «${strong[0].meta.short}» را با یک فعالیت واقعی تقویت کنید.`)
  }
  ;(insights.nextSteps || []).slice(0, 2).forEach((s) => {
    if (!followUps.includes(s)) followUps.push(s)
  })

  return {
    ...insights,
    personName: name,
    explained,
    dossierHeadline,
    dossierBody,
    followUps: followUps.slice(0, 5),
    riskNote: weak.length >= 2
      ? 'چند حوزه نمره پایین دارند؛ سطح پیگیری پرونده را بررسی کنید.'
      : weak.length === 1
        ? 'یک حوزه نیاز به حمایت دارد؛ یادداشت پیگیری پیشنهاد می‌شود.'
        : '',
  }
}

/**
 * @param {Array} attempts - completed counseling attempts from file API
 * @returns {object} insights payload for UI
 */
export function buildCounselingInsights(attempts = []) {
  const rows = (attempts || []).filter((a) => a && (a.max_score > 0 || a.score != null))
  const count = rows.length

  const byKind = {}
  rows.forEach((a) => {
    const k = a.test_kind || 'custom'
    if (!byKind[k]) {
      byKind[k] = {
        kind: k,
        label: a.test_kind_label || KIND_META[k]?.label || k,
        sum: 0,
        n: 0,
        best: 0,
        latestLabel: '',
      }
    }
    const pct = pctOf(a.score, a.max_score)
    byKind[k].sum += pct
    byKind[k].n += 1
    byKind[k].best = Math.max(byKind[k].best, pct)
    if (!byKind[k].latestLabel && a.result_label) byKind[k].latestLabel = a.result_label
  })

  const profiles = Object.values(byKind).map((b) => {
    const avg = Math.round(b.sum / b.n)
    return {
      ...b,
      avg,
      level: levelOf(avg),
      meta: KIND_META[b.kind] || KIND_META.custom,
    }
  }).sort((a, b) => b.avg - a.avg)

  const strong = profiles.filter((p) => p.level === 'strong')
  const mid = profiles.filter((p) => p.level === 'mid')
  const weak = profiles.filter((p) => p.level === 'weak')

  // maturity: more tests + more kinds => richer advice
  const kindsCovered = profiles.length
  let maturity = 'seed'
  if (count >= 5 && kindsCovered >= 3) maturity = 'rich'
  else if (count >= 3 || kindsCovered >= 2) maturity = 'growing'
  else if (count >= 1) maturity = 'seed'

  const maturityCopy = {
    seed: {
      title: 'شروع خودشناسی',
      text: 'با چند آزمون اول، تصویر اولیه‌ای ساخته شده. هر آزمون بعدی پیشنهادها را دقیق‌تر می‌کند.',
    },
    growing: {
      title: 'تصویر در حال تکمیل',
      text: 'نتایج فعلی الگوی استعداد و ضعف را نشان می‌دهد. با تکمیل انواع دیگر آزمون، مسیر شغلی شفاف‌تر می‌شود.',
    },
    rich: {
      title: 'پروفایل نسبتاً کامل',
      text: 'با چند حوزه پوشش‌داده‌شده، می‌توانید روی مسیر شغلی و پوشش نقاط ضعف متمرکز شوید.',
    },
  }

  const talents = strong.length
    ? strong.map((p) => ({
        kind: p.kind,
        title: p.meta.talent || p.label,
        label: p.label,
        pct: p.avg,
        hint: p.latestLabel || null,
      }))
    : mid.slice(0, 2).map((p) => ({
        kind: p.kind,
        title: `زمینه در حال رشد: ${p.meta.short}`,
        label: p.label,
        pct: p.avg,
        hint: 'هنوز در محدوده متوسط است؛ با تمرین می‌تواند به نقطه قوت تبدیل شود.',
      }))

  const careers = uniq(
    profiles.flatMap((p) => {
      if (p.level === 'weak') return []
      const weight = p.level === 'strong' ? p.meta.careers : (p.meta.careers || []).slice(0, 2)
      return weight || []
    }),
    maturity === 'rich' ? 8 : 5,
  )

  const lifePaths = uniq(
    profiles.flatMap((p) => (p.level === 'weak' ? [] : (p.meta.life || []))),
    5,
  )

  const weaknesses = (weak.length ? weak : mid.filter((p) => p.avg < 55)).map((p) => ({
    kind: p.kind,
    label: p.label,
    pct: p.avg,
    why: p.level === 'weak'
      ? `میانگین ${p.avg}٪ نشان می‌دهد این حوزه نیاز به تمرین هدفمند دارد.`
      : `میانگین ${p.avg}٪ متوسط است و با برنامه منظم قابل تقویت است.`,
    actions: (p.meta.cover || []).slice(0, maturity === 'seed' ? 2 : 4),
  }))

  const nextSteps = []
  if (count < 2) {
    nextSteps.push('حداقل یک آزمون دیگر از نوع متفاوت (مثلاً EQ یا شغلی) بدهید تا پیشنهادها کامل‌تر شود.')
  }
  if (!byKind.iq) nextSteps.push('آزمون هوش (IQ) را تکمیل کنید تا استعداد تحلیلی دقیق‌تر سنجیده شود.')
  if (!byKind.eq) nextSteps.push('آزمون هوش هیجانی (EQ) را بدهید؛ برای مسیر شغلی و روابط خیلی مهم است.')
  if (!byKind.career && !byKind.interest) {
    nextSteps.push('آزمون هدایت شغلی یا علاقه‌مندی را انجام دهید تا مسیر آینده واضح‌تر شود.')
  }
  if (weak.length) {
    nextSteps.push(`این هفته روی «${weak[0].label}» تمرکز کنید و یکی از تمرین‌های پیشنهادی را اجرا کنید.`)
  } else if (strong.length) {
    nextSteps.push(`نقطه قوت «${strong[0].label}» را با یک پروژه کوچک واقعی تقویت کنید.`)
  }

  const headline = !count
    ? 'هنوز نتیجه‌ای نیست — با اولین آزمون، پیشنهادها فعال می‌شوند.'
    : strong.length
      ? `استعداد برجسته شما در حوزه «${strong[0].meta.short}» دیده می‌شود.`
      : mid.length
        ? `پروفایل شما متعادل است؛ «${mid[0].meta.short}» نزدیک‌ترین زمینه رشد است.`
        : 'فعلاً تمرکز روی پوشش نقاط ضعف، سریع‌ترین مسیر پیشرفت شماست.'

  return {
    count,
    kindsCovered,
    maturity,
    maturityInfo: maturityCopy[maturity],
    headline,
    profiles,
    talents,
    careers,
    lifePaths,
    weaknesses,
    nextSteps: nextSteps.slice(0, 4),
    empty: count === 0,
  }
}

export { KIND_META, STRONG, MID }
