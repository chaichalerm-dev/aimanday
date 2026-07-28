// Browser file download helpers — trigger a client-side file save

// สั่งดาวน์โหลดไฟล์ฝั่ง browser โดยสร้าง Blob แล้วจำลองคลิกลิงก์ดาวน์โหลด
// รับ filename, content (เนื้อหาไฟล์), mime (MIME type) ไม่คืนค่า (side effect: ไฟล์ถูกเซฟ)
export function downloadFile(filename: string, content: string, mime: string) {
  // Prepend BOM for UTF-8 so Excel / editors read Thai characters correctly
  const blob = new Blob(['﻿' + content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(baseName: string, data: unknown) {
  downloadFile(`${baseName}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export function downloadMarkdown(baseName: string, markdown: string) {
  downloadFile(`${baseName}.md`, markdown, 'text/markdown');
}

export function downloadCsv(baseName: string, csv: string) {
  downloadFile(`${baseName}.csv`, csv, 'text/csv');
}

// Sanitize a filename: strip extension, replace unsafe chars
// แปลงชื่อไฟล์ (เช่น "บันทึกประชุม.mp3") ให้เป็นชื่อไฟล์ปลอดภัยสำหรับ export
// รับ name คืนค่า string: ตัดนามสกุลออก (\.[^.]+$) แล้วแทนอักขระที่ไม่ใช่ตัวอักษร/เลข/ไทย ([^\w฀-๿-])
// ด้วย "_" — ๐-๙฀-๿ คือช่วง unicode ของอักษรไทยทั้งหมด กันชื่อไทยโดนแทนที่จนว่างเปล่า
export function safeBaseName(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[^\w฀-๿-]+/g, '_') || 'estimation';
}
