(function() {
    "use strict";
    var UP_VISIBLE = [ "CUST_ACCT", "OFFERNUM", "Branch", "Site ID", "Customer Name", "Address", "Job Type", "Job Task", "SCH Date", "SCH Time", "Installer", "Konfirmasi Pergeseran Slot Time", "Result Choice", "Result Remark", "STATUS1", "CA Partner", "TMFID" ];
    var UP_WIDTHS = {
        1: 11,
        2: 9.14,
        3: 9.14,
        4: 10.43,
        5: 9.14,
        6: 34.29,
        7: 9.43,
        8: 9.14,
        9: 8.71,
        10: 12.71,
        11: 9.86,
        12: 18.57,
        13: 18.57,
        14: 16,
        15: 10.86,
        16: 10.86,
        17: 7.86,
        18: 8.14,
        19: 12.43,
        20: 3.57,
        24: 30.57,
        82: 10.43,
        83: 31
    };
    var UP_FMT = {
        OFFERNUM: "0",
        WORDER: "m/d/yyyy",
        "SCH Date": "d/mm/yyyy",
        "Input Date": "m/d/yyyy",
        "Report Date": "m/d/yyyy",
        "Update Date": "m/d/yyyy",
        CloseDate: "m/d/yyyy"
    };
    var UP_DATECOLS = [ "WORDER", "SCH Date", "Input Date", "Report Date", "Update Date", "CloseDate" ];
    var WCT_VISIBLE = [ "Customer Account", "Customer Name", "Workorder No.", "Plan Arrival Time", "Techician Code", "CA Partner ID", "Task Type", "ServCo", "Status", "Reason", "Detail", "Result Remark", "Job Task", "HomePass ID", "Wip Comments" ];
    var WCT_WIDTHS = {
        1: 11,
        2: 9.14,
        3: 13,
        4: 10.43,
        5: 9.14,
        6: 34.29,
        7: 9.43,
        8: 9.14,
        9: 8.71,
        10: 18.43,
        11: 13,
        12: 18.57,
        13: 13,
        14: 16,
        15: 10.86,
        16: 10.86,
        17: 7.86,
        18: 8.14,
        19: 12.43,
        20: 19.86,
        21: 9.14,
        22: 13,
        23: 12.86,
        24: 30.57,
        25: 9.14,
        26: 13,
        27: 10.43,
        28: 9.14,
        29: 13,
        30: 13,
        31: 9.14,
        32: 13,
        33: 9.14,
        34: 9.14,
        35: 9.14,
        36: 9.14,
        37: 13,
        38: 96.29,
        39: 9.14,
        40: 13,
        41: 13,
        42: 13,
        43: 14.57,
        44: 9.14,
        45: 13
    };
    var SLOT_LABEL = {
        plan: "Plan Surabaya/Gresik",
        planBatam: "Plan Batam",
        wo: "WO Report",
        wct: "WCT",
        sameday: "Sameday"
    };
    var WAJIB = [ "wct" ];
    var INTERNAL_HDR = [ "CUST_ACCT", "OFFERNUM", "Branch", "Site ID", "Customer Name", "Address", "Job Type", "Job Task", "WORDER", "SCH Date", "SCH Time", "Installer", "Result Choice", "Result Remark", "STATUS1", "CA Partner", "TMFID", "WIP Comment" ];
    function daerahBatam(v) {
        return /^\s*batam/i.test(txt(v));
    }
    function isDate(v) {
        return v instanceof Date && !isNaN(v);
    }
    function txt(v) {
        if (v === null || v === undefined) return "";
        if (isDate(v)) return v.toISOString();
        return String(v).replace(/_x000D_/g, "").replace(/\r/g, "").trim();
    }
    function key(v) {
        var s = txt(v);
        if (/^-?\d+\.0+$/.test(s)) s = s.replace(/\.0+$/, "");
        return s;
    }
    function pad8(v) {
        var s = key(v);
        return s && /^\d+$/.test(s) ? ("00000000" + s).slice(-Math.max(8, s.length)) : s;
    }
    function serialToDate(n) {
        return new Date(Math.round((n - 25569) * 864e5));
    }
    function toDate(v) {
        if (isDate(v)) return v;
        if (typeof v === "number" && isFinite(v) && v > 0) return serialToDate(v);
        var s = txt(v);
        if (!s) return "";
        if (/^\d+(\.\d+)?$/.test(s)) return serialToDate(Number(s));
        var m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
        if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)));
        m = s.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
        if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)));
        return s;
    }
    function headerRow(grid, needle) {
        for (var r = 0; r < Math.min(6, grid.length); r++) {
            var row = (grid[r] || []).map(txt);
            if (row.indexOf(needle) !== -1) return r;
        }
        return -1;
    }
    function jenisPlan(grid, hr, hdr) {
        var ib = hdr.indexOf("Service Territory");
        if (ib < 0) ib = hdr.indexOf("Branch");
        if (ib < 0) return "plan";
        var total = 0, batam = 0;
        for (var r = hr + 1; r < grid.length; r++) {
            var v = txt((grid[r] || [])[ib]);
            if (!v) continue;
            total++;
            if (daerahBatam(v)) batam++;
        }
        return total > 0 && batam / total > .5 ? "planBatam" : "plan";
    }
    function classify(grid) {
        if (headerRow(grid, "ID SMD") >= 0) return "sameday";
        var whr = headerRow(grid, "Customer Account");
        if (whr >= 0 && headerRow(grid, "Task Order No.") >= 0) {
            for (var wr = 0; wr < whr; wr++) {
                var wrow = (grid[wr] || []).map(function(x) {
                    return txt(x).toUpperCase();
                });
                if (wrow.indexOf("REGULER") !== -1) return jenisPlan(grid, whr, (grid[whr] || []).map(txt));
            }
            return "wct";
        }
        var hr = headerRow(grid, "CUST_ACCT");
        if (hr < 0) return null;
        var hdr = (grid[hr] || []).map(txt);
        if (hdr.indexOf("Stat GD") !== -1) return "wo";
        if (hdr.indexOf("Konfirmasi Pergeseran Slot Time") !== -1) return jenisPlan(grid, hr, hdr);
        for (var r = 0; r < hr; r++) {
            var row = (grid[r] || []).map(function(x) {
                return txt(x).toUpperCase();
            });
            if (row.indexOf("REGULER") !== -1 || row.indexOf("SAMEDAY") !== -1) return jenisPlan(grid, hr, hdr);
        }
        return hr === 0 ? "wo" : jenisPlan(grid, hr, hdr);
    }
    function table(grid, needle) {
        var hr = headerRow(grid, needle);
        if (hr < 0) throw new Error('Header "' + needle + '" tidak ketemu');
        var header = (grid[hr] || []).map(txt);
        var rows = [];
        for (var r = hr + 1; r < grid.length; r++) {
            var raw = grid[r] || [];
            var any = false;
            for (var i = 0; i < raw.length; i++) if (txt(raw[i]) !== "") {
                any = true;
                break;
            }
            if (!any) continue;
            var o = {}, arr = [];
            for (var c = 0; c < header.length; c++) {
                var val = raw[c] === undefined ? "" : raw[c];
                o[header[c]] = val;
                arr.push(val);
            }
            o.__arr = arr;
            rows.push(o);
        }
        return {
            header: header,
            rows: rows
        };
    }
    function planWctTable(grid) {
        var hr = headerRow(grid, "Customer Account");
        if (hr < 0) throw new Error('Header "Customer Account" tidak ketemu di plan');
        var header = (grid[hr] || []).map(txt), rows = [];
        for (var r = hr + 1; r < grid.length; r++) {
            var raw = grid[r] || [];
            var first = txt(raw[0]).toUpperCase();
            if (first === "SAMEDAY") break;
            if (!first || first === "REGULER" || first === "CUSTOMER ACCOUNT") continue;
            var o = {}, arr = [];
            for (var c = 0; c < header.length; c++) {
                var val = raw[c] === undefined ? "" : raw[c];
                o[header[c]] = val;
                arr.push(val);
            }
            o.__arr = arr;
            rows.push(o);
        }
        return {
            header: header,
            rows: rows
        };
    }
    function build(src) {
        var planFormatWct = !!src.plan && headerRow(src.plan, "Customer Account") >= 0;
        var planRaw = src.plan ? planFormatWct ? planWctTable(src.plan) : table(src.plan, "CUST_ACCT") : null;
        var planBFormatWct = !!src.planBatam && headerRow(src.planBatam, "Customer Account") >= 0;
        var planBRaw = src.planBatam ? planBFormatWct ? planWctTable(src.planBatam) : table(src.planBatam, "CUST_ACCT") : null;
        if (!planRaw && !planBRaw) throw new Error("Upload minimal salah satu: Plan Surabaya/Gresik atau Plan Batam");
        var woT = src.wo ? table(src.wo, "CUST_ACCT") : null;
        var HDR = woT ? woT.header : planRaw && !planFormatWct ? planRaw.header : planBRaw && !planBFormatWct ? planBRaw.header : INTERNAL_HDR.slice();
        var I = {};
        HDR.forEach(function(h, i) {
            I[h] = i;
        });
        [ "CUST_ACCT", "Site ID", "Branch", "Job Task", "WORDER", "SCH Date", "SCH Time", "Installer", "Result Choice", "Result Remark", "STATUS1", "CA Partner", "TMFID", "Job Type" ].forEach(function(h) {
            if (!(h in I)) throw new Error('Kolom "' + h + '" tidak ada di plan reguler');
        });
        var wctT = table(src.wct, "Customer Account");
        var OUT_HDR = wctT.header.slice();
        if (planRaw && !planFormatWct && planRaw.header.length !== HDR.length) throw new Error("Jumlah kolom plan Surabaya/Gresik (" + planRaw.header.length + ") beda dari WO Report (" + HDR.length + ")");
        if (planBRaw && !planBFormatWct && planBRaw.header.length !== HDR.length) throw new Error("Jumlah kolom plan Batam (" + planBRaw.header.length + ") beda dari WO Report (" + HDR.length + ")");
        var pisah = !!planBRaw;
        if (!planRaw) planRaw = {
            header: HDR,
            rows: []
        };
        if (!woT) woT = {
            header: HDR,
            rows: []
        };
        var smdT = src.sameday ? table(src.sameday, "ID SMD") : {
            header: [],
            rows: []
        };
        function isNI(v) {
            return txt(v).toUpperCase() === "NEW INSTALL";
        }
        function validWOInstaller(v) {
            var k = key(v);
            return k !== "950" && k !== "-";
        }
        var woC = woT.rows.filter(function(r) {
            return validWOInstaller(r["Installer"]) && /centrin/i.test(txt(r["WIP Comment"])) && isNI(r["Job Task"]);
        });
        var smdC = smdT.rows.filter(function(r) {
            return txt(r["SMD Type"]).toUpperCase() === "CENTRIN" && isNI(r["Job Task"]);
        });
        var wctC = wctT.rows.filter(function(r) {
            return txt(r["ServCo"]) === "Centrin Online" && isNI(r["Job Task"]);
        });
        var woM = {}, wctM = {};
        woC.forEach(function(r) {
            var k = key(r["CUST_ACCT"]);
            if (k && !(k in woM)) woM[k] = r;
        });
        wctC.forEach(function(r) {
            var k = key(r["Customer Account"]);
            if (k && !(k in wctM)) wctM[k] = r;
        });
        function blank() {
            var a = [];
            for (var i = 0; i < HDR.length; i++) a.push("");
            return a;
        }
        function widen(arr) {
            var a = arr.slice(0, HDR.length);
            while (a.length < HDR.length) a.push("");
            return a;
        }
        function fromWO(s) {
            var row = widen(s.__arr);
            row[I["Site ID"]] = pad8(row[I["Site ID"]]);
            row.__wo = s;
            return row;
        }
        function applyWCT(row, s) {
            row[I["Branch"]] = txt(s["Service Territory"]).toUpperCase();
            row[I["Site ID"]] = pad8(s["HomePass ID"]);
            row[I["Job Task"]] = txt(s["Job Task"]);
            row[I["WORDER"]] = "";
            row[I["SCH Date"]] = toDate(s["Schedule Date"]);
            row[I["Installer"]] = txt(s["Techician Code"]);
            row[I["Result Choice"]] = txt(s["Status"]);
            row[I["Result Remark"]] = txt(s["Result Remark"]);
            row[I["STATUS1"]] = txt(s["Status"]);
            row[I["CA Partner"]] = key(s["CA Partner ID"]);
            row.__wct = s;
            return row;
        }
        function newFromWCT(s) {
            var row = blank();
            row[I["CUST_ACCT"]] = key(s["Customer Account"]);
            row[I["OFFERNUM"]] = txt(s["Workorder No."]);
            row[I["Customer Name"]] = txt(s["Customer Name"]);
            row[I["Address"]] = txt(s["Address"]);
            row[I["Job Type"]] = "IN";
            row[I["SCH Time"]] = "Anytime";
            row[I["TMFID"]] = txt(s["WO Partner ID"]);
            return applyWCT(row, s);
        }
        function internalPlanWct(s) {
            var arr = newFromWCT(s), o = {};
            HDR.forEach(function(h, i) {
                o[h] = arr[i];
            });
            o.__arr = arr;
            o.__wct = s;
            return o;
        }
        var plan = planFormatWct ? {
            header: HDR,
            rows: planRaw.rows.map(internalPlanWct)
        } : planRaw;
        var planB = planBRaw ? planBFormatWct ? {
            header: HDR,
            rows: planBRaw.rows.map(internalPlanWct)
        } : planBRaw : null;
        function newFromSMD(s) {
            var row = blank();
            row[I["CUST_ACCT"]] = key(s["Account"]);
            row[I["OFFERNUM"]] = key(s["Offernum"]);
            row[I["Branch"]] = txt(s["Branch"]);
            row[I["Site ID"]] = pad8(s["Site ID"]);
            row[I["Customer Name"]] = txt(s["Customer Name"]);
            row[I["Address"]] = txt(s["Address"]);
            row[I["Job Type"]] = "IN";
            row[I["Job Task"]] = txt(s["Job Task"]);
            row[I["WORDER"]] = "";
            row[I["SCH Date"]] = "";
            row[I["SCH Time"]] = "Anytime";
            row[I["Installer"]] = txt(s["Team"]) || "-";
            row[I["CA Partner"]] = key(s["Account P"]);
            row[I["TMFID"]] = txt(s["WOID P"]);
            return row;
        }
        function bangunReguler(rows) {
            var out = [], miss = [], cWO = 0, cWCT = 0;
            rows.forEach(function(p) {
                var k = key(p["CUST_ACCT"]);
                if (wctM[k]) {
                    out.push(applyWCT(widen(p.__arr), wctM[k]));
                    cWCT++;
                } else if (woM[k]) {
                    out.push(fromWO(woM[k]));
                    cWO++;
                } else {
                    var row = widen(p.__arr);
                    if (p.__wct) row.__wct = p.__wct;
                    row[I["Site ID"]] = pad8(row[I["Site ID"]]);
                    out.push(row);
                    miss.push({
                        acct: k,
                        name: txt(p["Customer Name"]),
                        branch: txt(p["Branch"])
                    });
                }
            });
            return {
                rows: out,
                missing: miss,
                fromWO: cWO,
                fromWCT: cWCT
            };
        }
        var planKeys = {};
        plan.rows.forEach(function(p) {
            planKeys[key(p["CUST_ACCT"])] = true;
        });
        if (planB) planB.rows.forEach(function(p) {
            planKeys[key(p["CUST_ACCT"])] = true;
        });
        var regS = bangunReguler(plan.rows);
        var regB = planB ? bangunReguler(planB.rows) : null;
        var sdS = [], sdB = [], used = {};
        var stS = {
            sWO: 0,
            sSMD: 0,
            sWCT: 0
        }, stB = {
            sWO: 0,
            sSMD: 0,
            sWCT: 0
        };
        Object.keys(planKeys).forEach(function(k) {
            used[k] = true;
        });
        function taruh(row, keBatam, jenis) {
            if (pisah && keBatam) {
                sdB.push(row);
                stB[jenis]++;
            } else {
                sdS.push(row);
                stS[jenis]++;
            }
        }
        wctC.forEach(function(r) {
            var k = key(r["Customer Account"]);
            if (k && !used[k]) {
                used[k] = true;
                taruh(newFromWCT(r), daerahBatam(r["Service Territory"]), "sWCT");
            }
        });
        woC.forEach(function(r) {
            var k = key(r["CUST_ACCT"]);
            if (k && !used[k]) {
                used[k] = true;
                taruh(fromWO(r), daerahBatam(r["Branch"]), "sWO");
            }
        });
        smdC.forEach(function(r) {
            var k = key(r["Account"]);
            if (k && !used[k]) {
                used[k] = true;
                taruh(newFromSMD(r), daerahBatam(r["Branch"]), "sSMD");
            }
        });
        var umum = {
            woRows: woT.rows.length,
            woCentrin: woC.length,
            wctRows: wctC.length,
            smdRows: smdT.rows.length,
            smdCentrin: smdC.length
        };
        function gabung(a, b) {
            var o = {};
            Object.keys(a).forEach(function(k) {
                o[k] = a[k];
            });
            Object.keys(b).forEach(function(k) {
                o[k] = b[k];
            });
            return o;
        }
        return {
            header: HDR,
            outputHeader: OUT_HDR,
            reguler: regS.rows,
            sameday: sdS,
            missing: regS.missing,
            stats: gabung(umum, {
                planTotal: plan.rows.length,
                fromWO: regS.fromWO,
                fromWCT: regS.fromWCT,
                notFound: regS.missing.length,
                sWO: stS.sWO,
                sSMD: stS.sSMD,
                sWCT: stS.sWCT
            }),
            batam: planB ? {
                header: HDR,
                outputHeader: OUT_HDR,
                reguler: regB.rows,
                sameday: sdB,
                missing: regB.missing,
                stats: gabung(umum, {
                    planTotal: planB.rows.length,
                    fromWO: regB.fromWO,
                    fromWCT: regB.fromWCT,
                    notFound: regB.missing.length,
                    sWO: stB.sWO,
                    sSMD: stB.sSMD,
                    sWCT: stB.sWCT
                })
            } : null
        };
    }
    var BATAM_WCT_HDR = [ "Customer Account", "Customer Name", "Workorder No.", "Request No.", "Task Order No.", "Task Status", "Field Service", "Address", "Create Time", "Plan Arrival Time", "Arrival Time", "Complete Time", "Longitude", "Latitude", "Priority", "Techician Code", "Create User Code", "Team", "CA Partner ID", "WO Partner ID", "Sales Group", "Sameday Type", "Task Type", "ServCo", "Crew", "Service Territory", "Status", "Reason", "Detail", "Result Remark", "TC Dummy Status", "Jeopardy", "Job Task", "SCA", "HomePass ID", "Fiber Node", "Network Id", "Wip Comments", "Main Prob", "Main Fix", "SQ Times", "Facing Times", "Schedule Date", "Contract Type", "Special Instruction" ];
    var BATAM_VIS_COLS = [ 1, 2, 3, 11, 13, 16, 19, 22, 23, 24, 26, 27, 28, 29, 30, 32, 33, 35, 37, 38, 40, 41, 42 ];
    for (var _c = 46; _c <= 83; _c++) BATAM_VIS_COLS.push(_c);
    var BATAM_WIDTHS = {
        1: 11,
        2: 9.14,
        3: 13,
        4: 10.43,
        5: 9.14,
        6: 34.29,
        7: 9.43,
        8: 9.14,
        9: 8.71,
        10: 18.43,
        11: 13,
        12: 18.57,
        13: 13,
        14: 16,
        15: 10.86,
        16: 10.86,
        17: 7.86,
        18: 8.14,
        19: 12.43,
        20: 19.86,
        21: 9.14,
        22: 13,
        23: 12.86,
        24: 30.57,
        25: 9.14,
        26: 13,
        27: 10.43,
        28: 9.14,
        29: 13,
        30: 13,
        31: 9.14,
        32: 13,
        33: 9.14,
        34: 9.14,
        35: 9.14,
        36: 9.14,
        37: 13,
        38: 15.86,
        39: 9.14,
        40: 13,
        41: 13,
        42: 13,
        43: 14.57,
        44: 9.14,
        45: 18.57,
        82: 10.43,
        83: 31
    };
    function writeBook(res, isBatam) {
        var HDR = res.outputHeader || res.header, N = HDR.length;
        var PHDR = res.header;
        var PI = {};
        PHDR.forEach(function(h, i) {
            PI[h] = i;
        });
        var PLAN_TO_WCT = {
            "Customer Account": "CUST_ACCT",
            "Customer Name": "Customer Name",
            "Workorder No.": "OFFERNUM",
            Address: "Address",
            "Service Territory": "Branch",
            "Techician Code": "Installer",
            "CA Partner ID": "CA Partner",
            "WO Partner ID": "TMFID",
            Status: "STATUS1",
            "Result Remark": "Result Remark",
            "Job Task": "Job Task",
            "HomePass ID": "Site ID",
            "Wip Comments": "WIP Comment",
            "Schedule Date": "SCH Date"
        };
        function toOutput(vals) {
            var source = vals.__wct || vals.__wo;
            if (source) {
                return HDR.map(function(h) {
                    if (vals.__wct && Object.prototype.hasOwnProperty.call(source, h)) return source[h];
                    var ph = PLAN_TO_WCT[h];
                    return ph && PI[ph] !== undefined ? vals[PI[ph]] : "";
                });
            }
            return HDR.map(function(h) {
                var ph = PLAN_TO_WCT[h];
                return ph && PI[ph] !== undefined ? vals[PI[ph]] : "";
            });
        }
        var wb = new ExcelJS.Workbook;
        var ws = wb.addWorksheet("Sheet1");
        wb.addWorksheet("Sheet2");
        wb.addWorksheet("Sheet3");
        var dateSet = {};
        UP_DATECOLS.forEach(function(h) {
            dateSet[h] = true;
        });
        function push(vals, isSameday) {
            var out = [];
            vals = toOutput(vals);
            if (isSameday) {
                var iTaskType = HDR.indexOf("Task Type");
                var iServCo = HDR.indexOf("ServCo");
                if (iTaskType >= 0 && !txt(vals[iTaskType])) vals[iTaskType] = "Sameday Task";
                if (iServCo >= 0 && !txt(vals[iServCo])) vals[iServCo] = "Centrin Online";
            }
            for (var c = 0; c < N; c++) {
                var v = vals[c], h = HDR[c];
                if (dateSet[h]) v = toDate(v); else if (isDate(v)) v = v; else if (h === "OFFERNUM") {
                    var s = key(v);
                    v = /^\d+$/.test(s) ? Number(s) : s;
                } else if (h === "CUST_ACCT" || h === "Site ID" || h === "CA Partner") v = key(v); else v = txt(v);
                out.push(v === "" ? null : v);
            }
            ws.addRow(out);
        }
        function label(t) {
            var r = ws.addRow([ t ]);
            for (var c = 1; c <= N; c++) r.getCell(c).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: "FFFFFF00"
                }
            };
        }
        function head(hdrList) {
            var list = hdrList || HDR;
            var rowVals = [];
            for (var i = 0; i < N; i++) rowVals.push(list[i] || null);
            var r = ws.addRow(rowVals);
            for (var c = 1; c <= N; c++) {
                var cell = r.getCell(c);
                cell.font = {
                    name: "Calibri",
                    size: 11,
                    bold: true
                };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: {
                        argb: "FFFFC000"
                    }
                };
            }
        }
        label("REGULER");
        head();
        res.reguler.forEach(function(v) {
            push(v, false);
        });
        ws.addRow([]);
        ws.addRow([]);
        label("SAMEDAY");
        head();
        res.sameday.forEach(function(v) {
            push(v, true);
        });
        var thin = {
            style: "thin"
        };
        var border = {
            top: thin,
            left: thin,
            bottom: thin,
            right: thin
        };
        for (var r = 1; r <= ws.rowCount; r++) {
            var row = ws.getRow(r);
            for (var c = 1; c <= N; c++) {
                var cell = row.getCell(c);
                cell.border = border;
                if (!cell.font) cell.font = {
                    name: "Calibri",
                    size: 11
                };
                var f = UP_FMT[HDR[c - 1]];
                if (f && r > 2) cell.numFmt = f;
            }
        }
        var vis = {};
        WCT_VISIBLE.forEach(function(h) {
            vis[h] = true;
        });
        for (var c2 = 1; c2 <= N; c2++) {
            var col = ws.getColumn(c2);
            col.width = WCT_WIDTHS[c2] || 13;
            col.hidden = !vis[HDR[c2 - 1]];
        }
        return wb;
    }
    var upFiles = [], upRes = null;
    var ORDER = [ "plan", "planBatam", "wo", "wct", "sameday" ];
    var elDrop = document.getElementById("upDrop");
    var elInput = document.getElementById("upFileInput");
    var elSlots = document.getElementById("upSlots");
    var elGen = document.getElementById("upBtnGen");
    var elClear = document.getElementById("upBtnClear");
    var elDl = document.getElementById("upBtnDl");
    var elDlB = document.getElementById("upBtnDlBatam");
    var elResult = document.getElementById("upResults");
    function upStatus(msg, type) {
        var el = document.getElementById("upStatus");
        el.textContent = msg;
        el.className = "statusline" + (type ? " " + type : "");
    }
    function tally() {
        var c = {};
        upFiles.forEach(function(f) {
            if (f.kind) c[f.kind] = (c[f.kind] || 0) + 1;
        });
        return c;
    }
    function renderSlots() {
        if (upFiles.length) elDrop.classList.add("compact"); else elDrop.classList.remove("compact");
        var isi = {}, lebih = [];
        upFiles.forEach(function(f, i) {
            if (f.kind && !isi[f.kind]) isi[f.kind] = {
                f: f,
                i: i
            }; else lebih.push({
                f: f,
                i: i
            });
        });
        function pilihan(idx, kind) {
            var opts = ORDER.map(function(k) {
                return '<option value="' + k + '"' + (kind === k ? " selected" : "") + ">" + SLOT_LABEL[k] + "</option>";
            }).join("");
            return '<select class="sl-sel" data-i="' + idx + '">' + (kind ? "" : '<option value="" selected>pilih jenis</option>') + opts + "</select>";
        }
        function hapus(idx) {
            return '<div class="fc-x" data-del="' + idx + '" title="Hapus">✕</div>';
        }
        var kartu = ORDER.map(function(k, n) {
            var e = isi[k];
            if (!e) {
                var opsional = WAJIB.indexOf(k) < 0;
                var ket = k === "plan" || k === "planBatam" ? "wajib salah satu" : opsional ? "belum ada, opsional" : "belum ada";
                return '<div class="slot empty">' + '<div class="sl-ico">' + (n + 1) + "</div>" + '<div class="sl-body"><div class="sl-key">' + SLOT_LABEL[k] + "</div>" + '<div class="sl-file kosong">' + ket + "</div></div></div>";
            }
            return '<div class="slot filled">' + '<div class="sl-ico">✓</div>' + '<div class="sl-body">' + '<div class="sl-key">' + SLOT_LABEL[k] + "</div>" + '<div class="sl-file" title="' + e.f.name + '">' + e.f.name + "</div>" + pilihan(e.i, e.f.kind) + "</div>" + hapus(e.i) + "</div>";
        });
        lebih.forEach(function(e) {
            kartu.push('<div class="slot bad">' + '<div class="sl-ico">!</div>' + '<div class="sl-body">' + '<div class="sl-key">' + (e.f.kind ? "dobel" : "belum dikenali") + "</div>" + '<div class="sl-file" title="' + e.f.name + '">' + e.f.name + "</div>" + pilihan(e.i, e.f.kind) + "</div>" + hapus(e.i) + "</div>");
        });
        elSlots.innerHTML = kartu.join("");
        var kurang = WAJIB.filter(function(k) {
            return !isi[k];
        });
        var adaPlan = !!isi.plan || !!isi.planBatam;
        var siap = !kurang.length && adaPlan && !lebih.length;
        var N = 2;
        var terpenuhi = (isi.wct ? 1 : 0) + (adaPlan ? 1 : 0);
        elGen.disabled = !siap;
        elGen.textContent = siap ? "Susun Report Centrin" : "Susun Report Centrin (" + terpenuhi + "/" + N + ")";
        if (!upFiles.length) upStatus("Butuh WCT dan minimal salah satu Plan", ""); else if (lebih.length) upStatus(lebih.length + " file belum kebagian slot, betulkan lewat dropdown", "err"); else if (kurang.length || !adaPlan) {
            var belum = kurang.map(function(k) {
                return SLOT_LABEL[k];
            });
            if (!adaPlan) belum.push("Plan Surabaya/Gresik atau Plan Batam");
            upStatus("Belum ada: " + belum.join(", "), "");
        } else if (isi["planBatam"]) upStatus(Object.keys(isi).length + " file siap disusun, jadi 2 keluaran", "ok"); else upStatus(Object.keys(isi).length + " file siap disusun. Plan Batam belum ada, jadi 1 keluaran", "ok");
        Array.prototype.forEach.call(elSlots.querySelectorAll(".sl-sel"), function(sel) {
            sel.addEventListener("change", function() {
                upFiles[+sel.getAttribute("data-i")].kind = sel.value || null;
                elResult.style.display = "none";
                renderSlots();
            });
        });
        Array.prototype.forEach.call(elSlots.querySelectorAll("[data-del]"), function(x) {
            x.addEventListener("click", function() {
                upFiles.splice(+x.getAttribute("data-del"), 1);
                elResult.style.display = "none";
                renderSlots();
            });
        });
    }
    function readOne(file) {
        return new Promise(function(resolve, reject) {
            var fr = new FileReader;
            fr.onerror = function() {
                reject(new Error("Gagal baca " + file.name));
            };
            fr.onload = function(e) {
                try {
                    var wb = XLSX.read(new Uint8Array(e.target.result), {
                        type: "array",
                        cellDates: false
                    });
                    var ws = wb.Sheets[wb.SheetNames[0]];
                    var grid = XLSX.utils.sheet_to_json(ws, {
                        header: 1,
                        defval: "",
                        raw: true,
                        blankrows: true
                    });
                    resolve({
                        name: file.name,
                        grid: grid,
                        kind: classify(grid)
                    });
                } catch (err) {
                    reject(new Error(file.name + ": " + err.message));
                }
            };
            fr.readAsArrayBuffer(file);
        });
    }
    function handleFiles(list) {
        var files = Array.prototype.slice.call(list);
        if (!files.length) return;
        upStatus("Membaca " + files.length + " file…", "");
        Promise.all(files.map(readOne)).then(function(out) {
            out.forEach(function(o) {
                var ix = -1;
                for (var i = 0; i < upFiles.length; i++) if (upFiles[i].name === o.name) {
                    ix = i;
                    break;
                }
                if (ix >= 0) upFiles[ix] = o; else upFiles.push(o);
            });
            renderSlots();
        }).catch(function(err) {
            upStatus(err.message, "err");
        });
    }
    [ "dragover", "dragenter" ].forEach(function(ev) {
        elDrop.addEventListener(ev, function(e) {
            e.preventDefault();
            elDrop.classList.add("drag");
        });
    });
    [ "dragleave", "dragend" ].forEach(function(ev) {
        elDrop.addEventListener(ev, function(e) {
            e.preventDefault();
            elDrop.classList.remove("drag");
        });
    });
    elDrop.addEventListener("drop", function(e) {
        e.preventDefault();
        elDrop.classList.remove("drag");
        handleFiles(e.dataTransfer.files);
    });
    elInput.addEventListener("change", function() {
        handleFiles(elInput.files);
        elInput.value = "";
    });
    elClear.addEventListener("click", function() {
        upFiles = [];
        upRes = null;
        elResult.style.display = "none";
        renderSlots();
        upStatus("", "");
    });
    elGen.addEventListener("click", function() {
        upStatus("Menyusun…", "");
        elResult.style.display = "none";
        try {
            var pick = {};
            upFiles.forEach(function(f) {
                if (f.kind && !(f.kind in pick)) pick[f.kind] = f.grid;
            });
            upRes = build(pick);
            var s = upRes.stats, B = upRes.batam;
            function rincian(r, judul) {
                var t = r.stats;
                return (judul ? '<div><div class="k">— ' + judul + ' —</div><div class="v"></div></div>' : "") + '<div><div class="k">Reguler</div><div class="v">' + r.reguler.length + "</div></div>" + '<div><div class="k">Sameday</div><div class="v">' + r.sameday.length + "</div></div>" + '<div><div class="k">Total baris</div><div class="v">' + (r.reguler.length + r.sameday.length) + "</div></div>" + '<div><div class="k">Reguler ← WO</div><div class="v">' + t.fromWO + "</div></div>" + '<div><div class="k">Reguler ← WCT</div><div class="v">' + t.fromWCT + "</div></div>" + '<div><div class="k">Tidak ketemu</div><div class="v" style="color:' + (t.notFound ? "var(--resched)" : "var(--done)") + '">' + t.notFound + "</div></div>" + '<div><div class="k">Sameday ← WO</div><div class="v">' + t.sWO + "</div></div>" + '<div><div class="k">Sameday ← file SMD</div><div class="v">' + t.sSMD + "</div></div>" + '<div><div class="k">Sameday ← WCT</div><div class="v">' + t.sWCT + "</div></div>";
            }
            document.getElementById("upBrk").innerHTML = B ? rincian(upRes, "Surabaya/Gresik") + rincian(B, "Batam") : rincian(upRes);
            function daftarHilang(r, dari) {
                return '<div class="note warn"><b>' + r.stats.notFound + " akun di " + dari + " tidak ketemu</b> di WO report maupun WCT. Barisnya dibiarkan seperti aslinya.<ul>" + r.missing.map(function(m) {
                    return "<li>" + m.acct + " · " + (m.name || "-") + (m.branch ? " · " + m.branch : "") + "</li>";
                }).join("") + "</ul></div>";
            }
            var pesan = "";
            if (B) {
                if (!B.reguler.length && !B.sameday.length) pesan += '<div class="note warn"><b>Keluaran Batam kosong.</b> Plan Batam sudah diunggah ' + "tapi tidak ada satu baris pun yang masuk. Cek apakah slotnya ketuker, " + "lihat dropdown di kartu file di atas.</div>";
                pesan += s.notFound ? daftarHilang(upRes, "plan Surabaya/Gresik") : '<div class="note good">Semua ' + s.planTotal + " akun di plan Surabaya/Gresik ketemu dan sudah diperbarui.</div>";
                pesan += B.stats.notFound ? daftarHilang(B, "plan Batam") : '<div class="note good">Semua ' + B.stats.planTotal + " akun di plan Batam ketemu dan sudah diperbarui.</div>";
            } else {
                pesan = s.notFound ? daftarHilang(upRes, "plan reguler") : '<div class="note good">Semua ' + s.planTotal + " akun di plan reguler ketemu dan sudah diperbarui.</div>";
            }
            document.getElementById("upNote").innerHTML = pesan;
            document.getElementById("upCount").textContent = "WO " + s.woCentrin + "/" + s.woRows + " centrin · WCT " + s.wctRows + " · SMD " + s.smdCentrin + "/" + s.smdRows + " centrin" + (B ? " · 2 keluaran" : "");
            document.getElementById("upDlLabel").textContent = B ? "Unduh Surabaya/Gresik" : "Unduh Excel";
            elDlB.style.display = B ? "" : "none";
            elResult.style.display = "block";
            upStatus("Selesai, siap diunduh", "ok");
            if (elResult.scrollIntoView) elResult.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        } catch (err) {
            upStatus("Error: " + err.message, "err");
        }
    });
    function unduh(res, sisipan) {
        if (!res) return;
        upStatus("Menyiapkan file…", "");
        try {
            var isBatam = sisipan === "Batam";
            var wb = writeBook(res, isBatam);
            var hariIni = new Date;
            var nm = "Update progress WO Installation Centrin " + (sisipan ? sisipan + " " : "") + hariIni.getDate() + " " + BULAN[hariIni.getMonth() + 1] + " " + hariIni.getFullYear();
            wb.xlsx.writeBuffer().then(function(buf) {
                var blob = new Blob([ buf ], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                var a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = nm + ".xlsx";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function() {
                    URL.revokeObjectURL(a.href);
                }, 4e3);
                upStatus("Terunduh: " + nm + ".xlsx", "ok");
            }).catch(function(err) {
                upStatus("Gagal menulis: " + err.message, "err");
            });
        } catch (err) {
            upStatus("Gagal menulis: " + err.message, "err");
        }
    }
    elDl.addEventListener("click", function() {
        unduh(upRes, "");
    });
    elDlB.addEventListener("click", function() {
        unduh(upRes && upRes.batam, "Batam");
    });
    renderSlots();
    window.addEventListener("load", function() {
        var miss = [];
        if (typeof XLSX === "undefined") miss.push("SheetJS");
        if (typeof ExcelJS === "undefined") miss.push("ExcelJS");
        if (miss.length) {
            document.getElementById("upNote").innerHTML = '<div class="note warn"><b>Library gagal dimuat: ' + miss.join(", ") + "</b><br>Jaringan kantor kemungkinan memblokir cdnjs. Minta versi offline.</div>";
            document.getElementById("upResults").style.display = "block";
            elGen.disabled = true;
        }
    });
})();