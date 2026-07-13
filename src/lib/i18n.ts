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

export const th: Translations = {
  homeNav: 'หน้าหลัก',
  historyNav: 'ประวัติ',
  guideNav: 'วิธีใช้',
  loginNav: 'เข้าสู่ระบบ',
  logout: 'ออกจากระบบ',
  logoutConfirmTitle: 'ออกจากระบบ?',
  logoutConfirmDesc: 'คุณต้องการออกจากระบบบัญชี {email} ใช่หรือไม่',
  logoutCancel: 'ยกเลิก',
  guestModeNotice: 'คุณยังไม่ได้เข้าสู่ระบบ ใช้งานได้ตามปกติ แต่ผลลัพธ์จะไม่ถูกบันทึกในประวัติ',
  appTitle: 'AI Manday Estimator',
  appSubtitle: 'อัปโหลดไฟล์เสียง Requirement เพื่อรับ SOW และประมาณการ Manday จาก AI',
  dropHere: 'วางไฟล์เสียงที่นี่ หรือ',
  clickToBrowse: 'คลิกเพื่อเลือกไฟล์',
  supports: 'รองรับ .mp3, .wav, .m4a — ไม่เกิน ~25 MB',
  autoTranscribeNote: 'ระบบจะถอดเสียงให้อัตโนมัติทันทีที่เลือกไฟล์',
  changeFile: 'คลิกหรือวางไฟล์ใหม่เพื่อเปลี่ยนไฟล์',
  inputModeAudio: 'ไฟล์เสียง',
  inputModeText: 'พิมพ์ข้อความ',
  textModePlaceholder: 'พิมพ์รายละเอียด Requirement ที่นี่ เช่น "อยากได้เว็บอีคอมเมิร์ซ มีระบบตะกร้าสินค้า ระบบสมาชิก และชำระเงินผ่านบัตรเครดิต..."',
  textModeContinue: 'ดำเนินการต่อ',
  manualEntryHint: 'ตรวจสอบข้อความให้ครบถ้วนก่อนส่งให้ AI วิเคราะห์',
  editAgain: 'แก้ไขข้อความใหม่',
  analyzeAiBtn: 'วิเคราะห์ด้วย AI',
  retranscribe: 'ถอดเสียงใหม่',
  retryTranscribe: 'ลองถอดเสียงอีกครั้ง',
  reset: 'เริ่มใหม่',
  editTranscriptLabel: 'ตรวจสอบและแก้ไขข้อความก่อนวิเคราะห์',
  editTranscriptHint: 'AI ถอดเสียงอาจมีข้อผิดพลาด สามารถแก้ไขข้อความก่อนส่งให้ AI วิเคราะห์ได้',
  transcribing: 'กำลังถอดเสียง…',
  analyzing: 'กำลังวิเคราะห์…',
  stepUpload: 'เริ่มต้น',
  stepReview: 'ตรวจข้อความ',
  stepResult: 'ผลลัพธ์',
  totalManday: 'ประมาณการ Manday รวม',
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
  assumptions: 'สมมติฐาน / ข้อมูลที่ต้องสอบถามเพิ่ม',
  assumptionsShort: 'สมมติฐาน',
  historyTitle: 'ประวัติการประเมิน',
  historySubtitle: 'รายการประมาณการทั้งหมดที่บันทึกไว้',
  historyEmpty: 'ยังไม่มีประวัติการประเมิน',
  historyEmptyDesc: 'กลับไปหน้าหลักและอัปโหลดไฟล์เสียงเพื่อเริ่มต้น',
  backHome: 'กลับหน้าหลัก',
  backToHistory: 'กลับไปหน้าประวัติ',
  viewDetail: 'ดูรายละเอียด',
  hideDetail: 'ซ่อน',
  detailNotFound: 'ไม่พบรายการนี้',
  detailNotFoundDesc: 'รายการอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง',
  sourceTranscript: 'ข้อความต้นฉบับจากเสียง',
  savedAt: 'บันทึกเมื่อ',
  loadingHistory: 'กำลังโหลด…',
  transcriptLabel: 'Transcript',
  reliabilityLabel: 'ความน่าเชื่อถือ',
  reliabilityHigh: 'ความเชื่อมั่นสูง',
  reliabilityMedium: 'ความเชื่อมั่นปานกลาง',
  reliabilityLow: 'ความเชื่อมั่นต่ำ',
  reliabilityHint: 'คำนวณจากจำนวนสมมติฐาน, ความกว้างของ range และความละเอียดของ breakdown',
  deleteItem: 'ลบ',
  deleteConfirm: 'ยืนยันลบ?',
  deleteCancel: 'ยกเลิก',
  deleting: 'กำลังลบ…',
  reAnalyze: 'วิเคราะห์ใหม่',
  reAnalyzeToast: 'โหลด transcript แล้ว — แก้ไขและกด "วิเคราะห์ด้วย AI" ได้เลย',
  searchPlaceholder: 'ค้นหาตามชื่อไฟล์…',
  searchClear: 'ล้าง',
  searchNoResults: 'ไม่พบรายการที่ตรงกัน',
  searchNoResultsDesc: 'ลองค้นหาด้วยชื่อไฟล์อื่น',
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
  copied: 'คัดลอกแล้ว!',
  exportCsvSuccess: 'ดาวน์โหลด CSV แล้ว!',
  exportJsonSuccess: 'ดาวน์โหลด JSON แล้ว!',
  exportMarkdownSuccess: 'ดาวน์โหลด Markdown แล้ว!',
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
  reliabilityRangeSpread: 'ช่วง Range',
  reliabilityDetailBonus: 'โบนัสรายละเอียด',
  reliabilityScore: 'คะแนน',
  copyFailed: 'คัดลอกไม่สำเร็จ',
  invalidFileType: 'ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือก .mp3, .wav หรือ .m4a',
};

export const en: Translations = {
  homeNav: 'Home',
  historyNav: 'History',
  guideNav: 'Guide',
  loginNav: 'Log In',
  logout: 'Log Out',
  logoutConfirmTitle: 'Log out?',
  logoutConfirmDesc: 'Are you sure you want to log out of {email}?',
  logoutCancel: 'Cancel',
  guestModeNotice: "You're not logged in — everything still works, but results won't be saved to your history.",
  appTitle: 'AI Manday Estimator',
  appSubtitle: 'Upload an audio requirement recording to get AI-generated SOW and manday estimate',
  dropHere: 'Drop audio file here, or',
  clickToBrowse: 'click to browse',
  supports: 'Supports .mp3, .wav, .m4a — max ~25 MB',
  autoTranscribeNote: 'Transcription starts automatically when you select a file',
  changeFile: 'Click or drop a new file to replace',
  inputModeAudio: 'Audio File',
  inputModeText: 'Type Text',
  textModePlaceholder: 'Type your requirement details here, e.g. "We need an e-commerce site with a shopping cart, membership system, and credit card payments..."',
  textModeContinue: 'Continue',
  manualEntryHint: 'Double-check your text is complete before sending it to AI for analysis',
  editAgain: 'Edit Again',
  analyzeAiBtn: 'Analyze with AI',
  retranscribe: 'Re-transcribe',
  retryTranscribe: 'Retry transcription',
  reset: 'Reset',
  editTranscriptLabel: 'Review & edit transcript before analysis',
  editTranscriptHint: 'STT may not be 100% accurate. Edit the text below before sending to AI.',
  transcribing: 'Transcribing audio…',
  analyzing: 'Analyzing requirements…',
  stepUpload: 'Start',
  stepReview: 'Review',
  stepResult: 'Result',
  totalManday: 'Total Manday Estimate',
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
  assumptions: 'Assumptions / Missing Info',
  assumptionsShort: 'assumptions',
  historyTitle: 'Estimation History',
  historySubtitle: 'All saved estimations',
  historyEmpty: 'No estimations yet',
  historyEmptyDesc: 'Go back to the home page and upload an audio file to get started',
  backHome: 'Back to Home',
  backToHistory: 'Back to History',
  viewDetail: 'View Details',
  hideDetail: 'Hide',
  detailNotFound: 'Item not found',
  detailNotFoundDesc: 'This item may have been deleted, or the link is invalid',
  sourceTranscript: 'Source transcript from audio',
  savedAt: 'Saved at',
  loadingHistory: 'Loading…',
  transcriptLabel: 'Transcript',
  reliabilityLabel: 'Reliability',
  reliabilityHigh: 'High Confidence',
  reliabilityMedium: 'Medium Confidence',
  reliabilityLow: 'Low Confidence',
  reliabilityHint: 'Calculated from assumption count, manday range spread, and breakdown detail',
  deleteItem: 'Delete',
  deleteConfirm: 'Confirm delete?',
  deleteCancel: 'Cancel',
  deleting: 'Deleting…',
  reAnalyze: 'Re-analyze',
  reAnalyzeToast: 'Transcript loaded — edit and click "Analyze with AI" to proceed',
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
  copied: 'Copied!',
  exportCsvSuccess: 'CSV downloaded!',
  exportJsonSuccess: 'JSON downloaded!',
  exportMarkdownSuccess: 'Markdown downloaded!',
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
