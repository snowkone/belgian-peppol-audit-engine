import React, { useState, useMemo, useRef } from 'react';
import { 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  TrendingUp, 
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  X,
  FileCheck,
  ShieldAlert,
  Trash2,
  Sparkles,
  FileCode,
  ArrowRight,
  Info,
  CheckCircle2,
  Scale,
  Calculator,
  Receipt,
  HelpCircle,
  BarChart3,
  LineChart
} from 'lucide-react';
import FinancialVisualizations, { CategoryBarChart, CashFlowLineChart } from './components/FinancialVisualizations';

interface Transaction {
  Date: string;
  Transaction_ID: string;
  Client_Vendor: string;
  Category: string;
  Type: 'Revenue' | 'Expense';
  Amount: string;
  Anomaly_Note?: string;
  risk_flag?: string;
  risk_flags?: string[];
  vat_number?: string;
  has_payment_means_iban?: boolean;
  ogm_reference?: string;
  is_valid_ogm?: boolean;
  vat_grid?: '81' | '82' | '83';
  source_type?: 'csv' | 'xml';
}

const RAW_ANOMALY_CSV = `Date,Transaction_ID,Client_Vendor,Category,Type,Amount,Anomaly_Note
2026-06-01,EXP-1046,Befimmo NV,Rent,Expense,3250.00,Duplicate rent payment processed on same day as EXP-1016
2026-07-15,EXP-1047,AWS EMEA SARL (LU26375245),IT Software,Expense,2180.00,Massive 5x cost spike in cloud infrastructure (uncontrolled autoscaling/AI workload)
2026-08-09,EXP-1048,NMBS,Travel,Expense,315.00,Weekend Sunday booking anomaly; suspicious non-business day batch posting
2026-08-20,INV-2016,TechSolutions NV,Consulting Revenue,Revenue,-12500.00,Major credit note and refund issued following project milestone dispute
2026-09-29,EXP-1049,SD Worx,Payroll,Expense,19250.00,Erroneous duplicate SEPA payroll batch re-executed 24h after EXP-1044
2026-05-12,EXP-1050,Proximus,Telecom,Expense,1950.00,Data entry decimal error; €195.00 monthly line mistakenly keyed as €1950.00
2026-07-22,EXP-1051,FOD Financiën,Taxes & Penalties,Expense,3840.00,Late VAT/corporate tax payment penalty and statutory late interest charge
2026-06-18,EXP-1052,Apple Store Brussels (FR0123456789),IT Hardware,Expense,4299.00,Unapproved high-end hardware purchase booked directly to operating expenses
2026-09-12,INV-2017,Nexus Belgium CommV,Consulting Revenue,Revenue,35000.00,Unusual large unbudgeted prepayment from uncontracted new entity; AML risk
2026-05-27,EXP-1053,KBC ATM Brussels,Cash Withdrawal,Expense,1500.00,Unreconciled cash ATM withdrawal with no supporting receipt or expense claim
2026-07-29,EXP-1054 (+++852/1479/63205+++),Belgacom International SA (BE0202239951),Telecom,Expense,1420.00,Invalid Belgian OGM (Mod-97 Failure) - +++852/1479/63205+++ failed Modulo 97 checksum (bank batch rejection risk)`;

const RAW_CSV_DATA = `Date,Transaction_ID,Client_Vendor,Category,Type,Amount
2026-04-01,EXP-1001,Befimmo NV,Rent,Expense,3250.00
2026-04-03,EXP-1002 (+++102/3456/78989+++),Proximus,Telecom,Expense,185.50
2026-04-07,INV-2001,TechSolutions NV,Consulting Revenue,Revenue,14200.00
2026-04-12,EXP-1003,NMBS,Travel,Expense,84.60
2026-04-15,EXP-1004,Teamleader BV,IT Software,Expense,349.00
2026-04-18,INV-2002,Alpha BV,Consulting Revenue,Revenue,8900.00
2026-04-22,EXP-1005,TotalEnergies Belgium,Travel,Expense,112.40
2026-04-26,EXP-1006,Liantis,Payroll,Expense,425.00
2026-04-28,EXP-1007,SD Worx,Payroll,Expense,19250.00
2026-04-30,EXP-1008,KBC,Banking Fees,Expense,45.00
2026-05-02,EXP-1009,Befimmo NV,Rent,Expense,3250.00
2026-05-05,INV-2003,Antwerp Logistics Group NV,Consulting Revenue,Revenue,16500.00
2026-05-08,EXP-1010,Telenet,Telecom,Expense,192.30
2026-05-11,EXP-1011,NMBS,Travel,Expense,126.80
2026-05-15,INV-2004,Flanders BioTech CommV,Consulting Revenue,Revenue,11400.00
2026-05-18,EXP-1012,Office Depot Belgium,Materials,Expense,420.00
2026-05-21,INV-2005,TechSolutions NV,Consulting Revenue,Revenue,7600.00
2026-05-25,EXP-1013,Liantis,Payroll,Expense,425.00
2026-05-28,EXP-1014,SD Worx,Payroll,Expense,19250.00
2026-05-30,EXP-1015,KBC,Banking Fees,Expense,45.00
2026-06-01,EXP-1016,Befimmo NV,Rent,Expense,3250.00
2026-06-04,INV-2006,Brussels FinTech Solutions BV,Consulting Revenue,Revenue,22800.00
2026-06-06,EXP-1017,Proximus,Telecom,Expense,179.80
2026-06-10,EXP-1018,Moore Belgium,Accounting,Expense,1450.00
2026-06-14,EXP-1019,NMBS,Travel,Expense,95.40
2026-06-17,INV-2007,Alpha BV,Consulting Revenue,Revenue,9800.00
2026-06-18,EXP-1020,Rexel Belgium NV,Trade Goods,Expense,1850.00
2026-06-20,EXP-1021,Dell Technologies Belgium,Hardware,Expense,3240.00
2026-06-22,EXP-1022,TotalEnergies Belgium,Travel,Expense,128.50
2026-06-25,EXP-1023,Liantis,Payroll,Expense,425.00
2026-06-26,EXP-1024,SD Worx,Payroll,Expense,19250.00
2026-06-30,EXP-1025,KBC,Banking Fees,Expense,48.50
2026-07-01,EXP-1026,Befimmo NV,Rent,Expense,3250.00
2026-07-03,INV-2008,Ghent Precision Systems NV,Consulting Revenue,Revenue,18200.00
2026-07-04,EXP-1027,Manutan Brussels,Inventory,Expense,760.00
2026-07-06,EXP-1028,Telenet,Telecom,Expense,188.00
2026-07-09,EXP-1029,AWS EMEA SARL,IT Software,Expense,415.60
2026-07-13,INV-2009,Mechelen Digital Studio BV,Consulting Revenue,Revenue,6400.00
2026-07-16,EXP-1030,NMBS,Travel,Expense,62.00
2026-07-20,INV-2010,Antwerp Logistics Group NV,Consulting Revenue,Revenue,12900.00
2026-07-24,EXP-1031,Acerta,Payroll,Expense,425.00
2026-07-28,EXP-1032,SD Worx,Payroll,Expense,19250.00
2026-07-31,EXP-1033,KBC,Banking Fees,Expense,45.00
2026-08-01,EXP-1034,Befimmo NV,Rent,Expense,3250.00
2026-08-04,EXP-1035,Proximus,Telecom,Expense,182.20
2026-08-07,INV-2011,TechSolutions NV,Consulting Revenue,Revenue,15800.00
2026-08-11,EXP-1036,Brussels Airlines,Travel,Expense,438.90
2026-08-14,EXP-1037,Microsoft Ireland,IT Software,Expense,280.00
2026-08-15,EXP-1038,D'Ieteren Lease,Vehicles,Expense,1450.00
2026-08-18,INV-2012,Flanders BioTech CommV,Consulting Revenue,Revenue,9200.00
2026-08-22,EXP-1039,TotalEnergies Belgium,Travel,Expense,96.30
2026-08-25,EXP-1040,Liantis,Payroll,Expense,425.00
2026-08-27,EXP-1041,SD Worx,Payroll,Expense,19250.00
2026-08-31,EXP-1042,KBC,Banking Fees,Expense,45.00
2026-09-01,EXP-1043,Befimmo NV,Rent,Expense,3250.00
2026-09-03,INV-2013,Wallonia Pharma Services SA,Consulting Revenue,Revenue,24500.00
2026-09-07,EXP-1044,Telenet,Telecom,Expense,194.50
2026-09-10,INV-2014,Alpha BV,Consulting Revenue,Revenue,10500.00
2026-09-14,EXP-1045,NMBS,Travel,Expense,118.20
2026-09-17,EXP-1046,Teamleader BV,IT Software,Expense,349.00
2026-09-21,INV-2015,Ghent Precision Systems NV,Consulting Revenue,Revenue,13700.00
2026-09-25,EXP-1047,Liantis,Payroll,Expense,425.00
2026-09-28,EXP-1048,SD Worx,Payroll,Expense,19250.00
2026-09-30,EXP-1049,KBC,Banking Fees,Expense,52.00`;

// Sample compliant Peppol UBL 2.1 XML string for instant test
const SAMPLE_COMPLIANT_PEPPOL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>PEPPOL-INV-2026-901</cbc:ID>
  <cbc:IssueDate>2026-09-18</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>Proximus Enterprise SA</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>BE0202239951</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cbc:PaymentID>+++102/3456/78989+++</cbc:PaymentID>
    <cac:PayeeFinancialAccount>
      <cbc:ID>BE68539007547034</cbc:ID>
      <cac:FinancialInstitutionBranch><cbc:ID>KBCBBEBB</cbc:ID></cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="EUR">485.50</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;

// Sample non-compliant Peppol UBL 2.1 XML string (Non-BE VAT + Missing PaymentMeans IBAN + Invalid OGM)
const SAMPLE_NON_COMPLIANT_PEPPOL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>PEPPOL-WARN-2026-44</cbc:ID>
  <cbc:IssueDate>2026-09-22</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>TechHardware Global Distribution</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>FR88990011223</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cbc:PaymentID>+++999/1234/56701+++</cbc:PaymentID>
  </cac:PaymentMeans>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="EUR">6250.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;

function extractVatNumber(text: string): string | undefined {
  if (!text) return undefined;
  // Match VAT/BTW/TVA prefixes or standard European VAT sequences like BE0123456789, FR0123456789, LU12345678, etc.
  const match = text.match(/(?:VAT|BTW|TVA)?\s*:?\s*\(?([A-Z]{2}[0-9A-Z]{7,12})\)?/i);
  if (match) {
    const raw = match[1].replace(/[\s.-]/g, '').toUpperCase();
    if (raw.length >= 8) return raw;
  }
  return undefined;
}

/**
 * Helper function validateOGM(reference) to check Belgian structured communications (format: +++xxx/xxxx/xxxxx+++):
 * - Strips all non-numeric characters.
 * - Takes the first 10 digits as a number.
 * - Calculates modulo 97 (num % 97).
 * - If the result is 0, the check digits (the last 2 digits) must be 97.
 * - Otherwise, the check digits must equal the modulo result.
 */
export function validateOGM(reference: string): boolean {
  if (!reference) return false;
  // Strip all non-numeric characters
  const cleanDigits = reference.replace(/\D/g, '');
  if (cleanDigits.length !== 12) return false;

  const first10Str = cleanDigits.slice(0, 10);
  const last2Str = cleanDigits.slice(10, 12);

  const num = BigInt(first10Str);
  const modResult = Number(num % 97n);

  // If the result is 0, the check digits (the last 2 digits) must be 97. Otherwise, the check digits must equal the modulo result.
  const expectedCheck = modResult === 0 ? 97 : modResult;
  const actualCheck = parseInt(last2Str, 10);

  return actualCheck === expectedCheck;
}

export function extractFormattedOGM(text: string): string | null {
  if (!text) return null;
  // Standard Belgian OGM format: +++xxx/xxxx/xxxxx+++ or ***xxx/xxxx/xxxxx***
  const structuredRegex = /(?:\+{3}|\*{3})\s*(\d{3})\s*[\/\s.-]?\s*(\d{4})\s*[\/\s.-]?\s*(\d{5})\s*(?:\+{3}|\*{3})/;
  const match = text.match(structuredRegex);
  if (match) {
    return `+++${match[1]}/${match[2]}/${match[3]}+++`;
  }

  // Enclosed in +++ or *** containing 12 digits
  if (text.includes('+++') || text.includes('***')) {
    const enclosed = text.match(/(?:\+{3}|\*{3})([^+*]+)(?:\+{3}|\*{3})/);
    if (enclosed) {
      const digitsOnly = enclosed[1].replace(/\D/g, '');
      if (digitsOnly.length === 12) {
        return `+++${digitsOnly.slice(0, 3)}/${digitsOnly.slice(3, 7)}/${digitsOnly.slice(7, 12)}+++`;
      }
    }
  }

  // Slash formatted: 123/4567/89012
  const slashRegex = /\b(\d{3})\/(\d{4})\/(\d{5})\b/;
  const slashMatch = text.match(slashRegex);
  if (slashMatch) {
    return `+++${slashMatch[1]}/${slashMatch[2]}/${slashMatch[3]}+++`;
  }

  return null;
}

export function validateBelgianOGM(text: string): {
  found: boolean;
  ogm?: string;
  isValid: boolean;
  first10?: string;
  last2?: string;
  expectedCheck?: number;
  actualCheck?: number;
  reason?: string;
} {
  if (!text) return { found: false, isValid: true };
  const formatted = extractFormattedOGM(text);
  if (!formatted) {
    return { found: false, isValid: true };
  }

  const cleanDigits = formatted.replace(/\D/g, '');
  if (cleanDigits.length !== 12) {
    return { found: false, isValid: true };
  }

  const p1 = cleanDigits.slice(0, 3);
  const p2 = cleanDigits.slice(3, 7);
  const p3 = cleanDigits.slice(7, 12);
  const ogm = `+++${p1}/${p2}/${p3}+++`;

  const first10 = cleanDigits.slice(0, 10);
  const last2 = cleanDigits.slice(10, 12);

  const num = BigInt(first10);
  const modResult = Number(num % 97n);
  const expectedCheck = modResult === 0 ? 97 : modResult;
  const actualCheck = parseInt(last2, 10);

  const isValid = validateOGM(formatted);

  let reason = '';
  if (!isValid) {
    reason = `Modulo 97 failed: (${first10} % 97) is ${expectedCheck < 10 ? '0' + expectedCheck : expectedCheck}, but received ${last2}`;
  }

  return {
    found: true,
    ogm,
    isValid,
    first10,
    last2,
    expectedCheck,
    actualCheck,
    reason
  };
}

/**
 * Belgian VAT return categorization helpers:
 * - Grid 81 (Merchandise/Trade Goods): Map expenses categorized as "Inventory", "Materials", or "Trade Goods"
 * - Grid 82 (Services & Misc Goods): Map general expenses like "Telecom", "Consulting", or "Travel"
 * - Grid 83 (Investments/Capital Assets): Map any expense where the Amount > €1,000 AND Category relates to "Hardware", "Machinery", or "Vehicles"
 * - Grid 59 (Deductible VAT): Calculate an estimated 21% on the sum of Grids 81, 82, and 83
 */
export function getBelgianVatGrid(tx: { Type?: string; Amount?: string | number; Category?: string; Client_Vendor?: string }): '81' | '82' | '83' | undefined {
  if (tx.Type !== 'Expense') return undefined;
  const amount = typeof tx.Amount === 'number' ? tx.Amount : parseFloat(String(tx.Amount || '0'));
  if (isNaN(amount)) return undefined;

  const cat = (tx.Category || '').toLowerCase();
  const vendor = (tx.Client_Vendor || '').toLowerCase();
  const combined = `${cat} ${vendor}`;

  // Grid 83 (Investments/Capital Assets): Map any expense where the Amount > €1,000 AND Category relates to "Hardware", "Machinery", or "Vehicles"
  const isCapital = 
    combined.includes('hardware') || 
    combined.includes('machinery') || 
    combined.includes('machine') || 
    combined.includes('vehicle') || 
    combined.includes('vehicule') || 
    combined.includes('car') || 
    combined.includes('auto') || 
    combined.includes('fleet') || 
    combined.includes('voertuig') || 
    combined.includes('equipment') || 
    combined.includes('equipement') || 
    combined.includes('materieel') || 
    combined.includes('computer') || 
    combined.includes('server') || 
    combined.includes('laptop') || 
    combined.includes('investment') || 
    combined.includes('capital');

  if (amount > 1000 && isCapital) {
    return '83';
  }

  // Grid 81 (Merchandise/Trade Goods): Map expenses categorized as "Inventory", "Materials", or "Trade Goods"
  const isTradeGoods = 
    combined.includes('inventory') || 
    combined.includes('materials') || 
    combined.includes('material') || 
    combined.includes('trade goods') || 
    combined.includes('goods') || 
    combined.includes('stock') || 
    combined.includes('merchandise') || 
    combined.includes('handelsgoederen') || 
    combined.includes('grondstoffen');

  if (isTradeGoods) {
    return '81';
  }

  // Grid 82 (Services & Misc Goods): Map general expenses like "Telecom", "Consulting", "Travel", "Rent", "Software", etc.
  return '82';
}

export interface BelgianVATGrids {
  grid81: number; // Merchandise / Trade Goods
  grid81Count: number;
  grid82: number; // Services & Misc Goods
  grid82Count: number;
  grid83: number; // Investments / Capital Assets
  grid83Count: number;
  grid59: number; // Deductible VAT (21% of Grids 81 + 82 + 83)
  totalTaxableBase: number;
  turnoverGrid03: number;
  outputVatGrid54: number;
  netVatBalance: number;
  totalExpenses: number;
}

/**
 * Maps the activeTransactions into standard Belgian VAT boxes:
 * - Grid 81 (Merchandise/Trade Goods): Map expenses categorized as "Inventory", "Materials", or "Trade Goods"
 * - Grid 82 (Services & Misc Goods): Map general expenses like "Telecom", "Consulting", or "Travel"
 * - Grid 83 (Investments/Capital Assets): Map any expense where the Amount > €1,000 AND Category relates to "Hardware", "Machinery", or "Vehicles"
 * - Grid 59 (Deductible VAT): Calculate an estimated 21% on the sum of Grids 81, 82, and 83
 */
export function mapTransactionsToBelgianVATGrids(transactions: Transaction[]): BelgianVATGrids {
  if (!transactions || transactions.length === 0) {
    return {
      grid81: 0,
      grid81Count: 0,
      grid82: 0,
      grid82Count: 0,
      grid83: 0,
      grid83Count: 0,
      grid59: 0,
      totalTaxableBase: 0,
      turnoverGrid03: 0,
      outputVatGrid54: 0,
      netVatBalance: 0,
      totalExpenses: 0
    };
  }

  let grid81 = 0;
  let grid81Count = 0;
  let grid82 = 0;
  let grid82Count = 0;
  let grid83 = 0;
  let grid83Count = 0;
  let turnoverGrid03 = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    const val = parseFloat(t.Amount);
    if (isNaN(val)) continue;

    if (t.Type === 'Revenue') {
      turnoverGrid03 += val;
      continue;
    }

    if (t.Type === 'Expense') {
      totalExpenses += val;
      const grid = getBelgianVatGrid(t);
      if (grid === '83') {
        grid83 += val;
        grid83Count++;
      } else if (grid === '81') {
        grid81 += val;
        grid81Count++;
      } else {
        grid82 += val;
        grid82Count++;
      }
    }
  }

  const totalTaxableBase = grid81 + grid82 + grid83;
  // Grid 59 (Deductible VAT): Calculate an estimated 21% on the sum of Grids 81, 82, and 83.
  const grid59 = totalTaxableBase * 0.21;
  const outputVatGrid54 = turnoverGrid03 * 0.21;
  const netVatBalance = outputVatGrid54 - grid59;

  return {
    grid81,
    grid81Count,
    grid82,
    grid82Count,
    grid83,
    grid83Count,
    grid59,
    totalTaxableBase,
    turnoverGrid03,
    outputVatGrid54,
    netVatBalance,
    totalExpenses
  };
}

export const calculateBelgianVATReturn = mapTransactionsToBelgianVATGrids;

export function isCapitalEquipmentCategory(category: string = '', clientVendor: string = ''): boolean {
  const combined = `${category} ${clientVendor}`.toLowerCase();
  const keywords = [
    'hardware',
    'machinery',
    'machine',
    'vehicle',
    'vehicule',
    'car',
    'auto',
    'fleet',
    'equipment',
    'equipement',
    'materieel',
    'voertuig',
    'computer',
    'server',
    'laptop',
    'investment',
    'capital'
  ];
  return keywords.some(kw => combined.includes(kw));
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csv: string): Transaction[] {
  const lines = csv.trim().split('\n');
  return lines.slice(1).map(line => {
    const parts = line.split(',');
    const txId = parts[1] || '';
    const clientVendor = parts[2] || '';
    const category = parts[3] || 'General';
    const type = parts[4] as 'Revenue' | 'Expense';
    const amountStr = parts[5] || '0.00';
    const note = parts.slice(6).join(',').replace(/^"|"$/g, '') || undefined;
    const num = parseFloat(amountStr);

    const ogmCandidate = [txId, note, clientVendor].filter(Boolean).join(' ');
    const ogmCheck = validateBelgianOGM(ogmCandidate);
    const assignedGrid = getBelgianVatGrid({ Type: type, Amount: num, Category: category, Client_Vendor: clientVendor });

    const initialFlags: string[] = [];
    if (note) initialFlags.push(note);
    if (ogmCheck.found && !ogmCheck.isValid) {
      initialFlags.unshift("Invalid Belgian OGM (Mod-97 Failure)");
    }

    return {
      Date: parts[0],
      Transaction_ID: txId,
      Client_Vendor: clientVendor,
      Category: category,
      Type: type,
      Amount: amountStr,
      Anomaly_Note: note,
      risk_flag: initialFlags.length > 0 ? initialFlags[0] : undefined,
      risk_flags: initialFlags.length > 0 ? initialFlags : undefined,
      vat_number: extractVatNumber(clientVendor),
      ogm_reference: ogmCheck.found ? ogmCheck.ogm : undefined,
      is_valid_ogm: ogmCheck.found ? ogmCheck.isValid : undefined,
      vat_grid: assignedGrid,
      source_type: 'csv'
    };
  });
}

function parseUploadedCSV(csvText: string): { data: Transaction[]; error?: string } {
  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) {
    return { data: [], error: 'The uploaded file is empty. Please select a valid CSV file.' };
  }

  const rawLines = cleanText.split('\n').filter(line => line.trim().length > 0);
  if (rawLines.length < 2) {
    return { data: [], error: 'CSV file must contain a header row and at least one transaction row.' };
  }

  const rawHeaders = parseCSVLine(rawLines[0]);
  const normalizedHeaders = rawHeaders.map(h => 
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const dateIdx = normalizedHeaders.findIndex(h => h === 'date');
  const amountIdx = normalizedHeaders.findIndex(h => h === 'amount');

  if (dateIdx === -1 || amountIdx === -1) {
    const missing: string[] = [];
    if (dateIdx === -1) missing.push('"Date"');
    if (amountIdx === -1) missing.push('"Amount"');
    return { 
      data: [], 
      error: `Missing required CSV column headers: ${missing.join(' and ')}. Please check your file headers.` 
    };
  }

  const idIdx = normalizedHeaders.findIndex(h => 
    h === 'transactionid' || h === 'txid' || h === 'id' || h === 'invoiceid' || h === 'ref'
  );
  const clientIdx = normalizedHeaders.findIndex(h => 
    h === 'clientvendor' || h === 'client' || h === 'vendor' || h === 'customer' || h === 'company' || h === 'name'
  );
  const categoryIdx = normalizedHeaders.findIndex(h => 
    h === 'category' || h === 'account' || h === 'expensecategory'
  );
  const typeIdx = normalizedHeaders.findIndex(h => 
    h === 'type' || h === 'transactiontype' || h === 'flow'
  );
  const noteIdx = normalizedHeaders.findIndex(h => 
    h === 'anomalynote' || h === 'note' || h === 'notes' || h === 'auditnote' || h === 'comment'
  );
  const ogmIdx = normalizedHeaders.findIndex(h => 
    h === 'ogm' || h === 'vcs' || h === 'structuredcommunication' || h === 'paymentref' || h === 'paymentreference' || h === 'reference'
  );

  const parsedTransactions: Transaction[] = [];

  for (let i = 1; i < rawLines.length; i++) {
    const row = parseCSVLine(rawLines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const rawDate = row[dateIdx]?.trim() || '';
    const rawAmount = row[amountIdx]?.trim() || '0';

    let cleanAmountStr = rawAmount.replace(/[€$£¥\s]/g, '');

    if (cleanAmountStr.includes(',') && !cleanAmountStr.includes('.')) {
      cleanAmountStr = cleanAmountStr.replace(',', '.');
    } else {
      cleanAmountStr = cleanAmountStr.replace(/,/g, '');
    }

    const numAmount = parseFloat(cleanAmountStr);
    const validAmount = isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);

    let resolvedType: 'Revenue' | 'Expense' = 'Expense';
    const rawType = (typeIdx !== -1 && row[typeIdx]) ? row[typeIdx].trim().toLowerCase() : '';
    if (rawType.includes('rev') || rawType.includes('inc') || rawType.includes('credit')) {
      resolvedType = 'Revenue';
    } else if (rawType.includes('exp') || rawType.includes('deb')) {
      resolvedType = 'Expense';
    } else {
      const rawId = (idIdx !== -1 && row[idIdx]) ? row[idIdx].trim().toUpperCase() : '';
      if (rawId.startsWith('INV')) resolvedType = 'Revenue';
      else if (rawId.startsWith('EXP')) resolvedType = 'Expense';
    }

    const clientVendor = (clientIdx !== -1 && row[clientIdx]) ? row[clientIdx].trim() : 'Unspecified Client/Vendor';
    const categoryVal = (categoryIdx !== -1 && row[categoryIdx]) ? row[categoryIdx].trim() : 'General';
    const noteVal = (noteIdx !== -1 && row[noteIdx]) ? row[noteIdx].trim() : undefined;
    const explicitOgm = (ogmIdx !== -1 && row[ogmIdx]) ? row[ogmIdx].trim() : undefined;

    const txIdVal = (idIdx !== -1 && row[idIdx]) ? row[idIdx].trim() : `TX-${1000 + i}`;
    const ogmCandidate = [explicitOgm, txIdVal, noteVal, clientVendor].filter(Boolean).join(' ');
    const ogmCheck = validateBelgianOGM(ogmCandidate);
    const assignedGrid = getBelgianVatGrid({ Type: resolvedType, Amount: numAmount, Category: categoryVal, Client_Vendor: clientVendor });

    const initialFlags: string[] = [];
    if (noteVal) initialFlags.push(noteVal);
    if (ogmCheck.found && !ogmCheck.isValid) {
      initialFlags.unshift("Invalid Belgian OGM (Mod-97 Failure)");
    }

    const transaction: Transaction = {
      Date: rawDate,
      Transaction_ID: txIdVal,
      Client_Vendor: clientVendor,
      Category: categoryVal,
      Type: resolvedType,
      Amount: validAmount,
      Anomaly_Note: noteVal,
      risk_flag: initialFlags.length > 0 ? initialFlags[0] : undefined,
      risk_flags: initialFlags.length > 0 ? initialFlags : undefined,
      vat_number: extractVatNumber(clientVendor),
      ogm_reference: ogmCheck.found ? ogmCheck.ogm : explicitOgm,
      is_valid_ogm: ogmCheck.found ? ogmCheck.isValid : undefined,
      vat_grid: assignedGrid,
      source_type: 'csv'
    };

    parsedTransactions.push(transaction);
  }

  if (parsedTransactions.length === 0) {
    return { data: [], error: 'No valid data rows found in the uploaded CSV.' };
  }

  return { data: parsedTransactions };
}

// Native Peppol XML / UBL 2.1 Parser with Belgian 2026 Mandate checks
function parsePeppolXML(xmlText: string): { data: Transaction; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      return { 
        data: {} as Transaction, 
        error: 'Malformed XML: ' + (parserError[0].textContent || 'Could not parse document structure') 
      };
    }

    const getElementText = (parent: Element | Document, tagName: string): string => {
      const byName = parent.getElementsByTagName(tagName);
      if (byName.length > 0 && byName[0].textContent) return byName[0].textContent.trim();

      const cbcName = parent.getElementsByTagName(`cbc:${tagName}`);
      if (cbcName.length > 0 && cbcName[0].textContent) return cbcName[0].textContent.trim();

      const cacName = parent.getElementsByTagName(`cac:${tagName}`);
      if (cacName.length > 0 && cacName[0].textContent) return cacName[0].textContent.trim();

      return '';
    };

    // 1. Invoice ID: <cbc:ID>
    const invoiceId = getElementText(xmlDoc, 'ID') || `PEPPOL-${Date.now().toString().slice(-5)}`;

    // 2. Issue Date: <cbc:IssueDate>
    const issueDate = getElementText(xmlDoc, 'IssueDate') || new Date().toISOString().split('T')[0];

    // 3. Supplier Name: <cac:AccountingSupplierParty> ... <cbc:Name>
    let supplierName = '';
    const supplierParties = xmlDoc.getElementsByTagName('cac:AccountingSupplierParty');
    const directSupplier = supplierParties.length > 0 ? supplierParties[0] : xmlDoc.getElementsByTagName('AccountingSupplierParty')[0];
    
    if (directSupplier) {
      supplierName = getElementText(directSupplier, 'Name') || 
                     getElementText(directSupplier, 'RegistrationName') ||
                     getElementText(directSupplier, 'CompanyID');
    }
    if (!supplierName) {
      supplierName = getElementText(xmlDoc, 'Name') || 'Peppol Supplier';
    }

    // 4. Supplier VAT Number Check
    let vatNumber = '';
    if (directSupplier) {
      const partyTaxSchemes = directSupplier.getElementsByTagName('cac:PartyTaxScheme');
      const directTaxScheme = partyTaxSchemes.length > 0 ? partyTaxSchemes[0] : directSupplier.getElementsByTagName('PartyTaxScheme')[0];
      if (directTaxScheme) {
        vatNumber = getElementText(directTaxScheme, 'CompanyID');
      }
      if (!vatNumber) {
        const legalEntities = directSupplier.getElementsByTagName('cac:PartyLegalEntity');
        if (legalEntities.length > 0) {
          vatNumber = getElementText(legalEntities[0], 'CompanyID');
        }
      }
    }
    if (!vatNumber) {
      vatNumber = extractVatNumber(supplierName) || '';
    }

    // 5. Payment Information & OGM Reference Check: <cac:PaymentMeans> with IBAN & PaymentID
    let hasPaymentMeansIban = false;
    let paymentMeansOgm = '';
    const paymentMeansElements = xmlDoc.getElementsByTagName('cac:PaymentMeans');
    const directPaymentMeans = paymentMeansElements.length > 0 ? paymentMeansElements[0] : xmlDoc.getElementsByTagName('PaymentMeans')[0];

    if (directPaymentMeans) {
      paymentMeansOgm = getElementText(directPaymentMeans, 'PaymentID') || 
                        getElementText(directPaymentMeans, 'InstructionNote') || 
                        getElementText(directPaymentMeans, 'PaymentReference');

      const payeeAccounts = directPaymentMeans.getElementsByTagName('cac:PayeeFinancialAccount');
      const directPayeeAccount = payeeAccounts.length > 0 ? payeeAccounts[0] : directPaymentMeans.getElementsByTagName('PayeeFinancialAccount')[0];
      if (directPayeeAccount) {
        const ibanId = getElementText(directPayeeAccount, 'ID');
        if (ibanId && ibanId.length >= 10) {
          hasPaymentMeansIban = true;
        }
      }
    }

    if (!paymentMeansOgm) {
      paymentMeansOgm = getElementText(xmlDoc, 'PaymentReference') || 
                        getElementText(xmlDoc, 'PaymentID');
    }

    // 6. Payable Amount: <cbc:PayableAmount> or <cbc:TaxInclusiveAmount>
    let rawAmount = getElementText(xmlDoc, 'PayableAmount') || 
                    getElementText(xmlDoc, 'TaxInclusiveAmount') || 
                    getElementText(xmlDoc, 'TaxExclusiveAmount') || 
                    getElementText(xmlDoc, 'LineExtensionAmount');

    let cleanAmountStr = rawAmount.replace(/[€$£¥\s]/g, '');
    if (cleanAmountStr.includes(',') && !cleanAmountStr.includes('.')) {
      cleanAmountStr = cleanAmountStr.replace(',', '.');
    } else {
      cleanAmountStr = cleanAmountStr.replace(/,/g, '');
    }

    const numAmount = parseFloat(cleanAmountStr);
    const validAmount = isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);

    const ogmCandidate = [paymentMeansOgm, invoiceId, supplierName].filter(Boolean).join(' ');
    const ogmCheck = validateBelgianOGM(ogmCandidate);
    const assignedGrid = getBelgianVatGrid({ Type: 'Expense', Amount: numAmount, Category: 'Supplier Invoice (Peppol)', Client_Vendor: supplierName });

    const transaction: Transaction = {
      Date: issueDate,
      Transaction_ID: invoiceId,
      Client_Vendor: supplierName + (vatNumber ? ` (${vatNumber})` : ''),
      Category: 'Supplier Invoice (Peppol)',
      Type: 'Expense',
      Amount: validAmount,
      Anomaly_Note: 'Peppol UBL 2.1 E-Invoice',
      vat_number: vatNumber || undefined,
      has_payment_means_iban: hasPaymentMeansIban,
      ogm_reference: ogmCheck.found ? ogmCheck.ogm : (paymentMeansOgm || undefined),
      is_valid_ogm: ogmCheck.found ? ogmCheck.isValid : undefined,
      vat_grid: assignedGrid,
      source_type: 'xml'
    };

    return { data: transaction };
  } catch (err) {
    return { 
      data: {} as Transaction, 
      error: 'Error parsing Peppol XML: ' + (err instanceof Error ? err.message : String(err)) 
    };
  }
}

// Enhanced Automated Risk Engine with Belgian 2026 Peppol & OGM Modulo 97 Checks
function applyRiskScan(transactions: Transaction[]): Transaction[] {
  return transactions.map(tx => {
    const rawVal = tx.Amount;
    const num = parseFloat(rawVal);
    const flags: string[] = [];

    // Financial check 1: Missing or invalid amount
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '' || isNaN(num)) {
      flags.push("Missing Financial Data");
    }

    // Financial check 2: High value expense approval (> €5,000)
    if (tx.Type === 'Expense' && num > 5000) {
      flags.push("High Value Approval Required");
    }

    // Financial check 3: Negative revenue entry (credit note / refund)
    if (tx.Type === 'Revenue' && num < 0) {
      flags.push("Refund / Credit Note");
    }

    // Peppol Rule 1: VAT Number Format Check
    // If a VAT number exists but does not begin with prefix "BE" (e.g. BE0 or BE1)
    const detectedVat = tx.vat_number || extractVatNumber(tx.Client_Vendor);
    if (detectedVat) {
      const cleanVat = detectedVat.trim().toUpperCase().replace(/[\s.-]/g, '');
      if (!cleanVat.startsWith('BE')) {
        flags.push("Peppol Risk: Invalid Belgian VAT Format");
      }
    }

    // Peppol Rule 2: Payment Information Check
    // Ensure the parsed UBL XML contains a valid <cac:PaymentMeans> block with an IBAN
    if (tx.source_type === 'xml' && !tx.has_payment_means_iban) {
      flags.push("Peppol Risk: Missing Bank Account (Mandatory for BIS 3.0)");
    }

    // Belgian Rule 3: OGM (Structured Communication) Modulo 97 Validator
    // Check Transaction_ID, payment reference field, Anomaly_Note, or Client_Vendor
    const ogmCandidate = [tx.ogm_reference, tx.Transaction_ID, tx.Anomaly_Note, tx.Client_Vendor]
      .filter(Boolean)
      .join(' ');
    const formattedOgm = extractFormattedOGM(ogmCandidate);
    let detectedOgm = tx.ogm_reference;
    let isValidOgm = tx.is_valid_ogm;

    if (formattedOgm) {
      detectedOgm = formattedOgm;
      const isMod97Valid = validateOGM(formattedOgm);
      isValidOgm = isMod97Valid;
      if (!isMod97Valid) {
        flags.push("Invalid Belgian OGM (Mod-97 Failure)");
      }
    }

    // Belgian VAT Grid Assignment
    const assignedGrid = getBelgianVatGrid(tx);

    // Append existing anomaly note if present and not redundant
    if (tx.Anomaly_Note && !flags.includes(tx.Anomaly_Note)) {
      flags.push(tx.Anomaly_Note);
    }

    let primaryFlag = flags.length > 0 ? flags[0] : undefined;
    if (flags.includes("Invalid Belgian OGM (Mod-97 Failure)")) {
      primaryFlag = "Invalid Belgian OGM (Mod-97 Failure)";
    }

    return { 
      ...tx, 
      risk_flag: primaryFlag, 
      risk_flags: flags.length > 0 ? flags : undefined,
      ogm_reference: detectedOgm,
      is_valid_ogm: isValidOgm,
      vat_grid: assignedGrid
    };
  });
}

interface VatReturnPreviewCardProps {
  vatStats: BelgianVATGrids;
  vatGridFilter: 'All' | '81' | '82' | '83';
  setVatGridFilter: (val: 'All' | '81' | '82' | '83') => void;
  ogmTesterOpen: boolean;
  setOgmTesterOpen: (val: boolean) => void;
  ogmTestInput: string;
  setOgmTestInput: (val: string) => void;
  liveOgmCheck: ReturnType<typeof validateBelgianOGM>;
  isDefaultEmpty?: boolean;
}

export function VatReturnPreviewCard({
  vatStats,
  vatGridFilter,
  setVatGridFilter,
  ogmTesterOpen,
  setOgmTesterOpen,
  ogmTestInput,
  setOgmTestInput,
  liveOgmCheck,
  isDefaultEmpty = false
}: VatReturnPreviewCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white">VAT Return Preview</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/80 text-purple-300 font-mono">
                BTW-Aangifte / Déclaration TVA
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                Standard Rate: 21%
              </span>
              {isDefaultEmpty && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800/60 text-blue-300">
                  Default View (€0.00)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Preliminary Belgian VAT boxes: Grids [81] (Trade Goods), [82] (Services), [83] (Investments) &amp; Grid [59] (Deductible VAT)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOgmTesterOpen(!ogmTesterOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition cursor-pointer active:scale-95"
            title="Open Belgian OGM Modulo 97 Validator & Formula Inspector"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            {ogmTesterOpen ? 'Close OGM Mod 97 Tool' : 'OGM Mod 97 Tool'}
          </button>
        </div>
      </div>

      {/* Interactive OGM Modulo 97 Validator Drawer */}
      {ogmTesterOpen && (
        <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Belgian OGM (Structured Communication) Modulo 97 Validator</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              (First 10 Digits % 97) = Last 2 Digits · 00 mapped to 97
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <input
                type="text"
                value={ogmTestInput}
                onChange={(e) => setOgmTestInput(e.target.value)}
                placeholder="e.g. +++102/3456/78989+++ or 102345678989"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setOgmTestInput('+++102/3456/78989+++')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-emerald-300 border border-emerald-500/30 cursor-pointer transition"
              >
                Sample Valid OGM
              </button>
              <button
                onClick={() => setOgmTestInput('+++102/3456/78912+++')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-rose-300 border border-rose-500/30 cursor-pointer transition"
              >
                Sample Invalid OGM
              </button>
              <button
                onClick={() => setOgmTestInput('+++000/0000/09797+++')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-blue-300 border border-blue-500/30 cursor-pointer transition"
              >
                Remainder 0 / 97 Check
              </button>
            </div>
          </div>

          {liveOgmCheck.found ? (
            <div className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              liveOgmCheck.isValid
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {liveOgmCheck.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold font-mono">{liveOgmCheck.ogm}</span>: {' '}
                  <span>
                    {liveOgmCheck.isValid 
                      ? 'Valid Belgian OGM. Modulo 97 checksum verified.' 
                      : 'Invalid Belgian OGM (Mod-97 Failure). Triggers automated risk exception flag.'}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-300 shrink-0">
                ({liveOgmCheck.first10} % 97) = <strong>{liveOgmCheck.expectedCheck}</strong> | Check: <strong>{liveOgmCheck.last2}</strong>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Enter a 12-digit Belgian structured communication number (format: +++xxx/xxxx/xxxxx+++) to test Modulo 97 mathematical validation.</span>
            </div>
          )}
        </div>
      )}

      {/* 4 Standard Belgian VAT Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Grid 81: Merchandise / Trade Goods */}
        <div className={`border rounded-xl p-4 transition flex flex-col justify-between ${
          vatGridFilter === '81' 
            ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50' 
            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  Grid 81
                </span>
                <h3 className="text-xs font-bold text-white mt-1.5">Merchandise / Trade Goods</h3>
                <p className="text-[10px] text-slate-400">Handelsgoederen / Marchandises</p>
              </div>
              <button
                onClick={() => setVatGridFilter(vatGridFilter === '81' ? 'All' : '81')}
                className={`text-[11px] px-2 py-1 rounded transition cursor-pointer font-medium ${
                  vatGridFilter === '81' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {vatGridFilter === '81' ? 'Active Filter' : 'Filter Grid 81'}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-xl font-bold font-mono text-white">
                €{vatStats.grid81.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>{vatStats.grid81Count} expense lines</span>
                <span className="text-blue-300 font-mono font-semibold">
                  VAT 21%: €{(vatStats.grid81 * 0.21).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 leading-relaxed">
            Expenses categorized as <strong>Inventory</strong>, <strong>Materials</strong>, or <strong>Trade Goods</strong>.
          </p>
        </div>

        {/* Grid 82: Services & Misc Goods */}
        <div className={`border rounded-xl p-4 transition flex flex-col justify-between ${
          vatGridFilter === '82' 
            ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50' 
            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  Grid 82
                </span>
                <h3 className="text-xs font-bold text-white mt-1.5">Services &amp; Misc Goods</h3>
                <p className="text-[10px] text-slate-400">Diensten en diverse goederen</p>
              </div>
              <button
                onClick={() => setVatGridFilter(vatGridFilter === '82' ? 'All' : '82')}
                className={`text-[11px] px-2 py-1 rounded transition cursor-pointer font-medium ${
                  vatGridFilter === '82' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {vatGridFilter === '82' ? 'Active Filter' : 'Filter Grid 82'}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-xl font-bold font-mono text-white">
                €{vatStats.grid82.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>{vatStats.grid82Count} expense lines</span>
                <span className="text-indigo-300 font-mono font-semibold">
                  VAT 21%: €{(vatStats.grid82 * 0.21).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 leading-relaxed">
            General operating expenses like <strong>Telecom</strong>, <strong>Consulting</strong>, <strong>Travel</strong>, Rent, and Software.
          </p>
        </div>

        {/* Grid 83: Investments / Capital Assets */}
        <div className={`border rounded-xl p-4 transition flex flex-col justify-between ${
          vatGridFilter === '83' 
            ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50' 
            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Grid 83
                </span>
                <h3 className="text-xs font-bold text-white mt-1.5">Investments / Capital Assets</h3>
                <p className="text-[10px] text-slate-400">Bedrijfsmiddelen / Investissements</p>
              </div>
              <button
                onClick={() => setVatGridFilter(vatGridFilter === '83' ? 'All' : '83')}
                className={`text-[11px] px-2 py-1 rounded transition cursor-pointer font-medium ${
                  vatGridFilter === '83' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {vatGridFilter === '83' ? 'Active Filter' : 'Filter Grid 83'}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-xl font-bold font-mono text-purple-300">
                €{vatStats.grid83.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>{vatStats.grid83Count} line{vatStats.grid83Count === 1 ? '' : 's'}</span>
                <span className="text-purple-300 font-mono font-semibold">
                  VAT 21%: €{(vatStats.grid83 * 0.21).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 leading-relaxed">
            Expenses where <strong>Amount &gt; €1,000</strong> AND Category relates to <strong>Hardware</strong>, <strong>Machinery</strong>, or <strong>Vehicles</strong>.
          </p>
        </div>

        {/* Grid 59: Total Estimated Deductible VAT */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Grid 59 (Deductible VAT)
                </span>
                <h3 className="text-xs font-bold text-emerald-200 mt-1.5">Estimated Deductible VAT</h3>
                <p className="text-[10px] text-slate-400">Aftrekbare btw / TVA déductible</p>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Receipt className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                €{vatStats.grid59.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-mono">
                Grid 59 = 21% × (€{(vatStats.grid81 + vatStats.grid82 + vatStats.grid83).toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </div>
            </div>
          </div>

          <p className="text-[10px] text-emerald-300/80 mt-3 pt-2 border-t border-emerald-500/20 leading-relaxed">
            Calculated as an estimated 21% on the sum of Grids 81, 82, and 83.
          </p>
        </div>
      </div>

      {/* Bottom Summary Bar: Turnover, Output VAT, and Net VAT Settlement */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Turnover (Grid 03):</span>
            <span className="text-white font-mono font-bold">€{vatStats.turnoverGrid03.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">VAT on Sales (Grid 54 @ 21%):</span>
            <span className="text-emerald-300 font-mono font-bold">€{vatStats.outputVatGrid54.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Deductible VAT (Grid 59):</span>
            <span className="text-blue-300 font-mono font-bold">€{vatStats.grid59.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Estimated Net VAT Settlement:</span>
          <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
            vatStats.netVatBalance >= 0 
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200' 
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
          }`}>
            {vatStats.netVatBalance >= 0 
              ? `€${vatStats.netVatBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Net Payable)` 
              : `€${Math.abs(vatStats.netVatBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} (Refundable Credit)`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const standardTransactions = useMemo(() => parseCSV(RAW_CSV_DATA), []);
  const anomalyTransactions = useMemo(() => parseCSV(RAW_ANOMALY_CSV), []);

  // Entrance Workspace State: Empty by default
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'visualizations' | 'looker'>('all');
  const [workspaceViewMode, setWorkspaceViewMode] = useState<'both' | 'table' | 'charts'>('both');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [auditScanActive, setAuditScanActive] = useState<boolean>(false);

  // File Type Warning Banner for Belgian 2026 Mandate
  const [csvMandateWarningVisible, setCsvMandateWarningVisible] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Revenue' | 'Expense'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copiedFormula, setCopiedFormula] = useState<number | null>(null);

  // Unified File Upload Handler for .csv and Peppol .xml
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const isXml = fileNameLower.endsWith('.xml');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;

        if (isXml || text.trim().startsWith('<?xml') || text.includes('<Invoice')) {
          const { data: parsedInvoice, error } = parsePeppolXML(text);
          if (error) {
            setStatusMessage({ type: 'error', text: error });
          } else {
            // Dismiss CSV warning when XML is uploaded
            setCsvMandateWarningVisible(false);
            setActiveTransactions(prev => {
              const updated = [parsedInvoice, ...prev];
              return auditScanActive ? applyRiskScan(updated) : updated;
            });
            setIsDemoMode(false);
            setActiveTab('all');
            setStatusMessage({ 
              type: 'success', 
              text: `Parsed Peppol XML invoice "${parsedInvoice.Transaction_ID}" from ${parsedInvoice.Client_Vendor} (€${parsedInvoice.Amount}). Appended to active workspace.` 
            });
          }
        } else {
          // CSV ledger file uploaded
          const { data, error } = parseUploadedCSV(text);
          if (error) {
            setStatusMessage({ type: 'error', text: error });
          } else {
            // Rule 3: File Type Warning for CSV files under Belgian 2026 mandate
            setCsvMandateWarningVisible(true);
            const finalData = auditScanActive ? applyRiskScan(data) : data;
            setActiveTransactions(finalData);
            setIsDemoMode(false);
            setActiveTab('all');
            setStatusMessage({ 
              type: 'success', 
              text: `Loaded ${data.length} transactions from CSV "${file.name}".` 
            });
          }
        }
      } catch (err) {
        setStatusMessage({ 
          type: 'error', 
          text: 'File processing error: ' + (err instanceof Error ? err.message : 'Unknown error') 
        });
      }
    };

    reader.onerror = () => {
      setStatusMessage({ type: 'error', text: 'Error reading local file.' });
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Demo Dataset Activation
  const handleLoadDemoData = () => {
    const all70 = [...standardTransactions, ...anomalyTransactions].sort((a, b) => a.Date.localeCompare(b.Date));
    setActiveTransactions(all70);
    setIsDemoMode(true);
    setActiveTab('all');
    setAuditScanActive(false);
    setCsvMandateWarningVisible(false);
    setStatusMessage({
      type: 'success',
      text: 'Loaded synthetic Belgian SME consulting dataset (70 transactions).'
    });
  };

  // Quick helper to load sample Peppol XML invoices for test purposes
  const handleLoadSamplePeppolXML = (compliant: boolean) => {
    const xml = compliant ? SAMPLE_COMPLIANT_PEPPOL_XML : SAMPLE_NON_COMPLIANT_PEPPOL_XML;
    const { data, error } = parsePeppolXML(xml);
    if (!error) {
      setCsvMandateWarningVisible(false);
      setActiveTransactions(prev => {
        const updated = [data, ...prev];
        return auditScanActive ? applyRiskScan(updated) : updated;
      });
      setIsDemoMode(false);
      setActiveTab('all');
      setStatusMessage({
        type: 'success',
        text: compliant 
          ? 'Loaded compliant Peppol XML e-invoice (Proximus with BE VAT & IBAN).'
          : 'Loaded non-compliant Peppol XML (Non-BE VAT & Missing IBAN to trigger risk scan).'
      });
    }
  };

  // Exit Demo Mode & Return to Entrance Screen
  const handleExitDemo = () => {
    setActiveTransactions([]);
    setIsDemoMode(false);
    setAuditScanActive(false);
    setCsvMandateWarningVisible(false);
    setStatusMessage(null);
    setSearchTerm('');
    setTypeFilter('All');
    setCategoryFilter('All');
    setActiveTab('all');
  };

  // Automated Risk Engine Scan Toggle
  const handleToggleAuditScan = () => {
    if (activeTransactions.length === 0) return;

    if (auditScanActive) {
      setActiveTransactions(prev => prev.map(t => ({ ...t, risk_flag: undefined, risk_flags: undefined })));
      setAuditScanActive(false);
      setStatusMessage({ type: 'success', text: 'Audit scan deactivated. Standard view restored.' });
    } else {
      const scanned = applyRiskScan(activeTransactions);
      setActiveTransactions(scanned);
      setAuditScanActive(true);
      const flaggedRows = scanned.filter(t => t.risk_flags && t.risk_flags.length > 0);
      setStatusMessage({ 
        type: flaggedRows.length > 0 ? 'error' : 'success', 
        text: `Automated Peppol & Financial Audit complete: identified ${flaggedRows.length} transaction${flaggedRows.length === 1 ? '' : 's'} with compliance or financial risk flags.` 
      });
    }
  };

  const copyFormula = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // VAT Grid filter state: 'All' | '81' | '82' | '83'
  const [vatGridFilter, setVatGridFilter] = useState<'All' | '81' | '82' | '83'>('All');

  // Interactive OGM Modulo 97 Tester Drawer State
  const [ogmTesterOpen, setOgmTesterOpen] = useState<boolean>(false);
  const [ogmTestInput, setOgmTestInput] = useState<string>('+++102/3456/78989+++');

  const liveOgmCheck = useMemo(() => {
    return validateBelgianOGM(ogmTestInput);
  }, [ogmTestInput]);

  // Safe scorecard math handling empty arrays gracefully
  const stats = useMemo(() => {
    if (!activeTransactions || activeTransactions.length === 0) {
      return { revenue: 0, expenses: 0, net: 0, margin: 0 };
    }
    let revenue = 0;
    let expenses = 0;
    activeTransactions.forEach(t => {
      const val = parseFloat(t.Amount);
      if (!isNaN(val)) {
        if (t.Type === 'Revenue') revenue += val;
        else expenses += val;
      }
    });
    const net = revenue - expenses;
    const margin = revenue > 0 ? (net / revenue) * 100 : 0;
    return { revenue, expenses, net, margin };
  }, [activeTransactions]);

  // Belgian VAT Box Breakdown & Intervat Grid Math mapped via mapTransactionsToBelgianVATGrids
  const vatStats = useMemo(() => {
    return mapTransactionsToBelgianVATGrids(activeTransactions);
  }, [activeTransactions]);

  const categories = useMemo(() => {
    if (!activeTransactions || activeTransactions.length === 0) return ['All'];
    const set = new Set(activeTransactions.map(t => t.Category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [activeTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!activeTransactions || activeTransactions.length === 0) return [];
    return activeTransactions.filter(t => {
      const matchesSearch = 
        (t.Client_Vendor && t.Client_Vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.Transaction_ID && t.Transaction_ID.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.Category && t.Category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.ogm_reference && t.ogm_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.risk_flags && t.risk_flags.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (t.Anomaly_Note && t.Anomaly_Note.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'All' || t.Type === typeFilter;
      const matchesCategory = categoryFilter === 'All' || t.Category === categoryFilter;
      const matchesVatGrid = vatGridFilter === 'All' || t.vat_grid === vatGridFilter;

      return matchesSearch && matchesType && matchesCategory && matchesVatGrid;
    });
  }, [activeTransactions, searchTerm, typeFilter, categoryFilter, vatGridFilter]);

  const riskExceptions = useMemo(() => {
    return activeTransactions.filter(t => (t.risk_flags && t.risk_flags.length > 0) || !!t.risk_flag);
  }, [activeTransactions]);

  const hasRiskExceptions = riskExceptions.length > 0;

  const handleDownloadAuditReport = () => {
    const exceptions = activeTransactions.filter(t => (t.risk_flags && t.risk_flags.length > 0) || !!t.risk_flag);
    if (exceptions.length === 0) return;

    const header = 'Date,Transaction_ID,Client_Vendor,Amount,Risk_Reason\n';
    const rows = exceptions.map(tx => {
      const rawReason = (tx.risk_flags && tx.risk_flags.length > 0) 
        ? tx.risk_flags.join('; ') 
        : (tx.risk_flag || tx.Anomaly_Note || 'Flagged Exception');
      const escapedVendor = `"${(tx.Client_Vendor || '').replace(/"/g, '""')}"`;
      const escapedReason = `"${rawReason.replace(/"/g, '""')}"`;
      return `${tx.Date},${tx.Transaction_ID},${escapedVendor},${tx.Amount},${escapedReason}`;
    }).join('\n');

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const currentDate = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `Audit_Exceptions_Report_${currentDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: 'success',
      text: `Exported ${exceptions.length} audit exception${exceptions.length === 1 ? '' : 's'} to "Audit_Exceptions_Report_${currentDate}.csv".`
    });
  };

  const handleCopyCurrentCSV = () => {
    if (activeTransactions.length === 0) return;
    const header = 'Date,Transaction_ID,Client_Vendor,Category,Type,Amount' + (auditScanActive ? ',Risk_Flags\n' : '\n');
    const rows = activeTransactions.map(t => 
      `${t.Date},${t.Transaction_ID},${t.Client_Vendor},${t.Category},${t.Type},${t.Amount}${auditScanActive ? ',"' + (t.risk_flags?.join('; ') || '') + '"' : ''}`
    ).join('\n');
    navigator.clipboard.writeText(header + rows);
    setStatusMessage({ type: 'success', text: `Copied ${activeTransactions.length} transactions to clipboard!` });
  };

  const handleDownload = () => {
    if (activeTransactions.length === 0) return;
    const header = 'Date,Transaction_ID,Client_Vendor,Category,Type,Amount' + (auditScanActive ? ',Risk_Flags\n' : '\n');
    const rows = activeTransactions.map(t => 
      `${t.Date},${t.Transaction_ID},${t.Client_Vendor},${t.Category},${t.Type},${t.Amount}${auditScanActive ? ',"' + (t.risk_flags?.join('; ') || '') + '"' : ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_ledger_${activeTransactions.length}_rows.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Active Demo Mode Sticky Notification Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-6 py-2.5 shadow-md flex items-center justify-between sticky top-0 z-30 transition">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
            <span>You are currently viewing the Belgian SME Demo Dataset.</span>
          </div>
          <button
            onClick={handleExitDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white text-xs font-bold shadow transition cursor-pointer active:scale-95"
            title="Reset workspace and return to entrance screen"
          >
            <X className="w-3.5 h-3.5" />
            Exit Demo & Return Home
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className={`border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 z-20 ${!isDemoMode ? 'sticky top-0' : ''}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Belgian Consulting SME Financial Controller</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  activeTransactions.length > 0 
                    ? isDemoMode 
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {activeTransactions.length > 0 
                    ? isDemoMode 
                      ? 'Demo Dataset Active' 
                      : `${activeTransactions.length} Transactions Loaded`
                    : 'Empty Workspace'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                General Ledger Analytics · 2026 Peppol B2B E-Invoicing · Audit Risk Scan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden Native File Input supporting .csv and Peppol .xml */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".csv,text/csv,.xml,text/xml,application/xml" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition active:scale-95 cursor-pointer"
              title="Upload CSV ledger or Peppol XML e-invoice"
            >
              <Upload className="w-4 h-4" />
              Upload Financial File (.CSV / .XML)
            </button>

            {/* Demo Button */}
            {!isDemoMode && (
              <button
                onClick={handleLoadDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition active:scale-95 cursor-pointer"
                title="Load 70-row synthetic Belgian SME dataset"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Explore Demo Dataset
              </button>
            )}

            {/* Loaded state actions */}
            {activeTransactions.length > 0 && (
              <>
                <button
                  onClick={handleToggleAuditScan}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition active:scale-95 cursor-pointer ${
                    auditScanActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
                  }`}
                  title="Run automated financial audit & Peppol risk scan"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {auditScanActive ? 'Audit Scan Active' : 'Run Audit Scan'}
                </button>

                {/* Actionable Audit Report Export Button */}
                <button
                  onClick={handleDownloadAuditReport}
                  disabled={!hasRiskExceptions}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                    hasRiskExceptions
                      ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/60 text-rose-200 cursor-pointer shadow-sm active:scale-95'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                  title={hasRiskExceptions ? `Export ${riskExceptions.length} audit exceptions to CSV` : 'No audit risks flagged (click Run Audit Scan or load exceptions)'}
                >
                  <Download className="w-4 h-4" />
                  Download Audit Report {hasRiskExceptions && `(${riskExceptions.length})`}
                </button>

                <button
                  onClick={handleCopyCurrentCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition active:scale-95 cursor-pointer"
                  title="Copy current table as CSV"
                >
                  <Copy className="w-4 h-4" />
                  Copy CSV
                </button>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  title="Download CSV file"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

                <button
                  onClick={handleExitDemo}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 border border-slate-700 transition active:scale-95 cursor-pointer"
                  title="Clear workspace and return to entrance screen"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Workspace
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Status Alert Notification */}
        {statusMessage && (
          <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium animate-fadeIn ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-lg shadow-emerald-950/50' 
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-950/50'
          }`}>
            <div className="flex items-center gap-2.5">
              {statusMessage.type === 'success' ? (
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)} 
              className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Belgian 2026 Mandate Dismissible File Type Warning Banner */}
        {csvMandateWarningVisible && (
          <div className="bg-amber-950/75 border border-amber-500/50 rounded-xl p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-lg animate-fadeIn">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <span className="font-medium leading-relaxed">
                Note: Belgian B2B transactions require structured XML e-invoices as of Jan 1, 2026. CSV ledgers are for internal auditing only.
              </span>
            </div>
            <button
              onClick={() => setCsvMandateWarningVisible(false)}
              className="p-1 text-amber-400 hover:text-white rounded-md transition cursor-pointer shrink-0"
              title="Dismiss Peppol mandate warning"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Global Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 gap-2">
          {activeTransactions.length > 0 && (
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'border-blue-400 text-blue-300 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📋 General Ledger</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                {activeTransactions.length} Rows
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('visualizations')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'visualizations'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📈 Financial Visualizations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 border border-indigo-800/80 text-indigo-300 text-[10px]">
              SVG Charts
            </span>
          </button>

          <button
            onClick={() => setActiveTab('looker')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'looker'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📊 Looker Studio Calculated Fields</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-[10px]">Formulas</span>
          </button>
        </div>

        {/* View 1: Looker Studio Reference */}
        {activeTab === 'looker' ? (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                How to Add Calculated Fields in Looker Studio (Step-by-Step)
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400 mb-1">Step 1: Open Data Source</div>
                  <p className="text-slate-300">In your report, look at the right sidebar under the <strong>Data</strong> panel.</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400 mb-1">Step 2: Add Field</div>
                  <p className="text-slate-300">Click <strong>+ Add field</strong> at the bottom of the field list.</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400 mb-1">Step 3: Enter Details</div>
                  <p className="text-slate-300">Type the <strong>Field Name</strong>, paste the formula into the <strong>Formula</strong> box, and verify the green checkmark.</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400 mb-1">Step 4: Save & Apply</div>
                  <p className="text-slate-300">Click <strong>Save</strong> then <strong>Done</strong>. Drag into Metrics or Dimensions!</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Formula 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Metric
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">1. Net Cash Flow</h3>
                    <p className="text-xs text-slate-400">Total Revenue minus Total Expenses</p>
                  </div>
                  <button
                    onClick={() => copyFormula('SUM(CASE WHEN Type = "Revenue" THEN Amount ELSE 0 END) - SUM(CASE WHEN Type = "Expense" THEN Amount ELSE 0 END)', 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition"
                  >
                    {copiedFormula === 1 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormula === 1 ? 'Copied!' : 'Copy Formula'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
{`SUM(CASE WHEN Type = "Revenue" THEN Amount ELSE 0 END) - SUM(CASE WHEN Type = "Expense" THEN Amount ELSE 0 END)`}
                </pre>
              </div>

              {/* Formula 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Dimension
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">2. Cost Type Classification (Fixed vs Variable)</h3>
                    <p className="text-xs text-slate-400">Classifies categories into Fixed Costs, Variable Costs, or Revenue</p>
                  </div>
                  <button
                    onClick={() => copyFormula(`CASE 
  WHEN Category IN ("Rent", "Payroll", "Telecom") THEN "Fixed Costs"
  WHEN Category IN ("Travel", "Meals", "IT Software", "IT Hardware", "Accounting", "Taxes & Penalties") THEN "Variable Costs"
  WHEN Type = "Revenue" THEN "Revenue"
  ELSE "Other Costs"
END`, 2)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition"
                  >
                    {copiedFormula === 2 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormula === 2 ? 'Copied!' : 'Copy Formula'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-purple-300 font-mono text-xs overflow-x-auto border border-slate-800">
{`CASE 
  WHEN Category IN ("Rent", "Payroll", "Telecom") THEN "Fixed Costs"
  WHEN Category IN ("Travel", "Meals", "IT Software", "IT Hardware", "Accounting", "Taxes & Penalties") THEN "Variable Costs"
  WHEN Type = "Revenue" THEN "Revenue"
  ELSE "Other Costs"
END`}
                </pre>
              </div>

              {/* Formula 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Dimension
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">3. Board Approval Threshold Flag</h3>
                    <p className="text-xs text-slate-400">Flags single expense transactions exceeding €5,000.00 for governance review</p>
                  </div>
                  <button
                    onClick={() => copyFormula(`CASE 
  WHEN Type = "Expense" AND Amount > 5000 THEN "Requires Board Approval"
  ELSE "Standard Approval"
END`, 3)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition"
                  >
                    {copiedFormula === 3 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormula === 3 ? 'Copied!' : 'Copy Formula'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-amber-300 font-mono text-xs overflow-x-auto border border-slate-800">
{`CASE 
  WHEN Type = "Expense" AND Amount > 5000 THEN "Requires Board Approval"
  ELSE "Standard Approval"
END`}
                </pre>
              </div>

              {/* Formula 4: Estimated Deductible VAT (Grid 59) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Belgian Tax Metric
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">4. Estimated Deductible VAT (Grid 59)</h3>
                    <p className="text-xs text-slate-400">Total Deductible VAT calculated as 21% of Grids 81, 82, and 83 (Grid 59 = Taxable Purchases × 0.21)</p>
                  </div>
                  <button
                    onClick={() => copyFormula('SUM(CASE WHEN Type = "Expense" THEN Amount * 0.21 ELSE 0 END)', 4)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition"
                  >
                    {copiedFormula === 4 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormula === 4 ? 'Copied!' : 'Copy Formula'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
{`/* Grid 59: Deductible Input VAT (21% on Belgian Business Purchases) */
SUM(CASE WHEN Type = "Expense" THEN Amount * 0.21 ELSE 0 END)`}
                </pre>
              </div>

              {/* Formula 5: Belgian VAT Box Classification */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Belgian Tax Dimension
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">5. Belgian VAT Return Grid Categorization</h3>
                    <p className="text-xs text-slate-400">Maps transactions to Intervat purchase grids [81] (Merchandise/Trade Goods), [82] (Services &amp; Misc Goods), or [83] (Investments/Capital Assets)</p>
                  </div>
                  <button
                    onClick={() => copyFormula(`CASE 
  WHEN Type = "Expense" AND Amount > 1000 AND (
    REGEXP_CONTAINS(LOWER(Category), "hardware|machin|vehicle|car|auto|fleet|equip|server|computer|laptop")
  ) THEN "Grid 83 (Investments/Capital Assets)"
  WHEN Type = "Expense" AND (
    REGEXP_CONTAINS(LOWER(Category), "inventory|material|trade goods|merchandise|stock")
  ) THEN "Grid 81 (Merchandise/Trade Goods)"
  WHEN Type = "Expense" THEN "Grid 82 (Services & Misc Goods)"
  WHEN Type = "Revenue" THEN "Grid 03 (Turnover)"
  ELSE "Out of Scope"
END`, 5)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer transition"
                  >
                    {copiedFormula === 5 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormula === 5 ? 'Copied!' : 'Copy Formula'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">
{`CASE 
  WHEN Type = "Expense" AND Amount > 1000 AND (
    REGEXP_CONTAINS(LOWER(Category), "hardware|machin|vehicle|car|auto|fleet|equip|server|computer|laptop")
  ) THEN "Grid 83 (Investments/Capital Assets)"
  WHEN Type = "Expense" AND (
    REGEXP_CONTAINS(LOWER(Category), "inventory|material|trade goods|merchandise|stock")
  ) THEN "Grid 81 (Merchandise/Trade Goods)"
  WHEN Type = "Expense" THEN "Grid 82 (Services & Misc Goods)"
  WHEN Type = "Revenue" THEN "Grid 03 (Turnover)"
  ELSE "Out of Scope"
END`}
                </pre>
              </div>
            </div>
          </div>
        ) : activeTab === 'visualizations' ? (
          <FinancialVisualizations 
            transactions={activeTransactions}
            onUploadClick={() => fileInputRef.current?.click()}
            onLoadDemo={handleLoadDemoData}
          />
        ) : activeTransactions.length === 0 ? (
          /* View 2: Empty Entrance Workspace (2 Primary CTA Cards) */
          <div className="py-12 px-4 max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                Belgian SME Financial Controller Hub
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Financial Analysis & 2026 Peppol Audit Workspace
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Begin by uploading your company's general ledger CSV or Peppol UBL 2.1 XML supplier invoices, or explore the pre-loaded Belgian SME dataset.
              </p>
            </div>

            {/* 2 Primary CTA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card A: Upload Financial File */}
              <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-7 flex flex-col justify-between shadow-xl transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                      Upload Financial File
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Upload standard general ledger <strong>.csv</strong> files or native <strong>Peppol UBL 2.1 .xml</strong> e-invoices. Validates Belgian VAT prefixes (BE0/BE1) and mandatory BIS 3.0 payment IBANs.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-emerald-400 border border-slate-800">
                      .CSV Ledgers
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-blue-400 border border-slate-800">
                      Peppol UBL 2.1 .XML
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-purple-400 border border-slate-800">
                      Mandate 2026 Checks
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-2.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Select .CSV or Peppol .XML File
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadSamplePeppolXML(true)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-blue-300 border border-slate-800 text-center transition cursor-pointer"
                      title="Load sample valid Peppol XML"
                    >
                      + Test Valid Peppol XML
                    </button>
                    <button
                      onClick={() => handleLoadSamplePeppolXML(false)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-amber-300 border border-slate-800 text-center transition cursor-pointer"
                      title="Load Peppol XML with non-BE VAT & missing IBAN"
                    >
                      + Test Risk Peppol XML
                    </button>
                  </div>
                </div>
              </div>

              {/* Card B: Explore Demo Dataset */}
              <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-7 flex flex-col justify-between shadow-xl transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
                      Explore Demo Dataset
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Instant preview of <strong>70 realistic Belgian B2B transactions</strong> across Brussels, Flanders, and Wallonia. Includes recurring rent (Befimmo), payroll (SD Worx/Liantis), foreign VAT, and 10 audit anomalies.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-amber-400 border border-slate-800">
                      70 Synthetic Transactions
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      Belgian Vendors
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-purple-400 border border-slate-800">
                      Peppol Audit Risks
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80">
                  <button
                    onClick={handleLoadDemoData}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-950/40 transition active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Load Belgian SME Demo Ledger
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Peppol Mandate Info Callout */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>Belgian 2026 Peppol Mandate:</strong> Effective Jan 1, 2026, all domestic B2B invoices must follow EN 16931 Peppol BIS Billing 3.0 UBL XML.
                </span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">
                Automated VAT & IBAN compliance engine
              </span>
            </div>

            {/* VAT Return Preview Card (Default State: €0.00) */}
            <div className="pt-2">
              <VatReturnPreviewCard
                vatStats={vatStats}
                vatGridFilter={vatGridFilter}
                setVatGridFilter={setVatGridFilter}
                ogmTesterOpen={ogmTesterOpen}
                setOgmTesterOpen={setOgmTesterOpen}
                ogmTestInput={ogmTestInput}
                setOgmTestInput={setOgmTestInput}
                liveOgmCheck={liveOgmCheck}
                isDefaultEmpty={true}
              />
            </div>
          </div>
        ) : (
          /* View 3: Loaded Ledger Workspace */
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-400 font-mono">
                  €{stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTransactions.filter(t => t.Type === 'Revenue').length} Revenue Invoices
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Expenses</span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-rose-400 font-mono">
                  €{stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTransactions.filter(t => t.Type === 'Expense').length} Expense Disbursals
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Position</span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-white font-mono">
                  €{stats.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-400 mt-1">Margin: {stats.margin.toFixed(1)}%</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Audit Flags & Risks
                  </span>
                  <div className={`p-1.5 rounded-lg ${
                    activeTransactions.filter(t => (t.risk_flags && t.risk_flags.length > 0) || !!t.risk_flag || !!t.Anomaly_Note).length > 0 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-amber-300 font-mono">
                  {activeTransactions.filter(t => (t.risk_flags && t.risk_flags.length > 0) || !!t.risk_flag || !!t.Anomaly_Note).length} Items
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {auditScanActive 
                    ? 'Peppol BIS 3.0 & financial audit active' 
                    : 'Click "Run Audit Scan" to audit'}
                </p>
              </div>
            </div>

            {/* Belgian VAT Return Preview Card (BTW-Aangifte) */}
            <VatReturnPreviewCard
              vatStats={vatStats}
              vatGridFilter={vatGridFilter}
              setVatGridFilter={setVatGridFilter}
              ogmTesterOpen={ogmTesterOpen}
              setOgmTesterOpen={setOgmTesterOpen}
              ogmTestInput={ogmTestInput}
              setOgmTestInput={setOgmTestInput}
              liveOgmCheck={liveOgmCheck}
              isDefaultEmpty={false}
            />

            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ID, client, Peppol, OGM, VAT, flags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* VAT Grid Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Scale className="w-3.5 h-3.5 text-purple-400" />
                  <span>VAT Box:</span>
                </div>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                  {(['All', '81', '82', '83'] as const).map(box => (
                    <button
                      key={box}
                      onClick={() => setVatGridFilter(box)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                        vatGridFilter === box
                          ? box === '83' 
                            ? 'bg-purple-600 text-white font-bold' 
                            : box === '82'
                            ? 'bg-indigo-600 text-white font-bold'
                            : box === '81' 
                            ? 'bg-blue-600 text-white font-bold' 
                            : 'bg-slate-700 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {box === 'All' ? 'All' : `Grid ${box}`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Type:</span>
                </div>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                  {(['All', 'Revenue', 'Expense'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                        typeFilter === type
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Workspace View Mode Switcher */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Display:</span>
                </div>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                  <button
                    onClick={() => setWorkspaceViewMode('both')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition cursor-pointer flex items-center gap-1 ${
                      workspaceViewMode === 'both' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Display both SVG charts and transaction table"
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setWorkspaceViewMode('charts')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition cursor-pointer flex items-center gap-1 ${
                      workspaceViewMode === 'charts' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Display SVG charts only"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Charts
                  </button>
                  <button
                    onClick={() => setWorkspaceViewMode('table')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition cursor-pointer flex items-center gap-1 ${
                      workspaceViewMode === 'table' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Display ledger table only"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    Table
                  </button>
                </div>

                <span className="text-xs text-slate-500 ml-auto md:ml-2">
                  Showing {filteredTransactions.length} of {activeTransactions.length} rows
                </span>
              </div>
            </div>

            {/* Financial Visualizations Section (Native SVG Charts) */}
            {(workspaceViewMode === 'both' || workspaceViewMode === 'charts') && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Financial Visualizations</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800/80 text-blue-300 font-mono">
                      Native SVG (ViewBox 800×400)
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Category spending allocations and cumulative cash flow trajectory
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Native SVG Bar Chart */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Revenue vs. Expenses by Category</h4>
                          <p className="text-[11px] text-slate-400">Aggregated spending and revenue distribution</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        SVG Bars
                      </span>
                    </div>

                    <div className="w-full">
                      <CategoryBarChart transactions={activeTransactions} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Hover bars for transaction totals</span>
                      <span className="text-emerald-400 font-medium">Green = Revenue · Red = Expenses</span>
                    </div>
                  </div>

                  {/* Chart 2: Native SVG Line Chart */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          <LineChart className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Cash Flow Trend (Cumulative Net Position)</h4>
                          <p className="text-[11px] text-slate-400">Chronological net cash trajectory over time</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        SVG Polyline
                      </span>
                    </div>

                    <div className="w-full">
                      <CashFlowLineChart transactions={activeTransactions} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Hover points to inspect individual entries</span>
                      <span className="text-cyan-400 font-medium">Cumulative Trajectory</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Ledger Table */}
            {(workspaceViewMode === 'both' || workspaceViewMode === 'table') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Transaction ID & OGM</th>
                      <th className="py-3.5 px-4">Client / Vendor & VAT</th>
                      <th className="py-3.5 px-4">Category & VAT Grid</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4 text-right">Amount (EUR)</th>
                      <th className="py-3.5 px-4 text-left">
                        {auditScanActive ? 'Audit, OGM & Peppol 2026 Risk Flags' : 'Audit / Governance Note'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredTransactions.map((tx, idx) => {
                      const hasRisks = tx.risk_flags && tx.risk_flags.length > 0;
                      const hasPeppolRisk = tx.risk_flags?.some(f => f.startsWith('Peppol Risk:'));
                      const hasOgmRisk = tx.risk_flags?.some(f => f.includes('Invalid') && (f.includes('OGM') || f.includes('Mod-97'))) || tx.risk_flag?.includes('Invalid');
                      const isPeppol = tx.Category.includes('Peppol');
                      const assignedGrid = tx.vat_grid || (tx.Type === 'Expense' ? getBelgianVatGrid(tx) : undefined);
                      
                      let rowStyle = 'hover:bg-slate-800/40';
                      if (hasOgmRisk) {
                        rowStyle = 'bg-rose-950/25 hover:bg-rose-950/35 border-l-4 border-l-rose-500';
                      } else if (hasPeppolRisk) {
                        rowStyle = 'bg-purple-950/20 hover:bg-purple-950/30 border-l-4 border-l-purple-500';
                      } else if (hasRisks) {
                        rowStyle = 'bg-rose-950/20 hover:bg-rose-950/30 border-l-4 border-l-rose-500';
                      } else if (isPeppol) {
                        rowStyle = 'bg-blue-950/20 hover:bg-blue-950/30';
                      }

                      return (
                        <tr key={`${tx.Transaction_ID}-${idx}`} className={`transition ${rowStyle}`}>
                          <td className="py-2.5 px-4 text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-4 text-slate-300 font-sans">{tx.Date}</td>
                          <td className="py-2.5 px-4">
                            <div>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                tx.Type === 'Revenue'
                                  ? 'bg-emerald-950/80 border border-emerald-800/60 text-emerald-300'
                                  : isPeppol
                                  ? 'bg-blue-950/80 border border-blue-700/60 text-blue-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {tx.Transaction_ID}
                              </span>

                              {/* OGM Structured Communication Reference Display */}
                              {tx.ogm_reference && (
                                <div className="mt-1 flex items-center gap-1 font-mono text-[10px]">
                                  {tx.is_valid_ogm !== false ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60" title="Valid Belgian OGM (Modulo 97 verified)">
                                      <Check className="w-2.5 h-2.5" />
                                      {tx.ogm_reference}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-700/60 font-bold" title="Invalid Belgian OGM: Failed Modulo 97 check">
                                      <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                      {tx.ogm_reference} (Mod 97 Fail)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-sans font-medium text-white">
                            <div className="flex items-center gap-1.5">
                              {isPeppol && (
                                <span title="Peppol UBL 2.1 E-Invoice">
                                  <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                </span>
                              )}
                              <span>{tx.Client_Vendor}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-sans">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/50">
                                {tx.Category}
                              </span>
                              {tx.Type === 'Expense' && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                  assignedGrid === '83'
                                    ? 'bg-purple-950/80 border-purple-700/70 text-purple-300 font-semibold'
                                    : assignedGrid === '81'
                                    ? 'bg-blue-950/80 border-blue-700/70 text-blue-300 font-semibold'
                                    : 'bg-indigo-950/80 border-indigo-700/70 text-indigo-300 font-semibold'
                                }`} title={
                                  assignedGrid === '83' 
                                    ? 'Belgian Intervat Grid 83: Investments / Capital Assets' 
                                    : assignedGrid === '81' 
                                    ? 'Belgian Intervat Grid 81: Merchandise / Trade Goods' 
                                    : 'Belgian Intervat Grid 82: Services & Misc Goods'
                                }>
                                  Grid {assignedGrid || '82'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-sans">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              tx.Type === 'Revenue' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {parseFloat(tx.Amount) < 0 ? '-' : tx.Type === 'Revenue' ? '+' : '-'} {tx.Type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-sm">
                            <span className={
                              parseFloat(tx.Amount) < 0 
                                ? 'text-rose-400' 
                                : tx.Type === 'Revenue' 
                                ? 'text-emerald-400' 
                                : 'text-slate-200'
                            }>
                              {parseFloat(tx.Amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-sans text-xs">
                            {tx.risk_flags && tx.risk_flags.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-lg">
                                {tx.risk_flags.map((flag, fIdx) => {
                                  const isOgmInvalid = flag.includes('Invalid OGM') || flag.includes('Mod-97 Failure') || (flag.includes('Invalid') && flag.includes('OGM'));
                                  const isPeppolRisk = flag.startsWith('Peppol Risk:');
                                  const isHighValue = flag.includes('High Value');
                                  const isMissing = flag.includes('Missing');
                                  const isRefund = flag.includes('Refund') || flag.includes('Credit Note');

                                  let badgeStyle = 'bg-amber-950/80 border-amber-600/50 text-amber-200';
                                  if (isOgmInvalid) {
                                    badgeStyle = 'bg-rose-950/95 border-rose-500 text-rose-200 font-bold shadow-md shadow-rose-950/50';
                                  } else if (isPeppolRisk) {
                                    badgeStyle = 'bg-purple-950/90 border-purple-500/60 text-purple-200 font-semibold shadow-sm';
                                  } else if (isHighValue || isMissing) {
                                    badgeStyle = 'bg-rose-950/90 border-rose-500/60 text-rose-200 font-semibold shadow-sm';
                                  } else if (isRefund) {
                                    badgeStyle = 'bg-blue-950/90 border-blue-500/60 text-blue-200 font-semibold shadow-sm';
                                  }

                                  return (
                                    <span 
                                      key={fIdx} 
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border ${badgeStyle}`}
                                    >
                                      <AlertTriangle className="w-3 h-3 shrink-0" />
                                      <span>{flag}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : tx.Anomaly_Note ? (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                                isPeppol
                                  ? 'bg-blue-950/70 border-blue-600/40 text-blue-200'
                                  : 'bg-amber-950/70 border-amber-600/40 text-amber-200'
                              }`}>
                                {isPeppol ? <FileCode className="w-3.5 h-3.5 text-blue-400" /> : '⚠️'}
                                {tx.Anomaly_Note}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                                Compliant / Clear
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Quick Copy Raw CSV Block helper */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Active Dataset ({activeTransactions.length} transactions)
                </span>
                <button
                  onClick={handleCopyCurrentCSV}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  Copy CSV to Clipboard
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-400 bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-36 border border-slate-800">
                {`Date,Transaction_ID,Client_Vendor,Category,Type,Amount${auditScanActive ? ',Risk_Flags' : ''}\n` +
                  activeTransactions.slice(0, 8).map(t => 
                    `${t.Date},${t.Transaction_ID},${t.Client_Vendor},${t.Category},${t.Type},${t.Amount}${auditScanActive ? ',"' + (t.risk_flags?.join('; ') || '') + '"' : ''}`
                  ).join('\n') +
                  (activeTransactions.length > 8 ? `\n... (${activeTransactions.length - 8} more rows)` : '')}
              </pre>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
