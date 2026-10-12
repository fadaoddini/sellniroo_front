/** شبکه‌های ازپیش‌تعریف‌شده شبیه المنتور */

export const LAYOUT_PRESETS = [
  {
    id: '100',
    labelFa: 'تمام‌عرض',
    labelEn: 'Full width',
    columns: [100],
    icon: '████',
  },
  {
    id: '50_50',
    labelFa: 'دو ستون مساوی',
    labelEn: '50 / 50',
    columns: [50, 50],
    icon: '██ ██',
  },
  {
    id: '33_33_33',
    labelFa: 'سه ستون',
    labelEn: '33 / 33 / 33',
    columns: [33.33, 33.33, 33.33],
    icon: '█ █ █',
  },
  {
    id: '30_70',
    labelFa: '۳۰ / ۷۰',
    labelEn: '30 / 70',
    columns: [30, 70],
    icon: '█ ███',
  },
  {
    id: '70_30',
    labelFa: '۷۰ / ۳۰',
    labelEn: '70 / 30',
    columns: [70, 30],
    icon: '███ █',
  },
  {
    id: '25_75',
    labelFa: '۲۵ / ۷۵',
    labelEn: '25 / 75',
    columns: [25, 75],
    icon: '▌ ███',
  },
  {
    id: '75_25',
    labelFa: '۷۵ / ۲۵',
    labelEn: '75 / 25',
    columns: [75, 25],
    icon: '███ ▌',
  },
  {
    id: 'cover',
    labelFa: 'جلد تمام‌صفحه',
    labelEn: 'Full cover',
    columns: [100],
    icon: '▣',
    isCover: true,
  },
]

export const WIDGET_TYPES = [
  { type: 'heading', labelFa: 'عنوان', labelEn: 'Heading', icon: 'H' },
  { type: 'text', labelFa: 'متن', labelEn: 'Text', icon: 'T' },
  { type: 'image', labelFa: 'تصویر', labelEn: 'Image', icon: '🖼' },
  { type: 'button', labelFa: 'دکمه', labelEn: 'Button', icon: '▢' },
  { type: 'divider', labelFa: 'جداکننده', labelEn: 'Divider', icon: '—' },
  { type: 'spacer', labelFa: 'فاصله', labelEn: 'Spacer', icon: '↕' },
  { type: 'list', labelFa: 'لیست', labelEn: 'List', icon: '≡' },
]

let _uid = 0
export function uid(prefix = 'id') {
  _uid += 1
  return `${prefix}_${Date.now().toString(36)}_${_uid}`
}

export function createEmptyBlock(type) {
  const id = uid('blk')
  const base = { id, type, data: {} }
  switch (type) {
    case 'heading':
      return {
        ...base,
        data: {
          text_fa: 'عنوان جدید',
          text_en: 'New heading',
          size: 'lg',
          align: 'right',
          color: '',
        },
      }
    case 'text':
      return {
        ...base,
        data: {
          text_fa: 'متن خود را اینجا بنویسید…',
          text_en: 'Write your text here…',
          align: 'right',
        },
      }
    case 'image':
      return {
        ...base,
        data: { url: '', alt: '', radius: 12, fit: 'cover' },
      }
    case 'button':
      return {
        ...base,
        data: {
          label_fa: 'کلیک کنید',
          label_en: 'Click me',
          url: '#',
          style: 'primary',
        },
      }
    case 'divider':
      return { ...base, data: { style: 'solid', color: '' } }
    case 'spacer':
      return { ...base, data: { size: 24 } }
    case 'list':
      return {
        ...base,
        data: {
          items_fa: 'مورد اول\nمورد دوم\nمورد سوم',
          items_en: 'Item one\nItem two\nItem three',
        },
      }
    default:
      return base
  }
}

export function createSection(layoutId = '100') {
  const preset = LAYOUT_PRESETS.find((l) => l.id === layoutId) || LAYOUT_PRESETS[0]
  return {
    id: uid('sec'),
    layout: preset.id,
    background: preset.isCover ? '#1a0a12' : '',
    padding: 'md',
    columns: preset.columns.map(() => ({
      id: uid('col'),
      blocks: [],
    })),
  }
}

export function emptyBuilder(layoutId = '100') {
  return { sections: [createSection(layoutId)] }
}

/** تبدیل صفحات قدیمی به ساختار builder */
export function legacyPageToBuilder(page) {
  if (page?.builder?.sections?.length) {
    return page.builder
  }

  const type = page?.page_type || 'text'

  if (type === 'cover') {
    const section = createSection('cover')
    section.background = page.cover_bg || '#1a0a12'
    section.columns[0].blocks = [
      createEmptyBlock('heading'),
      createEmptyBlock('divider'),
      createEmptyBlock('text'),
    ]
    section.columns[0].blocks[0].data = {
      text_fa: page.title_fa || '',
      text_en: page.title_en || '',
      size: 'xl',
      align: 'center',
      color: '#ffffff',
    }
    section.columns[0].blocks[2].data = {
      text_fa: page.subtitle_fa || '',
      text_en: page.subtitle_en || '',
      align: 'center',
      color: 'rgba(255,255,255,0.85)',
    }
    if (page.cover_image_url) {
      const img = createEmptyBlock('image')
      img.data.url = page.cover_image_url
      section.columns[0].blocks.unshift(img)
    }
    return { sections: [section] }
  }

  if (type === 'image_text') {
    const section = createSection('50_50')
    const img = createEmptyBlock('image')
    img.data.url = page.image_url || ''
    section.columns[0].blocks = [img]
    section.columns[1].blocks = [
      {
        ...createEmptyBlock('heading'),
        data: {
          text_fa: page.title_fa || '',
          text_en: page.title_en || '',
          size: 'lg',
          align: 'right',
          color: '',
        },
      },
      {
        ...createEmptyBlock('text'),
        data: {
          text_fa: page.body_fa || '',
          text_en: page.body_en || '',
          align: 'right',
        },
      },
    ]
    return { sections: [section] }
  }

  if (type === 'cards') {
    const section = createSection('100')
    section.columns[0].blocks = [
      {
        ...createEmptyBlock('heading'),
        data: {
          text_fa: page.title_fa || '',
          text_en: page.title_en || '',
          size: 'lg',
          align: 'right',
          color: '',
        },
      },
      {
        ...createEmptyBlock('text'),
        data: {
          text_fa: page.body_fa || '',
          text_en: page.body_en || '',
          align: 'right',
        },
      },
      {
        ...createEmptyBlock('list'),
        data: {
          items_fa: (page.cards || [])
            .map((c) => `${c.title_fa || ''}: ${c.desc_fa || ''}`)
            .join('\n'),
          items_en: (page.cards || [])
            .map((c) => `${c.title_en || ''}: ${c.desc_en || ''}`)
            .join('\n'),
        },
      },
    ]
    return { sections: [section] }
  }

  // text
  const section = createSection('100')
  section.columns[0].blocks = [
    {
      ...createEmptyBlock('heading'),
      data: {
        text_fa: page.title_fa || '',
        text_en: page.title_en || '',
        size: 'lg',
        align: 'right',
        color: '',
      },
    },
    {
      ...createEmptyBlock('text'),
      data: {
        text_fa: page.body_fa || page.subtitle_fa || '',
        text_en: page.body_en || page.subtitle_en || '',
        align: 'right',
      },
    },
  ]
  return { sections: [section] }
}

export function getLayoutPreset(layoutId) {
  return LAYOUT_PRESETS.find((l) => l.id === layoutId) || LAYOUT_PRESETS[0]
}
