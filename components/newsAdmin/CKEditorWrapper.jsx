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
  constructor(loader) { this.loader = loader }
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
    xhr.open('POST', `${getBaseUrl()}/api/news/upload-image/`, true)
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
      resolve({ default: response.url })
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

function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new CustomUploadAdapter(loader)
  }
}

const CKEditorWrapper = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null)
  const lastValueRef = useRef(value || '')

  const editorConfig = useMemo(
    () => ({
      licenseKey: 'GPL',
      language: 'fa',
      direction: 'rtl',
      placeholder: placeholder || 'متن کامل خبر را اینجا بنویسید...',
      extraPlugins: [CustomUploadAdapterPlugin],
      plugins: [
        Essentials, Paragraph, Bold, Italic, Underline, Strikethrough,
        Heading, Link, List, BlockQuote, Table, TableToolbar,
        Image, ImageUpload, ImageResize, ImageStyle, ImageToolbar, ImageCaption,
        MediaEmbed, Indent, Alignment, FontColor, FontBackgroundColor,
        FontSize, FontFamily, Highlight, HorizontalLine, RemoveFormat,
        SourceEditing, CodeBlock, Code, SpecialCharacters,
        SpecialCharactersEssentials, FindAndReplace, PasteFromOffice,
        Autoformat, TextTransformation, GeneralHtmlSupport,
      ],
      toolbar: {
        items: [
          'undo', 'redo', '|',
          'heading', '|',
          'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
          'bold', 'italic', 'underline', 'strikethrough', 'code', '|',
          'alignment', '|',
          'bulletedList', 'numberedList', 'outdent', 'indent', '|',
          'link', 'blockQuote', 'uploadImage', 'mediaEmbed', 'insertTable', 'horizontalLine', '|',
          'highlight', 'specialCharacters', 'findAndReplace', 'removeFormat', '|',
          'sourceEditing',
        ],
        shouldNotGroupWhenFull: false,
      },
      heading: {
        options: [
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
        toolbar: [
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
    [placeholder]
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
    <div className={styles.ckEditorRoot}>
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
          console.log('✅ CKEditor ready, data length:', editor.getData().length)
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