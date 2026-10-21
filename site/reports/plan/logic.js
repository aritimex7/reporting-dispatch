(function() {
    "use strict";
    var PL_HDR = [ "CUST_ACCT", "OFFERNUM", "Contractor", "Branch", "Site ID", "Customer Name", "Address", "MKTTYPE", "Job Type", "Job Task", "WORDER", "WIP Comment", "Special Instructions", "Route", "SCH Date", "SCH Time", "Routing", "Sales", "OPR_CREATE", "SQ", "Installer", "UPD Installer", "Drop Position", "Konfirmasi Pergeseran Slot Time", "STAT_GT", "Stat GC", "Confirmation Status", "Monitoring Remark", "Need Conf", "CHG SlotTime", "START", "FINISH", "CHRG Cable", "Close By", "Sched Area", "SCA", "C Area", "NET_REPORTED", "Close By WOM", "Close Status WOM", "NET_PIC", "XBOX_MODEM", "XBOX_STB", "Conf By", "Result Choice", "Result Remark", "STATUS1", "STATUS2", "STATUS3", "Next Schedule", "Input Date", "Report Date", "Report By", "Update Date", "Update By", "SMS Stat", "SMS PIC", "TAPFULL_STAT", "TAPFULL_PIC", "Checkin By", "Checkin Stat", "Close By Stat", "RA By", "New Box Type", "SDSTB", "PIC", "CloseDate", "Networkid", "FIBERNODE", "ISLAND_NAME", "Basecamp", "Installer OnlineBooking", "Contractor OnlineBooking", "Installer Team OnlineBooking", "Installer Phone No", "Installer Amdocs", "Contractor Amdocs", "Problem WO", "Fix WO", "demographics1", "Cust Type Desc", "CA Partner", "TMFID" ];
    var PL_VISIBLE = [ "CUST_ACCT", "OFFERNUM", "Branch", "Site ID", "Customer Name", "Address", "Job Type", "Job Task", "SCH Date", "SCH Time", "Installer", "Konfirmasi Pergeseran Slot Time", "Result Choice", "Result Remark", "STATUS1", "CA Partner", "TMFID" ];
    var WO_HDR = PL_HDR.map(function(h) {
        return h === "Konfirmasi Pergeseran Slot Time" ? "Stat GD" : h;
    });
    var WO_VISIBLE = PL_VISIBLE.map(function(h) {
        return h === "Konfirmasi Pergeseran Slot Time" ? "Stat GD" : h;
    });
    var NEXA_HDR = [ "CA Partner" ].concat(PL_HDR.filter(function(h) {
        return h !== "Contractor" && h !== "CA Partner";
    }).map(function(h) {
        return h === "Konfirmasi Pergeseran Slot Time" ? "Stat GD" : h;
    }));
    var NEXA_VISIBLE = [ "CA Partner", "CUST_ACCT", "OFFERNUM", "Branch", "Site ID", "Customer Name", "Address", "Job Type", "Job Task", "WIP Comment", "SCH Date", "SCH Time", "Installer", "START", "FINISH", "SCA", "Result Choice", "Result Remark", "STATUS2", "STATUS3", "Networkid", "FIBERNODE", "TMFID" ];
    var NEXA_WIDTHS = {
        1: 10.42578125,
        2: 11.140625,
        3: 11.28515625,
        4: 11.140625,
        5: 13,
        6: 14.140625,
        7: 16.5703125,
        8: 9.28515625,
        9: 8.7109375,
        10: 12.85546875,
        11: 9.7109375,
        12: 41.28515625,
        13: 20.140625,
        14: 6.28515625,
        15: 15.85546875,
        16: 18.28515625,
        17: 7.85546875,
        18: 5.5703125,
        19: 12.28515625,
        20: 3.42578125,
        21: 8.28515625,
        22: 12.5703125,
        23: 13.140625,
        24: 7.5703125,
        25: 8.7109375,
        26: 7.42578125,
        27: 18.85546875,
        28: 18.42578125,
        29: 10.42578125,
        30: 13.28515625,
        31: 6.42578125,
        32: 6.85546875,
        33: 11.42578125,
        34: 8.42578125,
        35: 10.85546875,
        36: 4.42578125,
        37: 6.7109375,
        38: 14.7109375,
        39: 14.28515625,
        40: 17.7109375,
        41: 8.28515625,
        42: 14.42578125,
        43: 10,
        44: 7.7109375,
        45: 13.140625,
        46: 15,
        47: 8.7109375,
        48: 13,
        49: 13,
        50: 14,
        51: 10.28515625,
        52: 11.5703125,
        53: 9.5703125,
        54: 12.140625,
        55: 10.140625,
        56: 8.7109375,
        57: 8.140625,
        58: 14,
        59: 12.42578125,
        60: 10.5703125,
        61: 11.85546875,
        62: 12.28515625,
        63: 6,
        64: 13.7109375,
        65: 6.42578125,
        66: 3.85546875,
        67: 10,
        68: 13.42578125,
        69: 11,
        70: 14.140625,
        71: 9.85546875,
        72: 22.28515625,
        73: 24.28515625,
        74: 27.7109375,
        75: 17.7109375,
        76: 15.85546875,
        77: 18,
        78: 12.42578125,
        79: 7.42578125,
        80: 14.5703125,
        81: 14.28515625,
        82: 31.7109375
    };
    var NEXA_FMT = {
        OFFERNUM: "0",
        WORDER: "m/d/yyyy",
        "SCH Date": "d/mm/yyyy",
        "Input Date": "m/d/yyyy",
        "Report Date": "m/d/yyyy",
        "Update Date": "m/d/yyyy",
        CloseDate: "m/d/yyyy"
    };
    var INFOCOM_HDR = [ "ACCT ID", "HPID/Site ID", "Nama Pelanggan", "Sales", "Nama Sales", "BRANCH", "RFS Date", "Day Activate", "Format Jadwal", "Source", "Slot Time", "Installer", "Result Choice", "Status", "REMARK INSTALLASI LN", "NEXT SCHEDULE" ];
    var INFOCOM_FMT = {
        "RFS Date": "dd-mmm-yy"
    };
    var WCT_HDR = [ "Customer Account", "Customer Name", "Workorder No.", "Request No.", "Task Order No.", "Task Status", "Field Service", "Address", "Create Time", "Plan Arrival Time", "Arrival Time", "Complete Time", "Longitude", "Latitude", "Priority", "Techician Code", "Create User Code", "Team", "CA Partner ID", "WO Partner ID", "Sales Group", "Sameday Type", "Task Type", "ServCo", "Crew", "Service Territory", "Status", "Reason", "Detail", "Result Remark", "TC Dummy Status", "Jeopardy", "Job Task", "SCA", "HomePass ID", "Fiber Node", "Network Id", "Wip Comments", "Main Prob", "Main Fix", "SQ Times", "Facing Times", "Schedule Date", "Contract Type", "Special Instruction" ];
    var CENTRIN_WCT_VISIBLE = [ "Customer Account", "Customer Name", "Workorder No.", "Plan Arrival Time", "Techician Code", "CA Partner ID", "Task Type", "ServCo", "Status", "Reason", "Detail", "Result Remark", "Job Task", "HomePass ID", "Wip Comments" ];
    var WCT_TEXT_COLS = {
        "Customer Account": true,
        "Workorder No.": true,
        "Request No.": true,
        "Task Order No.": true,
        "CA Partner ID": true,
        "WO Partner ID": true,
        "HomePass ID": true
    };
    var WCT_FMT = {
        "Create Time": "dd-mm-yyyy hh:mm:ss",
        "Plan Arrival Time": "dd-mm-yyyy hh:mm:ss",
        "Arrival Time": "dd-mm-yyyy hh:mm:ss",
        "Complete Time": "dd-mm-yyyy hh:mm:ss",
        "Schedule Date": "yyyy-mm-dd"
    };
    var WCT_DEFAULT_WIDTH = 17.578125;
    var TEMPLATE_DEFS = {
        wct: {
            id: "wct",
            label: "Raw WCT",
            detail: "45 kolom · semua field tampil"
        },
        plan: {
            id: "plan",
            label: "Plan Centrin",
            detail: "83 kolom · format Plan Centrin"
        },
        wo: {
            id: "wo",
            label: "WO Report",
            detail: "83 kolom · format WO Report"
        },
        nexa: {
            id: "nexa",
            label: "template nexa",
            detail: "82 kolom · format NEXA"
        },
        infocom: {
            id: "infocom",
            label: "Plan Infocom",
            detail: "16 kolom · format Infocom"
        }
    };
    var TEMPLATE_ORDER = [ "wct", "plan", "wo", "nexa", "infocom" ];
    var WO_TO_WCT = {
        "Customer Account": "CUST_ACCT",
        "Customer Name": "Customer Name",
        "Workorder No.": "OFFERNUM",
        Address: "Address",
        "Job Task": "Job Task",
        "Create Time": "WORDER",
        "Techician Code": "Installer",
        Team: "Contractor",
        Crew: "Route",
        "Sales Group": "Sales",
        "Create User Code": "OPR_CREATE",
        "CA Partner ID": "CA Partner",
        "WO Partner ID": "TMFID",
        "Result Remark": "Result Remark",
        Reason: "STATUS2",
        Detail: "STATUS3",
        "Special Instruction": "Special Instructions",
        SCA: "SCA",
        "Network Id": "Networkid",
        "Fiber Node": "FIBERNODE",
        "Wip Comments": "WIP Comment",
        "Main Prob": "Problem WO",
        "Main Fix": "Fix WO",
        "SQ Times": "SQ",
        "Service Territory": "Branch",
        "HomePass ID": "Site ID"
    };
    var PL_WIDTHS = {
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
    var PL_FMT = {
        OFFERNUM: "0",
        WORDER: "m/d/yyyy",
        "SCH Date": "d/mm/yyyy",
        "Input Date": "m/d/yyyy",
        "Report Date": "m/d/yyyy",
        "Update Date": "m/d/yyyy",
        CloseDate: "m/d/yyyy"
    };
    var PL_DATECOLS = [ "WORDER", "SCH Date", "Input Date", "Report Date", "Update Date", "CloseDate" ];
    var KUNCI_SIMPAN = "dispatch.plan.katakunci.v3";
    var AWAL_WCT = "";
    var AWAL_WO = "";
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
    function tanggalPolos(d) {
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"]/g, function(c) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;"
            }[c];
        });
    }
    function tanpaSpasi(s) {
        var out = txt(s).toUpperCase().replace(/\s+/g, "");
        return out.replace(/INFOCOM/g, "INFOKOM").replace(/WIZNET/g, "INFOKOM");
    }
    function berisiKata(nilai, kata) {
        var k = tanpaSpasi(kata);
        if (!k) return false;
        return tanpaSpasi(nilai).indexOf(k) >= 0;
    }
    function daerahBatam(v) {
        return /^\s*batam/i.test(txt(v));
    }
    function isCentrin(kata) {
        return kata.toUpperCase().indexOf("CENTRIN") >= 0;
    }
    function partnerDisplay(v) {
        var raw = txt(v).replace(/\s+/g, " ").trim();
        var u = raw.toUpperCase();
        if (!u) return "";
        if (u.indexOf("CENTRIN") >= 0) return "Centrin";
        if (/XL\s*SATU|XLSATU/.test(u)) return "XL SATU";
        if (/SUKMA\s*MEDIA|SUKMAMEDIA/.test(u)) return "SUKMA MEDIA";
        if (u.indexOf("MAYNET") >= 0) return "MAYNET";
        if (u.indexOf("NETIVE") >= 0) return "NETIVE";
        if (u.indexOf("NEXA") >= 0) return "NEXA";
        if (/INFO(?:KOM|COM)|WIZ\s*NET/.test(u)) return "INFOKOM";
        if (/NUSA\s*NET|NUSANET/.test(u)) return "NUSANET";
        if (/TETRA(?:\s*NET)?/.test(u)) return "TETRA";
        return raw;
    }
    function partnerId(v) {
        return tanpaSpasi(partnerDisplay(v));
    }
    function partnerFromWip(v) {
        var raw = txt(v), u = raw.toUpperCase();
        if (!u) return "";
        var pm = raw.match(/Product\s*=\s*\[\s*([\'\"])([\\s\\S]*?)\1/i);
        var scope = pm ? pm[2] : raw;
        var compact = scope.toUpperCase().replace(/\s+/g, "");
        var known = [ "SUKMA MEDIA", "XL SATU", "CENTRIN", "INFOKOM", "INFOCOM", "WIZNET", "MAYNET", "NETIVE", "NEXA", "NUSANET", "TETRA" ];
        for (var i = 0; i < known.length; i++) if (compact.indexOf(known[i].replace(/\s+/g, "")) >= 0) return partnerDisplay(known[i]);
        return "";
    }
    function templateId(v) {
        return v === "plan" || v === "wct" || v === "wo" || v === "nexa" || v === "infocom" || v === "skip" ? v : "";
    }
    function templateDefault(kata, partner) {
        if (partnerId(kata) === "NEXA" && partner && partner.wo > 0) return "nexa";
        return isCentrin(kata) ? "plan" : "wct";
    }
    function salinTemplateMap(map) {
        var out = {};
        Object.keys(map || {}).forEach(function(k) {
            var t = templateId(map[k]), id = partnerId(k);
            if (t && id) out[id] = t;
        });
        return out;
    }
    function templateUntuk(kata, map, partner) {
        var id = partnerId(kata), t = (map || {})[id];
        if (isCentrin(kata) && t === "wo") t = "plan";
        return templateId(t) || templateDefault(kata, partner);
    }
    function rekapPartner(wctRows, woRows) {
        var c = {};
        function tambah(raw, source) {
            var nama = partnerDisplay(raw), id = partnerId(nama);
            if (!id) return;
            var x = c[id] || (c[id] = {
                id: id,
                nama: nama,
                wct: 0,
                wo: 0,
                total: 0,
                alias: [],
                wctTerms: [],
                woTerms: []
            });
            if (source === "wct") x.wct++; else x.wo++;
            x.total++;
            var alias = txt(raw).replace(/\s+/g, " ").trim();
            if (alias && x.alias.indexOf(alias) < 0 && x.alias.length < 4) x.alias.push(alias);
            var terms = source === "wct" ? x.wctTerms : x.woTerms;
            if (nama && terms.indexOf(nama) < 0) terms.push(nama);
        }
        (wctRows || []).forEach(function(r) {
            tambah(r["ServCo"], "wct");
        });
        (woRows || []).forEach(function(r) {
            tambah(partnerFromWip(r["WIP Comment"]) || "UNKNOWN", "wo");
        });
        return Object.keys(c).map(function(id) {
            var x = c[id];
            x.source = x.wct && x.wo ? "WCT + WO" : x.wct ? "WCT" : "WO Report";
            return x;
        }).sort(function(a, b) {
            return b.total - a.total || a.nama.localeCompare(b.nama);
        });
    }
    function headerRow(grid, needle) {
        for (var r = 0; r < Math.min(6, grid.length); r++) {
            var row = (grid[r] || []).map(txt);
            if (row.indexOf(needle) !== -1) return r;
        }
        return -1;
    }
    function classify(grid) {
        if (headerRow(grid, "Customer Account") >= 0 && headerRow(grid, "Task Order No.") >= 0) return "wct";
        if (headerRow(grid, "CUST_ACCT") >= 0 && headerRow(grid, "Stat GD") >= 0) return "wo";
        return null;
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
    function pecahKata(s) {
        var out = [], lihat = {};
        String(s || "").split(",").forEach(function(x) {
            var k = x.trim();
            if (!k) return;
            var n = k.toUpperCase();
            if (lihat[n]) return;
            lihat[n] = true;
            out.push(k);
        });
        return out;
    }
    function bangun(src, opsi) {
        opsi = opsi || {};
        var tanggal = tanggalPolos(opsi.tanggal || new Date);
        var kataWct = pecahKata(opsi.kataWct);
        var kataWo = pecahKata(opsi.kataWo);
        var templateMap = salinTemplateMap(opsi.assignment || opsi.templateMap || {});
        var adaAssignment = Object.keys(templateMap).length > 0;
        var I = {};
        PL_HDR.forEach(function(h, i) {
            I[h] = i;
        });
        var N = PL_HDR.length;
        var woT = src.wo ? table(src.wo, "CUST_ACCT") : {
            rows: [],
            header: []
        };
        var wctT = src.wct ? table(src.wct, "Customer Account") : {
            rows: [],
            header: []
        };
        if (src.wo && woT.header.length !== N) throw new Error("Jumlah kolom WO report (" + woT.header.length + ") beda dari susunan plan (" + N + ")");
        function isNI(r) {
            return txt(r["Job Task"]).toUpperCase() === "NEW INSTALL";
        }
        var woNI = woT.rows.filter(isNI);
        var wctNI = wctT.rows.filter(isNI);
        var partnerCatalog = rekapPartner(wctNI, woNI);
        function hasOwn(o, k) {
            return Object.prototype.hasOwnProperty.call(o, k);
        }
        function blank() {
            var a = [];
            for (var i = 0; i < N; i++) a.push("");
            return a;
        }
        function widen(arr) {
            var a = arr.slice(0, N);
            while (a.length < N) a.push("");
            return a;
        }
        function cocokPartner(r, p, source) {
            if (!p) return false;
            if (source === "wct") return partnerId(r["ServCo"]) === p.id;
            return partnerId(partnerFromWip(r["WIP Comment"]) || "UNKNOWN") === p.id;
        }
        function cocokKata(r, kata, source) {
            if (source === "wo" && partnerId(kata) === "UNKNOWN") return !partnerFromWip(r["WIP Comment"]);
            return source === "wct" ? berisiKata(r["ServCo"], kata) : berisiKata(r["WIP Comment"], kata);
        }
        function cariPartner(kata) {
            var id = partnerId(kata);
            return partnerCatalog.find(function(p) {
                return p.id === id;
            }) || partnerCatalog.find(function(p) {
                return berisiKata(p.nama, kata) || p.alias.some(function(a) {
                    return berisiKata(a, kata);
                });
            }) || null;
        }
        function tambahDef(defs, seen, def) {
            var id = def.partner ? def.partner.id : partnerId(def.kata);
            var marker = id || tanpaSpasi(def.kata);
            if (seen[marker]) return;
            seen[marker] = true;
            def.id = marker;
            defs.push(def);
        }
        function dariWO(s, keyword) {
            var row = widen(s.__arr);
            row[I["Site ID"]] = pad8(row[I["Site ID"]]);
            row[I["SCH Date"]] = tanggal;
            row.__sourceType = "wo";
            row.__sourceRow = s;
            row.__keyword = keyword || "";
            row.__planDate = tanggal;
            return row;
        }
        function dariWCT(s) {
            var row = blank();
            row[I["CUST_ACCT"]] = key(s["Customer Account"]);
            row[I["OFFERNUM"]] = txt(s["Workorder No."]);
            row[I["Branch"]] = txt(s["Service Territory"]);
            row[I["Site ID"]] = pad8(s["HomePass ID"]);
            row[I["Customer Name"]] = txt(s["Customer Name"]);
            row[I["Address"]] = txt(s["Address"]);
            row[I["Job Type"]] = "IN";
            row[I["Job Task"]] = txt(s["Job Task"]);
            row[I["SCH Date"]] = tanggal;
            row[I["SCH Time"]] = "-";
            row[I["Installer"]] = txt(s["Techician Code"]);
            row[I["CA Partner"]] = key(s["CA Partner ID"]);
            row[I["TMFID"]] = txt(s["WO Partner ID"]);
            row.__sourceType = "wct";
            row.__sourceRow = s;
            row.__planDate = tanggal;
            return row;
        }
        var defs = [], seenDef = {};
        if (adaAssignment) {
            partnerCatalog.forEach(function(p) {
                if (hasOwn(templateMap, p.id)) tambahDef(defs, seenDef, {
                    kata: p.nama,
                    partner: p,
                    selected: true
                });
            });
            kataWct.concat(kataWo).forEach(function(k) {
                if (!seenDef[partnerId(k)]) tambahDef(defs, seenDef, {
                    kata: k,
                    partner: cariPartner(k),
                    selected: false
                });
            });
        } else {
            kataWct.concat(kataWo).forEach(function(k) {
                tambahDef(defs, seenDef, {
                    kata: k,
                    partner: cariPartner(k),
                    selected: true
                });
            });
        }
        var urut = defs.map(function(d) {
            return d.kata;
        });
        var kelompok = [], alert = [];
        var kenaWo = {}, kenaWct = {};
        defs.forEach(function(def) {
            var kata = def.kata, partner = def.partner;
            var pakaiWct = kataWct.some(function(x) {
                return x.toUpperCase() === kata.toUpperCase();
            });
            var pakaiWo = kataWo.some(function(x) {
                return x.toUpperCase() === kata.toUpperCase();
            });
            if (partner && adaAssignment) {
                pakaiWct = partner.wct > 0;
                pakaiWo = partner.wo > 0;
            }
            if (adaAssignment && !def.selected) {
                pakaiWct = false;
                pakaiWo = false;
            }
            var brsWct = pakaiWct ? wctNI.filter(function(r) {
                return partner ? cocokPartner(r, partner, "wct") : cocokKata(r, kata, "wct");
            }) : [];
            var brsWo = pakaiWo ? woNI.filter(function(r) {
                return partner ? cocokPartner(r, partner, "wo") : cocokKata(r, kata, "wo");
            }) : [];
            brsWct.forEach(function(r) {
                var k = key(r["Customer Account"]);
                (kenaWct[k] = kenaWct[k] || []).push({
                    kata: kata,
                    id: partner ? partner.id : ""
                });
            });
            brsWo.forEach(function(r) {
                var k = key(r["CUST_ACCT"]);
                (kenaWo[k] = kenaWo[k] || []).push({
                    kata: kata,
                    id: partner ? partner.id : ""
                });
            });
            var template = templateUntuk(kata, templateMap, partner);
            var pecah = isCentrin(kata) && template === "plan";
            var bagian = pecah ? [ {
                suffix: " SBY dan Gresik",
                batam: false
            }, {
                suffix: " Batam",
                batam: true
            } ] : [ {
                suffix: "",
                batam: null
            } ];
            bagian.forEach(function(b) {
                var part = template === "nexa" ? [ {
                    jenis: "wo",
                    suffix: "",
                    format: "nexa"
                }, {
                    jenis: "wct",
                    suffix: " WCT",
                    format: "wct"
                } ] : [ {
                    jenis: "gabung",
                    suffix: "",
                    format: template
                } ];
                var akunTerpakaiNexa = {};
                var akunPrioritasWct = {};
                if (template === "nexa") {
                    brsWct.forEach(function(r) {
                        if (b.batam !== null && daerahBatam(r["Service Territory"]) !== b.batam) return;
                        var k = key(r["Customer Account"]);
                        if (k) akunPrioritasWct[k] = true;
                    });
                }
                part.forEach(function(partition) {
                    var baris = [], dipakai = template === "nexa" ? akunTerpakaiNexa : {};
                    var nWo = 0, nWct = 0;
                    function ambilWct(r) {
                        if (b.batam !== null && daerahBatam(r["Service Territory"]) !== b.batam) return;
                        var k = key(r["Customer Account"]);
                        if (!k || dipakai[k]) return;
                        dipakai[k] = true;
                        baris.push(dariWCT(r));
                        nWct++;
                    }
                    function ambilWo(r) {
                        if (b.batam !== null && daerahBatam(r["Branch"]) !== b.batam) return;
                        var k = key(r["CUST_ACCT"]);
                        if (!k) return;
                        if (template === "nexa" && akunPrioritasWct[k]) {
                            alert.push({
                                t: "Akun ada di dua sumber, yang dipakai WCT",
                                d: kata + " · " + k
                            });
                            return;
                        }
                        if (dipakai[k]) return;
                        dipakai[k] = true;
                        baris.push(dariWO(r, kata));
                        nWo++;
                    }
                    if (partition.jenis === "wct" || partition.jenis === "gabung") brsWct.forEach(ambilWct);
                    if (partition.jenis === "wo" || partition.jenis === "gabung") brsWo.forEach(ambilWo);
                    var sheetName = pecah ? "Plan " + kata + b.suffix : kata + partition.suffix;
                    if (adaAssignment && template === "skip") return;
                    kelompok.push({
                        kata: kata,
                        partnerId: partner ? partner.id : partnerId(kata),
                        sheet: sheetName,
                        label: pecah ? "REGULER" : null,
                        format: partition.format,
                        baris: baris,
                        dariWo: nWo,
                        dariWct: nWct,
                        sumber: (nWo ? "WO" : "") + (nWo && nWct ? "+" : "") + (nWct ? "WCT" : "")
                    });
                });
            });
        });
        var tabrakan = [];
        [ [ kenaWo, "WO Report" ], [ kenaWct, "WCT" ] ].forEach(function(pair) {
            Object.keys(pair[0]).forEach(function(k) {
                var kk = pair[0][k];
                var ids = kk.map(function(x) {
                    return x.id || x.kata;
                }).filter(function(x, i, a) {
                    return a.indexOf(x) === i;
                });
                if (ids.length > 1) tabrakan.push({
                    sumber: pair[1],
                    akun: k,
                    kata: kk.map(function(x) {
                        return x.kata;
                    })
                });
            });
        });
        var perPartner = [];
        var sudahPartner = {};
        partnerCatalog.forEach(function(p) {
            var milik = kelompok.filter(function(g) {
                return g.partnerId === p.id;
            });
            var wo = milik.reduce(function(s, g) {
                return s + g.dariWo;
            }, 0);
            var wct = milik.reduce(function(s, g) {
                return s + g.dariWct;
            }, 0);
            perPartner.push({
                id: p.id,
                nama: p.nama,
                wo: wo,
                wct: wct,
                total: wo + wct,
                detectedWo: p.wo,
                detectedWct: p.wct,
                template: templateUntuk(p.nama, templateMap, p),
                selected: hasOwn(templateMap, p.id) ? templateMap[p.id] !== "skip" : !adaAssignment,
                sheet: milik.filter(function(g) {
                    return g.baris.length;
                }).map(function(g) {
                    return g.sheet;
                }),
                alias: p.alias,
                source: p.source
            });
            sudahPartner[p.id] = true;
        });
        defs.forEach(function(def) {
            var id = def.partner ? def.partner.id : partnerId(def.kata);
            if (!id || sudahPartner[id]) return;
            var milik = kelompok.filter(function(g) {
                return g.id === id || g.kata === def.kata;
            });
            var wo = milik.reduce(function(s, g) {
                return s + g.dariWo;
            }, 0);
            var wct = milik.reduce(function(s, g) {
                return s + g.dariWct;
            }, 0);
            perPartner.push({
                id: id,
                nama: def.kata,
                wo: wo,
                wct: wct,
                total: wo + wct,
                detectedWo: 0,
                detectedWct: 0,
                template: templateUntuk(def.kata, templateMap, def.partner),
                selected: def.selected,
                sheet: milik.map(function(g) {
                    return g.sheet;
                }),
                alias: [],
                source: "keyword"
            });
            sudahPartner[id] = true;
        });
        return {
            header: PL_HDR,
            planDate: tanggal,
            kelompok: kelompok,
            perPartner: perPartner,
            partnerCatalog: partnerCatalog,
            assignment: templateMap,
            assignmentActive: adaAssignment,
            alert: alert,
            tabrakan: tabrakan
        };
    }
    function amanSheet(nama) {
        var s = String(nama || "Sheet").replace(/[\\\/\?\*\[\]:]/g, " ").trim().slice(0, 31);
        return s || "Sheet";
    }
    function woToWct(s, keyword, tanggal) {
        var out = {};
        WCT_HDR.forEach(function(h) {
            out[h] = "";
        });
        Object.keys(WO_TO_WCT).forEach(function(wctH) {
            var planH = WO_TO_WCT[wctH];
            if (out[wctH] === "" || out[wctH] === undefined) out[wctH] = s[planH];
        });
        var jobType = txt(s["Job Type"]).toUpperCase();
        var instruction = txt(s["Special Instructions"]).toUpperCase();
        var status = txt(s["STATUS1"]) || txt(s["Result Choice"]);
        out["Field Service"] = jobType === "UN" ? "Uninstall" : "Install";
        out["Task Status"] = status;
        out["Status"] = status;
        out["Schedule Date"] = tanggal;
        out["ServCo"] = partnerFromWip(s["WIP Comment"]) || "";
        if (/SAME ?DAY/.test(instruction)) {
            out["Sameday Type"] = "Sameday Regular";
            out["Task Type"] = "Sameday Task";
        } else {
            out["Task Type"] = "Regular Task";
        }
        var slot = txt(s["SCH Time"]).replace(/\./g, ":");
        var m = slot.match(/(\d{1,2}):(\d{2})/);
        if (m && tanggal instanceof Date && !isNaN(tanggal)) {
            out["Plan Arrival Time"] = new Date(Date.UTC(tanggal.getUTCFullYear(), tanggal.getUTCMonth(), tanggal.getUTCDate(), +m[1], +m[2], 0));
        }
        return out;
    }
    function nilaiWct(vals, header) {
        var source = vals.__sourceRow || {};
        var obj = vals.__sourceType === "wct" ? source : woToWct(source, vals.__keyword || "", vals.__planDate || new Date);
        var v = obj[header];
        if (header === "Schedule Date" && vals.__planDate) return vals.__planDate;
        if (WCT_TEXT_COLS[header]) {
            if (header === "HomePass ID") return pad8(v);
            return key(v);
        }
        if (WCT_FMT[header]) return toDate(v);
        if (isDate(v)) return v;
        return txt(v);
    }
    function slotInfocomFromHour(hour) {
        if (!isFinite(hour) || hour < 9 || hour >= 18) return "Anytime";
        if (hour < 12) return "09:00-12:00";
        if (hour < 15) return "13:00-15:00";
        return "15:00-18:00";
    }
    function slotInfocomFromText(v) {
        var m = txt(v).replace(/\./g, ":").match(/(\d{1,2}):\d{2}/);
        return m ? slotInfocomFromHour(+m[1]) : "Anytime";
    }
    function infocomRow(vals) {
        var source = vals.__sourceRow || {};
        var isWct = vals.__sourceType === "wct";
        var date = toDate(isWct ? source["Plan Arrival Time"] : source["SCH Date"]);
        var slot = isWct ? function() {
            var d = toDate(source["Plan Arrival Time"]);
            return isDate(d) ? slotInfocomFromHour(d.getUTCHours() + d.getUTCMinutes() / 60) : "Anytime";
        }() : slotInfocomFromText(source["SCH Time"]);
        return [ isWct ? source["Customer Account"] : source["CUST_ACCT"], isWct ? source["HomePass ID"] : source["Site ID"], source["Customer Name"], "VMS", "", isWct ? source["Service Territory"] : source["Branch"], date, "", "", "Reguler", slot, isWct ? source["Techician Code"] : source["Installer"], "", "", "", "" ];
    }
    function barisNexa(vals) {
        return NEXA_HDR.map(function(h) {
            var internal = h === "Stat GD" ? "Konfirmasi Pergeseran Slot Time" : h;
            var i = PL_HDR.indexOf(internal);
            return i >= 0 ? vals[i] : "";
        });
    }
    function tulisBuku(hasil) {
        var wb = new ExcelJS.Workbook;
        var dateSet = {};
        PL_DATECOLS.forEach(function(h) {
            dateSet[h] = true;
        });
        var vis = {};
        PL_VISIBLE.forEach(function(h) {
            vis[h] = true;
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
        var pakai = {}, ditulis = 0;
        hasil.kelompok.forEach(function(g) {
            if (!g.baris.length) return;
            var nama = amanSheet(g.sheet), asal = nama, i = 2;
            while (pakai[nama.toLowerCase()]) {
                nama = amanSheet(asal + " " + i);
                i++;
            }
            pakai[nama.toLowerCase()] = true;
            ditulis++;
            var rawWct = g.format === "wct";
            var centrinWct = g.format === "plan" && isCentrin(g.kata);
            var woTemplate = g.format === "wo";
            var wctOutput = rawWct || centrinWct;
            var templateNexa = g.format === "nexa";
            var templateInfocom = g.format === "infocom";
            var HDR = wctOutput ? WCT_HDR : woTemplate ? WO_HDR : templateNexa ? NEXA_HDR : templateInfocom ? INFOCOM_HDR : hasil.header;
            var N = HDR.length;
            var barisHeader = g.label ? 2 : 1;
            var ws = wb.addWorksheet(nama);
            ws.views = [ {
                state: "frozen",
                ySplit: barisHeader
            } ];
            ws.autoFilter = {
                from: {
                    row: barisHeader,
                    column: 1
                },
                to: {
                    row: barisHeader,
                    column: N
                }
            };
            if (g.label) {
                var lab = ws.addRow([ g.label ]);
                for (var c = 1; c <= N; c++) lab.getCell(c).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: {
                        argb: "FFFFFF00"
                    }
                };
            }
            var head = ws.addRow(HDR);
            for (var c2 = 1; c2 <= N; c2++) {
                head.getCell(c2).font = {
                    name: "Calibri",
                    size: 11,
                    bold: true
                };
                head.getCell(c2).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: {
                        argb: "FFFFC000"
                    }
                };
            }
            g.baris.forEach(function(vals) {
                if (wctOutput) {
                    var rawOut = [];
                    vals.__planDate = hasil.planDate || vals.__planDate || new Date;
                    for (var wc = 0; wc < N; wc++) rawOut.push(nilaiWct(vals, HDR[wc]) || null);
                    ws.addRow(rawOut);
                    return;
                }
                if (templateInfocom) {
                    ws.addRow(infocomRow(vals).map(function(v) {
                        return v === "" ? null : v;
                    }));
                    return;
                }
                var sourceVals = templateNexa ? barisNexa(vals) : vals;
                var out = [];
                for (var c3 = 0; c3 < N; c3++) {
                    var v = sourceVals[c3], h = HDR[c3];
                    if (dateSet[h]) v = toDate(v); else if (isDate(v)) v = v; else if (h === "OFFERNUM") {
                        var s = key(v);
                        v = /^\d+$/.test(s) ? Number(s) : s;
                    } else if (h === "CUST_ACCT" || h === "Site ID" || h === "CA Partner") v = key(v); else v = txt(v);
                    out.push(v === "" ? null : v);
                }
                ws.addRow(out);
            });
            for (var r = 1; r <= ws.rowCount; r++) {
                var row = ws.getRow(r);
                for (var c4 = 1; c4 <= N; c4++) {
                    var cell = row.getCell(c4);
                    cell.border = border;
                    if (!cell.font) cell.font = {
                        name: "Calibri",
                        size: 11
                    };
                    var f = wctOutput ? WCT_FMT[HDR[c4 - 1]] : woTemplate ? PL_FMT[HDR[c4 - 1]] : templateNexa ? NEXA_FMT[HDR[c4 - 1]] : templateInfocom ? INFOCOM_FMT[HDR[c4 - 1]] : PL_FMT[HDR[c4 - 1]];
                    if (f && r > barisHeader) cell.numFmt = f;
                }
            }
            if (wctOutput) {
                for (var wc2 = 1; wc2 <= N; wc2++) {
                    var rawCol = ws.getColumn(wc2);
                    rawCol.width = WCT_DEFAULT_WIDTH;
                    rawCol.hidden = centrinWct && CENTRIN_WCT_VISIBLE.indexOf(HDR[wc2 - 1]) < 0;
                }
            } else {
                var visible = woTemplate ? WO_VISIBLE : templateNexa ? NEXA_VISIBLE : PL_VISIBLE;
                var widths = templateNexa ? NEXA_WIDTHS : PL_WIDTHS;
                if (templateInfocom) {
                    visible = INFOCOM_HDR;
                    widths = {};
                }
                var visibleSet = {};
                visible.forEach(function(h) {
                    visibleSet[h] = true;
                });
                for (var c5 = 1; c5 <= N; c5++) {
                    var col = ws.getColumn(c5);
                    col.width = widths[c5] || 9.14;
                    col.hidden = !visibleSet[HDR[c5 - 1]];
                }
            }
        });
        if (!ditulis) throw new Error("Tidak ada satu pun baris yang cocok, filenya tidak dibuat");
        return wb;
    }
    var $ = function(id) {
        return document.getElementById("pl-" + id);
    };
    var berkas = {
        wo: null,
        wct: null
    };
    var grid = {
        wo: null,
        wct: null
    };
    var hasil = null;
    var assignment = {};
    var LABEL = {
        wo: "WO Report",
        wct: "WCT"
    };
    function status(msg, tipe) {
        var el = $("status");
        el.textContent = msg;
        el.className = "statusline" + (tipe ? " " + tipe : "");
    }
    function gambarSlot() {
        [ "wo", "wct" ].forEach(function(k) {
            var el = $("n-" + k);
            if (berkas[k]) {
                el.textContent = berkas[k];
                el.classList.add("on");
            } else {
                el.textContent = LABEL[k] + (k === "wo" ? " .xls" : " .xlsx");
                el.classList.remove("on");
            }
        });
        $("cnt").textContent = berkas.wct ? berkas.wo ? "WCT + WO Report" : "WCT siap · WO Report opsional" : "WCT wajib";
        $("run").disabled = !berkas.wct;
    }
    function bacaSatu(file) {
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
                    var g = XLSX.utils.sheet_to_json(ws, {
                        header: 1,
                        defval: "",
                        raw: true,
                        blankrows: true
                    });
                    resolve({
                        name: file.name,
                        grid: g,
                        jenis: classify(g)
                    });
                } catch (err) {
                    reject(new Error(file.name + ": " + err.message));
                }
            };
            fr.readAsArrayBuffer(file);
        });
    }
    function terimaFile(list) {
        var files = Array.prototype.slice.call(list);
        if (!files.length) return;
        hasil = null;
        $("save").disabled = true;
        status("Membaca " + files.length + " file…", "");
        Promise.all(files.map(bacaSatu)).then(function(out) {
            var bingung = [];
            out.forEach(function(o) {
                if (o.jenis) {
                    berkas[o.jenis] = o.name;
                    grid[o.jenis] = o.grid;
                } else bingung.push(o.name);
            });
            gambarSlot();
            hitungCepat();
            if (bingung.length) status("Tidak dikenali: " + bingung.join(", ") + ". WCT wajib; WO Report opsional.", "err"); else if (berkas.wct && berkas.wo) status("WCT + WO Report siap. Periksa kata kuncinya lalu susun.", "ok"); else if (berkas.wct) status("WCT siap. WO Report opsional; bisa langsung susun.", "ok"); else status("WCT belum di-upload.", "");
        }).catch(function(err) {
            status(err.message, "err");
        });
    }
    function assignmentOwn(k) {
        return Object.prototype.hasOwnProperty.call(assignment, k);
    }
    function siapkanAssignment(katalog) {
        var next = {};
        (katalog || []).forEach(function(p) {
            next[p.id] = assignmentOwn(p.id) ? assignment[p.id] : templateDefault(p.nama, p);
        });
        assignment = next;
    }
    function ubahAssignment(id, template) {
        if (!id || [ "wct", "plan", "wo", "nexa", "infocom", "skip" ].indexOf(template) < 0) return;
        assignment[id] = template;
        hitungCepat();
    }
    function kartuPartner(p) {
        var t = templateUntuk(p.nama, assignment, p);
        var selected = t !== "skip";
        return '<article class="pl-partner-card' + (selected ? "" : " is-skipped") + '" draggable="true" data-partner-id="' + esc(p.id) + '">' + '<div class="pl-partner-grip" aria-hidden="true">⋮⋮</div>' + '<div class="pl-partner-main"><b>' + esc(p.nama) + "</b>" + "<span>" + esc(p.source || "") + " · " + p.total + " baris</span></div></article>";
    }
    function gambarAssignment(r) {
        var panel = $("assignment-panel");
        if (!panel) return;
        var partners = (r.partnerCatalog || []).filter(function(p) {
            return p.total > 0;
        });
        panel.hidden = !partners.length;
        if (!partners.length) return;
        $("assignment-count").textContent = partners.length + " partner terdeteksi";
        var zones = {
            wct: $("template-wct"),
            plan: $("template-plan"),
            wo: $("template-wo"),
            nexa: $("template-nexa"),
            infocom: $("template-infocom"),
            skip: $("template-skip")
        };
        Object.keys(zones).forEach(function(t) {
            var zone = zones[t];
            if (!zone) return;
            var list = partners.filter(function(p) {
                return templateUntuk(p.nama, assignment, p) === t;
            });
            zone.innerHTML = list.length ? list.map(kartuPartner).join("") : '<div class="pl-zone-empty">Tarik partner ke sini</div>';
        });
    }
    function pasangAssignment() {
        var panel = $("assignment-panel");
        if (!panel) return;
        panel.addEventListener("dragstart", function(e) {
            var card = e.target.closest ? e.target.closest(".pl-partner-card") : null;
            if (!card || !e.dataTransfer) return;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", card.getAttribute("data-partner-id"));
            card.classList.add("is-dragging");
        });
        panel.addEventListener("dragend", function(e) {
            var card = e.target.closest ? e.target.closest(".pl-partner-card") : null;
            if (card) card.classList.remove("is-dragging");
            Array.prototype.forEach.call(panel.querySelectorAll(".pl-assignment-zone"), function(z) {
                z.classList.remove("is-over");
            });
        });
        panel.addEventListener("dragover", function(e) {
            var zone = e.target.closest ? e.target.closest(".pl-assignment-zone") : null;
            if (!zone) return;
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
            zone.classList.add("is-over");
        });
        panel.addEventListener("dragleave", function(e) {
            var zone = e.target.closest ? e.target.closest(".pl-assignment-zone") : null;
            if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("is-over");
        });
        panel.addEventListener("drop", function(e) {
            var zone = e.target.closest ? e.target.closest(".pl-assignment-zone") : null;
            if (!zone) return;
            e.preventDefault();
            zone.classList.remove("is-over");
            var id = e.dataTransfer ? e.dataTransfer.getData("text/plain") : "";
            ubahAssignment(id, zone.getAttribute("data-template"));
        });
    }
    function hitungCepat() {
        hasil = null;
        $("save").disabled = true;
        if (!grid.wct) {
            $("hitung").innerHTML = "";
            if ($("assignment-panel")) $("assignment-panel").hidden = true;
            return;
        }
        var r;
        try {
            var opsi = {
                kataWct: $("k-wct").value,
                kataWo: $("k-wo").value,
                tanggal: new Date
            };
            var temuan = bangun({
                wo: grid.wo,
                wct: grid.wct
            }, opsi);
            siapkanAssignment(temuan.partnerCatalog);
            r = bangun({
                wo: grid.wo,
                wct: grid.wct
            }, {
                kataWct: opsi.kataWct,
                kataWo: opsi.kataWo,
                tanggal: opsi.tanggal,
                assignment: assignment
            });
        } catch (e) {
            $("hitung").innerHTML = '<div class="pl-warn">' + esc(e.message) + "</div>";
            if ($("assignment-panel")) $("assignment-panel").hidden = true;
            status("Error: " + e.message, "err");
            return false;
        }
        var angka = function(n) {
            return n ? String(n) : "";
        };
        var totWo = 0, totWct = 0, totAll = 0;
        var h = '<table class="pl-tabel"><thead><tr>' + "<th>Partner</th><th>WO Report</th><th>WCT</th><th>Total</th></tr></thead><tbody>";
        r.perPartner.forEach(function(p) {
            totWo += p.wo;
            totWct += p.wct;
            totAll += p.total;
            h += '<tr class="' + (p.total ? "" : "nol") + '">' + "<td>" + esc(p.nama) + "</td>" + "<td>" + angka(p.wo) + "</td>" + "<td>" + angka(p.wct) + "</td>" + "<td>" + angka(p.total) + "</td></tr>";
        });
        h += "</tbody><tfoot><tr><td>Total</td><td>" + angka(totWo) + "</td><td>" + angka(totWct) + "</td><td>" + angka(totAll) + "</td></tr></tfoot></table>";
        if (r.tabrakan.length) {
            var contoh = r.tabrakan.slice(0, 6).map(function(t) {
                return t.akun + " kena " + t.kata.join(" dan ");
            }).join(", ");
            h += '<div class="pl-warn"><b>' + r.tabrakan.length + " baris kena lebih dari satu kata kunci.</b> Baris itu akan muncul di dua sheet sekaligus, " + "jadi satu order terjadwal dua kali. Pakai kata yang lebih panjang, misal XL SATU bukan XL. " + '<span class="pl-mono">' + esc(contoh) + (r.tabrakan.length > 6 ? ", dan lainnya" : "") + "</span></div>";
        }
        $("hitung").innerHTML = h;
        gambarAssignment(r);
        hasil = r;
        $("save").disabled = !r.kelompok.some(function(g) {
            return g.baris.length;
        });
        return true;
    }
    function muatKata() {
        var v = null;
        try {
            v = JSON.parse(localStorage.getItem(KUNCI_SIMPAN) || "null");
        } catch (e) {}
        $("k-wct").value = v && typeof v.wct === "string" ? v.wct : AWAL_WCT;
        $("k-wo").value = v && typeof v.wo === "string" ? v.wo : AWAL_WO;
    }
    function simpanKata() {
        try {
            localStorage.setItem(KUNCI_SIMPAN, JSON.stringify({
                wct: $("k-wct").value,
                wo: $("k-wo").value
            }));
        } catch (e) {}
    }
    muatKata();
    gambarSlot();
    [ "k-wct", "k-wo" ].forEach(function(id) {
        $(id).addEventListener("input", function() {
            simpanKata();
            hitungCepat();
        });
    });
    $("awal").addEventListener("click", function() {
        $("k-wct").value = AWAL_WCT;
        $("k-wo").value = AWAL_WO;
        simpanKata();
        hitungCepat();
        status("Kata kunci dikembalikan ke awal.", "");
    });
    $("fi").addEventListener("change", function() {
        terimaFile($("fi").files);
        $("fi").value = "";
    });
    $("drop").addEventListener("click", function(e) {
        e.preventDefault();
        $("fi").click();
    });
    [ "dragenter", "dragover" ].forEach(function(ev) {
        $("drop").addEventListener(ev, function(e) {
            e.preventDefault();
            $("drop").classList.add("drag");
        });
    });
    [ "dragleave", "dragend" ].forEach(function(ev) {
        $("drop").addEventListener(ev, function(e) {
            e.preventDefault();
            $("drop").classList.remove("drag");
        });
    });
    $("drop").addEventListener("drop", function(e) {
        e.preventDefault();
        $("drop").classList.remove("drag");
        terimaFile(e.dataTransfer.files);
    });
    $("kosong").addEventListener("click", function() {
        berkas = {
            wo: null,
            wct: null
        };
        grid = {
            wo: null,
            wct: null
        };
        hasil = null;
        assignment = {};
        gambarSlot();
        $("hitung").innerHTML = "";
        if ($("assignment-panel")) $("assignment-panel").hidden = true;
        $("save").disabled = true;
        status("", "");
    });
    if ($("reset-assign")) $("reset-assign").addEventListener("click", function() {
        assignment = {};
        hitungCepat();
        status("Assignment dikembalikan ke default.", "");
    });
    $("run").addEventListener("click", function() {
        status("Menyusun…", "");
        try {
            if (hitungCepat()) status("Selesai, periksa hitungannya lalu unduh.", "ok");
        } catch (e) {
            status("Error: " + e.message, "err");
        }
    });
    $("save").addEventListener("click", function() {
        if (!hasil) return;
        var b = $("save");
        b.disabled = true;
        status("Menyiapkan file…", "");
        try {
            var wb = tulisBuku(hasil);
            var d = new Date;
            var BLN = typeof BULAN !== "undefined" && BULAN ? BULAN : [ "", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember" ];
            var nm = "Plan WO Installation " + d.getDate() + " " + BLN[d.getMonth() + 1] + " " + d.getFullYear();
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
                status("Terunduh: " + nm + ".xlsx", "ok");
                b.disabled = !hasil || !hasil.kelompok.some(function(g) {
                    return g.baris.length;
                });
            }).catch(function(err) {
                status("Gagal menulis: " + err.message, "err");
                b.disabled = !hasil || !hasil.kelompok.some(function(g) {
                    return g.baris.length;
                });
            });
        } catch (err) {
            status("Gagal menulis: " + err.message, "err");
            b.disabled = !hasil || !hasil.kelompok.some(function(g) {
                return g.baris.length;
            });
        }
    });
    status("Tarik WCT ke sini. WO Report opsional.", "");
    pasangAssignment();
})();