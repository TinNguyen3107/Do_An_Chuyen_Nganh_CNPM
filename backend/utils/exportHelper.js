/**
 * exportHelper.js — Utility tạo file CSV & Excel cho Admin Reports
 * Dùng exceljs cho Excel, csv-stringify cho CSV
 */

import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';

// ─── Màu sắc cho Excel ───────────────────────────────────────────────────────
const THEME = {
  headerFill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }, // slate-800
  headerFont:   { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 },
  evenRowFill:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }, // slate-50
  oddRowFill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
  border: {
    top:    { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left:   { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right:  { style: 'thin', color: { argb: 'FFE2E8F0' } },
  },
};

/**
 * Tạo file Excel (.xlsx) từ mảng dữ liệu
 * @param {Object[]} data        - Mảng rows
 * @param {Object[]} columns     - [{ header, key, width }]
 * @param {string}   sheetName   - Tên sheet
 * @param {string}   reportTitle - Tiêu đề báo cáo (dòng đầu)
 * @returns {Buffer}
 */
export async function generateExcel(data, columns, sheetName = 'Report', reportTitle = '') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '26Tech LMS Admin';
  workbook.created  = new Date();

  const sheet = workbook.addWorksheet(sheetName, {
    pageSetup: { orientation: 'landscape', fitToPage: true },
  });

  // ── Tiêu đề báo cáo (merged row) ──────────────────────────────────────────
  if (reportTitle) {
    sheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = sheet.getCell('A1');
    titleCell.value = reportTitle;
    titleCell.font  = { bold: true, size: 14, color: { argb: 'FF0F172A' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
    sheet.getRow(1).height = 32;

    // Hàng phụ: ngày xuất
    sheet.mergeCells(2, 1, 2, columns.length);
    const dateCell = sheet.getCell('A2');
    dateCell.value = `Xuất ngày: ${new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
    dateCell.font  = { size: 10, color: { argb: 'FF64748B' }, italic: true };
    dateCell.alignment = { horizontal: 'center' };
    sheet.getRow(2).height = 18;
  }

  const headerRowIndex = reportTitle ? 3 : 1;

  // ── Cột ──────────────────────────────────────────────────────────────────
  sheet.columns = columns.map((col) => ({
    header: col.header,
    key:    col.key,
    width:  col.width || 20,
  }));

  // ── Style header ─────────────────────────────────────────────────────────
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.fill      = THEME.headerFill;
    cell.font      = THEME.headerFont;
    cell.border    = THEME.border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // ── Data rows ─────────────────────────────────────────────────────────────
  data.forEach((row, idx) => {
    const excelRow = sheet.addRow(row);
    excelRow.height = 22;
    excelRow.eachCell((cell) => {
      cell.fill   = idx % 2 === 0 ? THEME.evenRowFill : THEME.oddRowFill;
      cell.border = THEME.border;
      cell.alignment = { vertical: 'middle' };
    });
  });

  // ── Freeze header ─────────────────────────────────────────────────────────
  sheet.views = [{ state: 'frozen', ySplit: headerRowIndex }];

  return workbook.xlsx.writeBuffer();
}

/**
 * Tạo file CSV từ mảng dữ liệu
 * @param {Object[]} data    - Mảng rows
 * @param {Object[]} columns - [{ header, key }]
 * @returns {string}         - CSV string (UTF-8 BOM để Excel mở đúng tiếng Việt)
 */
export function generateCSV(data, columns) {
  const headers = columns.map((c) => c.header);
  const rows    = data.map((row) => columns.map((c) => row[c.key] ?? ''));

  const csv = stringify([headers, ...rows], {
    quoted: true,
  });

  // BOM cho Excel mở UTF-8 đúng tiếng Việt
  return '\uFEFF' + csv;
}

/**
 * Gọi trong controller để gửi file về client
 * @param {import('express').Response} res
 * @param {'csv'|'excel'} format
 * @param {string} baseName - VD: 'revenue'
 * @param {Buffer|string} content
 */
export function sendExportResponse(res, format, baseName, content) {
  const date     = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const fileName = `report_${baseName}_${date}`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    return res.send(content);
  }

  // Excel
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
  return res.send(content);
}
