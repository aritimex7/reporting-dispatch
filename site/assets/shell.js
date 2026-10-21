(function() {
    "use strict";
    var ASSET_VERSION = "20260925-16";
    if (typeof window.BULAN === "undefined") {
        window.BULAN = [ "", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember" ];
    }
    (function() {
        var el = document.getElementById("today");
        if (!el) return;
        var d = new Date;
        el.textContent = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
    })();
    (function() {
        var el = document.getElementById("clock");
        if (!el) return;
        function tik() {
            var d = new Date;
            el.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
        }
        tik();
        setInterval(tik, 15e3);
    })();
    var DISPATCH = {
        pane: function(id, html) {
            var el = document.getElementById("pane-" + id);
            if (!el) {
                console.warn("[shell] pane-" + id + " tidak ada. " + 'Cek apakah id "' + id + '" sudah terdaftar di reports.js');
                return null;
            }
            el.innerHTML = html;
            return el;
        },
        q: function(id, sel) {
            var el = document.getElementById("pane-" + id);
            return el ? el.querySelectorAll(sel) : [];
        }
    };
    window.DISPATCH = DISPATCH;
    var daftar = typeof REPORTS !== "undefined" && REPORTS ? REPORTS : [];
    var barTab = document.getElementById("tabs");
    var kotak = document.getElementById("panes");
    if (!daftar.length) {
        kotak.innerHTML = '<main><div class="lead"><h1>Belum ada report.</h1>' + "<p>Daftarnya kosong. Tambahkan satu baris di reports.js.</p></div></main>";
        return;
    }
    var terpakai = {};
    daftar.forEach(function(r, i) {
        if (!r || !r.id) {
            console.warn("[shell] ada baris di reports.js tanpa id, dilewati");
            return;
        }
        if (terpakai[r.id]) {
            console.warn('[shell] id "' + r.id + '" dobel di reports.js, dilewati');
            return;
        }
        terpakai[r.id] = true;
        var b = document.createElement("button");
        b.className = "tab" + (i === 0 ? " on" : "");
        b.setAttribute("data-pane", "pane-" + r.id);
        b.textContent = r.label || r.id;
        barTab.appendChild(b);
        var p = document.createElement("div");
        p.className = "pane" + (i === 0 ? " on" : "");
        p.id = "pane-" + r.id;
        kotak.appendChild(p);
    });
    barTab.addEventListener("click", function(e) {
        var t = e.target.closest ? e.target.closest(".tab") : null;
        if (!t || !barTab.contains(t)) return;
        Array.prototype.forEach.call(barTab.querySelectorAll(".tab"), function(x) {
            x.classList.remove("on");
        });
        Array.prototype.forEach.call(kotak.querySelectorAll(".pane"), function(x) {
            x.classList.remove("on");
        });
        t.classList.add("on");
        var p = document.getElementById(t.dataset.pane);
        if (p) p.classList.add("on");
    });
    Object.keys(terpakai).forEach(function(id) {
        var r = null;
        for (var i = 0; i < daftar.length; i++) if (daftar[i].id === id) {
            r = daftar[i];
            break;
        }
        if (r.css) {
            var l = document.createElement("link");
            l.rel = "stylesheet";
            l.href = "reports/" + id + "/style.css?v=" + ASSET_VERSION;
            document.head.appendChild(l);
        }
        [ "pane", "logic" ].forEach(function(bagian) {
            var s = document.createElement("script");
            s.src = "reports/" + id + "/" + bagian + ".js?v=" + ASSET_VERSION;
            s.async = false;
            s.onerror = function() {
                var p = document.getElementById("pane-" + id);
                if (p) p.innerHTML = '<main><div class="lead"><h1>Report ini gagal dimuat.</h1>' + "<p>File <code>reports/" + id + "/" + bagian + ".js</code> tidak ketemu. " + "Kalau report ini memang sudah tidak dipakai, hapus barisnya dari reports.js.</p></div></main>";
            };
            document.head.appendChild(s);
        });
    });
    window.addEventListener("load", function() {
        var kurang = [];
        if (typeof XLSX === "undefined") kurang.push("SheetJS");
        if (typeof ExcelJS === "undefined") kurang.push("ExcelJS");
        if (typeof JSZip === "undefined") kurang.push("JSZip");
        if (!kurang.length) return;
        var w = document.getElementById("libwarn");
        if (!w) return;
        w.innerHTML = '<div class="note warn"><b>Library gagal dimuat: ' + kurang.join(", ") + "</b><br>" + "Jaringan kemungkinan memblokir cdnjs, atau sedang tidak ada internet. " + "Selama ini belum beres, tombol prosesnya tidak akan jalan. Minta versi offline.</div>";
        w.style.display = "block";
    });
})();