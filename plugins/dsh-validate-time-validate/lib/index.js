/**
 * 校验：time validate — 校验工具
 */

export const name = "dsh-validate-time-validate";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

function luhn(s) { s = String(s).replace(/\D/g, ""); let sum = 0, dbl = false; for (let i = s.length - 1; i >= 0; i--) { let n = Number(s[i]); if (dbl) { n *= 2; if (n > 9) n -= 9; } sum += n; dbl = !dbl; } return s.length > 0 && sum % 10 === 0; }
function ibanMod97(s) { s = String(s).replace(/\s+/g, "").toUpperCase(); if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false; const re = s.slice(4) + s.slice(0, 4); let rem = 0; for (const c of re) { const v = /\d/.test(c) ? c : String(c.charCodeAt(0) - 55); for (const d of v) rem = (rem * 10 + Number(d)) % 97; } return rem === 1; }
const USCC_CHARS = "0123456789ABCDEFGHJKLMNPQRTUWXY";
const USCC_W = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];

const OPS = {
  iban_validate: (t) => ibanMod97(t) ? "IBAN 校验通过" : "IBAN 校验失败",
  iban_format: (t) => String(t).replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim(),
  uscc_validate: (t) => {
    const s = String(t).trim().toUpperCase();
    if (!/^[0-9A-HJ-NPQRTUWXY]{18}$/.test(s)) return "格式不符（18 位统一社会信用代码）";
    let sum = 0; for (let i = 0; i < 17; i++) { const idx = USCC_CHARS.indexOf(s[i]); if (idx < 0) return "含非法字符"; sum += idx * USCC_W[i]; }
    const c = (31 - sum % 31) % 31;
    return USCC_CHARS[c] === s[17] ? "统一社会信用代码校验通过" : "校验位错误（应为 " + USCC_CHARS[c] + "）";
  },
  vat_cn_validate: (t) => { const s = String(t).replace(/\s/g, ""); return /^(?:\d{15}|\d{17}[\dXx]|\d{18}|\d{20})$/.test(s) ? "格式像中国税号（15/18/20 位）" : "税号格式不符"; },
  isbn10_validate: (t) => { const s = String(t).replace(/[-\s]/g, "").toUpperCase(); if (!/^\d{9}[\dX]$/.test(s)) return "ISBN-10 格式不符"; let sum = 0; for (let i = 0; i < 10; i++) sum += (s[i] === "X" ? 10 : Number(s[i])) * (10 - i); return sum % 11 === 0 ? "ISBN-10 通过" : "ISBN-10 校验失败"; },
  isbn13_validate: (t) => { const s = String(t).replace(/[-\s]/g, ""); if (!/^\d{13}$/.test(s)) return "ISBN-13 格式不符"; let sum = 0; for (let i = 0; i < 12; i++) sum += Number(s[i]) * (i % 2 === 0 ? 1 : 3); return (10 - sum % 10) % 10 === Number(s[12]) ? "ISBN-13 通过" : "ISBN-13 校验失败"; },
  ean13_validate: (t) => { const s = String(t).replace(/\D/g, ""); if (s.length !== 13) return "EAN-13 需 13 位"; let sum = 0; for (let i = 0; i < 12; i++) sum += Number(s[i]) * (i % 2 === 0 ? 1 : 3); return (10 - sum % 10) % 10 === Number(s[12]) ? "EAN-13 通过" : "EAN-13 校验失败"; },
  domain_validate: (t) => /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(String(t).trim()) ? "域名格式正确" : "域名格式错误",
  hostname_validate: (t) => /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/.test(String(t).trim()) ? "主机名格式正确" : "主机名格式错误",
  url_validate: (t) => { try { const u = new URL(String(t).trim()); return /^https?:$/.test(u.protocol) ? "URL 正确（" + u.protocol + "）" : "非 http(s) URL"; } catch (e) { return "URL 格式错误"; } },
  date_validate: (t) => { const m = String(t).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return "需 YYYY-MM-DD"; const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])); return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? "日期有效" : "日期不存在"; },
  time_validate: (t) => { const m = String(t).trim().match(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/); return m ? "时间有效" : "需 HH:MM 或 HH:MM:SS"; },
  hex_color_validate: (t) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(String(t).trim()) ? "颜色格式正确" : "需 #RGB / #RRGGBB / #RRGGBBAA",
  base64_validate: (t) => { try { atob(String(t).trim().replace(/-/g, "+").replace(/_/g, "/")); return "Base64 格式正确"; } catch (e) { return "Base64 格式错误"; } },
  jwt_format: (t) => { const p = String(t).trim().split("."); return p.length === 3 && /^[A-Za-z0-9_-]+$/.test(p[0]) && /^[A-Za-z0-9_-]+$/.test(p[1]) ? "JWT 结构正确" : "JWT 结构错误"; },
  email_strict: (t) => { const s = String(t).trim(); return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s) && s.length <= 254 ? "邮箱格式正确" : "邮箱格式错误"; },
  phone_intl: (t) => /^\+?[1-9]\d{6,14}$/.test(String(t).replace(/[\s-]/g, "")) ? "国际号码格式正确" : "国际号码格式错误",
  postcode_cn: (t) => /^[1-9]\d{5}$/.test(String(t).trim()) ? "中国邮编格式正确" : "中国邮编需 6 位且不以 0 开头",
  swift_validate: (t) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(String(t).trim().toUpperCase()) ? "SWIFT/BIC 格式正确" : "SWIFT/BIC 格式错误",
  imei_validate: (t) => { const s = String(t).replace(/\D/g, ""); return s.length === 15 && luhn(s) ? "IMEI 校验通过" : "IMEI 格式或校验失败"; },
};

export function apply(ctx, config) {
  void config;
  ctx.tools.register({
    name: "validate_time_validate",
    description: "time validate",
    parameters: {
      text: { "type": "string", required: true, "description": "待校验值" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      const t = args && args.text != null ? String(args.text) : "";
      try {
        const fn = OPS["time_validate"];
        if (!fn) throw new Error("未知操作");
        return { text: ["校验：time validate", "=".repeat(52), String(fn(t)), "", "更多工具：" + SITE].join(NL) };
      } catch (e) {
        return { text: "处理失败: " + String((e && e.message) || e) };
      }
    },
  });
}
