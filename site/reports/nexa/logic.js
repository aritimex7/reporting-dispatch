const BULAN = [ "", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember" ];

const STATUS_MAP = {
    PENDING: {
        emoji: "⚫️",
        cat: "On progres",
        display: "ON  PROGRESS"
    },
    "ON PROGRESS": {
        emoji: "⚫️",
        cat: "On progres",
        display: "ON  PROGRESS"
    },
    COMPLETE: {
        emoji: "🟢",
        cat: "Done/Complete",
        display: "COMPLETE"
    },
    DONE: {
        emoji: "🟢",
        cat: "Done/Complete",
        display: "DONE"
    },
    RESCHEDULE: {
        emoji: "🟡",
        cat: "Reschedule",
        display: "RESCHEDULE"
    },
    RETURN: {
        emoji: "🔵",
        cat: "Return",
        display: "RETURN"
    },
    CANCEL: {
        emoji: "🔴",
        cat: "Cancel",
        display: "CANCEL"
    }
};

const SUMMARY_ORDER = [ "On progres", "Done/Complete", "Reschedule", "Return", "Cancel" ];

const SUMMARY_EMOJI = {
    "On progres": "⚫️",
    "Done/Complete": "🟢",
    Reschedule: "🟡",
    Return: "🔵",
    Cancel: "🔴"
};

const STAT_CLASS = {
    "On progres": "s-onprog",
    "Done/Complete": "s-done",
    Reschedule: "s-resched",
    Return: "s-return",
    Cancel: "s-cancel"
};

const STAT_SHORT = {
    "On progres": "Progres",
    "Done/Complete": "Done",
    Reschedule: "Resched",
    Return: "Return",
    Cancel: "Cancel"
};

const TIME_SLOTS = [ {
    label: "09:00–12:00",
    key: "09:00-12:00"
}, {
    label: "13:00–15:00",
    key: "13:00-15:00"
}, {
    label: "15:00–18:00",
    key: "15:00-18:00"
} ];

let parsedRows = [];

(function() {
    const d = new Date;
    document.getElementById("today").textContent = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
})();

function tanggalId() {
    const d = new Date;
    return `${d.getDate()} ${BULAN[d.getMonth() + 1]} ${d.getFullYear()}`;
}

const dropzone = document.getElementById("dropzone");

const fileInput = document.getElementById("fileInput");

[ "dragover", "dragenter" ].forEach(ev => dropzone.addEventListener(ev, e => {
    e.preventDefault();
    dropzone.classList.add("drag");
}));

[ "dragleave", "dragend" ].forEach(ev => dropzone.addEventListener(ev, e => {
    e.preventDefault();
    dropzone.classList.remove("drag");
}));

dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("drag");
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
});

document.getElementById("fcX").addEventListener("click", e => {
    e.preventDefault();
    parsedRows = [];
    fileInput.value = "";
    document.getElementById("filechip").style.display = "none";
    document.getElementById("btnGen").disabled = true;
    document.getElementById("results").style.display = "none";
    setStatus("", "");
});

function loadFile(file) {
    setStatus("Membaca " + file.name + "…", "");
    const reader = new FileReader;
    reader.onload = e => {
        try {
            const wb = XLSX.read(e.target.result, {
                type: "array",
                cellDates: false
            });
            const ws = wb.Sheets[wb.SheetNames[0]];
            parsedRows = XLSX.utils.sheet_to_json(ws, {
                defval: "",
                raw: false
            });
            document.getElementById("filechip").style.display = "flex";
            document.getElementById("fcName").textContent = file.name;
            document.getElementById("fcMeta").textContent = parsedRows.length + " baris · " + (file.size / 1024).toFixed(0) + " KB";
            document.getElementById("btnGen").disabled = false;
            setStatus("Siap disusun — " + parsedRows.length + " baris terbaca", "ok");
        } catch (err) {
            setStatus("Gagal membaca file: " + err.message, "err");
        }
    };
    reader.readAsArrayBuffer(file);
}

function getStatus(val) {
    if (val === null || val === undefined || String(val).trim() === "") return {
        emoji: "⚫️",
        cat: "On progres",
        display: "ON  PROGRESS"
    };
    const key = String(val).trim().toUpperCase();
    if (STATUS_MAP[key]) return STATUS_MAP[key];
    return {
        emoji: "🔴",
        cat: "Cancel",
        display: String(val).trim()
    };
}

function getDisplayStatus(row) {
    const s = getStatus(row["Result Choice"]);
    if (s.cat === "Cancel" || s.cat === "Reschedule") {
        const remark = String(row["Result Remark"] || "").trim();
        if (remark) return {
            emoji: s.emoji,
            cat: s.cat,
            display: remark.replace(/_x000D_\n/g, " ").replace(/\s+/g, " ").trim()
        };
    }
    return s;
}

function normSlot(v) {
    let s = String(v || "").replace(/[\u2010-\u2015\u2212\u2043]/g, "-").replace(/[.\uFF1A]/g, ":").replace(/\s+/g, "").replace(/[\u00A0]/g, "");
    s = s.replace(/(^|-)(\d):(\d{2})/g, "$10$2:$3");
    return s;
}

function extractWO(t) {
    const s = String(t || "");
    const m = s.match(/SO\w+-\w+-(.+)/);
    return m ? m[1] : s;
}

function cleanCustAcct(v) {
    return String(v || "").trim().replace(/\.0$/, "");
}

function cleanSiteId(v) {
    return String(v || "").trim().replace(/\.0$/, "");
}

function isReturn(r) {
    return getStatus(r["Result Choice"]).cat === "Return";
}

function formatRow(row) {
    const {emoji: emoji, display: display} = getDisplayStatus(row);
    const ca = String(row["CA Partner"] || "").trim();
    const wo = extractWO(row["TMFID"]);
    const customer = String(row["Customer Name"] || "").trim();
    const siteId = cleanSiteId(row["Site ID"]);
    const custAcct = cleanCustAcct(row["CUST_ACCT"]);
    return `${emoji}${ca} - ${wo} - ${customer} - ${siteId} - ${custAcct} >${display}`;
}

function generate() {
    setStatus("Menyusun…", "");
    document.getElementById("results").style.display = "none";
    try {
        const tanggal = tanggalId();
        const branches = [ ...new Set(parsedRows.map(r => String(r["Branch"] || "").trim()).filter(Boolean)) ].sort();
        const laporanList = [];
        const totalAll = {
            "On progres": 0,
            "Done/Complete": 0,
            Reschedule: 0,
            Return: 0,
            Cancel: 0
        };
        for (const branch of branches) {
            const rows = parsedRows.filter(r => String(r["Branch"] || "").trim() === branch);
            const summary = {
                "On progres": 0,
                "Done/Complete": 0,
                Reschedule: 0,
                Return: 0,
                Cancel: 0
            };
            for (const row of rows) {
                const cat = getStatus(row["Result Choice"]).cat;
                if (cat in summary) {
                    summary[cat]++;
                    totalAll[cat]++;
                }
            }
            const slotBuckets = {};
            TIME_SLOTS.forEach(s => slotBuckets[s.key] = []);
            let anytime = [];
            for (const row of rows) {
                const schVal = normSlot(row["SCH Time"]);
                const t = schVal.toUpperCase();
                if ([ "ANYTIME", "SAMEDAY" ].includes(t)) anytime.push(row); else if (slotBuckets[schVal] !== undefined) slotBuckets[schVal].push(row);
            }
            for (const slot of TIME_SLOTS) {
                const caRet = new Set(slotBuckets[slot.key].filter(isReturn).map(r => String(r["CA Partner"] || "").trim()));
                if (!caRet.size) continue;
                const na = [];
                for (const r of anytime) {
                    const ca = String(r["CA Partner"] || "").trim();
                    if (caRet.has(ca)) slotBuckets[slot.key].push(r); else na.push(r);
                }
                anytime = na;
                for (const other of TIME_SLOTS) {
                    if (other.key === slot.key) continue;
                    const stay = [], pull = [];
                    for (const r of slotBuckets[other.key]) {
                        const ca = String(r["CA Partner"] || "").trim();
                        (caRet.has(ca) ? pull : stay).push(r);
                    }
                    slotBuckets[slot.key].push(...pull);
                    slotBuckets[other.key] = stay;
                }
            }
            function sortSlot(arr) {
                const groups = new Map;
                for (const r of arr) {
                    const ca = String(r["CA Partner"] || "").trim();
                    if (!groups.has(ca)) groups.set(ca, []);
                    groups.get(ca).push(r);
                }
                const out = [];
                for (const [, grp] of groups) {
                    grp.sort((a, b) => (isReturn(a) ? 0 : 1) - (isReturn(b) ? 0 : 1));
                    out.push(...grp);
                }
                return out;
            }
            TIME_SLOTS.forEach(s => slotBuckets[s.key] = sortSlot(slotBuckets[s.key]));
            anytime = sortSlot(anytime);
            const lines = [];
            lines.push(`📌 Update Progress WO Installation IKR – ${branch}`);
            lines.push(`🗓️ ${tanggal}`);
            lines.push("");
            lines.push("Summary Status  ");
            for (const k of SUMMARY_ORDER) lines.push(`${SUMMARY_EMOJI[k]} ${k} : ${summary[k]}`);
            lines.push("");
            lines.push(`📋 Total WO Open : ${rows.length}`);
            for (const slot of TIME_SLOTS) {
                lines.push("");
                lines.push(`⏰ ${slot.label}  `);
                const sr = slotBuckets[slot.key];
                if (sr.length) sr.forEach(r => lines.push(formatRow(r))); else lines.push("-");
            }
            lines.push("");
            lines.push("⚪️Sameday (Anytime)  ");
            if (anytime.length) anytime.forEach(r => lines.push(formatRow(r))); else lines.push("-");
            laporanList.push(lines.join("\n"));
        }
        const hasil = laporanList.join("\n\n====================\n\n");
        document.getElementById("output").textContent = hasil;
        const stats = document.getElementById("stats");
        stats.innerHTML = "";
        for (const k of SUMMARY_ORDER) {
            const el = document.createElement("div");
            el.className = "stat " + STAT_CLASS[k];
            el.innerHTML = `<div class="num">${totalAll[k]}</div><div class="lbl"><span class="dot"></span><span>${STAT_SHORT[k]}</span></div>`;
            stats.appendChild(el);
        }
        document.getElementById("resCount").textContent = branches.length + " branch · " + parsedRows.length + " WO";
        document.getElementById("results").style.display = "block";
        setStatus("Selesai — " + branches.length + " branch tersusun", "ok");
        document.getElementById("results").scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    } catch (err) {
        setStatus("Error: " + err.message, "err");
    }
}

function copyResult() {
    const text = document.getElementById("output").textContent;
    navigator.clipboard.writeText(text).then(() => {
        const b = document.getElementById("btnCopy");
        const orig = b.innerHTML;
        b.classList.add("ok");
        b.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tersalin';
        setTimeout(() => {
            b.classList.remove("ok");
            b.innerHTML = orig;
        }, 1800);
    });
}

function setStatus(msg, type) {
    const el = document.getElementById("status");
    el.textContent = msg;
    el.className = "statusline" + (type ? " " + type : "");
}