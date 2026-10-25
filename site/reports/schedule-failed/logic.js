(function() {
    "use strict";
    const CFG = {
        SHEET_DATA: "Sheet0",
        SHEET_PIVOT: "Sheet4",
        FIELD_SERVICE_INCLUDE: [ "Install", "Trouble Call", "Movement" ],
        INSTALLER_KEY: "Customer Account",
        INSTALLER_SOURCE_COL: "Techician Code",
        INSTALLER_EXCLUDE_STATUS: [ "Dispatched" ],
        INSTALLER_EMPTY: "-",
        PREV_KEEP_INSTALLER: true,
        TAKEOUT_SCHEDULE_DAY: 1,
        PIVOTS: [ {
            name: "Regular",
            col: 1,
            taskType: "Regular Task"
        }, {
            name: "Sameday",
            col: 9,
            taskType: "Sameday Task"
        } ],
        PIVOT_FILTER_DEFAULT: {
            jobTask: "(All)",
            taskStatus: "Open"
        },
        HIGHLIGHT_NOT_ABSORB: "FFFFFF00"
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
    const F_INST = "INSTALLER", F_SSF = "Status SF";
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
        for (const sn of wb.SheetNames) {
            const aoa = aoaOf(wb.Sheets[sn]);
            if (!aoa.length || !isPrevHdr(aoa[0].map(nh))) continue;
            const hdr = aoa[0].map(clean), idx = {};
            hdr.forEach((h, i) => {
                if (h && idx[nh(h)] == null) idx[nh(h)] = i;
            });
            return {
                idx: idx,
                rows: aoa.slice(1).filter(a => a.some(x => String(x).trim() !== "")),
                name: file.name
            };
        }
        throw new Error(file.name + ": sheet data (kolom INSTALLER, Status SF, Customer Account) nggak ketemu — pastikan ini file output Schedule Failed");
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
        const dFs = colOf(D, "Field Service"), dAcct = colOf(D, CFG.INSTALLER_KEY);
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
            if (sch.on) {
                const raw = clean(a[dSch]), k = dayKey(raw);
                if (k !== null && k >= sch.key) {
                    sch.out++;
                    return;
                }
                if (k === null && raw) {
                    sch.bad++;
                    if (sch.badEx.length < 3 && sch.badEx.indexOf(raw) < 0) sch.badEx.push(raw);
                }
            }
            const vals = D.cols.map(c => {
                const v = a[c.src];
                return trim[c.src] ? clean(v) : v == null ? "" : String(v);
            });
            const t = tech.get(clean(a[dAcct]));
            const inst = t ? t : CFG.INSTALLER_EMPTY;
            out.push({
                v: [ inst, ssfOf(inst) ].concat(vals),
                i: out.length,
                acct: clean(a[dAcct])
            });
        });
        if (sch.bad) alerts.push({
            t: "Format Schedule Date nggak dikenali, baris tetap dimasukkan (filter H+1 nggak berlaku untuk baris ini)",
            d: sch.bad + " baris · contoh " + sch.badEx.join(" | ")
        });
        let upd = null;
        if (files.prv) {
            const P = await readPrev(files.prv), pi = P.idx;
            const pAcct = pi[nh(CFG.INSTALLER_KEY)], pInst = pi[nh(F_INST)], pSsf = pi[nh(F_SSF)];
            const miss = D.cols.filter(c => pi[nh(c.name)] == null).map(c => c.name);
            if (miss.length) alerts.push({
                t: "Kolom di output lama nggak lengkap, dibiarkan kosong untuk baris lama",
                d: miss.join(", ")
            });
            const lama = new Set();
            const old = P.rows.map((a, i) => {
                const acct = clean(a[pAcct]);
                lama.add(acct);
                const vals = D.cols.map(c => {
                    const j = pi[nh(c.name)], v = j == null ? "" : a[j];
                    return trim[c.src] ? clean(v) : v == null ? "" : String(v);
                });
                const before = clean(a[pInst]) || CFG.INSTALLER_EMPTY, t = tech.get(acct);
                const inst = t ? t : CFG.PREV_KEEP_INSTALLER ? before : CFG.INSTALLER_EMPTY;
                return {
                    v: [ inst, ssfOf(inst) ].concat(vals),
                    i: i,
                    acct: acct,
                    before: before,
                    ssfBefore: clean(a[pSsf])
                };
            });
            const baru = out.filter(o => !lama.has(o.acct));
            upd = {
                name: P.name,
                lama: old.length,
                baru: baru.length,
                skip: out.length - baru.length,
                ganti: old.filter(o => o.v[0] !== o.before).length,
                jadiAbsorb: old.filter(o => o.v[1] === ABSORB && o.ssfBefore !== ABSORB).length
            };
            baru.forEach((o, k) => o.i = old.length + k);
            out.length = 0;
            old.concat(baru).forEach(o => out.push(o));
        }
        out.sort((x, y) => cmp(x.v[1], y.v[1]) || cmp(x.v[0], y.v[0]) || x.i - y.i);
        const names = [ F_INST, F_SSF ].concat(D.cols.map(c => c.name));
        const rows = out.map(o => o.v);
        const F = {};
        [ [ "ca", CFG.INSTALLER_KEY ], [ "fs", "Field Service" ], [ "st", "Service Territory" ], [ "tt", "Task Type" ], [ "ts", "Task Status" ], [ "jt", "Job Task" ] ].forEach(p => F[p[0]] = names.map(nh).indexOf(nh(p[1])));
        F.ssf = 1;
        const cache = buildCache(names, rows);
        const pivots = rows.length ? CFG.PIVOTS.map((pv, n) => calcPivot(pv, n, cache, F, alerts)) : [];
        if (!rows.length) alerts.push({
            t: "Hasil filter 0 baris",
            d: "Sheet0 tetap dibuat, pivot dilewati"
        });
        const tally = {
            total: rows.length,
            absorb: rows.filter(r => r[1] === ABSORB).length,
            fs: {}
        };
        CFG.FIELD_SERVICE_INCLUDE.forEach(n => tally.fs[n] = rows.filter(r => nh(r[F.fs]) === nh(n)).length);
        return {
            names: names,
            rows: rows,
            cache: cache,
            F: F,
            pivots: pivots,
            alerts: alerts,
            tally: tally,
            buang: buang,
            sch: sch,
            upd: upd,
            skipped: skipped,
            dName: D.name,
            iName: I.name,
            dRows: D.rows.length,
            iRows: I.rows.length
        };
    }
    function buildCache(names, rows) {
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
            recs: recs
        };
    }
    function itemPos(cache, fi, value) {
        const s = cache.fields[fi].idx.get(low(value));
        return s == null ? -1 : cache.fields[fi].pos[s];
    }
    function calcPivot(pv, n, cache, F, alerts) {
        const f = cache.fields;
        const pages = [ {
            fi: F.tt,
            label: "Task Type",
            want: pv.taskType
        }, {
            fi: F.jt,
            label: "Job Task",
            want: CFG.PIVOT_FILTER_DEFAULT.jobTask
        }, {
            fi: F.ts,
            label: "Task Status",
            want: CFG.PIVOT_FILTER_DEFAULT.taskStatus
        } ].map(p => {
            const all = p.want === "(All)";
            const pos = all ? -1 : itemPos(cache, p.fi, p.want);
            if (!all && pos < 0) alerts.push({
                t: "Pivot " + pv.name + ": filter " + p.label + " = " + p.want + " nggak ada datanya",
                d: "filter dibiarkan (All)"
            });
            return {
                fi: p.fi,
                label: p.label,
                pos: pos,
                show: pos < 0 ? "(All)" : f[p.fi].items[f[p.fi].order[pos]]
            };
        });
        const recs = cache.recs.filter(r => pages.every(p => p.pos < 0 || f[p.fi].pos[r[p.fi]] === p.pos));
        const rowSet = new Set(), colMap = new Map(), cnt = new Map();
        recs.forEach(r => {
            const rp = f[F.st].pos[r[F.st]], a = f[F.ssf].pos[r[F.ssf]], b = f[F.fs].pos[r[F.fs]];
            rowSet.add(rp);
            const ck = a + "|" + b;
            colMap.set(ck, [ a, b ]);
            if (r[F.ca] === f[F.ca].blank) return;
            const k = rp + "#" + ck;
            cnt.set(k, (cnt.get(k) || 0) + 1);
        });
        const rowsP = Array.from(rowSet).sort((x, y) => x - y);
        const colsP = Array.from(colMap.values()).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
        const lbl = (fi, p) => {
            const s = f[fi].order[p], v = f[fi].items[s];
            return v === null ? "(blank)" : v;
        };
        const grid = rowsP.map(rp => colsP.map(c => cnt.get(rp + "#" + c[0] + "|" + c[1]) || 0));
        const naPos = itemPos(cache, F.ssf, NOT_ABSORB);
        return {
            n: n,
            name: pv.name,
            col: pv.col,
            pages: pages,
            rowsP: rowsP,
            colsP: colsP,
            grid: grid,
            naPos: naPos,
            rowLbl: rowsP.map(p => lbl(F.st, p)),
            colLbl: colsP.map(c => [ lbl(F.ssf, c[0]), lbl(F.fs, c[1]) ]),
            total: grid.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0)
        };
    }
    function render() {
        const r = res;
        $("meta").textContent = r.tally.total + " baris · dari " + r.dRows + " baris Dispatching" + (r.upd ? " · mode update" : "");
        const A = r.alerts;
        $("alerts").innerHTML = A.length ? '<div class="sf-alerts"><div class="ah">' + A.length + " hal perlu kamu lihat</div>" + A.map(a => '<div class="ai"><b>' + esc(a.t) + "</b> — <code>" + esc(a.d) + "</code></div>").join("") + "</div>" : "";
        const box = (n, l, c) => '<div class="' + (c || "") + '"><div class="n">' + n + '</div><div class="l">' + esc(l) + "</div></div>";
        $("tally").innerHTML = box(r.tally.total, "Total baris") + box(r.tally.absorb, ABSORB, "ok") + box(r.tally.total - r.tally.absorb, NOT_ABSORB, "no") + CFG.FIELD_SERVICE_INCLUDE.map(k => box(r.tally.fs[k], k)).join("");
        $("pv").innerHTML = r.pivots.length ? r.pivots.map(pvHtml).join("") : '<div class="sf-empty">Nggak ada baris yang lolos filter Field Service — pivot dilewati.</div>';
        const bu = Object.keys(r.buang).map(k => k + " " + r.buang[k]).join(" · ");
        const u = r.upd;
        $("pnote").innerHTML = "<b>Nama file:</b> " + esc(outName() + ".xlsx") + (u ? "<br><b>Update dari " + esc(u.name) + ":</b> " + u.lama + " baris lama diperbarui (INSTALLER berubah " + u.ganti + ", jadi ABSORB " + u.jadiAbsorb + ") · " + u.baru + " baris baru ditambahkan · " + u.skip + " baris Dispatching dilewati karena Customer Account sudah ada" : "") + "<br><b>Dibuang (Field Service):</b> " + esc(bu || "tidak ada") + (r.sch.on ? "<br><b>Schedule Date H+1 dan seterusnya (mulai " + fmtDate(r.sch.date) + ") ditakeout:</b> " + r.sch.out + " baris" : "") +"<br><b>Inprogress:</b> " + r.iRows + " baris, " + r.skipped + " baris Dispatched dilewati saat lookup INSTALLER" + "<br><b>Pivot:</b> 2 PivotTable asli di " + CFG.SHEET_PIVOT + ", ditandai refresh-saat-dibuka. Angka final dihitung ulang oleh Excel waktu file dibuka.";
    }
    function pvHtml(p) {
        const y = c => p.colsP[c][0] === p.naPos ? ' class="y"' : "";
        let h = '<div class="sf-sect-t"><span>Pivot ' + esc(p.name) + "</span><span>" + p.pages.map(g => esc(g.label + ": " + g.show)).join(" · ") + "</span></div>";
        if (!p.rowsP.length) return h + '<div class="sf-empty">Nggak ada data untuk filter ini.</div>';
        h += '<div class="sf-wrap"><table class="sf-tb"><thead><tr><th>Service Territory</th>' + p.colLbl.map((c, i) => "<th" + y(i) + ">" + esc(c[0]) + "<br>" + esc(c[1]) + "</th>").join("") + '<th class="gt">Grand Total</th></tr></thead><tbody>';
        p.grid.forEach((row, ri) => {
            h += "<tr><td>" + esc(p.rowLbl[ri]) + "</td>" + row.map((v, ci) => "<td" + y(ci) + ">" + (v || "") + "</td>").join("") + '<td class="gt">' + row.reduce((a, b) => a + b, 0) + "</td></tr>";
        });
        h += '<tr class="gt"><td>Grand Total</td>' + p.colsP.map((_, ci) => "<td" + y(ci) + ">" + p.grid.reduce((s, row) => s + row[ci], 0) + "</td>").join("") + "<td>" + p.total + "</td></tr>";
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
        return "SCHEDULE FAILED TGL " + fmtDate(d) + " UPDATE JAM " + p2(d.getHours()) + "." + p2(d.getMinutes());
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
            argb: "FFBFBFBF"
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
            argb: CFG.HIGHLIGHT_NOT_ABSORB
        }
    };
    const hFill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFDDEBF7"
        }
    };
    function writeData(wb) {
        const ws = wb.addWorksheet(CFG.SHEET_DATA);
        ws.addRow(res.names);
        res.rows.forEach(r => ws.addRow(r.map(v => v === "" ? null : v)));
        ws.getRow(1).font = {
            bold: true
        };
        ws.autoFilter = {
            from: {
                row: 1,
                column: 1
            },
            to: {
                row: Math.max(1, res.rows.length + 1),
                column: res.names.length
            }
        };
    }
    function writePivotPreview(ws, p) {
        const c0 = p.col;
        p.pages.forEach((g, i) => {
            ws.getCell(1 + i, c0).value = g.label;
            ws.getCell(1 + i, c0).font = {
                bold: true
            };
            ws.getCell(1 + i, c0 + 1).value = g.show;
        });
        const nC = p.colsP.length, last = c0 + nC + 1;
        const set = (r, c, v, st) => {
            const cell = ws.getCell(r, c);
            cell.value = v;
            cell.border = box4;
            if (st) Object.keys(st).forEach(k => cell[k] = st[k]);
            return cell;
        };
        const hd = {
            font: {
                bold: true
            },
            fill: hFill
        };
        const yc = ci => p.colsP[ci][0] === p.naPos;
        set(5, c0, "Count of Customer Account", hd);
        set(5, c0 + 1, F_SSF, hd);
        if (nC > 1) set(5, c0 + 2, "Field Service", hd);
        for (let c = c0 + 3; c <= last; c++) set(5, c, null, hd);
        set(6, c0, null, hd);
        set(7, c0, "Service Territory", hd);
        p.colsP.forEach((cp, ci) => {
            const st = yc(ci) ? {
                font: {
                    bold: true
                },
                fill: yFill
            } : hd;
            set(6, c0 + 1 + ci, ci === 0 || p.colsP[ci - 1][0] !== cp[0] ? p.colLbl[ci][0] : null, st);
            set(7, c0 + 1 + ci, p.colLbl[ci][1], st);
        });
        set(6, last, "Grand Total", hd);
        set(7, last, null, hd);
        p.grid.forEach((row, ri) => {
            const r = 8 + ri;
            set(r, c0, p.rowLbl[ri]);
            row.forEach((v, ci) => set(r, c0 + 1 + ci, v || null, yc(ci) ? {
                fill: yFill
            } : null));
            set(r, last, row.reduce((a, b) => a + b, 0), {
                font: {
                    bold: true
                }
            });
        });
        const gr = 8 + p.grid.length, bold = {
            font: {
                bold: true
            },
            fill: hFill
        };
        set(gr, c0, "Grand Total", bold);
        p.colsP.forEach((_, ci) => set(gr, c0 + 1 + ci, p.grid.reduce((s, row) => s + row[ci], 0), yc(ci) ? {
            font: {
                bold: true
            },
            fill: yFill
        } : bold));
        set(gr, last, p.total, bold);
        ws.getColumn(c0).width = 28;
    }
    async function save() {
        const wb = new ExcelJS.Workbook;
        wb.creator = "Dispatch Report";
        wb.modified = new Date;
        const pws = wb.addWorksheet(CFG.SHEET_PIVOT);
        res.pivots.forEach(p => writePivotPreview(pws, p));
        writeData(wb);
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
    function cacheDefXml(cache, nRows) {
        const fx = cache.fields.map((f, i) => {
            const strs = f.items.filter(v => v !== null).length;
            let at = "";
            if (!strs) at += ' containsNonDate="0" containsString="0"';
            if (f.blank >= 0) at += ' containsBlank="1"';
            if (f.longText) at += ' longText="1"';
            return '<cacheField name="' + xe(cache.names[i]) + '" numFmtId="0"><sharedItems' + at + ' count="' + f.items.length + '">' + f.items.map(v => v === null ? "<m/>" : '<s v="' + xe(v) + '"/>').join("") + "</sharedItems></cacheField>";
        }).join("");
        const ref = "A1:" + cname(cache.names.length) + (nRows + 1);
        return DECL + '<pivotCacheDefinition xmlns="' + NS + '" xmlns:r="' + RNS + '" r:id="rId1" refreshOnLoad="1" refreshedBy="Dispatch Report" createdVersion="6" refreshedVersion="6" minRefreshableVersion="3" recordCount="' + cache.recs.length + '"><cacheSource type="worksheet"><worksheetSource ref="' + ref + '" sheet="' + xe(CFG.SHEET_DATA) + '"/></cacheSource><cacheFields count="' + cache.names.length + '">' + fx + "</cacheFields></pivotCacheDefinition>";
    }
    function cacheRecXml(cache) {
        return DECL + '<pivotCacheRecords xmlns="' + NS + '" xmlns:r="' + RNS + '" count="' + cache.recs.length + '">' + cache.recs.map(r => "<r>" + r.map(x => '<x v="' + x + '"/>').join("") + "</r>").join("") + "</pivotCacheRecords>";
    }
    function pivotXml(p, cache, F, dxfId) {
        const f = cache.fields;
        const axis = {};
        axis[F.st] = "axisRow";
        axis[F.ssf] = "axisCol";
        axis[F.fs] = "axisCol";
        p.pages.forEach(g => axis[g.fi] = "axisPage");
        const pf = cache.names.map((_, i) => {
            if (axis[i]) return '<pivotField axis="' + axis[i] + '" compact="0" outline="0" showAll="0" defaultSubtotal="0" sortType="ascending"><items count="' + f[i].order.length + '">' + f[i].order.map(s => '<item x="' + s + '"/>').join("") + "</items></pivotField>";
            if (i === F.ca) return '<pivotField dataField="1" compact="0" outline="0" showAll="0"/>';
            return '<pivotField compact="0" outline="0" showAll="0"/>';
        }).join("");
        const rowItems = p.rowsP.map(r => '<i><x v="' + r + '"/></i>').join("") + '<i t="grand"><x/></i>';
        const colItems = p.colsP.map((c, i) => i > 0 && p.colsP[i - 1][0] === c[0] ? '<i r="1"><x v="' + c[1] + '"/></i>' : '<i><x v="' + c[0] + '"/><x v="' + c[1] + '"/></i>').join("") + '<i t="grand"><x/></i>';
        const c0 = p.col, lastC = c0 + p.colsP.length + 1, lastR = 7 + p.rowsP.length + 1;
        const loc = '<location ref="' + cname(c0) + "5:" + cname(lastC) + lastR + '" firstHeaderRow="1" firstDataRow="3" firstDataCol="1" rowPageCount="3" colPageCount="1"/>';
        const pages = p.pages.map(g => '<pageField fld="' + g.fi + '"' + (g.pos >= 0 ? ' item="' + g.pos + '"' : "") + ' hier="-1"/>').join("");
        let formats = "";
        if (dxfId != null && p.naPos >= 0) {
            const na = '<reference field="' + F.ssf + '" count="1" selected="0"><x v="' + p.naPos + '"/></reference>';
            const fsAll = '<reference field="' + F.fs + '" count="' + f[F.fs].order.length + '" selected="0">' + f[F.fs].order.map((_, i) => '<x v="' + i + '"/>').join("") + "</reference>";
            formats = '<formats count="3"><format dxfId="' + dxfId + '"><pivotArea outline="0" collapsedLevelsAreSubtotals="1" fieldPosition="0"><references count="1">' + na + '</references></pivotArea></format><format dxfId="' + dxfId + '"><pivotArea dataOnly="0" labelOnly="1" outline="0" fieldPosition="0"><references count="1">' + na + '</references></pivotArea></format><format dxfId="' + dxfId + '"><pivotArea dataOnly="0" labelOnly="1" outline="0" fieldPosition="0"><references count="2">' + na + fsAll + "</references></pivotArea></format></formats>";
        }
        return DECL + '<pivotTableDefinition xmlns="' + NS + '" name="PivotTable' + (p.n + 1) + '" cacheId="1" applyNumberFormats="0" applyBorderFormats="0" applyFontFormats="0" applyPatternFormats="0" applyAlignmentFormats="0" applyWidthHeightFormats="1" dataCaption="Values" updatedVersion="6" minRefreshableVersion="3" useAutoFormatting="1" itemPrintTitles="1" createdVersion="6" indent="0" compact="0" compactData="0" outline="1" outlineData="1" multipleFieldFilters="0">' + loc + '<pivotFields count="' + cache.names.length + '">' + pf + '</pivotFields><rowFields count="1"><field x="' + F.st + '"/></rowFields><rowItems count="' + (p.rowsP.length + 1) + '">' + rowItems + '</rowItems><colFields count="2"><field x="' + F.ssf + '"/><field x="' + F.fs + '"/></colFields><colItems count="' + (p.colsP.length + 1) + '">' + colItems + '</colItems><pageFields count="3">' + pages + '</pageFields><dataFields count="1"><dataField name="Count of Customer Account" fld="' + F.ca + '" subtotal="count" baseField="0" baseItem="0"/></dataFields>' + formats + '<pivotTableStyleInfo name="PivotStyleLight16" showRowHeaders="1" showColHeaders="1" showRowStripes="0" showColStripes="0" showLastColumn="1"/></pivotTableDefinition>';
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
    async function addDxf(zip) {
        const d = parseXml(await zip.file("xl/styles.xml").async("string"));
        let dx = els(d, "dxfs")[0];
        if (!dx) {
            dx = d.createElementNS(NS, "dxfs");
            const after = [ "tableStyles", "colors", "extLst" ].map(t => kids(d.documentElement, t)[0]).filter(Boolean)[0];
            d.documentElement.insertBefore(dx, after || null);
        }
        const x = d.createElementNS(NS, "dxf"), fl = d.createElementNS(NS, "fill"), pf = d.createElementNS(NS, "patternFill"), bg = d.createElementNS(NS, "bgColor");
        pf.setAttribute("patternType", "solid");
        bg.setAttribute("rgb", CFG.HIGHLIGHT_NOT_ABSORB);
        pf.appendChild(bg);
        fl.appendChild(pf);
        x.appendChild(fl);
        dx.appendChild(x);
        const id = kids(dx, "dxf").length - 1;
        dx.setAttribute("count", String(id + 1));
        zip.file("xl/styles.xml", ser(d));
        return id;
    }
    async function addPivots(buf) {
        const zip = await JSZip.loadAsync(buf);
        const wbRels = parseXml(await zip.file("xl/_rels/workbook.xml.rels").async("string"));
        const wbDoc = parseXml(await zip.file("xl/workbook.xml").async("string"));
        const target = {};
        els(wbRels, "Relationship").forEach(r => target[r.getAttribute("Id")] = r.getAttribute("Target"));
        const sh = els(wbDoc, "sheet").filter(s => s.getAttribute("name") === CFG.SHEET_PIVOT)[0];
        if (!sh) throw new Error("sheet " + CFG.SHEET_PIVOT + " nggak ketemu di workbook");
        let t = (target[sh.getAttributeNS(RNS, "id") || sh.getAttribute("r:id")] || "").replace(/^\.\//, "");
        const sPath = t.charAt(0) === "/" ? t.slice(1) : "xl/" + t;
        const cache = res.cache, F = res.F;
        zip.file("xl/pivotCache/pivotCacheDefinition1.xml", cacheDefXml(cache, res.rows.length));
        zip.file("xl/pivotCache/pivotCacheRecords1.xml", cacheRecXml(cache));
        zip.file("xl/pivotCache/_rels/pivotCacheDefinition1.xml.rels", relsXml([ [ "rId1", "pivotCacheRecords", "pivotCacheRecords1.xml" ] ]));
        const dxfId = await addDxf(zip);
        const sRelPath = sPath.replace(/([^\/]+)$/, "_rels/$1.rels");
        const sf = zip.file(sRelPath);
        const sRels = parseXml(sf ? await sf.async("string") : relsXml([]));
        res.pivots.forEach((p, i) => {
            const nm = "pivotTable" + (i + 1) + ".xml";
            zip.file("xl/pivotTables/" + nm, pivotXml(p, cache, F, dxfId));
            zip.file("xl/pivotTables/_rels/" + nm + ".rels", relsXml([ [ "rId1", "pivotCacheDefinition", "../pivotCache/pivotCacheDefinition1.xml" ] ]));
            addRel(sRels, freeId(sRels, "rIdPv"), "pivotTable", "../pivotTables/" + nm);
        });
        zip.file(sRelPath, ser(sRels));
        const pcId = freeId(wbRels, "rIdPc");
        addRel(wbRels, pcId, "pivotCacheDefinition", "pivotCache/pivotCacheDefinition1.xml");
        zip.file("xl/_rels/workbook.xml.rels", ser(wbRels));
        const root = wbDoc.documentElement;
        const pcs = wbDoc.createElementNS(NS, "pivotCaches"), pc = wbDoc.createElementNS(NS, "pivotCache");
        pc.setAttribute("cacheId", "1");
        pc.setAttributeNS(RNS, "r:id", pcId);
        pcs.appendChild(pc);
        const later = [ "smartTagPr", "smartTagTypes", "webPublishing", "fileRecoveryPr", "webPublishObjects", "extLst" ];
        let before = null;
        for (let n = root.firstElementChild; n; n = n.nextElementSibling) if (later.indexOf(n.localName) >= 0) {
            before = n;
            break;
        }
        root.insertBefore(pcs, before);
        zip.file("xl/workbook.xml", ser(wbDoc));
        const ct = parseXml(await zip.file("[Content_Types].xml").async("string"));
        const ov = (part, type) => {
            const o = ct.createElementNS(CNS, "Override");
            o.setAttribute("PartName", part);
            o.setAttribute("ContentType", CT + type + "+xml");
            ct.documentElement.appendChild(o);
        };
        ov("/xl/pivotCache/pivotCacheDefinition1.xml", "pivotCacheDefinition");
        ov("/xl/pivotCache/pivotCacheRecords1.xml", "pivotCacheRecords");
        res.pivots.forEach((_, i) => ov("/xl/pivotTables/pivotTable" + (i + 1) + ".xml", "pivotTable"));
        zip.file("[Content_Types].xml", ser(ct));
        return zip.generateAsync({
            type: "arraybuffer",
            compression: "DEFLATE"
        });
    }
})();
