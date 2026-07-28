// ชุด key ของข้อความในแอปทั้งหมด — เพิ่ม UI string ใหม่ต้องเพิ่ม field ที่นี่ก่อน แล้วเติมค่าทั้งใน th และ en ด้านล่าง
export interface Translations {
  // Header nav
  homeNav: string;
  historyNav: string;
  guideNav: string;
  loginNav: string;
  logout: string;
  logoutConfirmTitle: string;
  logoutConfirmDesc: string;
  logoutCancel: string;
  guestModeNotice: string;
  // Hero
  appTitle: string;
  appSubtitle: string;
  // Upload zone
  dropHere: string;
  clickToBrowse: string;
  supports: string;
  autoTranscribeNote: string;
  changeFile: string;
  // Input mode toggle (audio upload vs typed text)
  inputModeAudio: string;
  inputModeText: string;
  textModePlaceholder: string;
  textModeContinue: string;
  manualEntryHint: string;
  editAgain: string;
  // Buttons
  analyzeAiBtn: string;
  retranscribe: string;
  retryTranscribe: string;
  reset: string;
  // Editable transcript
  editTranscriptLabel: string;
  editTranscriptHint: string;
  // Loading states
  transcribing: string;
  analyzing: string;
  // Pipeline steps
  stepUpload: string;
  stepReview: string;
  stepResult: string;
  // Result card
  totalManday: string;
  mandays: string;
  basedOn: string;
  moduleWord: string;
  sumOfModules: string;
  scopeOfWork: string;
  modulesBreakdown: string;
  colModule: string;
  colDescription: string;
  colMandays: string;
  total: string;
  assumptions: string;
  assumptionsShort: string;
  // History page
  historyTitle: string;
  historySubtitle: string;
  historyEmpty: string;
  historyEmptyDesc: string;
  backHome: string;
  backToHistory: string;
  viewDetail: string;
  hideDetail: string;
  detailNotFound: string;
  detailNotFoundDesc: string;
  sourceTranscript: string;
  savedAt: string;
  loadingHistory: string;
  transcriptLabel: string;
  // Reliability
  reliabilityLabel: string;
  reliabilityHigh: string;
  reliabilityMedium: string;
  reliabilityLow: string;
  reliabilityHint: string;
  // Delete history
  deleteItem: string;
  deleteConfirm: string;
  deleteCancel: string;
  deleting: string;
  reAnalyze: string;
  reAnalyzeToast: string;
  // Search & Pagination
  searchPlaceholder: string;
  searchClear: string;
  searchNoResults: string;
  searchNoResultsDesc: string;
  showingOf: string;
  items: string;
  prevPage: string;
  nextPage: string;
  // Copy / Export
  copyJson: string;
  exportCsv: string;
  exportJson: string;
  exportMarkdown: string;
  copyMarkdown: string;
  printPdf: string;
  exportMenu: string;
  copyGroup: string;
  downloadGroup: string;
  exportJsonSuccess: string;
  exportMarkdownSuccess: string;
  copied: string;
  exportCsvSuccess: string;
  deleteSuccess: string;
  generating: string;
  printReportTitle: string;
  printGeneratedOn: string;
  // Audio replay in history
  playAudio: string;
  selectAudioFile: string;
  changeAudioFile: string;
  // Remove file
  removeFile: string;
  // Result divider
  resultLabel: string;
  // Transcript word counter
  wordsUnit: string;
  // Reliability tooltip labels
  reliabilityAssumptions: string;
  reliabilityRangeSpread: string;
  reliabilityDetailBonus: string;
  reliabilityScore: string;
  // Copy error
  copyFailed: string;
  // Errors
  invalidFileType: string;
}

// ข้อความภาษาไทย (ค่าเริ่มต้นของแอป)
export const th: Translations = {
  homeNav: 'หน้าหลัก',
  historyNav: 'ประวัติ',
  guideNav: 'วิธีใช้',
  loginNav: 'เข้าสู่ระบบ',
  logout: 'ออกจากระบบ',
  logoutConfirmTitle: 'ออกจากระบบ?',
  logoutConfirmDesc: 'ต้องการออกจากบัญชี {email} ใช่ไหม',
  logoutCancel: 'ยกเลิก',
  guestModeNotice: 'ยังไม่ได้เข้าสู่ระบบ คุณประเมินงานได้ตามปกติ แต่ระบบจะไม่เก็บผลไว้ในประวัติ',
  appTitle: 'AI Manday Estimator',
  appSubtitle: 'ใส่ไฟล์เสียงหรือรายละเอียดงาน แล้วให้ระบบช่วยสรุป SOW และประเมิน Manday',
  dropHere: 'วางไฟล์เสียงที่นี่ หรือ',
  clickToBrowse: 'คลิกเพื่อเลือกไฟล์',
  supports: 'รองรับ .mp3, .wav, .m4a — ไม่เกิน ~25 MB',
  autoTranscribeNote: 'ระบบจะถอดเสียงให้อัตโนมัติทันทีที่เลือกไฟล์',
  changeFile: 'คลิกหรือวางไฟล์ใหม่เพื่อเปลี่ยนไฟล์',
  inputModeAudio: 'ไฟล์เสียง',
  inputModeText: 'พิมพ์ข้อความ',
  textModePlaceholder: 'พิมพ์รายละเอียดงาน เช่น "อยากได้เว็บขายสินค้า มีตะกร้า ระบบสมาชิก และรับชำระผ่านบัตรเครดิต..."',
  textModeContinue: 'ตรวจข้อความต่อ',
  manualEntryHint: 'ใส่รายละเอียดให้ครบเท่าที่มี เพื่อให้ประเมินได้ใกล้เคียงขึ้น',
  editAgain: 'กลับไปแก้ข้อความ',
  analyzeAiBtn: 'วิเคราะห์ด้วย AI',
  retranscribe: 'ถอดเสียงใหม่',
  retryTranscribe: 'ลองถอดเสียงอีกครั้ง',
  reset: 'เริ่มใหม่',
  editTranscriptLabel: 'ตรวจข้อความก่อนนำไปประเมิน',
  editTranscriptHint: 'ลองเทียบกับเสียงต้นฉบับและแก้คำที่ถอดผิด โดยเฉพาะชื่อระบบหรือคำเฉพาะ',
  transcribing: 'กำลังถอดเสียง…',
  analyzing: 'กำลังวิเคราะห์…',
  stepUpload: 'เริ่มต้น',
  stepReview: 'ตรวจข้อความ',
  stepResult: 'ผลลัพธ์',
  totalManday: 'Manday รวมโดยประมาณ',
  mandays: 'วันทำงาน',
  basedOn: 'จาก',
  moduleWord: 'โมดูล',
  sumOfModules: 'รวมทุกโมดูล',
  scopeOfWork: 'ขอบเขตงาน (SOW)',
  modulesBreakdown: 'รายละเอียดแต่ละโมดูล',
  colModule: 'โมดูล',
  colDescription: 'รายละเอียด',
  colMandays: 'วันทำงาน',
  total: 'รวม',
  assumptions: 'สมมติฐานและข้อมูลที่ยังต้องยืนยัน',
  assumptionsShort: 'สมมติฐาน',
  historyTitle: 'ประวัติการประเมิน',
  historySubtitle: 'ผลประเมินที่บันทึกไว้ในบัญชีนี้',
  historyEmpty: 'ยังไม่มีประวัติการประเมิน',
  historyEmptyDesc: 'ลองประเมินงานจากไฟล์เสียงหรือข้อความ แล้วผลจะมาอยู่ที่นี่',
  backHome: 'กลับหน้าหลัก',
  backToHistory: 'กลับไปหน้าประวัติ',
  viewDetail: 'ดูรายละเอียด',
  hideDetail: 'ซ่อน',
  detailNotFound: 'ไม่พบรายการนี้',
  detailNotFoundDesc: 'รายการนี้อาจถูกลบไปแล้ว หรือลิงก์ที่เปิดมาไม่ถูกต้อง',
  sourceTranscript: 'ข้อความที่ใช้ประเมิน',
  savedAt: 'บันทึกเมื่อ',
  loadingHistory: 'กำลังโหลด…',
  transcriptLabel: 'Transcript',
  reliabilityLabel: 'ความน่าเชื่อถือ',
  reliabilityHigh: 'ความเชื่อมั่นสูง',
  reliabilityMedium: 'ความเชื่อมั่นปานกลาง',
  reliabilityLow: 'ความเชื่อมั่นต่ำ',
  reliabilityHint: 'ดูจากจำนวนสมมติฐาน ความกว้างของช่วง Manday และรายละเอียดของแต่ละโมดูล',
  deleteItem: 'ลบ',
  deleteConfirm: 'ลบรายการนี้ใช่ไหม?',
  deleteCancel: 'ยกเลิก',
  deleting: 'กำลังลบ…',
  reAnalyze: 'วิเคราะห์ใหม่',
  reAnalyzeToast: 'นำข้อความเดิมกลับมาแล้ว แก้ไขแล้วกด “วิเคราะห์ด้วย AI” ได้เลย',
  searchPlaceholder: 'ค้นหาตามชื่อไฟล์…',
  searchClear: 'ล้าง',
  searchNoResults: 'ไม่พบรายการที่ตรงกัน',
  searchNoResultsDesc: 'ลองใช้คำค้นอื่น หรือล้างช่องค้นหา',
  showingOf: 'แสดง {from}–{to} จาก {total} รายการ',
  items: 'รายการ',
  prevPage: 'ก่อนหน้า',
  nextPage: 'ถัดไป',
  copyJson: 'คัดลอก JSON',
  exportCsv: 'ส่งออก CSV',
  copyMarkdown: 'คัดลอก Markdown',
  exportJson: 'บันทึก JSON',
  exportMarkdown: 'บันทึก Markdown',
  printPdf: 'พิมพ์ / PDF',
  exportMenu: 'ส่งออก',
  copyGroup: 'คัดลอกไปคลิปบอร์ด',
  downloadGroup: 'ดาวน์โหลดไฟล์',
  copied: 'คัดลอกแล้ว',
  exportCsvSuccess: 'ดาวน์โหลด CSV แล้ว',
  exportJsonSuccess: 'ดาวน์โหลด JSON แล้ว',
  exportMarkdownSuccess: 'ดาวน์โหลด Markdown แล้ว',
  deleteSuccess: 'ลบเรียบร้อยแล้ว',
  generating: 'กำลังสร้าง…',
  printReportTitle: 'รายงานประมาณการโครงการ',
  printGeneratedOn: 'สร้างเมื่อ',
  removeFile: 'ลบออก',
  playAudio: 'เสียงต้นฉบับ',
  selectAudioFile: 'เลือกไฟล์เสียงต้นฉบับ (.mp3 / .wav / .m4a)',
  changeAudioFile: 'เปลี่ยนไฟล์',
  resultLabel: 'ผลลัพธ์',
  wordsUnit: 'คำ',
  reliabilityAssumptions: 'สมมติฐาน',
  reliabilityRangeSpread: 'ความกว้างของช่วง',
  reliabilityDetailBonus: 'ความครบถ้วนของรายละเอียด',
  reliabilityScore: 'คะแนน',
  copyFailed: 'คัดลอกไม่สำเร็จ',
  invalidFileType: 'รองรับเฉพาะไฟล์ .mp3, .wav และ .m4a',
};

// ข้อความภาษาอังกฤษ
export const en: Translations = {
  homeNav: 'Home',
  historyNav: 'History',
  guideNav: 'Guide',
  loginNav: 'Log In',
  logout: 'Log Out',
  logoutConfirmTitle: 'Log out?',
  logoutConfirmDesc: 'Are you sure you want to log out of {email}?',
  logoutCancel: 'Cancel',
  guestModeNotice: "You're not logged in. You can still create an estimate, but it won't be saved to your history.",
  appTitle: 'AI Manday Estimator',
  appSubtitle: 'Add an audio recording or written brief to prepare a SOW and manday estimate',
  dropHere: 'Drop audio file here, or',
  clickToBrowse: 'click to browse',
  supports: 'Supports .mp3, .wav, .m4a — max ~25 MB',
  autoTranscribeNote: 'Transcription starts automatically when you select a file',
  changeFile: 'Click or drop a new file to replace',
  inputModeAudio: 'Audio File',
  inputModeText: 'Type Text',
  textModePlaceholder: 'Type your requirement details here, e.g. "We need an e-commerce site with a shopping cart, membership system, and credit card payments..."',
  textModeContinue: 'Review Text',
  manualEntryHint: 'Include as much detail as you have for a more useful estimate',
  editAgain: 'Back to Editing',
  analyzeAiBtn: 'Analyze with AI',
  retranscribe: 'Re-transcribe',
  retryTranscribe: 'Retry transcription',
  reset: 'Reset',
  editTranscriptLabel: 'Review the text before estimating',
  editTranscriptHint: 'Compare it with the original audio and correct any names or technical terms.',
  transcribing: 'Transcribing audio…',
  analyzing: 'Analyzing requirements…',
  stepUpload: 'Start',
  stepReview: 'Review',
  stepResult: 'Result',
  totalManday: 'Estimated Total Mandays',
  mandays: 'mandays',
  basedOn: 'Based on',
  moduleWord: 'modules',
  sumOfModules: 'Sum of modules',
  scopeOfWork: 'Scope of Work',
  modulesBreakdown: 'Modules Breakdown',
  colModule: 'Module',
  colDescription: 'Description',
  colMandays: 'Mandays',
  total: 'Total',
  assumptions: 'Assumptions and Open Questions',
  assumptionsShort: 'assumptions',
  historyTitle: 'Estimation History',
  historySubtitle: 'Estimates saved to this account',
  historyEmpty: 'No estimations yet',
  historyEmptyDesc: 'Create an estimate from audio or text and it will appear here',
  backHome: 'Back to Home',
  backToHistory: 'Back to History',
  viewDetail: 'View Details',
  hideDetail: 'Hide',
  detailNotFound: 'Item not found',
  detailNotFoundDesc: 'This item may have been deleted, or the link is invalid',
  sourceTranscript: 'Text used for this estimate',
  savedAt: 'Saved at',
  loadingHistory: 'Loading…',
  transcriptLabel: 'Transcript',
  reliabilityLabel: 'Reliability',
  reliabilityHigh: 'High Confidence',
  reliabilityMedium: 'Medium Confidence',
  reliabilityLow: 'Low Confidence',
  reliabilityHint: 'Based on the assumptions, manday range, and level of detail in each module',
  deleteItem: 'Delete',
  deleteConfirm: 'Delete this item?',
  deleteCancel: 'Cancel',
  deleting: 'Deleting…',
  reAnalyze: 'Re-analyze',
  reAnalyzeToast: 'The original text is ready. Make your edits, then click “Analyze with AI.”',
  searchPlaceholder: 'Search by filename…',
  searchClear: 'Clear',
  searchNoResults: 'No matching results',
  searchNoResultsDesc: 'Try a different filename',
  showingOf: 'Showing {from}–{to} of {total} items',
  items: 'items',
  prevPage: 'Prev',
  nextPage: 'Next',
  copyJson: 'Copy JSON',
  exportCsv: 'Export CSV',
  copyMarkdown: 'Copy Markdown',
  exportJson: 'Save JSON',
  exportMarkdown: 'Save Markdown',
  printPdf: 'Print / PDF',
  exportMenu: 'Export',
  copyGroup: 'Copy to clipboard',
  downloadGroup: 'Download file',
  copied: 'Copied',
  exportCsvSuccess: 'CSV downloaded',
  exportJsonSuccess: 'JSON downloaded',
  exportMarkdownSuccess: 'Markdown downloaded',
  deleteSuccess: 'Deleted successfully',
  generating: 'Generating…',
  printReportTitle: 'Project Estimation Report',
  printGeneratedOn: 'Generated on',
  removeFile: 'Remove',
  playAudio: 'Original Audio',
  selectAudioFile: 'Select original audio file (.mp3 / .wav / .m4a)',
  changeAudioFile: 'Change file',
  resultLabel: 'Result',
  wordsUnit: 'words',
  reliabilityAssumptions: 'Assumptions',
  reliabilityRangeSpread: 'Range spread',
  reliabilityDetailBonus: 'Detail bonus',
  reliabilityScore: 'Score',
  copyFailed: 'Copy failed',
  invalidFileType: 'Invalid file type. Please upload .mp3, .wav, or .m4a',
};
