(function() {
    "use strict";
    function freezeRecords(records) {
        Object.keys(records).forEach(name => Object.freeze(records[name]));
        return Object.freeze(records);
    }
    const OPERATION_CONFIG = Object.freeze({
        columns: Object.freeze([ "No.", "CAID Link Net", "Account number Partner", "Work ID Partner", "Homepass ID", "FAT ID", "City (Branch) ", "Region", "City", "Status WO ", "Remarks", "Category Pending Network", "Sub Category Pending Network", "Schedule Date", "Installer", "Special Intruction" ]),
        widths: Object.freeze([ 9.14, 13.86, 23.14, 15.43, 13.86, 13, 13, 13, 13, 13, 13, 25.29, 29.29, 13.86, 13.86, 16.71 ]),
        formats: Object.freeze({
            schedule: "yyyy-mm-dd"
        }),
        requiredHeaders: Object.freeze({
            wct: Object.freeze([ "Customer Account", "CA Partner ID", "WO Partner ID", "HomePass ID", "Network Id", "Service Territory", "Status", "Reason", "Detail", "Result Remark", "Schedule Date", "Techician Code", "Task Type", "ServCo", "Field Service" ]),
            wctChange: Object.freeze([ "Customer Account", "CA Partner ID", "WO Partner ID", "HomePass ID", "Network Id", "Service Territory", "Status", "Reason", "Detail", "Result Remark", "Schedule Date", "Techician Code", "Task Type", "ServCo" ]),
            wo: Object.freeze([ "CUST_ACCT", "Branch", "Site ID", "Networkid", "TMFID", "Result Choice", "Result Remark", "STATUS2", "STATUS3", "SCH Date", "Installer", "CA Partner", "Sales", "Job Type", "Job Task", "OPR_CREATE" ])
        }),
        rules: Object.freeze({
            wctInstall: Object.freeze({
                servco: "XL SATU",
                fieldService: "INSTALL"
            }),
            wctDismantle: Object.freeze({
                servco: "XL SATU",
                workId: "WO-UNS"
            }),
            wctChangeService: Object.freeze({
                servco: "XL SATU",
                workIdPrefixes: Object.freeze([ "WO-CSV", "WO-REM", "WO-ADD" ])
            }),
            woInstall: Object.freeze({
                tmfid: "WO-INS",
                sales: "SCO",
                jobType: "IN"
            }),
            woDismantle: Object.freeze({
                tmfid: "WO-UNS",
                oprCreate: "UNKNOWN"
            }),
            woChangeService: Object.freeze({
                sales: "SCO",
                jobType: "SR",
                jobTask: "316"
            })
        }),
        mapping: Object.freeze({
            wct: Object.freeze({
                "CAID Link Net": "Customer Account",
                "Account number Partner": "CA Partner ID",
                "Work ID Partner": "WO Partner ID",
                "Homepass ID": "HomePass ID",
                "FAT ID": "Network Id",
                "City (Branch) ": "Service Territory",
                "Status WO ": "Status",
                Remarks: "Result Remark",
                "Category Pending Network": "Reason",
                "Sub Category Pending Network": "Detail",
                "Schedule Date": "Schedule Date",
                Installer: "Techician Code",
                "Special Intruction": "Task Type"
            }),
            wo: Object.freeze({
                "CAID Link Net": "CUST_ACCT",
                "Account number Partner": "CA Partner",
                "Work ID Partner": "TMFID = RIGHT(TMFID,18)",
                "Homepass ID": "Site ID",
                "FAT ID": "Networkid",
                "City (Branch) ": "Branch",
                "Status WO ": "Result Choice",
                Remarks: "Result Remark",
                "Category Pending Network": "STATUS2",
                "Sub Category Pending Network": "STATUS3",
                "Schedule Date": "SCH Date",
                Installer: "Installer",
                "Special Intruction": "(blank)"
            })
        }),
        area: freezeRecords({
            BALI: {
                area: "BALI",
                city_simplified: "BALI",
                region: "EAST",
                city: "KOTA DENPASAR"
            },
            BANDUNG: {
                area: "BANDUNG",
                city_simplified: "BANDUNG",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            BATAM: {
                area: "BATAM",
                city_simplified: "BATAM",
                region: "WEST",
                city: "KOTA BATAM"
            },
            BEKASI: {
                area: "BEKASI",
                city_simplified: "BEKASI",
                region: "JABO",
                city: "KOTA BEKASI"
            },
            BOGOR: {
                area: "BOGOR",
                city_simplified: "BOGOR",
                region: "JABO",
                city: "KOTA BOGOR"
            },
            CIREBON: {
                area: "CIREBON",
                city_simplified: "CIREBON",
                region: "CENTRAL",
                city: "KOTA CIREBON"
            },
            GRESIK: {
                area: "GRESIK",
                city_simplified: "GRESIK",
                region: "EAST",
                city: "KOTA GRESIK"
            },
            KARAWANG: {
                area: "KARAWANG",
                city_simplified: "KARAWANG",
                region: "CENTRAL",
                city: "KOTA KARAWANG"
            },
            KEDIRI: {
                area: "KEDIRI",
                city_simplified: "KEDIRI",
                region: "EAST",
                city: "KOTA KEDIRI"
            },
            MADIUN: {
                area: "MADIUN",
                city_simplified: "MADIUN",
                region: "EAST",
                city: "KOTA MADIUN"
            },
            MALANG: {
                area: "MALANG",
                city_simplified: "MALANG",
                region: "EAST",
                city: "KOTA MALANG"
            },
            MEDAN: {
                area: "MEDAN",
                city_simplified: "MEDAN",
                region: "WEST",
                city: "KOTA MEDAN"
            },
            "NORTH EAST": {
                area: "NORTH EAST",
                city_simplified: "NORTH EAST",
                region: "JABO",
                city: "KOTA JAKARTA UTARA"
            },
            PURWAKARTA: {
                area: "PURWAKARTA",
                city_simplified: "PURWAKARTA",
                region: "CENTRAL",
                city: "KOTA PURWAKARTA"
            },
            PURWOKERTO: {
                area: "PURWOKERTO",
                city_simplified: "PURWOKERTO",
                region: "CENTRAL",
                city: "KOTA PURWOKERTO"
            },
            SEMARANG: {
                area: "SEMARANG",
                city_simplified: "SEMARANG",
                region: "CENTRAL",
                city: "KOTA SEMARANG"
            },
            SERANG: {
                area: "SERANG",
                city_simplified: "SERANG",
                region: "JABO",
                city: "KOTA SERANG"
            },
            SOLO: {
                area: "SOLO",
                city_simplified: "SOLO",
                region: "CENTRAL",
                city: "KOTA SOLO"
            },
            SOUTH: {
                area: "SOUTH",
                city_simplified: "SOUTH",
                region: "JABO",
                city: "KOTA JAKARTA SELATAN"
            },
            SUBANG: {
                area: "SUBANG",
                city_simplified: "SUBANG",
                region: "CENTRAL",
                city: "KAB. SUBANG"
            },
            SUKABUMI: {
                area: "SUKABUMI",
                city_simplified: "SUKABUMI",
                region: "CENTRAL",
                city: "KAB. SUKABUMI"
            },
            SURABAYA: {
                area: "SURABAYA",
                city_simplified: "SURABAYA",
                region: "EAST",
                city: "KOTA SURABAYA"
            },
            TANGERANG: {
                area: "TANGERANG",
                city_simplified: "TANGERANG",
                region: "JABO",
                city: "KAB. TANGERANG"
            },
            TANGSEL: {
                area: "TANGSEL",
                city_simplified: "TANGSEL",
                region: "JABO",
                city: "KOTA TANGERANG SELATAN"
            },
            TEGAL: {
                area: "TEGAL",
                city_simplified: "TEGAL",
                region: "CENTRAL",
                city: "KOTA TEGAL"
            },
            WEST: {
                area: "WEST",
                city_simplified: "WEST",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            YOGYAKARTA: {
                area: "YOGYAKARTA",
                city_simplified: "YOGYAKARTA",
                region: "CENTRAL",
                city: "KOTA YOGYAKARTA"
            },
            BANTUL: {
                area: "BANTUL",
                city_simplified: "BANTUL",
                region: "CENTRAL",
                city: "KAB. BANTUL"
            },
            BANYUMAS: {
                area: "BANYUMAS",
                city_simplified: "BANYUMAS",
                region: "CENTRAL",
                city: "KAB. BANYUMAS"
            },
            BOJONEGORO: {
                area: "BOJONEGORO",
                city_simplified: "BOJONEGORO",
                region: "EAST",
                city: "KAB. BOJONEGORO"
            },
            CIAMIS: {
                area: "CIAMIS",
                city_simplified: "CIAMIS",
                region: "CENTRAL",
                city: "KAB. CIAMIS"
            },
            CIANJUR: {
                area: "CIANJUR",
                city_simplified: "CIANJUR",
                region: "CENTRAL",
                city: "KAB. CIANJUR"
            },
            DEMAK: {
                area: "DEMAK",
                city_simplified: "DEMAK",
                region: "CENTRAL",
                city: "KAB. DEMAK"
            },
            DENPASAR: {
                area: "DENPASAR",
                city_simplified: "DENPASAR",
                region: "EAST",
                city: "KOTA DENPASAR"
            },
            INDRAMAYU: {
                area: "INDRAMAYU",
                city_simplified: "INDRAMAYU",
                region: "CENTRAL",
                city: "KAB. INDRAMAYU"
            },
            KUNINGAN: {
                area: "KUNINGAN",
                city_simplified: "KUNINGAN",
                region: "CENTRAL",
                city: "KAB. KUNINGAN"
            },
            MAGELANG: {
                area: "MAGELANG",
                city_simplified: "MAGELANG",
                region: "CENTRAL",
                city: "KAB. MAGELANG"
            },
            MOJOKERTO: {
                area: "MOJOKERTO",
                city_simplified: "MOJOKERTO",
                region: "EAST",
                city: "KAB. MOJOKERTO"
            },
            PATI: {
                area: "PATI",
                city_simplified: "PATI",
                region: "CENTRAL",
                city: "KAB. PATI"
            },
            PEKALONGAN: {
                area: "PEKALONGAN",
                city_simplified: "PEKALONGAN",
                region: "CENTRAL",
                city: "KOTA PEKALONGAN"
            },
            PEMALANG: {
                area: "PEMALANG",
                city_simplified: "PEMALANG",
                region: "CENTRAL",
                city: "KAB. PEMALANG"
            },
            PONOROGO: {
                area: "PONOROGO",
                city_simplified: "PONOROGO",
                region: "EAST",
                city: "KAB. PONOROGO"
            },
            PROBOLINGGO: {
                area: "PROBOLINGGO",
                city_simplified: "PROBOLINGGO",
                region: "EAST",
                city: "KAB. PROBOLINGGO"
            },
            PURBALINGGA: {
                area: "PURBALINGGA",
                city_simplified: "PURBALINGGA",
                region: "CENTRAL",
                city: "KAB. PURBALINGGA"
            },
            TULUNGAGUNG: {
                area: "TULUNGAGUNG",
                city_simplified: "TULUNGAGUNG",
                region: "EAST",
                city: "KAB. TULUNGAGUNG"
            },
            BREBES: {
                area: "BREBES",
                city_simplified: "BREBES",
                region: "CENTRAL",
                city: "KOTA PURWOKERTO"
            },
            BOYOLALI: {
                area: "BOYOLALI",
                city_simplified: "BOYOLALI",
                region: "CENTRAL",
                city: "KOTA SOLO"
            },
            JEMBER: {
                area: "JEMBER",
                city_simplified: "JEMBER",
                region: "EAST",
                city: "KAB. JEMBER"
            },
            TASIKMALAYA: {
                area: "TASIKMALAYA",
                city_simplified: "TASIKMALAYA",
                region: "CENTRAL",
                city: "KAB. TASIKMALAYA"
            },
            "QN MEDAN": {
                area: "QN MEDAN",
                city_simplified: "QN MEDAN",
                region: "WEST",
                city: "KOTA MEDAN"
            },
            "CKT MEDAN": {
                area: "CKT MEDAN",
                city_simplified: "CKT MEDAN",
                region: "WEST",
                city: "KOTA MEDAN"
            },
            "ATP MEDAN": {
                area: "ATP MEDAN",
                city_simplified: "ATP MEDAN",
                region: "WEST",
                city: "KOTA MEDAN"
            },
            "QN MEDAN Z2": {
                area: "QN MEDAN Z2",
                city_simplified: "QN MEDAN Z2",
                region: "WEST",
                city: "KOTA MEDAN"
            },
            "BATAM Z1": {
                area: "BATAM Z1",
                city_simplified: "BATAM Z1",
                region: "WEST",
                city: "KOTA BATAM"
            },
            "BATAM Z2": {
                area: "BATAM Z2",
                city_simplified: "BATAM Z2",
                region: "WEST",
                city: "KOTA BATAM"
            },
            "BATAM Z3": {
                area: "BATAM Z3",
                city_simplified: "BATAM Z3",
                region: "WEST",
                city: "KOTA BATAM"
            },
            "MALANG BARAT": {
                area: "MALANG BARAT",
                city_simplified: "MALANG BARAT",
                region: "EAST",
                city: "KOTA MALANG"
            },
            "MALANG SELATAN": {
                area: "MALANG SELATAN",
                city_simplified: "MALANG SELATAN",
                region: "EAST",
                city: "KOTA MALANG"
            },
            "MALANG TENGAH": {
                area: "MALANG TENGAH",
                city_simplified: "MALANG TENGAH",
                region: "EAST",
                city: "KOTA MALANG"
            },
            "TANGERANG PARAMOUNT": {
                area: "TANGERANG PARAMOUNT",
                city_simplified: "TANGERANG PARAMOUNT",
                region: "JABO",
                city: "KAB. TANGERANG"
            },
            "TANGERANG KUTA BUMI": {
                area: "TANGERANG KUTA BUMI",
                city_simplified: "TANGERANG KUTA BUMI",
                region: "JABO",
                city: "KAB. TANGERANG"
            },
            "TANGERANG CIBODAS": {
                area: "TANGERANG CIBODAS",
                city_simplified: "TANGERANG CIBODAS",
                region: "JABO",
                city: "KAB. TANGERANG"
            },
            "BEKASI GRANDWISATA": {
                area: "BEKASI GRANDWISATA",
                city_simplified: "BEKASI GRANDWISATA",
                region: "JABO",
                city: "KOTA BEKASI"
            },
            "BEKASI KRANJI": {
                area: "BEKASI KRANJI",
                city_simplified: "BEKASI KRANJI",
                region: "JABO",
                city: "KOTA BEKASI"
            },
            "BOGOR CIBUBUR": {
                area: "BOGOR CIBUBUR",
                city_simplified: "BOGOR CIBUBUR",
                region: "JABO",
                city: "KOTA BOGOR"
            },
            "NORTH EAST KLENDER": {
                area: "NORTH EAST KLENDER",
                city_simplified: "NORTH EAST KLENDER",
                region: "JABO",
                city: "KOTA JAKARTA UTARA"
            },
            "NORTH EAST PULOMAS": {
                area: "NORTH EAST PULOMAS",
                city_simplified: "NORTH EAST PULOMAS",
                region: "JABO",
                city: "KOTA JAKARTA UTARA"
            },
            "NORTH EAST RAWABADAK": {
                area: "NORTH EAST RAWABADAK",
                city_simplified: "NORTH EAST RAWABADAK",
                region: "JABO",
                city: "KOTA JAKARTA UTARA"
            },
            "NORTH EAST SUNTER": {
                area: "NORTH EAST SUNTER",
                city_simplified: "NORTH EAST SUNTER",
                region: "JABO",
                city: "KOTA JAKARTA UTARA"
            },
            "TANGSEL SURADITA": {
                area: "TANGSEL SURADITA",
                city_simplified: "TANGSEL SURADITA",
                region: "JABO",
                city: "KOTA TANGERANG SELATAN"
            },
            "WEST TAMAN SURYA": {
                area: "WEST TAMAN SURYA",
                city_simplified: "WEST TAMAN SURYA",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            GARUT: {
                area: "GARUT",
                city_simplified: "GARUT",
                region: "CENTRAL",
                city: "KAB. GARUT"
            },
            "BANDUNG DERWATI": {
                area: "BANDUNG DERWATI",
                city_simplified: "BANDUNG DERWATI",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "TANGERANG BINONG": {
                area: "TANGERANG BINONG",
                city_simplified: "TANGERANG BINONG",
                region: "JABO",
                city: "KOTA TANGERANG"
            },
            "TANGSEL PAMULANG": {
                area: "TANGSEL PAMULANG",
                city_simplified: "TANGSEL PAMULANG",
                region: "JABO",
                city: "KOTA TANGERANG SELATAN"
            },
            "WEST BENHIL": {
                area: "WEST BENHIL",
                city_simplified: "WEST BENHIL",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            "WEST GROGOL": {
                area: "WEST GROGOL",
                city_simplified: "WEST GROGOL",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            "WEST KEMANGGISAN": {
                area: "WEST KEMANGGISAN",
                city_simplified: "West Kemanggisan",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            "TANGSEL BINTARO": {
                area: "TANGSEL BINTARO",
                city_simplified: "Tangsel Bintaro",
                region: "JABO",
                city: "KOTA TANGERANG SELATAN"
            },
            "BANDUNG UJUNG BERUNG": {
                area: "BANDUNG UJUNG BERUNG",
                city_simplified: "BANDUNG UJUNG BERUNG",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "BANDUNG BALEENDAH": {
                area: "BANDUNG BALEENDAH",
                city_simplified: "BANDUNG BALEENDAH",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "WEST JELAMBAR": {
                area: "WEST JELAMBAR",
                city_simplified: "West Jelambar",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            "BANDUNG CILEUNYI": {
                area: "BANDUNG CILEUNYI",
                city_simplified: "BANDUNG CILEUNYI",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "BANDUNG CIKUTRA": {
                area: "BANDUNG CIKUTRA",
                city_simplified: "BANDUNG CIKUTRA",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "BANDUNG KOPO": {
                area: "BANDUNG KOPO",
                city_simplified: "BANDUNG KOPO",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "BEKASI PDKUNGGU": {
                area: "BEKASI PDKUNGGU",
                city_simplified: "BEKASI PDKUNGGU",
                region: "JABO",
                city: "KOTA BEKASI"
            },
            "BOGOR SENTUL": {
                area: "BOGOR SENTUL",
                city_simplified: "BOGOR SENTUL",
                region: "JABO",
                city: "KOTA BOGOR"
            },
            "BOGOR DEPOK": {
                area: "BOGOR DEPOK",
                city_simplified: "BOGOR DEPOK",
                region: "JABO",
                city: "KOTA BOGOR"
            },
            "KARAWANG MAIKARTA": {
                area: "KARAWANG MAIKARTA",
                city_simplified: "KARAWANG MAIKARTA",
                region: "CENTRAL",
                city: "KOTA KARAWANG"
            },
            "NORTH EAST OTISTA": {
                area: "NORTH EAST OTISTA",
                city_simplified: "NORTH EAST OTISTA",
                region: "JABO",
                city: "KOTA JAKARTA UTARA"
            },
            "TANGERANG PRIUK": {
                area: "TANGERANG PRIUK",
                city_simplified: "TANGERANG PRIUK",
                region: "JABO",
                city: "KOTA TANGERANG"
            },
            "TANGSEL CILEDUG": {
                area: "TANGSEL CILEDUG",
                city_simplified: "TANGSEL CILEDUG",
                region: "JABO",
                city: "KOTA TANGERANG SELATAN"
            },
            "TANGSEL JAPOS": {
                area: "TANGSEL JAPOS",
                city_simplified: "TANGSEL JAPOS",
                region: "JABO",
                city: "KOTA TANGERANG SELATAN"
            },
            "WEST TAMAN ALFA": {
                area: "WEST TAMAN ALFA",
                city_simplified: "WEST TAMAN ALFA",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            "WEST MERUYA": {
                area: "WEST MERUYA",
                city_simplified: "WEST MERUYA",
                region: "JABO",
                city: "KOTA JAKARTA BARAT"
            },
            "TANGERANG MDU": {
                area: "TANGERANG MDU",
                city_simplified: "TANGERANG MDU",
                region: "JABO",
                city: "KOTA TANGERANG"
            },
            "KARAWANG TELUKJAMBE": {
                area: "KARAWANG TELUKJAMBE",
                city_simplified: "KARAWANG TELUKJAMBE",
                region: "CENTRAL",
                city: "KOTA KARAWANG"
            },
            "TANGSEL PDKACANG": {
                area: "TANGSEL PDKACANG",
                city_simplified: "TANGSEL PDKACANG",
                region: "JABO",
                city: "KOTA TANGERANG SELATAN"
            },
            "BEKASI APT SPRING LAKE": {
                area: "BEKASI APT SPRING LAKE",
                city_simplified: "BEKASI APT SPRING LAKE",
                region: "JABO",
                city: "KOTA BEKASI"
            },
            "TANGSEL BSD": {
                area: "TANGSEL BSD",
                city_simplified: "TANGSEL BSD",
                region: "JABO",
                city: "KOTA TANGERANG"
            },
            "BEKASI APT B02": {
                area: "BEKASI APT B02",
                city_simplified: "BEKASI APT B02",
                region: "JABO",
                city: "KOTA BEKASI"
            },
            "SOUTH CINERE": {
                area: "SOUTH CINERE",
                city_simplified: "SOUTH CINERE",
                region: "JABO",
                city: "KOTA JAKARTA SELATAN"
            },
            "BANDUNG BATUNUNGGAL": {
                area: "BANDUNG BATUNUNGGAL",
                city_simplified: "BANDUNG BATUNUNGGAL",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "BANDUNG CIMAHI": {
                area: "BANDUNG CIMAHI",
                city_simplified: "BANDUNG CIMAHI",
                region: "CENTRAL",
                city: "KOTA BANDUNG"
            },
            "BEKASI BABELAN": {
                area: "BEKASI BABELAN",
                city_simplified: "BEKASI BABELAN",
                region: "JABO",
                city: "KOTA BEKASI"
            },
            "BOGOR RANCAMAYA": {
                area: "BOGOR RANCAMAYA",
                city_simplified: "BOGOR RANCAMAYA",
                region: "JABO",
                city: "KOTA BOGOR"
            },
            "SOUTH DEPOK": {
                area: "SOUTH DEPOK",
                city_simplified: "SOUTH DEPOK",
                region: "JABO",
                city: "KOTA JAKARTA SELATAN"
            }
        })
    });
    const TC_REPORT_COLUMNS = Object.freeze([ "CUST_ACCT", "OFFERNUM", "Branch", "Region", "City", "Site ID", "Customer Name", "Job Type", "Job Task", "WIP Comment", "SCH Date", "SCH Time", "Installer", "Close By", "Result Remark", "Status WO", "STATUS2", "STATUS3", "Networkid", "Status Category 1", "Status Category 2", "WO Type" ]);
    const TC_REPORT_WIDTHS = Object.freeze([ 11.14, 11.43, 12.14, 8.86, 26.29, 6.71, 15.57, 8.71, 8.29, 14, 9, 9.29, 8.29, 8.43, 13.86, 10.29, 8.71, 8.71, 10.43, 16.43, 16.43, 9.14 ]);
    const TC_REPORT_REQUIRED = Object.freeze({
        wct: Object.freeze([ "Customer Account", "WO Partner ID", "ServCo", "Job Task" ]),
        wo: Object.freeze([ "CUST_ACCT", "Job Task", "OPR_CREATE", "Installer", "Cust Type Desc" ]),
        tc: Object.freeze([ "CUST_ACCT", "Job Task", "SCH_DATE" ])
    });
    const TC_TASK = Object.freeze({
        collection: "COLLECT CPE",
        migration: "318"
    });
    const STATUS3_CATEGORY = Object.freeze({
        1: "Tidak Ada Jaringan",
        2: "Problem Individu",
        4: "Tap Rusak",
        5: "Problem Sistem",
        40: "Problem Jalur",
        6: "Jarak Tidak Standar",
        7: "Rute Tidak Standar",
        8: "Problem Kabel Inhouse",
        9: "Teknisi TidakTepat Waktu",
        10: "Teknisi Tidak Datang",
        11: "Bencana Alam",
        12: "Kecelakaan",
        13: "Salah Alamat",
        14: "Tidak Ada Material",
        15: "CPE Bermasalah",
        16: "Informasi Mengenai Produk/Paket/Penagihan Tidak Jelas",
        17: "Salah Order",
        18: "CPE Hilang/Milik Customer",
        39: "CPE Diambil Oknum",
        19: "Alamat Tidak Ditemukan",
        37: "Aktif dengan Account Baru",
        20: "Perangkat Customer Rusak",
        21: "Perangkat Customer Tidak Standard",
        22: "Tidak Ada Pembuat Keputusan",
        23: "Tidak Ada Customer di Rumah",
        24: "Rumah Kosong Tidak Berpenghuni",
        25: "Rumah Sedang Direnovasi",
        26: "Tidak Dapat Izin",
        27: "Pelanggan Tidak Order",
        28: "Pelanggan Sudah Menggunakan Provider Lain",
        29: "Pelanggan Berubah Pikiran",
        30: "Pelanggan Minta Disconnect",
        31: "Permintaan Sales Channel /Customer Service",
        32: "Menunggu Konfirmasi Customer",
        33: "Pelanggan Tidak Ingin Diganggu",
        34: "Pelanggan Ingin Lanjut Berlangganan",
        38: "Back to normal (BTN)",
        35: "Tap Gandeng/Gantung",
        36: "Tap Standard",
        37: "Outage"
    });
    const STATUS2_CATEGORY = Object.freeze({
        60: "Jaringan Tidak Tersedia",
        61: "Problem Jaringan",
        62: "Instalasi Tidak Standar",
        63: "Problem Kabel Inhouse",
        64: "Teknisi Tidak Datang",
        65: "Kondisi Buruk",
        66: "Problem Site ID",
        67: "Material Tidak Tersedia",
        68: "Info Tidak Lengkap",
        70: "Problem Perangkat Customer",
        71: "Tidak Ada Customer",
        72: "Rumah Dalam Renovasi",
        73: "Diperlukan Izin",
        74: "Permintaan Pelanggan",
        75: "TAP/FAT Penuh",
        76: "Outage",
        44: "Salah Frame",
        47: "Label FAT Tidak Ada/berbeda",
        42: "Tidak Ada Sinyal",
        41: "Sinyal Bermasalah",
        46: "GPON Tidak Terdeteksi",
        43: "Port Bermasalah"
    });
    const clean = v => String(v == null ? "" : v).replace(/_x000D_/g, "").replace(/\r/g, "").trim();
    const key = v => clean(v).replace(/\s+/g, " ").toLowerCase();
    const upper = v => clean(v).toUpperCase();
    function dateOnly(value) {
        if (value == null || clean(value) === "") return "";
        if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
        const raw = clean(value);
        const n = Number(raw);
        if (Number.isFinite(n) && n > 3e4 && n < 6e4) {
            const d = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 864e5);
            return d.toISOString().slice(0, 10);
        }
        let m = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/.exec(raw);
        if (m) return m[1] + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[3]).padStart(2, "0");
        m = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/.exec(raw);
        if (m) {
            const y = m[3].length === 2 ? "20" + m[3] : m[3];
            return y + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[1]).padStart(2, "0");
        }
        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString().slice(0, 10);
    }
    function activityScore(value) {
        if (value == null || clean(value) === "") return 0;
        if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
        const raw = clean(value);
        const n = Number(clean(value));
        if (Number.isFinite(n) && n > 3e4 && n < 6e4) return Date.UTC(1899, 11, 30) + Math.round(n * 864e5);
        let m = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(raw);
        if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
        m = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(raw);
        if (m) {
            const year = m[3].length === 2 ? 2e3 + +m[3] : +m[3];
            return Date.UTC(year, +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
        }
        const t = Date.parse(raw);
        return Number.isNaN(t) ? 0 : t;
    }
    const WCT_ACTIVITY = Object.freeze([ "Complete Time", "Arrival Time", "Create Time" ]);
    const WO_ACTIVITY = Object.freeze([ "Update Date", "CloseDate", "Input Date" ]);
    const TC_ACTIVITY = Object.freeze([ "Update Date", "CloseDate", "Input Date", "SCH_DATE" ]);
    function selectLatest(rows, identityOf, activityFields) {
        const latest = new Map;
        rows.forEach(item => {
            const id = identityOf(item);
            const identity = id ? id : "__source_row__" + item.sourceRow;
            const score = Math.max.apply(null, activityFields.map(field => activityScore(item.row[key(field)])));
            const previous = latest.get(identity);
            if (!previous || score > previous.score || score === previous.score && item.sourceRow > previous.item.sourceRow) latest.set(identity, {
                item: item,
                score: score
            });
        });
        return Array.from(latest.values()).sort((a, b) => a.item.sourceRow - b.item.sourceRow).map(x => x.item);
    }
    function wctIdentities(rows) {
        const parent = rows.map((_, i) => i);
        const find = i => {
            while (parent[i] !== i) {
                parent[i] = parent[parent[i]];
                i = parent[i];
            }
            return i;
        };
        const firstSeen = new Map;
        rows.forEach((item, i) => {
            [ [ "ca", "CA Partner ID" ], [ "acct", "Customer Account" ] ].forEach(([tag, field]) => {
                const v = key(value(item, field));
                if (!v || v === "-") return;
                const k = tag + "\0" + v;
                if (firstSeen.has(k)) parent[find(i)] = find(firstSeen.get(k)); else firstSeen.set(k, i);
            });
        });
        const ids = new Map;
        rows.forEach((item, i) => {
            const linked = [ "CA Partner ID", "Customer Account" ].some(field => {
                const v = key(value(item, field));
                return v && v !== "-";
            });
            ids.set(item, linked ? "wct" + find(i) : "");
        });
        return ids;
    }
    function selectLatestWct(rows) {
        const ids = wctIdentities(rows);
        return selectLatest(rows, item => ids.get(item), WCT_ACTIVITY);
    }
    function accountTaskIdentity(accountFields) {
        return item => {
            const account = key(firstValue(item, accountFields));
            return account ? account + "\0" + key(firstValue(item, [ "Job Task", "Task Type" ])) : "";
        };
    }
    function value(item, name) {
        return item && item.row ? item.row[key(name)] == null ? "" : item.row[key(name)] : "";
    }
    function right18(raw) {
        const s = String(raw == null ? "" : raw);
        return s ? s.slice(-18) : "";
    }
    function validWo(item) {
        var installer = upper(value(item, "Installer"));
        return /^SO-\d+-WO-/i.test(clean(value(item, "TMFID"))) && installer !== "-" && installer !== "950";
    }
    function areaInfo(raw, item) {
        const normalized = upper(raw).replace(/\s+/g, " ");
        const areaMap = OPERATION_CONFIG.area;
        if (!normalized) return {
            region: "",
            city: ""
        };
        if (normalized === "LIPPO CIKARANG") return {
            area: "LIPPO CIKARANG",
            city_simplified: "LIPPO CIKARANG",
            region: "JABO",
            city: "KOTA BEKASI"
        };
        if (areaMap[normalized]) return areaMap[normalized];
        const candidates = Object.keys(areaMap).sort((a, b) => b.length - a.length);
        const prefix = candidates.find(k => normalized.indexOf(k) === 0);
        if (prefix) return areaMap[prefix];
        const contains = candidates.find(k => k.length >= 4 && normalized.indexOf(k) >= 0);
        return contains ? areaMap[contains] : {
            region: "",
            city: ""
        };
    }
    function makeOutput(item, source, no) {
        const isWct = source === "wct";
        const branch = value(item, isWct ? "Service Territory" : "Branch");
        const info = areaInfo(branch, item);
        const output = {};
        OPERATION_CONFIG.columns.forEach(column => {
            output[column] = "";
        });
        output["No."] = String(no);
        output["CAID Link Net"] = clean(value(item, isWct ? "Customer Account" : "CUST_ACCT"));
        output["Account number Partner"] = clean(value(item, isWct ? "CA Partner ID" : "CA Partner"));
        output["Work ID Partner"] = isWct ? clean(value(item, "WO Partner ID")) : right18(value(item, "TMFID"));
        output["Homepass ID"] = clean(value(item, isWct ? "HomePass ID" : "Site ID"));
        output["FAT ID"] = clean(value(item, isWct ? "Network Id" : "Networkid"));
        output["City (Branch) "] = upper(branch);
        output["Region"] = clean(info.region);
        output["City"] = clean(info.city);
        output["Status WO "] = clean(value(item, isWct ? "Status" : "Result Choice"));
        output["Remarks"] = clean(value(item, "Result Remark"));
        output["Category Pending Network"] = clean(value(item, isWct ? "Reason" : "STATUS2"));
        output["Sub Category Pending Network"] = clean(value(item, isWct ? "Detail" : "STATUS3"));
        output["Schedule Date"] = dateOnly(value(item, isWct ? "Schedule Date" : "SCH Date"));
        output["Installer"] = clean(value(item, isWct ? "Techician Code" : "Installer"));
        output["Special Intruction"] = isWct ? upper(value(item, "Task Type")) : "";
        return output;
    }
    function filterDate(item, dateFilter, field) {
        return !dateFilter || dateOnly(value(item, field)) === dateFilter;
    }
    function filteredWct(source, kind, dateFilter) {
        const candidates = source.rows.filter(item => {
            const servco = upper(value(item, "ServCo"));
            const fieldService = upper(value(item, "Field Service"));
            const workId = upper(value(item, "WO Partner ID"));
            if (kind !== "change" && clean(value(item, "Techician Code")) === "-") return false;
            if (kind === "install" && (servco !== OPERATION_CONFIG.rules.wctInstall.servco || fieldService !== OPERATION_CONFIG.rules.wctInstall.fieldService)) return false;
            if (kind === "dismantle" && (servco !== OPERATION_CONFIG.rules.wctDismantle.servco || workId.indexOf(OPERATION_CONFIG.rules.wctDismantle.workId) < 0)) return false;
            if (kind === "change" && (servco !== OPERATION_CONFIG.rules.wctChangeService.servco || !OPERATION_CONFIG.rules.wctChangeService.workIdPrefixes.some(prefix => workId.indexOf(prefix) === 0))) return false;
            return filterDate(item, dateFilter, "Schedule Date");
        });
        return selectLatestWct(candidates);
    }
    function filteredWo(source, kind, dateFilter) {
        return selectLatest(source.rows.filter(item => {
            if (!validWo(item) || !filterDate(item, dateFilter, "SCH Date")) return false;
            const sales = upper(value(item, "Sales"));
            const jobType = upper(value(item, "Job Type"));
            const task = clean(value(item, "Job Task"));
            const tmfid = upper(value(item, "TMFID"));
            const oprCreate = upper(value(item, "OPR_CREATE"));
            if (kind === "install") return tmfid.indexOf(OPERATION_CONFIG.rules.woInstall.tmfid) >= 0 && sales === OPERATION_CONFIG.rules.woInstall.sales && jobType === OPERATION_CONFIG.rules.woInstall.jobType;
            if (kind === "dismantle") return tmfid.indexOf(OPERATION_CONFIG.rules.woDismantle.tmfid) >= 0 && oprCreate === OPERATION_CONFIG.rules.woDismantle.oprCreate;
            if (kind === "change") return sales === OPERATION_CONFIG.rules.woChangeService.sales && jobType === OPERATION_CONFIG.rules.woChangeService.jobType && task === OPERATION_CONFIG.rules.woChangeService.jobTask;
            return false;
        }), accountTaskIdentity([ "CUST_ACCT" ]), WO_ACTIVITY);
    }
    function accountKey(row) {
        return key(row["CAID Link Net"]);
    }
    function mergeWctFirst(wctRows, woRows) {
        const wctAccounts = new Set(wctRows.map(accountKey).filter(Boolean));
        const merged = wctRows.slice();
        woRows.forEach(row => {
            const account = accountKey(row);
            if (!account || !wctAccounts.has(account)) merged.push(row);
        });
        return merged;
    }
    function ensureHeaders(source, required, label) {
        if (!source) throw new Error(label + " belum dipilih");
        const missing = required.filter(column => source.headers.indexOf(key(column)) < 0);
        if (missing.length) throw new Error(label + " bukan export yang sesuai. Kolom hilang: " + missing.join(", "));
    }
    function firstValue(item, names) {
        for (var i = 0; i < names.length; i++) {
            var valueFound = value(item, names[i]);
            if (clean(valueFound) !== "") return valueFound;
        }
        return "";
    }
    function statusCode(valueToMap) {
        var raw = clean(valueToMap);
        if (!raw) return "";
        var numeric = Number(raw);
        return Number.isFinite(numeric) && Number.isInteger(numeric) ? String(numeric) : raw.toUpperCase();
    }
    function categoryText(valueToMap, dictionary, fallbackDictionary) {
        var raw = clean(valueToMap);
        if (!raw) return "";
        var code = statusCode(valueToMap);
        if (Object.prototype.hasOwnProperty.call(dictionary, code)) return dictionary[code];
        if (fallbackDictionary && Object.prototype.hasOwnProperty.call(fallbackDictionary, code)) return fallbackDictionary[code];
        var rawKey = key(raw);
        var dictionaries = [ dictionary, fallbackDictionary ];
        for (var d = 0; d < dictionaries.length; d++) {
            var labels = dictionaries[d];
            if (!labels) continue;
            var match = Object.keys(labels).find(function(labelCode) {
                return key(labels[labelCode]) === rawKey;
            });
            if (match) return labels[match];
        }
        return "";
    }
    function allTask(item) {
        return upper(firstValue(item, [ "Job Task", "Task Type" ]));
    }
    function allCategory(task) {
        if (task === TC_TASK.collection) return "collection";
        if (task === TC_TASK.migration) return "migration";
        return "mvm";
    }
    function excludedAllWct(item) {
        var workId = upper(value(item, "WO Partner ID"));
        return [ "WO-UNS", "WO-INS", "WO-REM", "WO-ADD" ].some(function(prefix) {
            return workId.indexOf(prefix) === 0;
        });
    }
    function validAllWct(item, dateFilter) {
        return upper(value(item, "ServCo")) === "XL SATU" && !excludedAllWct(item) && filterDate(item, dateFilter, "Schedule Date");
    }
    function validAllWo(item, dateFilter) {
        var oprCreate = upper(value(item, "OPR_CREATE"));
        var installer = upper(value(item, "Installer"));
        var custType = upper(value(item, "Cust Type Desc"));
        var allowedCustType = !custType || custType === "XL PARTNER G2A" || custType === "XL PARTNER G2A MIGRATION";
        return oprCreate !== "SERVCO_API" && oprCreate !== "UNKNOWN" && installer !== "950" && installer !== "-" && allowedCustType && filterDate(item, dateFilter, "SCH Date");
    }
    function infocomSlotFromHour(hour) {
        if (!Number.isFinite(hour) || hour < 9 || hour >= 18) return "Anytime";
        if (hour < 12) return "09:00-12:00";
        if (hour < 15) return "13:00-15:00";
        return "15:00-18:00";
    }
    function infocomSlot(valueToFormat) {
        if (valueToFormat == null || clean(valueToFormat) === "") return "Anytime";
        if (valueToFormat instanceof Date && !Number.isNaN(valueToFormat.getTime())) return infocomSlotFromHour(valueToFormat.getUTCHours() + valueToFormat.getUTCMinutes() / 60);
        var raw = clean(valueToFormat);
        var serial = Number(raw);
        if (Number.isFinite(serial) && serial > 3e4 && serial < 6e4) {
            return infocomSlotFromHour((serial - Math.floor(serial)) * 24);
        }
        var match = raw.replace(/\./g, ":").match(/(\d{1,2}):\d{2}/);
        return match ? infocomSlotFromHour(Number(match[1])) : "Anytime";
    }
    function normalizeSlotPunctuation(valueToNormalize) {
        return clean(valueToNormalize).replace(/(\d{1,2})\.(\d{2})/g, "$1:$2");
    }
    function makeTcOutput(item, source, no) {
        var output = {};
        TC_REPORT_COLUMNS.forEach(function(column) {
            output[column] = "";
        });
        var isWct = source === "wct";
        var branch = firstValue(item, isWct ? [ "Service Territory", "Branch" ] : [ "Branch" ]);
        var info = areaInfo(branch, item);
        output["No."] = String(no);
        output["CUST_ACCT"] = clean(firstValue(item, isWct ? [ "Customer Account", "CUST_ACCT" ] : [ "CUST_ACCT" ]));
        output["OFFERNUM"] = clean(firstValue(item, isWct ? [ "Workorder No.", "OFFERNUM" ] : [ "OFFERNUM" ]));
        output["Branch"] = clean(branch);
        output["Region"] = clean(firstValue(item, [ "Region" ])) || clean(info.region);
        output["City"] = clean(firstValue(item, [ "City" ])) || clean(info.city);
        output["Site ID"] = clean(firstValue(item, isWct ? [ "HomePass ID", "Site ID" ] : [ "Site ID", "SITE_ID" ]));
        output["Customer Name"] = clean(firstValue(item, isWct ? [ "Customer Name", "CST_NAME" ] : [ "Customer Name", "CST_NAME" ]));
        output["Job Type"] = clean(firstValue(item, isWct ? [ "Field Service", "Job Type" ] : [ "Job Type" ]));
        output["Job Task"] = clean(firstValue(item, [ "Job Task", "Task Type" ]));
        output["WIP Comment"] = clean(firstValue(item, [ "WIP Comment", "Wip Comments", "WIP_COMMENT" ]));
        output["SCH Date"] = dateOnly(firstValue(item, isWct ? [ "Schedule Date", "SCH Date", "SCH_DATE" ] : [ "SCH Date", "SCH_DATE" ]));
        output["SCH Time"] = isWct ? clean(firstValue(item, [ "SCH Time", "SCH_TIME" ])) || infocomSlot(firstValue(item, [ "Plan Arrival Time" ])) : source === "wo" || source === "tc" ? normalizeSlotPunctuation(firstValue(item, [ "SCH Time", "SCH_TIME" ])) : clean(firstValue(item, [ "SCH Time", "SCH_TIME" ]));
        output["Installer"] = clean(firstValue(item, isWct ? [ "Techician Code", "Installer" ] : [ "Installer", "INSTALLER" ]));
        output["Close By"] = clean(firstValue(item, [ "Close By", "Closed_By" ]));
        output["Result Remark"] = clean(firstValue(item, isWct ? [ "Result Remark", "Remarks" ] : [ "Result Remark", "REMARKS" ]));
        output["Status WO"] = clean(firstValue(item, isWct ? [ "Status", "Status WO" ] : [ "Result Choice", "Status WO", "STATUS1" ]));
        output["STATUS2"] = clean(firstValue(item, isWct ? [ "Reason", "STATUS2" ] : [ "STATUS2" ]));
        output["STATUS3"] = clean(firstValue(item, isWct ? [ "Detail", "STATUS3" ] : [ "STATUS3" ]));
        output["Networkid"] = clean(firstValue(item, isWct ? [ "Network Id", "Networkid" ] : [ "Networkid", "Network Id" ]));
        var category1 = categoryText(output["STATUS2"], STATUS2_CATEGORY, STATUS3_CATEGORY);
        var category2 = categoryText(output["STATUS3"], STATUS3_CATEGORY, STATUS2_CATEGORY);
        if (isWct && !category1 && output["STATUS2"] && !/^\d+(?:\.0+)?$/.test(output["STATUS2"])) category1 = output["STATUS2"];
        if (isWct && !category2 && output["STATUS3"] && !/^\d+(?:\.0+)?$/.test(output["STATUS3"])) category2 = output["STATUS3"];
        output["Status Category 1"] = category1;
        output["Status Category 2"] = category2;
        output["WO Type"] = output["Networkid"] ? "FTTH" : "HFC";
        return output;
    }
    function mergeByAccountTask(wctRows, woRows, extraRows) {
        var seen = new Set;
        var merged = [];
        function add(row) {
            var identity = key(row["CUST_ACCT"]) + "\0" + key(row["Job Task"]);
            if (!key(row["CUST_ACCT"]) || !seen.has(identity)) {
                seen.add(identity);
                merged.push(row);
            }
        }
        wctRows.forEach(add);
        woRows.forEach(add);
        (extraRows || []).forEach(add);
        merged.forEach(function(row, index) {
            row["No."] = String(index + 1);
        });
        return merged;
    }
    function latestAll(rows, sourceName) {
        if (sourceName === "wct") return selectLatestWct(rows);
        return selectLatest(rows, accountTaskIdentity([ "CUST_ACCT" ]), sourceName === "tc" ? TC_ACTIVITY : WO_ACTIVITY);
    }
    function allRowsByCategory(source, sourceName, category, dateFilter) {
        if (!source) return [];
        return latestAll(source.rows.filter(function(item) {
            if (sourceName === "wct" && !validAllWct(item, dateFilter)) return false;
            if (sourceName === "wo" && !validAllWo(item, dateFilter)) return false;
            return allCategory(allTask(item)) === category;
        }), sourceName).map(function(item, index) {
            return makeTcOutput(item, sourceName, index + 1);
        });
    }
    function allWoRows(source, dateFilter) {
        if (!source) return [];
        return latestAll(source.rows.filter(function(item) {
            return validAllWo(item, dateFilter);
        }), "wo").map(function(item, index) {
            return makeTcOutput(item, "wo", index + 1);
        });
    }
    function allTcRows(source, dateFilter) {
        if (!source) return [];
        return latestAll(source.rows.filter(function(item) {
            return filterDate(item, dateFilter, "SCH_DATE");
        }), "tc").map(function(item, index) {
            return makeTcOutput(item, "tc", index + 1);
        });
    }
    function buildAll(wct, wo, tc, dateFilter) {
        ensureHeaders(wct, TC_REPORT_REQUIRED.wct, "WCT");
        if (wo) ensureHeaders(wo, TC_REPORT_REQUIRED.wo, "WO Report");
        if (tc) ensureHeaders(tc, TC_REPORT_REQUIRED.tc, "TC Report");
        var wctMvm = allRowsByCategory(wct, "wct", "mvm", dateFilter);
        var wctMigration = allRowsByCategory(wct, "wct", "migration", dateFilter);
        var wctCollection = allRowsByCategory(wct, "wct", "collection", dateFilter);
        var woAll = allWoRows(wo, dateFilter);
        var woMigration = allRowsByCategory(wo, "wo", "migration", dateFilter);
        var woCollection = allRowsByCategory(wo, "wo", "collection", dateFilter);
        var tcRows = allTcRows(tc, dateFilter);
        var install = buildInstall(wct, wo, dateFilter);
        var sheets = {
            "MVM.SR.TC": mergeByAccountTask(wctMvm, woAll, tcRows),
            Migration: mergeByAccountTask(wctMigration, woMigration),
            Collection: mergeByAccountTask(wctCollection, woCollection),
            "XL INSTALL": install.sheets.INSTAL,
            "XL DISMANTLE": install.sheets.DISMANTLE
        };
        return {
            mode: "all",
            dateFilter: dateFilter || "",
            sheets: sheets,
            stats: {
                mvm: sheets["MVM.SR.TC"].length,
                migration: sheets.Migration.length,
                collection: sheets.Collection.length,
                wctInstall: install.stats.wctInstall,
                woInstall: install.stats.woInstall,
                wctDismantle: install.stats.wctDismantle,
                woDismantle: install.stats.woDismantle
            }
        };
    }
    function buildInstall(wct, wo, dateFilter) {
        ensureHeaders(wct, OPERATION_CONFIG.requiredHeaders.wct, "WCT");
        if (wo) ensureHeaders(wo, OPERATION_CONFIG.requiredHeaders.wo, "WO Report");
        const wctInstall = filteredWct(wct, "install", dateFilter);
        const wctDismantle = filteredWct(wct, "dismantle", dateFilter);
        const woInstall = wo ? filteredWo(wo, "install", dateFilter) : [];
        const woDismantle = wo ? filteredWo(wo, "dismantle", dateFilter) : [];
        const instal = mergeWctFirst(wctInstall.map((item, i) => makeOutput(item, "wct", i + 1)), woInstall.map((item, i) => makeOutput(item, "wo", i + 1)));
        const dismantle = mergeWctFirst(wctDismantle.map((item, i) => makeOutput(item, "wct", i + 1)), woDismantle.map((item, i) => makeOutput(item, "wo", i + 1)));
        instal.forEach((row, i) => {
            row["No."] = String(i + 1);
        });
        dismantle.forEach((row, i) => {
            row["No."] = String(i + 1);
        });
        return {
            mode: "install",
            dateFilter: dateFilter || "",
            sheets: {
                INSTAL: instal,
                DISMANTLE: dismantle
            },
            stats: {
                wctInstall: wctInstall.length,
                woInstall: woInstall.length,
                wctDismantle: wctDismantle.length,
                woDismantle: woDismantle.length
            }
        };
    }
    function buildChange(wct, wo, dateFilter) {
        ensureHeaders(wct, OPERATION_CONFIG.requiredHeaders.wctChange, "WCT");
        if (wo) ensureHeaders(wo, OPERATION_CONFIG.requiredHeaders.wo, "WO Report");
        const wctChange = filteredWct(wct, "change", dateFilter);
        const woChange = wo ? filteredWo(wo, "change", dateFilter) : [];
        const rows = mergeWctFirst(wctChange.map((item, i) => makeOutput(item, "wct", i + 1)), woChange.map((item, i) => makeOutput(item, "wo", i + 1)));
        rows.forEach((row, i) => {
            row["No."] = String(i + 1);
        });
        return {
            mode: "change",
            dateFilter: dateFilter || "",
            sheets: {
                CSV: rows
            },
            stats: {
                change: rows.length,
                wctChange: wctChange.length,
                woChange: woChange.length
            }
        };
    }
    const PURE_API = {
        config: OPERATION_CONFIG,
        buildInstall: buildInstall,
        buildChange: buildChange,
        buildAll: buildAll,
        dateOnly: dateOnly,
        areaInfo: areaInfo
    };
    const $ = id => document.getElementById("op-" + id);
    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
    async function readSource(file) {
        const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
            type: "array",
            cellDates: false
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: true,
            defval: ""
        });
        if (!aoa.length) throw new Error(file.name + ": sheet kosong");
        const headers = (aoa[0] || []).map(key);
        const rows = [];
        for (let i = 1; i < aoa.length; i++) {
            const values = aoa[i] || [];
            if (!values.some(v => clean(v) !== "")) continue;
            const row = {};
            headers.forEach((header, j) => {
                if (header) row[header] = values[j] == null ? "" : values[j];
            });
            rows.push({
                row: row,
                sourceRow: i + 1
            });
        }
        return {
            name: file.name,
            headers: headers,
            rows: rows
        };
    }
    async function sniff(file) {
        try {
            const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
                type: "array",
                cellDates: false,
                sheetRows: 1
            });
            for (const name of workbook.SheetNames) {
                const aoa = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
                    header: 1,
                    raw: true,
                    defval: ""
                });
                const headers = (aoa[0] || []).map(key);
                if ([ "wo partner id", "servco", "ca partner id" ].every(x => headers.indexOf(x) >= 0)) return "wct";
                if ([ "ca partner", "tmfid", "job type", "job task" ].every(x => headers.indexOf(x) >= 0)) return "wo";
                if ([ "cust_acct", "job task", "sch_date" ].every(x => headers.indexOf(x) >= 0)) return "tc";
            }
        } catch (_) {}
        return null;
    }
    function updateNames() {
        [ "wct", "wo", "tc" ].forEach(kind => {
            const element = $("name-" + kind);
            const file = files[kind];
            if (file) element.textContent = file.name; else if (kind === "wct") element.textContent = "Belum dipilih · .xlsx wajib"; else element.textContent = "Belum dipilih · .xls opsional";
            element.classList.toggle("on", !!file);
        });
    }
    function refresh() {
        updateNames();
        const required = !!files.wct;
        $("count").textContent = required ? "1 / 1 wajib" : "0 / 1 wajib";
        $("run").disabled = !required;
        $("run").textContent = mode === "install" ? "Generate Install & Dismantle" : mode === "change" ? "Generate Change Service" : "Generate All Report";
    }
    function invalidateResult() {
        result = null;
        $("result-panel").classList.add("op-hidden");
        $("save").disabled = true;
    }
    function setSlot(kind, file) {
        files[kind] = file;
        invalidateResult();
        refresh();
    }
    async function takeFiles(list) {
        const unassigned = [];
        for (const file of Array.from(list)) {
            const kind = await sniff(file);
            if (kind === "wct" && !files.wct) setSlot("wct", file); else if (kind === "wo" && !files.wo) setSlot("wo", file); else if (kind === "tc" && !files.tc) setSlot("tc", file); else unassigned.push(file);
        }
        unassigned.forEach(file => {
            if (!files.wct) setSlot("wct", file); else if (!files.wo) setSlot("wo", file); else if (!files.tc) setSlot("tc", file);
        });
        refresh();
    }
    const files = {
        wct: null,
        wo: null,
        tc: null
    };
    let mode = "install";
    let result = null;
    let pendingSlot = null;
    Array.from(document.querySelectorAll("#pane-operation [data-op-pick]")).forEach(button => button.addEventListener("click", () => {
        pendingSlot = button.getAttribute("data-op-pick");
        $("file").value = "";
        $("file").click();
    }));
    $("file").addEventListener("change", () => {
        const selected = Array.from($("file").files || []);
        if (pendingSlot && selected[0]) setSlot(pendingSlot, selected[0]); else if (selected.length) takeFiles(selected);
        pendingSlot = null;
        $("file").value = "";
    });
    $("drop").addEventListener("click", () => {
        pendingSlot = null;
        $("file").click();
    });
    $("drop").addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            $("drop").click();
        }
    });
    [ "dragenter", "dragover" ].forEach(type => $("drop").addEventListener(type, e => {
        e.preventDefault();
        $("drop").classList.add("over");
    }));
    [ "dragleave", "drop" ].forEach(type => $("drop").addEventListener(type, e => {
        e.preventDefault();
        $("drop").classList.remove("over");
    }));
    $("drop").addEventListener("drop", e => {
        if (e.dataTransfer && e.dataTransfer.files.length) takeFiles(e.dataTransfer.files);
    });
    Array.from(document.querySelectorAll("#pane-operation [data-op-mode]")).forEach(button => button.addEventListener("click", () => {
        mode = button.getAttribute("data-op-mode");
        document.querySelectorAll("#pane-operation [data-op-mode]").forEach(item => {
            const active = item === button;
            item.classList.toggle("on", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
        });
        invalidateResult();
        refresh();
    }));
    $("date").addEventListener("change", invalidateResult);
    $("run").addEventListener("click", async () => {
        const button = $("run");
        button.disabled = true;
        button.textContent = "Menghitung…";
        $("error").innerHTML = "";
        invalidateResult();
        try {
            const dateFilter = $("date").value || "";
            const wct = files.wct ? await readSource(files.wct) : null;
            const wo = files.wo ? await readSource(files.wo) : null;
            const tc = mode === "all" && files.tc ? await readSource(files.tc) : null;
            if (mode === "install") result = buildInstall(wct, wo, dateFilter); else if (mode === "change") result = buildChange(wct, wo, dateFilter); else result = buildAll(wct, wo, tc, dateFilter);
            renderResult();
            $("result-panel").classList.remove("op-hidden");
        } catch (error) {
            $("error").innerHTML = '<div class="op-error">' + esc(error.message || error) + "</div>";
        }
        refresh();
    });
    function renderResult() {
        const stats = result.stats;
        $("result-meta").textContent = result.dateFilter ? "Schedule Date " + result.dateFilter : "Semua tanggal";
        const installRows = [ [ "INSTAL", "WCT Install", stats.wctInstall, "WCT" ], [ "INSTAL", "WO Install", stats.woInstall, "WO Report" ], [ "DISMANTLE", "WCT Dismantle", stats.wctDismantle, "WCT" ], [ "DISMANTLE", "WO Dismantle", stats.woDismantle, "WO Report" ] ];
        const changeRows = [ [ "CSV", "WCT Change Service", stats.wctChange, "WCT" ], [ "CSV", "WO Change Service", stats.woChange, "WO Report" ] ];
        const allRows = [ [ "MVM.SR.TC", "TC Report", stats.mvm, "WCT + WO + TC" ], [ "Migration", "Job Task 318", stats.migration, "WCT + WO" ], [ "Collection", "Job Task COLLECT CPE", stats.collection, "WCT + WO" ] ].concat(installRows);
        const rows = result.mode === "install" ? installRows : result.mode === "change" ? changeRows : allRows;
        const total = Object.values(result.sheets).reduce((sum, sheet) => sum + sheet.length, 0);
        $("summary").innerHTML = '<div class="op-summary"><div class="op-summary-head">Output Operation · ' + total + " baris</div>" + rows.map(row => '<div class="op-summary-row"><div class="label"><b>' + row[0] + '</b><span class="sub">' + row[1] + '</span></div><div class="num">' + row[2] + '</div><div class="src">' + row[3] + "</div></div>").join("") + '<div class="op-summary-row total"><div class="label"><b>Total workbook</b><span class="sub">writer terisolasi</span></div><div class="num">' + total + '</div><div class="src">' + Object.keys(result.sheets).length + " sheet</div></div></div>";
        $("save").disabled = false;
    }
    function headerStyle(cell) {
        cell.font = {
            name: "Calibri",
            size: 11,
            bold: true,
            color: {
                argb: "FF000000"
            }
        };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FFC6EFCE"
            }
        };
        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };
        cell.border = {
            top: {
                style: "thin"
            },
            left: {
                style: "thin"
            },
            bottom: {
                style: "thin"
            },
            right: {
                style: "thin"
            }
        };
    }
    function bodyStyle(cell, label) {
        cell.font = {
            name: "Calibri",
            size: 11
        };
        cell.border = {
            top: {
                style: "thin"
            },
            left: {
                style: "thin"
            },
            bottom: {
                style: "thin"
            },
            right: {
                style: "thin"
            }
        };
        cell.alignment = label === "Remarks" ? {
            vertical: "top",
            wrapText: false
        } : {
            horizontal: "center",
            vertical: "top"
        };
    }
    function writeSheet(workbook, name, rows) {
        const titled = name !== "CSV";
        const worksheet = workbook.addWorksheet(name);
        const headerRow = titled ? 2 : 1;
        if (titled) worksheet.getCell(1, 1).value = name === "INSTAL" ? "WO XL INSTAL" : "WO XL Dismantle";
        OPERATION_CONFIG.columns.forEach((label, index) => {
            const cell = worksheet.getCell(headerRow, index + 1);
            cell.value = label;
            headerStyle(cell);
        });
        rows.forEach((row, rowIndex) => OPERATION_CONFIG.columns.forEach((label, columnIndex) => {
            const cell = worksheet.getCell(headerRow + rowIndex + 1, columnIndex + 1);
            cell.value = row[label] == null ? "" : String(row[label]);
            bodyStyle(cell, label);
        }));
        OPERATION_CONFIG.widths.forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });
        worksheet.views = [ {
            state: "frozen",
            ySplit: headerRow,
            showGridLines: true,
            zoomScale: 85
        } ];
        worksheet.autoFilter = {
            from: {
                row: headerRow,
                column: 1
            },
            to: {
                row: Math.max(headerRow, headerRow + rows.length),
                column: OPERATION_CONFIG.columns.length
            }
        };
    }
    function writeTcSheet(workbook, name, rows) {
        const worksheet = workbook.addWorksheet(name);
        TC_REPORT_COLUMNS.forEach((label, index) => {
            const cell = worksheet.getCell(1, index + 1);
            cell.value = label;
            headerStyle(cell);
        });
        rows.forEach((row, rowIndex) => TC_REPORT_COLUMNS.forEach((label, columnIndex) => {
            const cell = worksheet.getCell(rowIndex + 2, columnIndex + 1);
            cell.value = row[label] == null ? "" : String(row[label]);
            bodyStyle(cell, label);
        }));
        TC_REPORT_WIDTHS.forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });
        worksheet.views = [ {
            state: "frozen",
            ySplit: 1,
            showGridLines: true,
            zoomScale: 85
        } ];
        worksheet.autoFilter = {
            from: {
                row: 1,
                column: 1
            },
            to: {
                row: Math.max(1, rows.length + 1),
                column: TC_REPORT_COLUMNS.length
            }
        };
    }
    function writeAllInstallSheet(workbook, rows) {
        const worksheet = workbook.addWorksheet("XL INSTALL");
        worksheet.getCell(1, 1).value = "WO XL INSTAL";
        OPERATION_CONFIG.columns.forEach((label, index) => {
            const cell = worksheet.getCell(2, index + 1);
            cell.value = label;
            headerStyle(cell);
        });
        rows.forEach((row, rowIndex) => OPERATION_CONFIG.columns.forEach((label, columnIndex) => {
            const cell = worksheet.getCell(rowIndex + 3, columnIndex + 1);
            cell.value = row[label] == null ? "" : String(row[label]);
            bodyStyle(cell, label);
        }));
        OPERATION_CONFIG.widths.forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });
        worksheet.views = [ {
            state: "frozen",
            ySplit: 2,
            showGridLines: true,
            zoomScale: 85
        } ];
        worksheet.autoFilter = {
            from: {
                row: 2,
                column: 1
            },
            to: {
                row: Math.max(2, rows.length + 2),
                column: OPERATION_CONFIG.columns.length
            }
        };
    }
    function writeAllDismantleSheet(workbook, rows) {
        const columns = OPERATION_CONFIG.columns.filter(column => column !== "Category Pending Network" && column !== "Sub Category Pending Network");
        const worksheet = workbook.addWorksheet("XL DISMANTLE");
        columns.forEach((label, index) => {
            const cell = worksheet.getCell(1, index + 1);
            cell.value = label;
            headerStyle(cell);
        });
        rows.forEach((row, rowIndex) => columns.forEach((label, columnIndex) => {
            const cell = worksheet.getCell(rowIndex + 2, columnIndex + 1);
            cell.value = row[label] == null ? "" : String(row[label]);
            bodyStyle(cell, label);
        }));
        OPERATION_CONFIG.widths.filter((_, index) => index !== 11 && index !== 12).forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });
        worksheet.views = [ {
            state: "frozen",
            ySplit: 1,
            showGridLines: true,
            zoomScale: 85
        } ];
        worksheet.autoFilter = {
            from: {
                row: 1,
                column: 1
            },
            to: {
                row: Math.max(1, rows.length + 1),
                column: columns.length
            }
        };
    }
    async function downloadResult() {
        const workbook = new ExcelJS.Workbook;
        workbook.creator = "Dispatch Report";
        workbook.modified = new Date;
        if (result.mode === "all") {
            [ "MVM.SR.TC", "Migration", "Collection" ].forEach(name => writeTcSheet(workbook, name, result.sheets[name]));
            writeAllInstallSheet(workbook, result.sheets["XL INSTALL"]);
            writeAllDismantleSheet(workbook, result.sheets["XL DISMANTLE"]);
        } else Object.keys(result.sheets).forEach(name => writeSheet(workbook, name, result.sheets[name]));
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([ buffer ], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        const stamp = result.dateFilter || (new Date).toISOString().slice(0, 10);
        const label = result.mode === "change" ? "Change Service " : result.mode === "all" ? "All Report " : "Install Dismantle ";
        anchor.download = "Report Operation " + label + stamp + ".xlsx";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(anchor.href), 4e3);
    }
    $("save").addEventListener("click", async () => {
        const button = $("save");
        button.disabled = true;
        button.textContent = "Menyiapkan…";
        try {
            await downloadResult();
            button.textContent = "Download workbook";
            button.disabled = false;
        } catch (error) {
            $("error").innerHTML = '<div class="op-error">Gagal menulis workbook: ' + esc(error.message || error) + "</div>";
            button.textContent = "Download workbook";
            button.disabled = false;
        }
    });
    refresh();
})();