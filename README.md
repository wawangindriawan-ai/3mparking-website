# 3M Parking — Website Company Profile

Website company profile satu halaman untuk **PT Tiga Marka Utama (3M Parking)** — perusahaan manajemen pengelolaan parkir, teknologi parkir digital, dan penyediaan SDM profesional di Jakarta dan Bandung sejak 2017.

Tampilan mengikuti identitas company profile cetak perusahaan: biru royal, merah, putih, pola halftone, dan aksen diagonal.

## Isi proyek

```
index.html        seluruh halaman (navbar, hero, tentang, layanan, produk,
                  kenapa kami, galeri, kontak, footer)
css/style.css     seluruh styling + aturan responsif
js/script.js      menu mobile, scrollspy, animasi muncul, lightbox galeri
images/           foto hero, layanan, galeri, dan lokasi operasional
CLAUDE.md         catatan teknis untuk pengembangan lanjutan
```

Tanpa framework, tanpa dependensi, dan tanpa proses build — cukup HTML, CSS, dan JavaScript biasa.

## Menjalankan secara lokal

Buka `index.html` langsung di browser, atau jalankan server lokal agar path relatif dan font berperilaku seperti di produksi:

```bash
python -m http.server 8000     # lalu buka http://localhost:8000
```

## Deploy

Karena situs ini statis, seluruh folder cukup disalin ke hosting statis mana pun. Repositori ini di-deploy otomatis ke Vercel setiap kali ada push ke branch `main`.

## Catatan aset

Empat file `images/svc-*.jpg` masih berupa potongan dari PDF company profile sehingga teks kartunya ikut terbawa di dalam gambar. Sementara ini dipotong lewat CSS (`.is-pdf-crop`). Saat foto asli tersedia, hapus class `is-pdf-crop` pada keempat tag `<img>` di `index.html` dan hapus blok CSS-nya di `css/style.css` — keduanya sudah ditandai komentar `SEMENTARA`.

## Kontak

PT Tiga Marka Utama — 0813-1793-5303 · tigamarkautama@gmail.com
Jl. Pelajar Pejuang 45 No.119, Turangga, Lengkong, Kota Bandung, Jawa Barat 40264
