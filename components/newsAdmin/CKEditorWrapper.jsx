// components/newsAdmin/CKEditorWrapper.jsx
'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Essentials, Paragraph, Bold, Italic, Underline, Strikethrough,
  Heading, Link, List, BlockQuote, Table, TableToolbar,
  Image, ImageUpload, ImageResize, ImageStyle, ImageToolbar, ImageCaption,
  MediaEmbed, Indent, Alignment, FontColor, FontBackgroundColor,
  FontSize, FontFamily, Highlight, HorizontalLine, RemoveFormat,
  SourceEditing, CodeBlock, Code, SpecialCharacters,
  SpecialCharactersEssentials, FindAndReplace, PasteFromOffice,
  Autoformat, TextTransformation, GeneralHtmlSupport,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'
import styles from '@/styles/modules/NewsManagement.module.css'

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

// ============================================================
// Adapter آپلود
// ============================================================
class CustomUploadAdapter {
  constructor(loader, uploadUrl) {
    this.loader = loader
    this.uploadUrl = uploadUrl || `${getBaseUrl()}/api/news/upload-image/`
  }
  upload() {
    return this.loader.file.then(
      (file) => new Promise((resolve, reject) => {
        this._initRequest()
        this._initListeners(resolve, reject, file)
        this._sendRequest(file)
      })
    )
  }
  abort() { if (this.xhr) this.xhr.abort() }
  _initRequest() {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', this.uploadUrl, true)
    xhr.responseType = 'json'
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    this.xhr = xhr
  }
  _initListeners(resolve, reject, file) {
    const xhr = this.xhr
    const loader = this.loader
    const genericErrorText = `خطا در آپلود فایل: ${file.name}`
    xhr.addEventListener('error', () => reject(genericErrorText))
    xhr.addEventListener('abort', () => reject())
    xhr.addEventListener('load', () => {
      const response = xhr.response
      if (!response || response.error) {
        return reject(response && response.error ? response.error.message : genericErrorText)
      }
      const url = response.url || response?.data?.url
      if (!url) return reject(genericErrorText)
      resolve({ default: url })
    })
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total
          loader.uploaded = evt.loaded
        }
      })
    }
  }
  _sendRequest(file) {
    const data = new FormData()
    data.append('upload', file)
    this.xhr.send(data)
  }
}

function createUploadAdapterPlugin(uploadUrl) {
  return function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CustomUploadAdapter(loader, uploadUrl)
    }
  }
}

const FULL_PLUGINS = [
  Essentials, Paragraph, Bold, Italic, Underline, Strikethrough,
  Heading, Link, List, BlockQuote, Table, TableToolbar,
  Image, ImageUpload, ImageResize, ImageStyle, ImageToolbar, ImageCaption,
  MediaEmbed, Indent, Alignment, FontColor, FontBackgroundColor,
  FontSize, FontFamily, Highlight, HorizontalLine, RemoveFormat,
  SourceEditing, CodeBlock, Code, SpecialCharacters,
  SpecialCharactersEssentials, FindAndReplace, PasteFromOffice,
  Autoformat, TextTransformation, GeneralHtmlSupport,
]

const COMPACT_PLUGINS = [
  Essentials, Paragraph, Bold, Italic, Underline,
  Heading, Link, List, Alignment,
  Image, ImageUpload, ImageResize, ImageStyle, ImageToolbar,
  PasteFromOffice, Autoformat, TextTransformation, GeneralHtmlSupport,
]

const FULL_TOOLBAR = [
  'undo', 'redo', '|',
  'heading', '|',
  'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
  'bold', 'italic', 'underline', 'strikethrough', 'code', '|',
  'alignment', '|',
  'bulletedList', 'numberedList', 'outdent', 'indent', '|',
  'link', 'blockQuote', 'uploadImage', 'mediaEmbed', 'insertTable', 'horizontalLine', '|',
  'highlight', 'specialCharacters', 'findAndReplace', 'removeFormat', '|',
  'sourceEditing',
]

/** یک ردیف فشرده — فقط ابزارهای ضروری */
const COMPACT_TOOLBAR = [
  'bold',
  'italic',
  'underline',
  '|',
  'heading',
  'alignment',
  '|',
  'bulletedList',
  'numberedList',
  '|',
  'link',
  'uploadImage',
  '|',
  'undo',
  'redo',
]

const CKEditorWrapper = ({
  value,
  onChange,
  placeholder,
  compact = false,
  uploadUrl = null,
}) => {
  const editorRef = useRef(null)
  const lastValueRef = useRef(value || '')

  const editorConfig = useMemo(
    () => ({
      licenseKey: 'GPL',
      language: 'fa',
      direction: 'rtl',
      placeholder: placeholder || 'متن کامل خبر را اینجا بنویسید...',
      extraPlugins: [createUploadAdapterPlugin(uploadUrl)],
      plugins: compact ? COMPACT_PLUGINS : FULL_PLUGINS,
      toolbar: {
        items: compact ? COMPACT_TOOLBAR : FULL_TOOLBAR,
        shouldNotGroupWhenFull: !compact,
      },
      heading: {
        options: compact
          ? [
              { model: 'paragraph', title: 'متن', class: 'ck-heading_paragraph' },
              { model: 'heading2', view: 'h2', title: 'تیتر', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'زیرتیتر', class: 'ck-heading_heading3' },
            ]
          : [
              { model: 'paragraph', title: 'پاراگراف', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'تیتر ۱', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'تیتر ۲', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'تیتر ۳', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'تیتر ۴', class: 'ck-heading_heading4' },
            ],
      },
      image: {
        resizeUnit: '%',
        resizeOptions: [
          { name: 'resizeImage:original', value: null, label: 'اندازه اصلی' },
          { name: 'resizeImage:25', value: '25', label: '25%' },
          { name: 'resizeImage:50', value: '50', label: '50%' },
          { name: 'resizeImage:75', value: '75', label: '75%' },
        ],
        toolbar: compact
          ? ['imageStyle:inline', 'imageStyle:block', '|', 'resizeImage']
          : [
              'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
              'toggleImageCaption', 'imageTextAlternative', '|',
              'resizeImage',
            ],
      },
      table: {
        contentToolbar: [
          'tableColumn', 'tableRow', 'mergeTableCells',
          'tableProperties', 'tableCellProperties',
        ],
      },
      htmlSupport: {
        allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
      },
    }),
    [placeholder, compact, uploadUrl]
  )

  // ✅ وقتی value از بیرون تغییر کرد، ادیتور رو آپدیت کن
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const currentData = editor.getData()
    const newValue = value || ''

    if (newValue !== currentData && newValue !== lastValueRef.current) {
      console.log('✏️ CKEditor setData:', newValue.substring(0, 100))
      editor.setData(newValue)
      lastValueRef.current = newValue
    }
  }, [value])

  return (
    <div
      className={[
        styles.ckEditorRoot,
        compact ? styles.ckEditorCompact : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value || ''}
        onReady={(editor) => {
          editorRef.current = editor
          // ✅ مطمئن شو data درست set شده
          if (value) {
            editor.setData(value)
            lastValueRef.current = value
          }
        }}
        onChange={(event, editor) => {
          const data = editor.getData()
          lastValueRef.current = data
          onChange(data)
        }}
        onError={(error) => {
          console.error('❌ CKEditor error:', error)
        }}
      />
    </div>
  )
}

export default CKEditorWrapper