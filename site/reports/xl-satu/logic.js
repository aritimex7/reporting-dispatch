(function() {
    "use strict";
    const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    const DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n';
    const YELLOW = "FFFFFF00";
    const CODE = {};
    [ 1, 6, 7, 8, 13, 16, 17, 18, 24, 27, 28, 29, 30, 34, 38, 39 ].forEach(c => CODE[c] = "Return");
    [ 2, 4, 5, 35, 36, 37, 40, 41, 42, 43, 44, 45, 46, 47, 48 ].forEach(c => CODE[c] = "Hold");
    [ 9, 10, 11, 12, 14, 15, 19, 20, 21, 22, 23, 25, 26, 31, 32, 33 ].forEach(c => CODE[c] = "Reschedule");
    const S1MAP = {
        CP: "Installed",
        ND: "Reschedule",
        CXL: "Return"
    };
    const WMAP = {
        COMPLETE: "Installed",
        "NOT DONE": "Reschedule",
        CANCEL: "Return"
    };
    const SLOT = {
        "13-15:00": "13:00-15:00",
        "15-17:30": "15:00-18:00",
        "9:00-12:00": "09:00-12:00",
        anytime: ">18.00",
        "13:00-15:00": "13:00-15:00",
        "15:00-18:00": "15:00-18:00",
        "09:00-12:00": "09:00-12:00",
        ">18.00": ">18.00"
    };
    const PART = {
        part001: "Dikirim jam 10:00",
        part002: "Dikirim jam 11:30",
        part003: "Dikirim jam 13:00",
        part004: "Dikirim jam 14:30"
    };
    const FROZEN = [ "installed", "return", "reschedule", "hold" ];
    const BLANKS = [ "", "-", "--", "---", ".", "n/a", "na", "nil", "null" ];
    const PLAN = "plan sameday";
    function clean(v) {
        return String(v == null ? "" : v).replace(/_x000D_/g, "").replace(/\r/g, "").trim();
    }
    function isBlank(v) {
        return BLANKS.indexOf(clean(v).replace(/\s+/g, " ").toLowerCase()) >= 0;
    }
    function padSlot(raw) {
        let v = clean(raw);
        if (!v) return null;
        if (/^revisit\b/i.test(v)) v = v.replace(/^revisit\b/i, "").trim();
        return SLOT[v.toLowerCase()] || SLOT[v] || null;
    }
    function nh(s) {
        return String(s == null ? "" : s).replace(/\s+/g, " ").trim().toLowerCase();
    }
    const $ = id => document.getElementById("xs-" + id);
    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }[c]));
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
    function cnum(s) {
        let n = 0;
        for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
        return n;
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
    function refOf(r) {
        const m = /^([A-Z]+)(\d+)$/.exec(r || "");
        return m ? {
            c: cnum(m[1]),
            r: +m[2]
        } : null;
    }
    async function readSource(file) {
        const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
            type: "array"
        });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(ws, {
            header: 1,
            raw: false,
            defval: ""
        });
        if (!aoa.length) throw new Error(file.name + ": sheet kosong");
        const hdr = aoa[0].map(nh), rows = [];
        for (let i = 1; i < aoa.length; i++) {
            const a = aoa[i];
            if (!a.some(x => String(x).trim() !== "")) continue;
            const o = {};
            for (let j = 0; j < hdr.length; j++) if (hdr[j]) o[hdr[j]] = clean(a[j]);
            rows.push(o);
        }
        return {
            hdr: hdr,
            rows: rows,
            name: file.name
        };
    }
    const g = (o, k) => o && o[nh(k)] != null ? o[nh(k)] : "";
    let zip = null, repName = "report", sst = [], sheets = {}, pivotDefs = [], stylesDoc = null, yFill = null, xfC = {};
    const P_NEED = [ "customer id", "work order", "slot time ln", "remark installasi ln", "slot gd", "remarks gd", "status final" ];
    const S_NEED = [ "cust_acct", "woid partner", "team handle", "remark installasi ln", "status final", "sameday time" ];
    async function loadReport(file) {
        repName = file.name.replace(/\.(xlsx|xlsm)$/i, "");
        zip = await JSZip.loadAsync(file);
        if (!zip.file("xl/workbook.xml")) throw new Error("bukan .xlsx yang valid");
        sst = [];
        const sf = zip.file("xl/sharedStrings.xml");
        if (sf) {
            const d = parseXml(await sf.async("string"));
            els(d, "si").forEach(si => {
                let t = "";
                els(si, "t").forEach(x => t += x.textContent);
                sst.push(t);
            });
        }
        const rel = {};
        const rf = zip.file("xl/_rels/workbook.xml.rels");
        if (rf) {
            const d = parseXml(await rf.async("string"));
            els(d, "Relationship").forEach(r => rel[r.getAttribute("Id")] = r.getAttribute("Target"));
        }
        const wb = parseXml(await zip.file("xl/workbook.xml").async("string"));
        const list = [];
        els(wb, "sheet").forEach(s => {
            const id = s.getAttribute("r:id") || s.getAttribute("id");
            let t = (rel[id] || "").replace(/^\.\//, "");
            const p = t.charAt(0) === "/" ? t.slice(1) : "xl/" + t;
            if (zip.file(p)) list.push({
                name: s.getAttribute("name"),
                path: p
            });
        });
        sheets = {};
        for (const s of list) {
            const o = await readSheet(s.path);
            o.name = s.name;
            const has = n => o.COLS[n] != null;
            if (P_NEED.every(has) && o.COLS["customer id"]) sheets.P = o; else if (S_NEED.every(has)) sheets.S = o;
        }
        if (!sheets.P) throw new Error("sheet Priority nggak ketemu (dicari lewat judul kolom, bukan nama sheet)");
        pivotDefs = Object.keys(zip.files).filter(p => /^xl\/pivotCache\/pivotCacheDefinition\d*\.xml$/i.test(p));
    }
    async function readSheet(path) {
        const doc = parseXml(await zip.file(path).async("string"));
        const rows = {};
        let last = 1;
        els(doc, "row").forEach(row => {
            const rn = +row.getAttribute("r"), cells = {};
            kids(row, "c").forEach(c => {
                const p = refOf(c.getAttribute("r"));
                if (p) cells[p.c] = cv(c);
            });
            rows[rn] = cells;
            if (rn > last) last = rn;
        });
        const h = rows[1] || {}, COLS = {};
        Object.keys(h).forEach(k => {
            const n = nh(h[k].text);
            if (n) COLS[n] = +k;
        });
        const styleByCol = {};
        for (let rn = 2; rn <= Math.min(last, 80); rn++) {
            const row = rows[rn];
            if (!row) continue;
            Object.keys(row).forEach(c => {
                if (styleByCol[c] == null && row[c].s != null) styleByCol[c] = row[c].s;
            });
        }
        const colStyle = {};
        const ce = els(doc, "cols")[0];
        if (ce) kids(ce, "col").forEach(c => {
            const s = c.getAttribute("s") || c.getAttribute("style");
            if (s == null) return;
            const a = +c.getAttribute("min"), b = Math.min(+c.getAttribute("max") || a, 300);
            for (let i = a; i <= b; i++) if (colStyle[i] == null) colStyle[i] = s;
        });
        return {
            doc: doc,
            path: path,
            rows: rows,
            last: last,
            COLS: COLS,
            styleByCol: styleByCol,
            colStyle: colStyle
        };
    }
    function cv(c) {
        const t = c.getAttribute("t"), s = c.getAttribute("s");
        if (t === "inlineStr") {
            const is = kids(c, "is")[0];
            let x = "";
            if (is) els(is, "t").forEach(n => x += n.textContent);
            return {
                text: clean(x),
                s: s
            };
        }
        const v = kids(c, "v")[0], raw = v ? v.textContent : "";
        if (raw === "") return {
            text: "",
            s: s
        };
        if (t === "s") return {
            text: clean(sst[+raw] || ""),
            s: s
        };
        return {
            text: clean(raw),
            s: s
        };
    }
    function txt(sh, r, c) {
        const row = sh.rows[r];
        if (!row) return "";
        const x = row[c];
        return x ? x.text : "";
    }
    function rowEl(sh, rn) {
        let sd = els(sh.doc, "sheetData")[0];
        if (!sd) {
            sd = sh.doc.createElementNS(NS, "sheetData");
            sh.doc.documentElement.appendChild(sd);
        }
        const rs = kids(sd, "row");
        let before = null;
        for (let i = 0; i < rs.length; i++) {
            const n = +rs[i].getAttribute("r");
            if (n === rn) return rs[i];
            if (n > rn) {
                before = rs[i];
                break;
            }
        }
        const r = sh.doc.createElementNS(NS, "row");
        r.setAttribute("r", String(rn));
        sd.insertBefore(r, before);
        return r;
    }
    function cellEl(sh, re, cn) {
        const ref = cname(cn) + re.getAttribute("r"), cs = kids(re, "c");
        let before = null;
        for (let i = 0; i < cs.length; i++) {
            const p = refOf(cs[i].getAttribute("r"));
            if (!p) continue;
            if (p.c === cn) return cs[i];
            if (p.c > cn) {
                before = cs[i];
                break;
            }
        }
        const c = sh.doc.createElementNS(NS, "c");
        c.setAttribute("r", ref);
        re.insertBefore(c, before);
        return c;
    }
    function styleFor(sh, cn) {
        let v = sh.styleByCol ? sh.styleByCol[cn] : null;
        if (v == null && sh.colStyle) v = sh.colStyle[cn];
        return v == null ? null : v;
    }
    function put(sh, rn, cn, val, styleFrom) {
        const re = rowEl(sh, rn);
        re.removeAttribute("spans");
        const c = cellEl(sh, re, cn);
        if (!c.getAttribute("s")) {
            const s = styleFrom != null ? styleFrom : styleFor(sh, cn);
            if (s != null) c.setAttribute("s", s);
        }
        while (c.firstChild) c.removeChild(c.firstChild);
        c.removeAttribute("t");
        const v = clean(val);
        if (v === "") return;
        c.setAttribute("t", "inlineStr");
        const is = sh.doc.createElementNS(NS, "is"), t = sh.doc.createElementNS(NS, "t");
        t.setAttribute("xml:space", "preserve");
        t.textContent = v;
        is.appendChild(t);
        c.appendChild(is);
    }
    async function prepStyles() {
        stylesDoc = parseXml(await zip.file("xl/styles.xml").async("string"));
        const fills = els(stylesDoc, "fills")[0];
        let found = null;
        kids(fills, "fill").forEach((f, i) => {
            const fg = els(f, "fgColor")[0];
            if (fg && (fg.getAttribute("rgb") || "").toUpperCase() === YELLOW) found = i;
        });
        if (found !== null) yFill = found; else {
            const f = stylesDoc.createElementNS(NS, "fill"), pf = stylesDoc.createElementNS(NS, "patternFill");
            pf.setAttribute("patternType", "solid");
            const fg = stylesDoc.createElementNS(NS, "fgColor");
            fg.setAttribute("rgb", YELLOW);
            const bg = stylesDoc.createElementNS(NS, "bgColor");
            bg.setAttribute("indexed", "64");
            pf.appendChild(fg);
            pf.appendChild(bg);
            f.appendChild(pf);
            fills.appendChild(f);
            yFill = kids(fills, "fill").length - 1;
            fills.setAttribute("count", String(yFill + 1));
        }
        xfC = {};
    }
    function yXf(orig) {
        const k = orig == null ? "0" : String(orig);
        if (xfC[k] != null) return xfC[k];
        const cx = els(stylesDoc, "cellXfs")[0], l = kids(cx, "xf");
        const nx = (l[+k] || l[0]).cloneNode(true);
        nx.setAttribute("fillId", String(yFill));
        nx.setAttribute("applyFill", "1");
        cx.appendChild(nx);
        const i = kids(cx, "xf").length - 1;
        cx.setAttribute("count", String(i + 1));
        xfC[k] = i;
        return i;
    }
    function mark(sh, rn, cn) {
        const c = cellEl(sh, rowEl(sh, rn), cn);
        let s = c.getAttribute("s");
        if (s == null) {
            const f = styleFor(sh, cn);
            if (f != null) {
                c.setAttribute("s", f);
                s = f;
            }
        }
        c.setAttribute("s", String(yXf(s)));
    }
    function setDim(sh, lastRow) {
        const d = els(sh.doc, "dimension")[0];
        if (!d) return;
        const m = /^([A-Z]+\d+):([A-Z]+)(\d+)$/.exec(d.getAttribute("ref") || "");
        if (m && +m[3] < lastRow) d.setAttribute("ref", m[1] + ":" + m[2] + lastRow);
    }
    function renum(re, n) {
        re.setAttribute("r", String(n));
        re.removeAttribute("spans");
        kids(re, "c").forEach(c => {
            const p = refOf(c.getAttribute("r"));
            if (p) c.setAttribute("r", cname(p.c) + n);
        });
    }
    function hasVal(re, cn) {
        let ok = false;
        kids(re, "c").forEach(c => {
            const p = refOf(c.getAttribute("r"));
            if (!p || p.c !== cn) return;
            const v = kids(c, "v")[0], is = kids(c, "is")[0];
            if (v && clean(v.textContent) || is && clean(is.textContent)) ok = true;
        });
        return ok;
    }
    const URUT = {
        installed: 1,
        reschedule: 2,
        hold: 3,
        return: 4
    };
    function sortSheet(sh, keyCol, stat) {
        const sd = els(sh.doc, "sheetData")[0];
        const all = kids(sd, "row");
        const A = [], B = [], C = [], sisa = [];
        all.forEach(re => {
            const rn = +re.getAttribute("r");
            if (rn === 1) return;
            if (!hasVal(re, keyCol)) {
                sisa.push(re);
                return;
            }
            const st = stat[rn] || {
                ubah: false,
                nilai: ""
            };
            const r = URUT[String(st.nilai || "").toLowerCase()];
            if (st.ubah) {
                B.push({
                    re: re,
                    r: URUT[String(st.nilai).toLowerCase()] || 9
                });
                return;
            }
            if (r) A.push(re); else C.push(re);
        });
        B.sort((x, y) => x.r - y.r);
        const urut = A.concat(B.map(x => x.re), C, sisa);
        urut.forEach(re => sd.removeChild(re));
        let n = 2;
        urut.forEach(re => {
            renum(re, n++);
            sd.appendChild(re);
        });
        return {
            lama: A.length,
            baru: B.length
        };
    }
    const files = {
        rep: null,
        wo: null,
        wct: null,
        sd: null
    };
    let pend = null;
    const LABEL = {
        rep: "n-rep",
        wo: "n-wo",
        wct: "n-wct",
        sd: "n-sd"
    };
    const SIDIK = [ {
        k: "rep",
        perlu: [ "customer id", "status final" ]
    }, {
        k: "rep",
        perlu: [ "cust_acct", "status final", "sameday time" ]
    }, {
        k: "wo",
        perlu: [ "ca partner", "status1" ]
    }, {
        k: "wct",
        perlu: [ "wo partner id" ]
    }, {
        k: "sd",
        perlu: [ "smd part", "job task" ]
    } ];
    async function sniff(file) {
        let wb;
        try {
            wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
                type: "array",
                sheetRows: 1
            });
        } catch (e) {
            return null;
        }
        for (const sn of wb.SheetNames) {
            const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], {
                header: 1,
                raw: false,
                defval: ""
            });
            if (!aoa.length) continue;
            const hdr = aoa[0].map(nh);
            for (const s of SIDIK) {
                if (s.perlu.every(n => hdr.indexOf(n) >= 0)) return s.k;
            }
        }
        return null;
    }
    function assign(k, f) {
        files[k] = f;
        const el = $(LABEL[k]);
        el.textContent = f.name;
        el.classList.add("on");
    }
    function refreshCount() {
        const n = [ "rep", "wct" ].filter(k => files[k]).length;
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
            const k = [ "rep", "wo", "wct", "sd" ].filter(x => !files[x])[0];
            if (k) assign(k, f);
        });
        dzs.textContent = asal;
        refreshCount();
    }
    document.querySelectorAll("#pane-xl-satu .xs-pick").forEach(b => b.addEventListener("click", () => {
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
    let plan = null;
    $("run").addEventListener("click", async () => {
        $("e1").innerHTML = "";
        $("run").disabled = true;
        $("run").textContent = "Menghitung…";
        try {
            await compute();
            render();
            $("res").classList.remove("xs-hidden");
            $("res").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } catch (e) {
            $("e1").innerHTML = '<div class="xs-err">' + esc(e.message) + "</div>";
        }
        $("run").disabled = false;
        $("run").textContent = "Hitung perubahan";
    });
    async function compute() {
        await loadReport(files.rep);
        const wo = files.wo ? await readSource(files.wo) : {
            hdr: [],
            rows: [],
            name: "WO Report tidak diunggah"
        };
        const wct = await readSource(files.wct);
        if (files.wo && wo.hdr.indexOf("ca partner") < 0) throw new Error("kolom 'CA Partner' nggak ada di WO Report");
        if (wct.hdr.indexOf("wo partner id") < 0) throw new Error("kolom 'WO Partner ID' nggak ada di sumber 2");
        const byCA = {}, byWO = {};
        wo.rows.forEach(r => {
            const k = g(r, "CA Partner");
            if (k && !byCA[k]) byCA[k] = r;
        });
        wct.rows.forEach(r => {
            const k = g(r, "WO Partner ID");
            if (k && !byWO[k]) byWO[k] = r;
        });
        const writes = [], alerts = [], marks = [], appends = [];
        const pStat = {}, sStat = {};
        const perCol = {
            P: {},
            S: {}
        };
        const route = {
            P: {
                Installed: 0,
                Return: 0,
                Reschedule: 0,
                Hold: 0,
                Progress: 0,
                none: 0,
                frozen: 0
            },
            S: {
                Installed: 0,
                Return: 0,
                Reschedule: 0,
                Hold: 0,
                Progress: 0,
                none: 0,
                frozen: 0,
                baru: 0
            }
        };
        function W(sh, tag, rn, cn, label, oldV, newV) {
            if (clean(oldV) === clean(newV)) return false;
            writes.push({
                sh: sh,
                tag: tag,
                r: rn,
                c: cn,
                label: label,
                old: oldV,
                nw: newV
            });
            perCol[tag][label] = (perCol[tag][label] || 0) + 1;
            return true;
        }
        function statusOf(s1, s2, sameday) {
            const st1 = g(s1, "STATUS1").toUpperCase(), wst = g(s2, "Status").toUpperCase();
            const st3 = g(s1, "STATUS3");
            let nf = S1MAP[st1] || WMAP[wst] || null;
            let al = null;
            if (st3) {
                const k = parseInt(st3, 10);
                if (!CODE[k]) al = {
                    t: "Kode STATUS3 nggak dikenal",
                    d: "kode " + st3
                }; else if (CODE[k] === "Hold" && nf === "Reschedule") nf = "Hold";
            }
            if (!nf && sameday && s1) nf = "Progress";
            return {
                nf: nf,
                alert: al
            };
        }
        const P = sheets.P, C = P.COLS;
        const pCid = C["customer id"], pWo = C["work order"], pLn = C["slot time ln"], pRem = C["remark installasi ln"], pGd = C["slot gd"], pRgd = C["remarks gd"], pFin = C["status final"];
        const pMark = pFin + 1;
        const priorityIds = {};
        let pRows = 0;
        for (let rn = 2; rn <= P.last; rn++) {
            const cid = txt(P, rn, pCid);
            if (!cid) continue;
            pRows++;
            priorityIds[cid] = true;
            const woid = txt(P, rn, pWo), cur = txt(P, rn, pFin);
            pStat[rn] = {
                ubah: false,
                nilai: cur
            };
            const s1 = byCA[cid] || null, s2 = byWO[woid] || null;
            if (!s1 && !s2) {
                alerts.push({
                    t: files.wo ? "Nggak ketemu di dua sumber" : "Nggak ketemu di WCT (WO Report tidak diunggah)",
                    d: "Priority baris " + rn + " · " + cid
                });
                continue;
            }
            if (FROZEN.indexOf(cur.toLowerCase()) >= 0) {
                route.P.frozen++;
                continue;
            }
            let touched = false;
            const r1 = g(s1, "Result Remark"), r2 = g(s2, "Result Remark");
            const rem = !isBlank(r1) ? r1 : !isBlank(r2) ? r2 : "";
            if (rem) touched = W(P, "P", rn, pRem, "REMARK INSTALLASI LN", txt(P, rn, pRem), rem) || touched;
            if (s1) {
                const raw = g(s1, "Stat GD") || g(s1, "STAT_GT") || g(s1, "Stat GC");
                if (raw) {
                    const sl = padSlot(raw);
                    if (!sl) alerts.push({
                        t: "Nilai slot nggak dikenal",
                        d: "Priority baris " + rn + " · " + raw
                    }); else {
                        touched = W(P, "P", rn, pGd, "SLOT GD", txt(P, rn, pGd), sl) || touched;
                        touched = W(P, "P", rn, pLn, "SLOT TIME LN", txt(P, rn, pLn), sl) || touched;
                        const mr = g(s1, "Monitoring Remark");
                        if (mr) touched = W(P, "P", rn, pRgd, "REMARKS GD", txt(P, rn, pRgd), mr) || touched;
                    }
                }
            }
            const st = statusOf(s1, s2, false);
            if (st.alert) {
                st.alert.d = "Priority baris " + rn + " · " + st.alert.d;
                alerts.push(st.alert);
            }
            if (st.nf) {
                route.P[st.nf]++;
                const ubah = W(P, "P", rn, pFin, "STATUS FINAL", cur, st.nf);
                if (ubah) {
                    pStat[rn] = {
                        ubah: true,
                        nilai: st.nf
                    };
                    marks.push({
                        sh: P,
                        r: rn,
                        c: pMark
                    });
                }
                touched = ubah || touched;
            } else route.P.none++;
        }
        let sRows = 0, sNewRows = [];
        if (sheets.S && files.sd) {
            const S = sheets.S, K = S.COLS;
            const sAcc = K["cust_acct"], sWo = K["woid partner"], sTeam = K["team handle"], sRem = K["remark installasi ln"], sFin = K["status final"], sTime = K["sameday time"], sAcctP = K["account number partner"];
            const src = await readSource(files.sd);
            const idx = {};
            let lastData = 1;
            for (let rn = 2; rn <= S.last; rn++) {
                const a = txt(S, rn, sAcc);
                if (a) {
                    idx[a] = rn;
                    if (rn > lastData) lastData = rn;
                }
            }
            sRows = Object.keys(idx).length;
            const styleRow = lastData;
            S.lastData = lastData;
            const wctByWo = byWO;
            const lolos = [];
            src.rows.forEach(r => {
                const jt = g(r, "Job Task").toUpperCase(), ty = g(r, "SMD Type").toUpperCase();
                if (jt !== "NEW INSTALL") return;
                if (ty.indexOf("XL") !== 0) return;
                const accP = g(r, "Account P");
                if (accP && priorityIds[accP]) {
                    alerts.push({
                        t: "Sameday dibuang, sudah ada di Priority",
                        d: accP
                    });
                    return;
                }
                const wid = g(r, "WOID P");
                if (wid.toUpperCase().indexOf("WO-INS") !== 0) {
                    alerts.push({
                        t: "Sameday dibuang, WOID bukan WO-INS",
                        d: (wid || "(kosong)") + " · " + g(r, "Account")
                    });
                    return;
                }
                lolos.push(r);
            });
            let nextRow = lastData + 1, nextNo = sRows;
            lolos.forEach(r => {
                const acc = g(r, "Account"), woid = g(r, "WOID P");
                const s1 = byCA[g(r, "Account P")] || null, s2 = wctByWo[woid] || null;
                let rn = idx[acc], baru = false;
                if (rn == null) {
                    baru = true;
                    rn = nextRow++;
                    nextNo++;
                    sNewRows.push(rn);
                    route.S.baru++;
                    const part = PART[g(r, "SMD Part").toLowerCase()];
                    if (!part) alerts.push({
                        t: "SMD Part nggak dikenal",
                        d: g(r, "SMD Part") + " · " + acc
                    });
                    const base = [ [ K["no"], String(nextNo) ], [ sAcc, acc ], [ K["offernum"], g(r, "Offernum") ], [ sWo, woid ], [ sAcctP, g(r, "Account P") ], [ K["branch"], g(r, "Branch") ], [ K["site id"], g(r, "Site ID") ], [ K["customer name"], g(r, "Customer Name") ], [ K["address"], g(r, "Address") ], [ K["slot time"], ">18.00" ], [ K["status wo ln"], PLAN ], [ sFin, PLAN ], [ sTime, part || "" ] ];
                    appends.push({
                        r: rn,
                        cells: base,
                        styleRow: styleRow
                    });
                }
                const cur = baru ? PLAN : txt(S, rn, sFin);
                sStat[rn] = {
                    ubah: false,
                    nilai: cur
                };
                if (!baru && FROZEN.indexOf(cur.toLowerCase()) >= 0) {
                    route.S.frozen++;
                    return;
                }
                let touched = baru;
                let tc = "";
                if (s2 && g(s2, "Status")) tc = g(s2, "Techician Code");
                if (!tc && s1 && g(s1, "STATUS1")) tc = g(s1, "Installer");
                if (tc) touched = W(S, "S", rn, sTeam, "Team Handle", baru ? "" : txt(S, rn, sTeam), tc) || touched;
                const r1 = g(s1, "Result Remark"), r2 = g(s2, "Result Remark");
                const rem = !isBlank(r1) ? r1 : !isBlank(r2) ? r2 : "";
                if (rem) touched = W(S, "S", rn, sRem, "REMARK INSTALLASI LN", baru ? "" : txt(S, rn, sRem), rem) || touched;
                const st = statusOf(s1, s2, true);
                if (st.alert) {
                    st.alert.d = "Sameday " + acc + " · " + st.alert.d;
                    alerts.push(st.alert);
                }
                if (st.nf) {
                    route.S[st.nf]++;
                    const ubah = W(S, "S", rn, sFin, "STATUS FINAL", cur, st.nf);
                    if (ubah) {
                        sStat[rn] = {
                            ubah: true,
                            nilai: st.nf
                        };
                        marks.push({
                            sh: S,
                            r: rn,
                            c: sFin
                        });
                    }
                    touched = ubah || touched;
                } else if (!baru) route.S.none++;
            });
        }
        plan = {
            writes: writes,
            alerts: alerts,
            marks: marks,
            appends: appends,
            route: route,
            pStat: pStat,
            sStat: sStat,
            perCol: perCol,
            pRows: pRows,
            sRows: sRows,
            sNewRows: sNewRows,
            hasS: !!(sheets.S && files.sd)
        };
    }
    function render() {
        const p = plan;
        $("meta").textContent = "Priority " + p.pRows + " baris" + (p.hasS ? " · Sameday " + p.sRows : "");
        const A = p.alerts;
        $("alerts").innerHTML = A.length ? '<div class="xs-alerts"><div class="ah">' + A.length + " hal perlu kamu lihat</div>" + A.slice(0, 30).map(a => '<div class="ai"><b>' + esc(a.t) + "</b> — <code>" + esc(a.d) + "</code></div>").join("") + (A.length > 30 ? '<div class="ai">+ ' + (A.length - 30) + " lainnya</div>" : "") + "</div>" : "";
        $("secP").innerHTML = section("Priority", p.route.P, p.perCol.P, "P", [ "REMARK INSTALLASI LN", "SLOT GD", "REMARKS GD", "SLOT TIME LN", "STATUS FINAL" ], "Kolom di sebelah kanan STATUS FINAL dikuningin — cuma baris yang STATUS FINAL-nya berubah.");
        $("secS").innerHTML = p.hasS ? section("Sameday", p.route.S, p.perCol.S, "S", [ "Team Handle", "REMARK INSTALLASI LN", "STATUS FINAL" ], "Sel STATUS FINAL dikuningin — cuma yang berubah.", p.route.S.baru) : '<div class="xs-sect-t">Sameday</div><div class="xs-empty">File sameday belum dipilih — sheet Sameday dilewati.</div>';
        function section(title, R, pc, tag, cols, lampTxt, baru) {
            let h = '<div class="xs-sect-t"><span>' + title + "</span><span>" + plan.writes.filter(w => w.tag === tag).length + " sel</span></div>";
            h += '<div class="xs-routing">';
            if (baru != null) h += rt("newrow", "Baris baru", "gelombang Sameday berikutnya", baru);
            h += rt("installed", "Installed", "STATUS1 = CP · WCT COMPLETE", R.Installed) + rt("ret", "Return", "kode cancel", R.Return) + rt("resched", "Reschedule", "kode reschedule", R.Reschedule) + rt("hold", "Hold", "perlu dicek manual", R.Hold) + rt("", "Progress", "sudah ada WO, belum selesai", R.Progress) + rt("", "Belum ada hasil", "dibiarkan apa adanya", R.none) + rt("frozen", "Beku", "sudah final, nggak disentuh", R.frozen) + "</div>";
            h += '<div class="xs-tally">' + cols.map(k => '<div><div class="n">' + (pc[k] || 0) + '</div><div class="l">' + k.replace("INSTALLASI LN", "INST").replace("REMARK ", "") + "</div></div>").join("") + "</div>";
            h += '<div class="xs-lampnote"><span class="xs-chip"></span><span>' + lampTxt + "</span></div>";
            const W = plan.writes.filter(w => w.tag === tag);
            h += '<div class="xs-diffs">' + (W.length ? W.slice(0, 120).map(w => '<div class="xs-d"><span class="ref">' + cname(w.c) + w.r + '</span><span class="col">' + esc(w.label) + '</span><div class="v">' + (w.old ? '<span class="old">' + esc(w.old.slice(0, 50)) + "</span>" : "") + '<span class="ar">&rarr;</span>' + esc(w.nw.slice(0, 80)) + "</div></div>").join("") + (W.length > 120 ? '<div class="xs-more">+ ' + (W.length - 120) + " lainnya</div>" : "") : '<div class="xs-empty">Nggak ada perubahan.</div>') + "</div>";
            return h;
            function rt(cls, lab, sub, n) {
                return '<div class="xs-route ' + cls + '"><div class="lab"><b>' + lab + "</b><span>" + sub + '</span></div><div class="n">' + (n || 0) + "</div></div>";
            }
        }
        $("pnote").innerHTML = "<b>Pivot:</b> " + pivotDefs.length + " pivot cache ditandai refresh-saat-dibuka" + (p.sNewRows.length ? ", rentang Sameday dilebarkan " + p.sNewRows.length + " baris" : "") + ". Angkanya berubah pas dibuka di Excel.";
        $("save").disabled = p.writes.length === 0 && p.appends.length === 0;
    }
    $("save").addEventListener("click", async () => {
        const b = $("save");
        b.disabled = true;
        b.textContent = "Menyimpan…";
        $("e2").innerHTML = "";
        try {
            await save();
            $("e2").innerHTML = '<div class="xs-ok">Tersimpan. Buka di Excel biar pivot-nya nge-refresh.</div>';
            b.textContent = "Simpan report baru";
        } catch (e) {
            $("e2").innerHTML = '<div class="xs-err">Gagal menyimpan: ' + esc(e.message) + "</div>";
            b.textContent = "Simpan report baru";
            b.disabled = false;
        }
    });
    async function save() {
        await prepStyles();
        const doAppend = $("doAppend").checked;
        const S = sheets.S;
        let sLast = S ? S.lastData || S.last : 0;
        if (doAppend && S) {
            plan.appends.forEach(a => {
                a.cells.forEach(pair => {
                    const cn = pair[0];
                    if (cn == null) return;
                    const st = S.rows[a.styleRow] && S.rows[a.styleRow][cn] ? S.rows[a.styleRow][cn].s : styleFor(S, cn);
                    put(S, a.r, cn, pair[1], st);
                });
                if (a.r > sLast) sLast = a.r;
            });
        }
        const skipRows = {};
        if (!doAppend) plan.sNewRows.forEach(r => skipRows[r] = true);
        plan.writes.forEach(w => {
            if (w.tag === "S" && skipRows[w.r]) return;
            put(w.sh, w.r, w.c, w.nw, null);
        });
        plan.marks.forEach(m => {
            if (m.sh === S && skipRows[m.r]) return;
            mark(m.sh, m.r, m.c);
        });
        if ($("doSort").checked) {
            sortSheet(sheets.P, sheets.P.COLS["customer id"], plan.pStat);
        }
        setDim(sheets.P, sheets.P.last);
        if (S) {
            setDim(S, sLast);
            zip.file(S.path, ser(S.doc));
        }
        zip.file(sheets.P.path, ser(sheets.P.doc));
        zip.file("xl/styles.xml", ser(stylesDoc));
        zip.remove("xl/calcChain.xml");
        const wbDoc = parseXml(await zip.file("xl/workbook.xml").async("string"));
        let cp = els(wbDoc, "calcPr")[0];
        if (!cp) {
            cp = wbDoc.createElementNS(NS, "calcPr");
            wbDoc.documentElement.appendChild(cp);
        }
        cp.setAttribute("fullCalcOnLoad", "1");
        zip.file("xl/workbook.xml", ser(wbDoc));
        const sName = S ? S.name : null;
        for (const p of pivotDefs) {
            const f = zip.file(p);
            if (!f) continue;
            const d = parseXml(await f.async("string"));
            d.documentElement.setAttribute("refreshOnLoad", "1");
            const ws = els(d, "worksheetSource")[0];
            if (ws && sName && ws.getAttribute("sheet") === sName) {
                const m = /^([A-Z]+\d+):([A-Z]+)(\d+)$/.exec(ws.getAttribute("ref") || "");
                if (m && +m[3] < sLast) ws.setAttribute("ref", m[1] + ":" + m[2] + sLast);
            }
            zip.file(p, ser(d));
        }
        const blob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const stamp = (new Date).toTimeString().slice(0, 5).replace(":", ".");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = repName + " - update " + stamp + ".xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 4e3);
    }
})();