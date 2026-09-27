/* =====================================================
   SITUSBOLA
   JAVASCRIPT UTAMA
   API: TheSportsDB
   ===================================================== */


/* =====================================================
   PENGATURAN API
   ===================================================== */

const API_KEY = "123";

const API_BASE =
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

const AUTO_REFRESH = 60000;


/* =====================================================
   UTILITAS
   ===================================================== */

function getElement(id) {

    return document.getElementById(id);

}


function formatTanggal(tanggal) {

    const date = new Date(tanggal);

    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function formatTanggalSingkat(tanggal) {

    const date = new Date(tanggal);

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =====================================================
   AMBIL DATA API
   ===================================================== */

async function ambilData(url) {

    try {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                function () {

                    controller.abort();

                },
                8000
            );


        const response =
            await fetch(
                url,
                {
                    signal:
                        controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil data API"
            );

        }


        const data =
            await response.json();


        return data;

    } catch (error) {

        console.error(
            "Kesalahan API:",
            error
        );

        return null;

    }

}


/* =====================================================
   AMBIL PERTANDINGAN BERDASARKAN TANGGAL
   ===================================================== */

async function ambilPertandingan(tanggal) {

    const url =
        `${API_BASE}/eventsday.php?d=${tanggal}&s=Soccer`;


    const data =
        await ambilData(url);


    if (
        !data ||
        !data.events
    ) {

        return [];

    }


    return data.events;

}


/* =====================================================
   AMBIL PERTANDINGAN BEBERAPA HARI
   ===================================================== */

async function ambilBeberapaHari(
    jumlahHari = 3
) {

    const semuaPertandingan = [];


    const sekarang =
        new Date();


    for (
        let i = 0;
        i < jumlahHari;
        i++
    ) {

        const tanggal =
            new Date(sekarang);


        tanggal.setDate(
            sekarang.getDate() + i
        );


        const tahun =
            tanggal.getFullYear();


        const bulan =
            String(
                tanggal.getMonth() + 1
            ).padStart(2, "0");


        const hari =
            String(
                tanggal.getDate()
            ).padStart(2, "0");


        const tanggalAPI =
            `${tahun}-${bulan}-${hari}`;


        const pertandingan =
            await ambilPertandingan(
                tanggalAPI
            );


        semuaPertandingan.push(
            ...pertandingan
        );

    }


    return semuaPertandingan;

}


/* =====================================================
   STATUS LIVE
   ===================================================== */

function apakahLive(match) {

    if (!match) {

        return false;

    }


    const status =
        String(
            match.strStatus || ""
        ).toLowerCase();


    const progress =
        String(
            match.strProgress || ""
        ).toLowerCase();


    if (
        status.includes("live") ||
        status.includes("1st") ||
        status.includes("2nd") ||
        status.includes("3rd") ||
        status.includes("4th")
    ) {

        return true;

    }


    if (
        progress.includes("1st") ||
        progress.includes("2nd") ||
        progress.includes("3rd") ||
        progress.includes("4th")
    ) {

        return true;

    }


    return false;

}


/* =====================================================
   STATUS SELESAI
   ===================================================== */

function apakahSelesai(match) {

    if (!match) {

        return false;

    }


    const status =
        String(
            match.strStatus || ""
        ).toLowerCase();


    return (
        status === "ft" ||
        status === "finished" ||
        status === "final" ||
        status.includes("finished")
    );

}


/* =====================================================
   KARTU PERTANDINGAN
   ===================================================== */

function buatKartu(match) {

    const homeTeam =
        match.strHomeTeam ||
        "Tim Home";


    const awayTeam =
        match.strAwayTeam ||
        "Tim Away";


    const homeBadge =
        match.strHomeTeamBadge ||
        "";


    const awayBadge =
        match.strAwayTeamBadge ||
        "";


    const waktu =
        match.strTime ||
        "--:--";


    const tanggal =
        match.dateEvent ||
        "";


    let statusHTML =
        `<span class="badge jadwal">
            JADWAL
        </span>`;


    if (
        apakahLive(match)
    ) {

        statusHTML =
            `<span class="badge live">
                LIVE
            </span>`;

    } else if (
        apakahSelesai(match)
    ) {

        statusHTML =
            `<span class="badge selesai">
                SELESAI
            </span>`;

    }


    const skorHome =
        match.intHomeScore !== null &&
        match.intHomeScore !== undefined
            ? match.intHomeScore
            : "-";


    const skorAway =
        match.intAwayScore !== null &&
        match.intAwayScore !== undefined
            ? match.intAwayScore
            : "-";


    return `

        <div class="match-card">

            <div class="match-header">

                <span>
                    ${match.strLeague || "Kompetisi"}
                </span>

                ${statusHTML}

            </div>


            <div class="match-date">

                ${tanggal
                    ? formatTanggal(tanggal)
                    : ""
                }

                ${waktu !== "--:--"
                    ? " • " + waktu
                    : ""
                }

            </div>


            <div class="teams">

                <div class="team">

                    ${
                        homeBadge
                        ? `<img
                             src="${homeBadge}"
                             alt="${homeTeam}"
                           >`
                        : ""
                    }

                    <span>
                        ${homeTeam}
                    </span>

                </div>


                <div class="score">

                    <strong>
                        ${skorHome}
                    </strong>

                    <span>:</span>

                    <strong>
                        ${skorAway}
                    </strong>

                </div>


                <div class="team">

                    ${
                        awayBadge
                        ? `<img
                             src="${awayBadge}"
                             alt="${awayTeam}"
                           >`
                        : ""
                    }

                    <span>
                        ${awayTeam}
                    </span>

                </div>

            </div>

        </div>

    `;

}


/* =====================================================
   TAMPILKAN DAFTAR
   ===================================================== */

function tampilkanDaftar(
    element,
    data,
    pesan
) {

    if (!element) {

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        element.innerHTML = `
            <div class="loading">
                ${pesan}
            </div>
        `;

        return;

    }


    element.innerHTML =
        data
            .map(
                function (match) {

                    return buatKartu(match);

                }
            )
            .join("");

}


/* =====================================================
   HALAMAN JADWAL
   ===================================================== */

async function tampilkanJadwal() {

    const container =
        getElement("jadwal-api");


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="loading">
            ⏳ Memuat jadwal pertandingan...
        </div>
    `;


    const pertandingan =
        await ambilBeberapaHari(3);


    tampilkanDaftar(
        container,
        pertandingan,
        "Belum ada jadwal pertandingan."
    );

}


/* =====================================================
   HALAMAN LIVE
   ===================================================== */

async function tampilkanLive() {

    const container =
        getElement("live-api");


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="loading">
            ⏳ Memeriksa pertandingan live...
        </div>
    `;


    const sekarang =
        new Date();


    const tahun =
        sekarang.getFullYear();


    const bulan =
        String(
            sekarang.getMonth() + 1
        ).padStart(2, "0");


    const hari =
        String(
            sekarang.getDate()
        ).padStart(2, "0");


    const tanggal =
        `${tahun}-${bulan}-${hari}`;


    const pertandingan =
        await ambilPertandingan(
            tanggal
        );


    const live =
        pertandingan.filter(
            function (match) {

                return apakahLive(match);

            }
        );


    tampilkanDaftar(
        container,
        live,
        "Tidak ada pertandingan yang sedang live."
    );

}


/* =====================================================
   HALAMAN HISTORY
   ===================================================== */

async function tampilkanHistory() {

    const container =
        getElement("history-api");


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="loading">
            ⏳ Memuat hasil pertandingan...
        </div>
    `;


    const hasil = [];


    const sekarang =
        new Date();


    for (
        let i = 1;
        i <= 3;
        i++
    ) {

        const tanggal =
            new Date(sekarang);


        tanggal.setDate(
            sekarang.getDate() - i
        );


        const tahun =
            tanggal.getFullYear();


        const bulan =
            String(
                tanggal.getMonth() + 1
            ).padStart(2, "0");


        const hari =
            String(
                tanggal.getDate()
            ).padStart(2, "0");


        const tanggalAPI =
            `${tahun}-${bulan}-${hari}`;


        const pertandingan =
            await ambilPertandingan(
                tanggalAPI
            );


        hasil.push(
            ...pertandingan.filter(
                function (match) {

                    return apakahSelesai(
                        match
                    );

                }
            )
        );

    }


    tampilkanDaftar(
        container,
        hasil,
        "Belum ada hasil pertandingan."
    );

}


/* =====================================================
   PENCARIAN HISTORY
   ===================================================== */

async function cariHistory() {

    const input =
        getElement("historySearch");


    const container =
        getElement("history-api");


    if (
        !input ||
        !container
    ) {

        return;

    }


    const kata =
        input.value.trim().toLowerCase();


    if (!kata) {

        tampilkanHistory();

        return;

    }


    const kartu =
        container.querySelectorAll(
            ".match-card"
        );


    if (
        !kartu ||
        kartu.length === 0
    ) {

        container.innerHTML = `
            <div class="loading">
                Belum ada hasil pertandingan
                yang bisa dicari.
            </div>
        `;

        return;

    }


    let ditemukan = 0;


    kartu.forEach(
        function (item) {

            const teks =
                item.textContent
                    .toLowerCase();


            if (
                teks.includes(kata)
            ) {

                item.style.display =
                    "";

                ditemukan++;

            } else {

                item.style.display =
                    "none";

            }

        }
    );


    if (ditemukan === 0) {

        container.innerHTML = `
            <div class="loading">
                Tidak ditemukan hasil untuk:
                <strong>${input.value}</strong>
            </div>
        `;

    }

}


/* =====================================================
   HALAMAN KOMPETISI
   ===================================================== */

async function tampilkanKompetisi() {

    const container =
        getElement("competition-api");


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="loading">
            ⏳ Memuat kompetisi...
        </div>
    `;


    const url =
        `${API_BASE}/all_leagues.php`;


    const data =
        await ambilData(url);


    if (
        !data ||
        !data.leagues ||
        data.leagues.length === 0
    ) {

        container.innerHTML = `
            <div class="loading">
                Belum ada data kompetisi.
            </div>
        `;

        return;

    }


    const sepakbola =
        data.leagues.filter(
            function (league) {

                const sport =
                    String(
                        league.strSport || ""
                    ).toLowerCase();


                return sport === "soccer";

            }
        );


    if (sepakbola.length === 0) {

        container.innerHTML = `
            <div class="loading">
                Belum ada kompetisi sepak bola.
            </div>
        `;

        return;

    }


    container.innerHTML =
        sepakbola
            .map(
                function (league) {

                    return `

                        <div class="competition-card">

                            <h3>
                                ⚽
                                ${league.strLeague}
                            </h3>

                            <p>
                                ${league.strCountry || "Internasional"}
                            </p>

                            <button
                                class="club-button"
                                type="button"
                                onclick="tampilkanKlub(
                                    '${league.strLeague.replace(/'/g, "\\'")}',
                                    this
                                )">

                                👥 Lihat Klub

                            </button>

                            <div class="club-list"></div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   TAMPILKAN KLUB
   ===================================================== */

async function tampilkanKlub(
    namaLiga,
    tombol
) {

    const kartu =
        tombol.closest(
            ".competition-card"
        );


    if (!kartu) {

        return;

    }


    const daftarKlub =
        kartu.querySelector(
            ".club-list"
        );


    if (!daftarKlub) {

        return;

    }


    if (
        daftarKlub.innerHTML.trim() !== "" &&
        daftarKlub.style.display !== "none"
    ) {

        daftarKlub.style.display =
            "none";

        tombol.innerHTML =
            "👥 Lihat Klub";

        return;

    }


    daftarKlub.style.display =
        "block";


    daftarKlub.innerHTML = `
        <div class="loading">
            ⏳ Memuat klub...
        </div>
    `;


    const url =
        `${API_BASE}/search_all_teams.php?l=${encodeURIComponent(namaLiga)}`;


    const data =
        await ambilData(url);


    if (
        !data ||
        !data.teams ||
        data.teams.length === 0
    ) {

        daftarKlub.innerHTML = `
            <div class="loading">
                ❌ Klub tidak ditemukan.
            </div>
        `;

        return;

    }


    daftarKlub.innerHTML =
        data.teams
            .map(
                function (club) {

                    return `
                        <div class="club-item">
                            ⚽ ${club.strTeam}
                        </div>
                    `;

                }
            )
            .join("");


    tombol.innerHTML =
        "🔽 Sembunyikan Klub";

}


/* =====================================================
   KLASemen
   ===================================================== */

async function tampilkanKlasemen() {

    const container =
        getElement("tableList");


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="loading">
            ⏳ Memuat klasemen...
        </div>
    `;


    const url =
        `${API_BASE}/lookuptable.php?l=4328`;


    const data =
        await ambilData(url);


    if (
        !data ||
        !data.table ||
        data.table.length === 0
    ) {

        container.innerHTML = `
            <div class="loading">
                Klasemen belum tersedia.
            </div>
        `;

        return;

    }


    let html = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            Tim
                        </th>

                        <th>
                            M
                        </th>

                        <th>
                            GD
                        </th>

                        <th>
                            Poin
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    data.table.forEach(
        function (team, index) {

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>

                        ${
                            team.strTeamBadge
                            ? `<img
                                src="${team.strTeamBadge}"
                                alt=""
                                style="
                                    width:25px;
                                    height:25px;
                                    object-fit:contain;
                                    vertical-align:middle;
                                    margin-right:6px;
                                "
                              >`
                            : ""
                        }

                        ${team.strTeam}

                    </td>

                    <td>
                        ${team.intPlayed || 0}
                    </td>

                    <td>
                        ${team.intGoalDifference || 0}
                    </td>

                    <td>
                        <strong>
                            ${team.intPoints || 0}
                        </strong>
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;

}


/* =====================================================
   HALAMAN BERANDA
   ===================================================== */

async function tampilkanBeranda() {

    const container =
        getElement("homeList");


    if (!container) {

        return;

    }


    const pertandingan =
        await ambilBeberapaHari(1);


    if (
        !pertandingan ||
        pertandingan.length === 0
    ) {

        container.innerHTML = `
            <div class="loading">
                Belum ada pertandingan hari ini.
            </div>
        `;

        return;

    }


    const beberapa =
        pertandingan.slice(0, 6);


    container.innerHTML =
        beberapa
            .map(
                function (match) {

                    return buatKartu(match);

                }
            )
            .join("");

}


/* =====================================================
   MENU NAVIGASI
   ===================================================== */
   
   function aktifkanMenu() {

    const menuButton =
        getElement("menuButton");


    const mainMenu =
        getElement("mainMenu");


    if (
        !menuButton ||
        !mainMenu
    ) {

        return;

    }


    menuButton.onclick =
        function () {

            mainMenu.classList.toggle(
                "show"
            );

        };


    const links =
        mainMenu.querySelectorAll(
            "a"
        );


    links.forEach(
        function (link) {

            link.onclick =
                function () {

                    mainMenu.classList.remove(
                        "show"
                    );

                };

        }
    );

}


/* =====================================================
   MENENTUKAN HALAMAN
   ===================================================== */

function initPage(page) {


    /* -----------------------------
       BERANDA
       ----------------------------- */

    if (
        page === "home"
    ) {

        tampilkanBeranda();

        return;

    }


    /* -----------------------------
       JADWAL
       ----------------------------- */

    if (
        page === "schedule"
    ) {

        tampilkanJadwal();

        return;

    }


    /* -----------------------------
       LIVE
       ----------------------------- */

    if (
        page === "live"
    ) {

        tampilkanLive();


        setInterval(
            tampilkanLive,
            AUTO_REFRESH
        );

        return;

    }


    /* -----------------------------
       HISTORY
       ----------------------------- */

    if (
        page === "history"
    ) {

        tampilkanHistory();

        return;

    }


    /* -----------------------------
       KOMPETISI
       ----------------------------- */

    if (
        page === "competition"
    ) {

        tampilkanKompetisi();

        tampilkanKlasemen();

        return;

    }


    /* -----------------------------
       TENTANG
       ----------------------------- */

    if (
        page === "about"
    ) {

        return;

    }

}


/* =====================================================
   JALANKAN SAAT HALAMAN SELESAI DIMUAT
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        aktifkanMenu();


        const searchButton =
            getElement(
                "historySearchButton"
            );


        if (searchButton) {

            searchButton.onclick =
                cariHistory;

        }

    }
);


/* =====================================================
   SELESAI
   ===================================================== */