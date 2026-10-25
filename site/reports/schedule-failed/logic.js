(function() {
    "use strict";
    const CFG = {
        SHEET_DATA: "SCH FAILED",
        SHEET_PIVOT: "PIVOT SCH FAILED",
        SHEET_EMER: "EMER INSERT BY DISPATCH",
        SHEET_EMER_PIVOT: "PIVOT EMER INSERT",
        EMER_TITLE: "ASSIGN EMERGENCY INSERT BY DISPATCH",
        FIELD_SERVICE_INCLUDE: [ "Install", "Trouble Call", "Movement" ],
        INSTALLER_KEY: "Customer Account",
        INSTALLER_SOURCE_COL: "Techician Code",
        INSTALLER_EXCLUDE_STATUS: [ "Dispatched" ],
        INSTALLER_EMPTY: "-",
        PREV_KEEP_INSTALLER: true,
        TAKEOUT_SCHEDULE_DAY: 1,
        AS_EMER: "Done Assign Emergency Insert",
        AS_FEEDBACK: "Done Assign Feedback Field",
        EMER_TASK_TYPE: "Regular Task",
        SAMEDAY_TASK_TYPE: "Sameday Task",
        PIVOTS: [ {
            name: "Regular",
            taskType: "Regular Task",
            cols: [ "Status SF", "Assignment Status", "Field Service" ]
        }, {
            name: "Sameday",
            taskType: "Sameday Task",
            cols: [ "Status SF", "Field Service" ]
        } ],
        HIGHLIGHT: "FFFFFF00"
    };
    const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    const RNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    const PNS = "http://schemas.openxmlformats.org/package/2006/relationships";
    const CNS = "http://schemas.openxmlformats.org/package/2006/content-types";
    const DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n';
    const CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.";
    const D_NEED = [ "Customer Account", "Field Service", "Service Territory", "Task Type", "Task Status", "Job Task" ];
    const I_NEED = [ "Customer Account", "Task Status", "Techician Code" ];
    const ABSORB = "ABSORB", NOT_ABSORB = "NOT ABSORB";
    const F_INST = "Installer", F_SSF = "Status SF", F_AS = "Assignment Status";
    function clean(v) {
        return String(v == null ? "" : v).replace(/_x000D_/g, "").replace(/\r/g, "").trim();
    }
    function nh(s) {
        return String(s == null ? "" : s).replace(/\s+/g, " ").trim().toLowerCase();
    }
    const $ = id => document.getElementById("sf-" + id);
    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }[c]));
    }
    function xe(s) {
        return esc(String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, ""));
    }
    function parseXml(s) {
        if (s.charCodeAt(0) === 65279) s = s.slice(1);
        const d = (new DOMParser).parseFromString(s, "application/xml");
        if (d.getElementsByTagName("parsererror").length) throw new Error("XML rusak");
        return d;
    }
    function ser(d) {
        return DECL + (new XMLSerializer).serializeToString(d.documentElement);
    }
    function els(p, t) {
        return Array.prototype.slice.call(p.getElementsByTagName(t));
    }
    function kids(p, t) {
        const o = [];
        for (let n = p.firstElementChild; n; n = n.nextElementSibling) if (n.localName === t) o.push(n);
        return o;
    }
    function cname(n) {
        let s = "";
        while (n > 0) {
            const r = (n - 1) % 26;
            s = String.fromCharCode(65 + r) + s;
            n = (n - 1 - r) / 26;
        }
        return s;
    }
    const low = s => String(s).toLowerCase();
    const cmp = (a, b) => {
        const x = low(a), y = low(b);
        return x < y ? -1 : x > y ? 1 : 0;
    };
    const ssfOf = inst => inst === "" || inst === "-" ? NOT_ABSORB : ABSORB;
    const AS_RANK = {};
    AS_RANK[CFG.AS_EMER] = 0;
    AS_RANK[CFG.AS_FEEDBACK] = 1;
    const asRank = v => AS_RANK[v] != null ? AS_RANK[v] : 2;
    const BLN = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        mei: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        agu: 8,
        agt: 8,
        sep: 9,
        oct: 10,
        okt: 10,
        nov: 11,
        dec: 12,
        des: 12
    };
    const BULAN_PENDEK = [ "", "jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des" ];
    const keyOf = d => d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate();
    function dayKey(v) {
        const s = clean(v);
        let m, y, mo, d;
        if (!s) return null;
        if (/^\d+(\.\d+)?$/.test(s)) {
            const n = +s;
            if (n < 2e4 || n > 8e4) return null;
            const t = new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 864e5);
            return t.getUTCFullYear() * 1e4 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
        }
        if (m = /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/.exec(s)) {
            y = +m[1];
            mo = +m[2];
            d = +m[3];
        } else if (m = /^(\d{1,2})[-\/. ]([A-Za-z]{3})[A-Za-z]*[-\/. ,]+(\d{2,4})/.exec(s)) {
            d = +m[1];
            mo = BLN[m[2].toLowerCase()];
            y = +m[3];
        } else if (m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/.exec(s)) {
            const a = +m[1], b = +m[2];
            if (b > 12 && a <= 12) {
                mo = a;
                d = b;
            } else {
                d = a;
                mo = b;
            }
            y = +m[3];
        } else return null;
        if (y < 100) y += 2e3;
        if (!mo || mo > 12 || d < 1 || d > 31) return null;
        return y * 1e4 + mo * 100 + d;
    }
    async function readBook(file, sheetRows) {
        return XLSX.read(new Uint8Array(await file.arrayBuffer()), sheetRows ? {
            type: "array",
            sheetRows: sheetRows
        } : {
            type: "array"
        });
    }
    function aoaOf(ws) {
        return XLSX.utils.sheet_to_json(ws, {
            header: 1,
            raw: false,
            defval: ""
        });
    }
    async function readTable(file) {
        const wb = await readBook(file);
        let hdr = null;
        const rows = [];
        wb.SheetNames.forEach(sn => {
            const aoa = aoaOf(wb.Sheets[sn]);
            if (!aoa.length) return;
            let start = 0;
            if (!hdr) {
                hdr = aoa[0].map(clean);
                start = 1;
            } else {
                const first = aoa[0].map(nh), named = hdr.filter(Boolean).length;
                const same = first.filter((h, i) => h && h === nh(hdr[i])).length;
                if (same >= Math.ceil(named / 2)) start = 1;
            }
            for (let i = start; i < aoa.length; i++) {
                const a = aoa[i];
                if (a.some(x => String(x).trim() !== "")) rows.push(a);
            }
        });
        if (!hdr) throw new Error(file.name + ": sheet kosong");
        const cols = [], seen = {};
        hdr.forEach((h, i) => {
            if (!h) return;
            let n = h, k = 2;
            while (seen[nh(n)]) n = h + " " + k++;
            seen[nh(n)] = true;
            cols.push({
                name: n,
                src: i
            });
        });
        return {
            cols: cols,
            rows: rows,
            name: file.name
        };
    }
    function colOf(t, name) {
        const c = t.cols.filter(x => nh(x.name) === nh(name))[0];
        return c ? c.src : -1;
    }
    const isPrevHdr = hdr => [ F_INST, F_SSF, CFG.INSTALLER_KEY ].every(n => hdr.indexOf(nh(n)) >= 0);
    async function readPrev(file) {
        const wb = await readBook(file);
        let best = null;
        for (const sn of wb.SheetNames) {
            const aoa = aoaOf(wb.Sheets[sn]);
            if (!aoa.length || !isPrevHdr(aoa[0].map(nh))) continue;
            const rows = aoa.slice(1).filter(a => a.some(x => String(x).trim() !== ""));
            if (!best || rows.length > best.rows.length) {
                const idx = {};
                aoa[0].map(clean).forEach((h, i) => {
                    if (h && idx[nh(h)] == null) idx[nh(h)] = i;
                });
                best = {
                    idx: idx,
                    rows: rows,
                    name: file.name
                };
            }
        }
        if (!best) throw new Error(file.name + ": sheet data (kolom Installer, Status SF, Customer Account) nggak ketemu — pastikan ini file output Schedule Failed");
        return best;
    }
    const files = {
        dsp: null,
        inp: null,
        prv: null
    };
    let pend = null;
    async function sniff(file) {
        let wb;
        try {
            wb = await readBook(file, 1);
        } catch (e) {
            return null;
        }
        for (const sn of wb.SheetNames) {
            const aoa = aoaOf(wb.Sheets[sn]);
            if (!aoa.length) continue;
            const hdr = aoa[0].map(nh), has = n => hdr.indexOf(nh(n)) >= 0;
            if (has("Techician Code") && has("Customer Account")) return "inp";
            if (isPrevHdr(hdr)) return "prv";
            if (has("Customer Account") && has("Field Service") && !has("Arrival Time")) return "dsp";
        }
        return null;
    }
    function assign(k, f) {
        files[k] = f;
        const el = $("n-" + k);
        el.textContent = f.name;
        el.classList.add("on");
    }
    function refreshCount() {
        const n = [ "dsp", "inp" ].filter(k => files[k]).length;
        $("cnt").textContent = n + " / 2 wajib";
        $("run").disabled = n < 2;
    }
    async function takeFiles(list) {
        const arr = Array.prototype.slice.call(list);
        const dzs = dz.querySelector("span"), asal = dzs.textContent;
        dzs.textContent = "mengenali " + arr.length + " file…";
        const sisa = [];
        for (const f of arr) {
            const k = await sniff(f);
            if (k && !files[k]) assign(k, f); else sisa.push(f);
        }
        sisa.forEach(f => {
            const k = [ "dsp", "inp" ].filter(x => !files[x])[0];
            if (k) assign(k, f);
        });
        dzs.textContent = asal;
        refreshCount();
    }
    document.querySelectorAll("#pane-schedule-failed .sf-pick").forEach(b => b.addEventListener("click", () => {
        pend = b.getAttribute("data-k");
        $("fi").value = "";
        $("fi").click();
    }));
    $("fi").addEventListener("change", () => {
        const f = $("fi").files[0];
        if (!f) return;
        if (pend) assign(pend, f); else takeFiles($("fi").files);
        refreshCount();
        pend = null;
    });
    const dz = $("drop"), fp = $("fp");
    dz.addEventListener("click", () => {
        pend = null;
        $("fi").value = "";
        $("fi").click();
    });
    [ "dragenter", "dragover" ].forEach(ev => fp.addEventListener(ev, e => {
        e.preventDefault();
        dz.classList.add("over");
    }));
    [ "dragleave", "drop" ].forEach(ev => fp.addEventListener(ev, e => {
        e.preventDefault();
        dz.classList.remove("over");
    }));
    fp.addEventListener("drop", e => {
        if (e.dataTransfer && e.dataTransfer.files.length) takeFiles(e.dataTransfer.files);
    });
    let res = null;
    $("run").addEventListener("click", async () => {
        $("e1").innerHTML = "";
        $("e2").innerHTML = "";
        $("run").disabled = true;
        $("run").textContent = "Memproses…";
        try {
            res = await compute();
            render();
            $("res").classList.remove("sf-hidden");
            $("res").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } catch (e) {
            $("e1").innerHTML = '<div class="sf-err">' + esc(e.message) + "</div>";
        }
        $("run").disabled = false;
        $("run").textContent = "Proses";
    });
    async function compute() {
        const D = await readTable(files.dsp), I = await readTable(files.inp);
        const dMiss = D_NEED.filter(n => colOf(D, n) < 0), iMiss = I_NEED.filter(n => colOf(I, n) < 0);
        if (dMiss.length) throw new Error(D.name + ": kolom wajib nggak ada — " + dMiss.join(", "));
        if (iMiss.length) throw new Error(I.name + ": kolom wajib nggak ada — " + iMiss.join(", "));
        const alerts = [];
        const excl = CFG.INSTALLER_EXCLUDE_STATUS.map(nh);
        const iAcct = colOf(I, CFG.INSTALLER_KEY), iStat = colOf(I, "Task Status"), iTech = colOf(I, CFG.INSTALLER_SOURCE_COL);
        const tech = new Map(), dup = new Map();
        let skipped = 0;
        I.rows.forEach(a => {
            if (excl.indexOf(nh(a[iStat])) >= 0) {
                skipped++;
                return;
            }
            const k = clean(a[iAcct]);
            if (!k) return;
            if (tech.has(k)) {
                dup.set(k, (dup.get(k) || 1) + 1);
                return;
            }
            tech.set(k, clean(a[iTech]));
        });
        if (dup.size) alerts.push({
            t: "Customer Account muncul lebih dari 1x di Inprogress, dipakai baris pertama",
            d: dup.size + " akun · contoh " + Array.from(dup.keys()).slice(0, 5).join(", ")
        });
        const trim = {};
        D_NEED.forEach(n => trim[colOf(D, n)] = true);
        const inc = CFG.FIELD_SERVICE_INCLUDE.map(nh);
        const dFs = colOf(D, "Field Service"), dAcct = colOf(D, CFG.INSTALLER_KEY), dTt = colOf(D, "Task Type");
        const out = [], buang = {};
        const dSch = colOf(D, "Schedule Date"), base = stampOf(files.dsp.name);
        const hDay = new Date(base.getFullYear(), base.getMonth(), base.getDate() + CFG.TAKEOUT_SCHEDULE_DAY);
        const sch = {
            on: dSch >= 0 && CFG.TAKEOUT_SCHEDULE_DAY != null,
            key: keyOf(hDay),
            date: hDay,
            out: 0,
            bad: 0,
            badEx: []
        };
        const nextDay = raw => {
            const k = dayKey(raw);
            if (k !== null && k >= sch.key) return true;
            if (k === null && raw) {
                sch.bad++;
                if (sch.badEx.length < 3 && sch.badEx.indexOf(raw) < 0) sch.badEx.push(raw);
            }
            return false;
        };
        if (dSch < 0) alerts.push({
            t: "Kolom Schedule Date nggak ada di Dispatching",
            d: "filter H+1 dilewati"
        });
        D.rows.forEach(a => {
            const fs = clean(a[dFs]);
            if (inc.indexOf(nh(fs)) < 0) {
                buang[fs || "(kosong)"] = (buang[fs || "(kosong)"] || 0) + 1;
                return;
            }
            if (sch.on && nextDay(clean(a[dSch]))) {
                sch.out++;
                return;
            }
            const vals = D.cols.map(c => {
                const v = a[c.src];
                return trim[c.src] ? clean(v) : v == null ? "" : String(v);
            });
            const t = tech.get(clean(a[dAcct]));
            const inst = t ? t : CFG.INSTALLER_EMPTY, ssf = ssfOf(inst);
            out.push({
                v: [ inst, ssf, ssf === ABSORB && nh(a[dTt]) === nh(CFG.EMER_TASK_TYPE) ? CFG.AS_FEEDBACK : "" ].concat(vals),
                i: out.length,
                acct: clean(a[dAcct])
            });
        });
        let upd = null;
        if (files.prv) {
            const P = await readPrev(files.prv), pi = P.idx;
            const pAcct = pi[nh(CFG.INSTALLER_KEY)], pInst = pi[nh(F_INST)], pSsf = pi[nh(F_SSF)], pAs = pi[nh(F_AS)], pTt = pi[nh("Task Type")];
            const miss = D.cols.filter(c => pi[nh(c.name)] == null).map(c => c.name);
            if (miss.length) alerts.push({
                t: "Kolom di output lama nggak lengkap, dibiarkan kosong untuk baris lama",
                d: miss.join(", ")
            });
            const lama = new Set(), pSch = pi[nh("Schedule Date")];
            let lamaOut = 0;
            const old = P.rows.filter(a => {
                if (!sch.on || pSch == null || !nextDay(clean(a[pSch]))) return true;
                lamaOut++;
                return false;
            }).map((a, i) => {
                const acct = clean(a[pAcct]);
                lama.add(acct);
                const vals = D.cols.map(c => {
                    const j = pi[nh(c.name)], v = j == null ? "" : a[j];
                    return trim[c.src] ? clean(v) : v == null ? "" : String(v);
                });
                const before = clean(a[pInst]) || CFG.INSTALLER_EMPTY, t = tech.get(acct);
                const inst = t ? t : CFG.PREV_KEEP_INSTALLER ? before : CFG.INSTALLER_EMPTY;
                const asBefore = pAs == null ? "" : clean(a[pAs]);
                const regular = pTt != null && nh(a[pTt]) === nh(CFG.EMER_TASK_TYPE);
                let ssf = ssfOf(inst), as = "";
                if (regular) {
                    ssf = ABSORB;
                    as = nh(asBefore) === nh(CFG.AS_EMER) || ssfOf(before) === NOT_ABSORB && !t ? CFG.AS_EMER : CFG.AS_FEEDBACK;
                }
                return {
                    v: [ inst, ssf, as ].concat(vals),
                    i: i,
                    acct: acct,
                    before: before,
                    ssfBefore: clean(a[pSsf]),
                    emerBaru: as === CFG.AS_EMER && nh(asBefore) !== nh(CFG.AS_EMER)
                };
            });
            const baru = out.filter(o => !lama.has(o.acct));
            const vi = n => {
                const k = D.cols.findIndex(c => nh(c.name) === nh(n));
                return k < 0 ? -1 : k + 3;
            };
            const ttI = vi("Task Type"), ctI = vi("Create Time"), today = keyOf(base);
            let jadiSameday = 0, emerBaruNew = 0, ctBad = 0;
            if (ctI < 0) alerts.push({
                t: "Kolom Create Time nggak ada di Dispatching",
                d: "cek Create Time hari ini → Sameday dilewati"
            });
            baru.forEach(o => {
                if (nh(o.v[ttI]) !== nh(CFG.EMER_TASK_TYPE)) return;
                const ck = ctI < 0 ? null : dayKey(o.v[ctI]);
                if (ctI >= 0 && ck === null && clean(o.v[ctI])) ctBad++;
                if (ck === today) {
                    o.v[ttI] = CFG.SAMEDAY_TASK_TYPE;
                    o.v[2] = "";
                    jadiSameday++;
                } else if (o.v[1] === NOT_ABSORB) {
                    o.v[1] = ABSORB;
                    o.v[2] = CFG.AS_EMER;
                    emerBaruNew++;
                }
            });
            if (ctBad) alerts.push({
                t: "Format Create Time nggak dikenali, baris dianggap bukan hari ini",
                d: ctBad + " baris"
            });
            upd = {
                jadiSameday: jadiSameday,
                emerBaruNew: emerBaruNew,
                name: P.name,
                lama: old.length,
                lamaOut: lamaOut,
                baru: baru.length,
                skip: out.length - baru.length,
                ganti: old.filter(o => o.v[0] !== o.before).length,
                jadiAbsorb: old.filter(o => o.v[1] === ABSORB && o.ssfBefore !== ABSORB).length,
                emerBaru: old.filter(o => o.emerBaru).length
            };
            baru.forEach((o, k) => o.i = old.length + k);
            out.length = 0;
            old.concat(baru).forEach(o => out.push(o));
        }
        if (sch.bad) alerts.push({
            t: "Format Schedule Date nggak dikenali, baris tetap dimasukkan (filter H+1 nggak berlaku untuk baris ini)",
            d: sch.bad + " baris · contoh " + sch.badEx.join(" | ")
        });
        out.sort((x, y) => cmp(x.v[1], y.v[1]) || asRank(x.v[2]) - asRank(y.v[2]) || cmp(x.v[0], y.v[0]) || x.i - y.i);
        const names = [ F_INST, F_SSF, F_AS ].concat(D.cols.map(c => c.name));
        const fi = n => names.map(nh).indexOf(nh(n));
        const rows = out.map(o => o.v);
        const emerRows = rows.filter(r => r[2] === CFG.AS_EMER && nh(r[fi("Task Type")]) === nh(CFG.EMER_TASK_TYPE));
        const caches = [ buildCache(names, rows, CFG.SHEET_DATA), buildCache(names, emerRows, CFG.SHEET_EMER) ];
        const pivots = [];
        if (rows.length) {
            let col = 1;
            CFG.PIVOTS.forEach((pv, n) => {
                const p = calcPivot({
                    name: pv.name,
                    sheet: CFG.SHEET_PIVOT,
                    cache: 0,
                    row: 5,
                    col: col,
                    pages: [ {
                        fi: fi("Task Type"),
                        label: "Task Type",
                        want: pv.taskType
                    } ],
                    rowF: fi("Service Territory"),
                    colF: pv.cols.map(fi),
                    dataF: fi(CFG.INSTALLER_KEY),
                    dataName: "Count of " + CFG.INSTALLER_KEY,
                    hi: [ fi(F_SSF), fi(F_AS) ]
                }, caches[0], alerts);
                pivots.push(p);
                col = Math.max(9, col + p.width + 2);
            });
        } else alerts.push({
            t: "Hasil filter 0 baris",
            d: "sheet data tetap dibuat, pivot dilewati"
        });
        if (emerRows.length) pivots.push(calcPivot({
            name: "Emergency Insert",
            sheet: CFG.SHEET_EMER_PIVOT,
            cache: 1,
            row: 3,
            col: 1,
            pages: [],
            rowF: fi("Service Territory"),
            colF: [ fi(F_AS), fi("Field Service") ],
            dataF: fi("Service Territory"),
            dataName: "Count of Service Territory",
            hi: [ fi(F_AS) ]
        }, caches[1], alerts));
        const tally = {
            total: rows.length,
            absorb: rows.filter(r => r[1] === ABSORB).length,
            emer: rows.filter(r => r[2] === CFG.AS_EMER).length,
            feedback: rows.filter(r => r[2] === CFG.AS_FEEDBACK).length,
            emerSheet: emerRows.length,
            fs: {}
        };
        CFG.FIELD_SERVICE_INCLUDE.forEach(n => tally.fs[n] = rows.filter(r => nh(r[fi("Field Service")]) === nh(n)).length);
        return {
            names: names,
            rows: rows,
            emerRows: emerRows,
            caches: caches,
            pivots: pivots,
            alerts: alerts,
            tally: tally,
            buang: buang,
            sch: sch,
            upd: upd,
            skipped: skipped,
            dRows: D.rows.length,
            iRows: I.rows.length
        };
    }
    function buildCache(names, rows, sheet) {
        const fields = names.map(() => ({
            items: [],
            idx: new Map(),
            blank: -1,
            longText: false
        }));
        const recs = rows.map(r => r.map((v, i) => {
            const f = fields[i];
            if (v === "") {
                if (f.blank < 0) {
                    f.blank = f.items.length;
                    f.items.push(null);
                }
                return f.blank;
            }
            const k = low(v);
            let x = f.idx.get(k);
            if (x == null) {
                x = f.items.length;
                f.items.push(v);
                f.idx.set(k, x);
                if (v.length > 255) f.longText = true;
            }
            return x;
        }));
        fields.forEach(f => {
            f.order = f.items.map((_, i) => i).sort((a, b) => {
                const x = f.items[a], y = f.items[b];
                if (x === null) return y === null ? 0 : 1;
                if (y === null) return -1;
                return cmp(x, y);
            });
            f.pos = [];
            f.order.forEach((s, p) => f.pos[s] = p);
        });
        return {
            names: names,
            fields: fields,
            recs: recs,
            sheet: sheet
        };
    }
    function itemPos(cache, fi, value) {
        const s = cache.fields[fi].idx.get(low(value));
        return s == null ? -1 : cache.fields[fi].pos[s];
    }
    function calcPivot(p, cache, alerts) {
        const f = cache.fields;
        p.pages = p.pages.map(g => {
            const pos = itemPos(cache, g.fi, g.want);
            if (pos < 0) alerts.push({
                t: "Pivot " + p.name + ": filter " + g.label + " = " + g.want + " nggak ada datanya",
                d: "filter dibiarkan (All)"
            });
            return {
                fi: g.fi,
                label: g.label,
                pos: pos,
                show: pos < 0 ? "(All)" : f[g.fi].items[f[g.fi].order[pos]]
            };
        });
        const recs = cache.recs.filter(r => p.pages.every(g => g.pos < 0 || f[g.fi].pos[r[g.fi]] === g.pos));
        const rowSet = new Set(), colMap = new Map(), cnt = new Map();
        recs.forEach(r => {
            const rp = f[p.rowF].pos[r[p.rowF]], cp = p.colF.map(c => f[c].pos[r[c]]), ck = cp.join("|");
            rowSet.add(rp);
            colMap.set(ck, cp);
            if (r[p.dataF] === f[p.dataF].blank) return;
            const k = rp + "#" + ck;
            cnt.set(k, (cnt.get(k) || 0) + 1);
        });
        const lbl = (fi, pos) => {
            const v = f[fi].items[f[fi].order[pos]];
            return v === null ? "(blank)" : v;
        };
        p.rowsP = Array.from(rowSet).sort((x, y) => x - y);
        p.colsP = Array.from(colMap.values()).sort((x, y) => {
            for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
            return 0;
        });
        p.grid = p.rowsP.map(rp => p.colsP.map(c => cnt.get(rp + "#" + c.join("|")) || 0));
        p.rowLbl = p.rowsP.map(x => lbl(p.rowF, x));
        p.colLbl = p.colsP.map(c => c.map((x, i) => lbl(p.colF[i], x)));
        p.total = p.grid.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0);
        p.width = p.colsP.length + 2;
        p.height = p.colF.length + p.rowsP.length + 2;
        return p;
    }
    function render() {
        const r = res, t = r.tally;
        $("meta").textContent = t.total + " baris · dari " + r.dRows + " baris Dispatching" + (r.upd ? " · mode update" : "");
        const A = r.alerts;
        $("alerts").innerHTML = A.length ? '<div class="sf-alerts"><div class="ah">' + A.length + " hal perlu kamu lihat</div>" + A.map(a => '<div class="ai"><b>' + esc(a.t) + "</b> — <code>" + esc(a.d) + "</code></div>").join("") + "</div>" : "";
        const box = (n, l, c) => '<div class="' + (c || "") + '"><div class="n">' + n + '</div><div class="l">' + esc(l) + "</div></div>";
        $("tally").innerHTML = box(t.total, "Total baris") + box(t.absorb, ABSORB, "ok") + box(t.total - t.absorb, NOT_ABSORB, "no") + box(t.emer, "Emergency Insert") + box(t.feedback, "Feedback Field") + CFG.FIELD_SERVICE_INCLUDE.map(k => box(t.fs[k], k)).join("");
        $("pv").innerHTML = r.pivots.length ? r.pivots.map(pvHtml).join("") : '<div class="sf-empty">Nggak ada baris yang lolos filter — pivot dilewati.</div>';
        const bu = Object.keys(r.buang).map(k => k + " " + r.buang[k]).join(" · ");
        const u = r.upd;
        $("pnote").innerHTML = "<b>Nama file:</b> " + esc(outName() + ".xlsx") + (u ? "<br><b>Update dari " + esc(u.name) + ":</b> " + u.lama + " baris lama diperbarui (INSTALLER berubah " + u.ganti + ", jadi ABSORB " + u.jadiAbsorb + ", Emergency Insert baru " + u.emerBaru + ") · " + (u.lamaOut ? u.lamaOut + " baris lama dibuang karena Schedule Date H+1 dst · " : "") + u.baru + " baris baru ditambahkan (Regular Create Time hari ini → Sameday " + u.jadiSameday + ", Regular tanpa team → Emergency Insert " + u.emerBaruNew + ") · " + u.skip + " baris Dispatching dilewati karena Customer Account sudah ada" : "") + "<br><b>Dibuang (Field Service):</b> " + esc(bu || "tidak ada") + (r.sch.on ? "<br><b>Schedule Date H+1 dan seterusnya (mulai " + fmtDate(r.sch.date) + ") ditakeout:</b> " + r.sch.out + " baris" : "") + "<br><b>" + esc(CFG.SHEET_EMER) + ":</b> " + t.emerSheet + " baris (Regular Task, " + esc(CFG.AS_EMER) + ")" + "<br><b>Inprogress:</b> " + r.iRows + " baris, " + r.skipped + " baris Dispatched dilewati saat lookup INSTALLER" + "<br><b>Pivot:</b> PivotTable asli di " + esc(CFG.SHEET_PIVOT) + " dan " + esc(CFG.SHEET_EMER_PIVOT) + ", ditandai refresh-saat-dibuka. Angka final dihitung ulang oleh Excel waktu file dibuka.";
    }
    function pvHtml(p) {
        let h = '<div class="sf-sect-t"><span>Pivot ' + esc(p.name) + "</span><span>" + (p.pages.length ? p.pages.map(g => esc(g.label + ": " + g.show)).join(" · ") : esc(p.sheet)) + "</span></div>";
        if (!p.rowsP.length) return h + '<div class="sf-empty">Nggak ada data untuk filter ini.</div>';
        h += '<div class="sf-wrap"><table class="sf-tb"><thead><tr><th>Row Labels</th>' + p.colLbl.map(c => "<th>" + c.map(esc).join("<br>") + "</th>").join("") + '<th class="gt">Grand Total</th></tr></thead><tbody>';
        p.grid.forEach((row, ri) => {
            h += "<tr><td>" + esc(p.rowLbl[ri]) + "</td>" + row.map(v => "<td>" + (v || "") + "</td>").join("") + '<td class="gt">' + row.reduce((a, b) => a + b, 0) + "</td></tr>";
        });
        h += '<tr class="gt"><td>Grand Total</td>' + p.colsP.map((_, ci) => "<td>" + p.grid.reduce((s, row) => s + row[ci], 0) + "</td>").join("") + "<td>" + p.total + "</td></tr>";
        return h + "</tbody></table></div>";
    }
    function stampOf(name) {
        const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(name || "");
        if (m) {
            const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
            if (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] && +m[4] < 24 && +m[5] < 60) return d;
        }
        return new Date;
    }
    const p2 = n => String(n).padStart(2, "0");
    const fmtDate = d => p2(d.getDate()) + "." + p2(d.getMonth() + 1) + "." + d.getFullYear();
    function outName() {
        const d = stampOf(files.dsp && files.dsp.name);
        return "Schedule Failed tgl " + d.getDate() + " " + BULAN_PENDEK[d.getMonth() + 1] + " " + d.getFullYear() + " cut off " + p2(d.getHours()) + "." + p2(d.getMinutes());
    }
    $("save").addEventListener("click", async () => {
        const b = $("save");
        b.disabled = true;
        b.textContent = "Menyiapkan…";
        $("e2").innerHTML = "";
        try {
            await save();
            $("e2").innerHTML = '<div class="sf-ok">Tersimpan. Buka di Excel, pivot-nya refresh otomatis.</div>';
        } catch (e) {
            $("e2").innerHTML = '<div class="sf-err">Gagal menyimpan: ' + esc(e.message || e) + "</div>";
        }
        b.textContent = "Download";
        b.disabled = false;
    });
    const thin = {
        style: "thin",
        color: {
            argb: "FF000000"
        }
    };
    const box4 = {
        top: thin,
        left: thin,
        bottom: thin,
        right: thin
    };
    const yFill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: CFG.HIGHLIGHT
        }
    };
    const hFill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFDDEBF7"
        }
    };
    function writeData(ws, rows) {
        ws.addRow(res.names);
        rows.forEach(r => ws.addRow(r.map(v => v === "" ? null : v)));
        [ 1, 2, 3 ].forEach(c => ws.getCell(1, c).fill = yFill);
        ws.getColumn(1).width = 17.6;
        ws.getColumn(2).width = 13;
        ws.getColumn(3).width = 27.7;
        ws.getColumn(4).width = 17.6;
        ws.autoFilter = {
            from: {
                row: 1,
                column: 1
            },
            to: {
                row: Math.max(1, rows.length + 1),
                column: res.names.length
            }
        };
    }
    function writePivotPreview(ws, p) {
        const c0 = p.col, r0 = p.row, N = p.colF.length, last = c0 + p.width - 1;
        const set = (r, c, v, st) => {
            const cell = ws.getCell(r, c);
            cell.value = v;
            cell.border = box4;
            if (st) Object.keys(st).forEach(k => cell[k] = st[k]);
        };
        p.pages.forEach((g, i) => {
            const r = r0 - p.pages.length - 1 + i;
            set(r, c0, g.label, {
                fill: yFill
            });
            set(r, c0 + 1, g.show, {
                fill: yFill
            });
        });
        const bold = {
            font: {
                bold: true
            },
            fill: hFill
        };
        set(r0, c0, p.dataName, bold);
        set(r0, c0 + 1, "Column Labels", bold);
        for (let c = c0 + 2; c <= last; c++) set(r0, c, null, bold);
        for (let L = 0; L < N; L++) {
            const r = r0 + 1 + L, hi = p.hi.indexOf(p.colF[L]) >= 0;
            set(r, c0, L === N - 1 ? "Row Labels" : null, bold);
            p.colsP.forEach((cp, ci) => {
                const first = ci === 0 || p.colsP[ci - 1].slice(0, L + 1).join("|") !== cp.slice(0, L + 1).join("|");
                set(r, c0 + 1 + ci, first ? p.colLbl[ci][L] : null, first && hi ? {
                    font: {
                        bold: true
                    },
                    fill: yFill
                } : bold);
            });
            set(r, last, L === 0 ? "Grand Total" : null, bold);
        }
        p.grid.forEach((row, ri) => {
            const r = r0 + N + 1 + ri;
            set(r, c0, p.rowLbl[ri]);
            row.forEach((v, ci) => set(r, c0 + 1 + ci, v || null));
            set(r, last, row.reduce((a, b) => a + b, 0));
        });
        const gr = r0 + N + 1 + p.grid.length;
        set(gr, c0, "Grand Total", bold);
        p.colsP.forEach((_, ci) => set(gr, c0 + 1 + ci, p.grid.reduce((s, row) => s + row[ci], 0), bold));
        set(gr, last, p.total, bold);
        ws.getColumn(c0).width = 28;
    }
    async function save() {
        const wb = new ExcelJS.Workbook;
        wb.creator = "Dispatch Report";
        wb.modified = new Date;
        const wsPv = wb.addWorksheet(CFG.SHEET_PIVOT), wsEp = wb.addWorksheet(CFG.SHEET_EMER_PIVOT);
        const wsEm = wb.addWorksheet(CFG.SHEET_EMER), wsData = wb.addWorksheet(CFG.SHEET_DATA);
        const t = wsEp.getCell(2, 1);
        t.value = CFG.EMER_TITLE;
        t.font = {
            bold: true
        };
        t.fill = yFill;
        res.pivots.forEach(p => writePivotPreview(p.sheet === CFG.SHEET_PIVOT ? wsPv : wsEp, p));
        writeData(wsEm, res.emerRows);
        writeData(wsData, res.rows);
        let buf = await wb.xlsx.writeBuffer();
        if (res.pivots.length) buf = await addPivots(buf);
        const blob = new Blob([ buf ], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = outName() + ".xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 4e3);
    }
    function cacheDefXml(cache) {
        const fx = cache.fields.map((f, i) => {
            const strs = f.items.filter(v => v !== null).length;
            let at = "";
            if (!strs) at += ' containsNonDate="0" containsString="0"';
            if (f.blank >= 0) at += ' containsBlank="1"';
            if (f.longText) at += ' longText="1"';
            return '<cacheField name="' + xe(cache.names[i]) + '" numFmtId="0"><sharedItems' + at + ' count="' + f.items.length + '">' + f.items.map(v => v === null ? "<m/>" : '<s v="' + xe(v) + '"/>').join("") + "</sharedItems></cacheField>";
        }).join("");
        const ref = "A1:" + cname(cache.names.length) + (cache.recs.length + 1);
        return DECL + '<pivotCacheDefinition xmlns="' + NS + '" xmlns:r="' + RNS + '" r:id="rId1" refreshOnLoad="1" refreshedBy="Dispatch Report" createdVersion="6" refreshedVersion="6" minRefreshableVersion="3" recordCount="' + cache.recs.length + '"><cacheSource type="worksheet"><worksheetSource ref="' + ref + '" sheet="' + xe(cache.sheet) + '"/></cacheSource><cacheFields count="' + cache.names.length + '">' + fx + "</cacheFields></pivotCacheDefinition>";
    }
    function cacheRecXml(cache) {
        return DECL + '<pivotCacheRecords xmlns="' + NS + '" xmlns:r="' + RNS + '" count="' + cache.recs.length + '">' + cache.recs.map(r => "<r>" + r.map(x => '<x v="' + x + '"/>').join("") + "</r>").join("") + "</pivotCacheRecords>";
    }
    function pivotXml(p, n, cache, cacheId, dxf) {
        const f = cache.fields, N = p.colF.length;
        const axis = {};
        axis[p.rowF] = "axisRow";
        p.colF.forEach(c => axis[c] = "axisCol");
        p.pages.forEach(g => axis[g.fi] = "axisPage");
        const pf = cache.names.map((_, i) => {
            const data = i === p.dataF ? ' dataField="1"' : "";
            if (axis[i]) return '<pivotField axis="' + axis[i] + '"' + data + ' showAll="0" defaultSubtotal="0" sortType="ascending"><items count="' + f[i].order.length + '">' + f[i].order.map(s => '<item x="' + s + '"/>').join("") + "</items></pivotField>";
            return "<pivotField" + data + ' showAll="0"/>';
        }).join("");
        const rowItems = p.rowsP.map(r => '<i><x v="' + r + '"/></i>').join("") + '<i t="grand"><x/></i>';
        const colItems = p.colsP.map((c, i) => {
            let k = 0;
            if (i > 0) while (k < N - 1 && p.colsP[i - 1][k] === c[k]) k++;
            return "<i" + (k ? ' r="' + k + '"' : "") + ">" + c.slice(k).map(x => '<x v="' + x + '"/>').join("") + "</i>";
        }).join("") + '<i t="grand"><x/></i>';
        const lastC = p.col + p.width - 1, lastR = p.row + p.height - 1;
        const pc = p.pages.length ? ' rowPageCount="' + p.pages.length + '" colPageCount="1"' : "";
        const loc = '<location ref="' + cname(p.col) + p.row + ":" + cname(lastC) + lastR + '" firstHeaderRow="1" firstDataRow="' + (N + 1) + '" firstDataCol="1"' + pc + "/>";
        const pages = p.pages.length ? '<pageFields count="' + p.pages.length + '">' + p.pages.map(g => '<pageField fld="' + g.fi + '"' + (g.pos >= 0 ? ' item="' + g.pos + '"' : "") + ' hier="-1"/>').join("") + "</pageFields>" : "";
        const fm = [ '<format dxfId="' + dxf.border + '"><pivotArea type="all" dataOnly="0" outline="0" fieldPosition="0"/></format>' ];
        p.hi.filter(h => p.colF.indexOf(h) >= 0).forEach(h => fm.push('<format dxfId="' + dxf.yellow + '"><pivotArea dataOnly="0" labelOnly="1" outline="0" fieldPosition="0"><references count="1"><reference field="' + h + '" count="0"/></references></pivotArea></format>'));
        return DECL + '<pivotTableDefinition xmlns="' + NS + '" name="PivotTable' + n + '" cacheId="' + cacheId + '" applyNumberFormats="0" applyBorderFormats="0" applyFontFormats="0" applyPatternFormats="0" applyAlignmentFormats="0" applyWidthHeightFormats="1" dataCaption="Values" updatedVersion="6" minRefreshableVersion="3" useAutoFormatting="1" itemPrintTitles="1" createdVersion="6" indent="0" outline="1" outlineData="1" multipleFieldFilters="0">' + loc + '<pivotFields count="' + cache.names.length + '">' + pf + '</pivotFields><rowFields count="1"><field x="' + p.rowF + '"/></rowFields><rowItems count="' + (p.rowsP.length + 1) + '">' + rowItems + '</rowItems><colFields count="' + N + '">' + p.colF.map(c => '<field x="' + c + '"/>').join("") + '</colFields><colItems count="' + (p.colsP.length + 1) + '">' + colItems + "</colItems>" + pages + '<dataFields count="1"><dataField name="' + xe(p.dataName) + '" fld="' + p.dataF + '" subtotal="count" baseField="0" baseItem="0"/></dataFields><formats count="' + fm.length + '">' + fm.join("") + '</formats><pivotTableStyleInfo name="PivotStyleLight16" showRowHeaders="1" showColHeaders="1" showRowStripes="0" showColStripes="0" showLastColumn="1"/></pivotTableDefinition>';
    }
    function relsXml(list) {
        return DECL + '<Relationships xmlns="' + PNS + '">' + list.map(r => '<Relationship Id="' + r[0] + '" Type="' + RNS + "/" + r[1] + '" Target="' + r[2] + '"/>').join("") + "</Relationships>";
    }
    function addRel(doc, id, type, target) {
        const r = doc.createElementNS(PNS, "Relationship");
        r.setAttribute("Id", id);
        r.setAttribute("Type", RNS + "/" + type);
        r.setAttribute("Target", target);
        doc.documentElement.appendChild(r);
    }
    function freeId(doc, base) {
        const used = {};
        els(doc, "Relationship").forEach(r => used[r.getAttribute("Id")] = true);
        let i = 1;
        while (used[base + i]) i++;
        return base + i;
    }
    async function addDxfs(zip) {
        const d = parseXml(await zip.file("xl/styles.xml").async("string"));
        let dx = els(d, "dxfs")[0];
        if (!dx) {
            dx = d.createElementNS(NS, "dxfs");
            const after = [ "tableStyles", "colors", "extLst" ].map(t => kids(d.documentElement, t)[0]).filter(Boolean)[0];
            d.documentElement.insertBefore(dx, after || null);
        }
        const mk = (tag, kids2) => {
            const e = d.createElementNS(NS, tag);
            kids2.forEach(k => e.appendChild(k));
            return e;
        };
        const at = (e, a) => {
            Object.keys(a).forEach(k => e.setAttribute(k, a[k]));
            return e;
        };
        const add = x => {
            dx.appendChild(x);
            const id = kids(dx, "dxf").length - 1;
            dx.setAttribute("count", String(id + 1));
            return id;
        };
        const yellow = add(mk("dxf", [ mk("fill", [ at(mk("patternFill", [ at(mk("bgColor", []), {
            rgb: CFG.HIGHLIGHT
        }) ]), {
            patternType: "solid"
        }) ]) ]));
        const side = t => at(mk(t, [ at(mk("color", []), {
            auto: "1"
        }) ]), {
            style: "thin"
        });
        const border = add(mk("dxf", [ mk("border", [ side("left"), side("right"), side("top"), side("bottom") ]) ]));
        zip.file("xl/styles.xml", ser(d));
        return {
            yellow: yellow,
            border: border
        };
    }
    async function addPivots(buf) {
        const zip = await JSZip.loadAsync(buf);
        const wbRels = parseXml(await zip.file("xl/_rels/workbook.xml.rels").async("string"));
        const wbDoc = parseXml(await zip.file("xl/workbook.xml").async("string"));
        const target = {};
        els(wbRels, "Relationship").forEach(r => target[r.getAttribute("Id")] = r.getAttribute("Target"));
        const sheetPath = name => {
            const sh = els(wbDoc, "sheet").filter(s => s.getAttribute("name") === name)[0];
            if (!sh) throw new Error("sheet " + name + " nggak ketemu di workbook");
            const t = (target[sh.getAttributeNS(RNS, "id") || sh.getAttribute("r:id")] || "").replace(/^\.\//, "");
            return t.charAt(0) === "/" ? t.slice(1) : "xl/" + t;
        };
        const dxf = await addDxfs(zip);
        const used = res.caches.map((_, i) => res.pivots.some(p => p.cache === i));
        const root = wbDoc.documentElement, pcs = wbDoc.createElementNS(NS, "pivotCaches");
        const ct = parseXml(await zip.file("[Content_Types].xml").async("string"));
        const ov = (part, type) => {
            const o = ct.createElementNS(CNS, "Override");
            o.setAttribute("PartName", part);
            o.setAttribute("ContentType", CT + type + "+xml");
            ct.documentElement.appendChild(o);
        };
        res.caches.forEach((cache, i) => {
            if (!used[i]) return;
            const k = i + 1, def = "pivotCacheDefinition" + k + ".xml", rec = "pivotCacheRecords" + k + ".xml";
            zip.file("xl/pivotCache/" + def, cacheDefXml(cache));
            zip.file("xl/pivotCache/" + rec, cacheRecXml(cache));
            zip.file("xl/pivotCache/_rels/" + def + ".rels", relsXml([ [ "rId1", "pivotCacheRecords", rec ] ]));
            const id = freeId(wbRels, "rIdPc");
            addRel(wbRels, id, "pivotCacheDefinition", "pivotCache/" + def);
            const pc = wbDoc.createElementNS(NS, "pivotCache");
            pc.setAttribute("cacheId", String(k));
            pc.setAttributeNS(RNS, "r:id", id);
            pcs.appendChild(pc);
            ov("/xl/pivotCache/" + def, "pivotCacheDefinition");
            ov("/xl/pivotCache/" + rec, "pivotCacheRecords");
        });
        const sRels = {};
        for (let i = 0; i < res.pivots.length; i++) {
            const p = res.pivots[i], nm = "pivotTable" + (i + 1) + ".xml", k = p.cache + 1;
            const sPath = sheetPath(p.sheet), rp = sPath.replace(/([^\/]+)$/, "_rels/$1.rels");
            if (!sRels[rp]) {
                const sf = zip.file(rp);
                sRels[rp] = parseXml(sf ? await sf.async("string") : relsXml([]));
            }
            zip.file("xl/pivotTables/" + nm, pivotXml(p, i + 1, res.caches[p.cache], k, dxf));
            zip.file("xl/pivotTables/_rels/" + nm + ".rels", relsXml([ [ "rId1", "pivotCacheDefinition", "../pivotCache/pivotCacheDefinition" + k + ".xml" ] ]));
            addRel(sRels[rp], freeId(sRels[rp], "rIdPv"), "pivotTable", "../pivotTables/" + nm);
            ov("/xl/pivotTables/" + nm, "pivotTable");
        }
        Object.keys(sRels).forEach(rp => zip.file(rp, ser(sRels[rp])));
        zip.file("xl/_rels/workbook.xml.rels", ser(wbRels));
        const later = [ "smartTagPr", "smartTagTypes", "webPublishing", "fileRecoveryPr", "webPublishObjects", "extLst" ];
        let before = null;
        for (let n = root.firstElementChild; n; n = n.nextElementSibling) if (later.indexOf(n.localName) >= 0) {
            before = n;
            break;
        }
        root.insertBefore(pcs, before);
        zip.file("xl/workbook.xml", ser(wbDoc));
        zip.file("[Content_Types].xml", ser(ct));
        return zip.generateAsync({
            type: "arraybuffer",
            compression: "DEFLATE"
        });
    }
})();
