import sys
import os

# Tambahkan direktori saat ini ke sys.path agar bisa import module backend
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from backend.MainUtama.database import SessionLocal
# [FIX] Import semua model yang berelasi dengan User, Store, & Book agar Mapper tidak error
from backend.Models import (
    aboutContentModels, 
    announcementModels, 
    securityTipModels, 
    userModels, 
    roleModels,
    storeModels,       
    reviewModels,
    reportModels,
    wishlistModels,
    transactionModels,
    bookModels,      
    categoryModels,
    moderationModels # [FIX] Tambahkan ini agar Book bisa mengenali Moderation
)

def seed_all_content():
    db = SessionLocal()
    try:
        print("--- Memulai Seeding Konten (About, Announcement, Security Tips) ---")

        # Cari Admin ID (opsional, untuk field created_by)
        admin = db.query(userModels.User).filter(userModels.User.role_id == 1).first()
        admin_id = admin.id if admin else None

        # 1. SEED ABOUT CONTENT
        print("\n[1/3] Seeding About Content...")
        about_data = [
            {
                "title": "Visi",
                "content": "\"Menjadi ekosistem pertukaran buku terdepan yang menghubungkan pecinta literasi di seluruh Indonesia, serta mewujudkan akses bacaan yang inklusif, terjangkau, dan ramah lingkungan.\""
            },
            {
                "title": "Misi",
                "content": """Akses Tanpa Batas: Memudahkan setiap orang untuk mendapatkan bahan bacaan berkualitas tanpa terkendala biaya mahal.

Komunitas Literasi: Membangun jejaring pembaca yang saling mendukung, berbagi wawasan, dan merekomendasikan karya terbaik.

Keberlanjutan (Sustainability): Memperpanjang umur buku dan mengurangi limbah kertas dengan konsep ekonomi sirkular (reuse & recycle)."""
            },
            {
                "title": "Manfaat",
                "content": """Mengapa Anda Harus Bertukar Buku di Sini?

📚 Hemat Biaya, Baca Sepuasnya
Nikmati petualangan baru tanpa membeli buku baru. Cukup tukarkan buku lama yang sudah selesai Anda baca.

🌱 Aksi Nyata untuk Bumi
Setiap buku yang ditukarkan adalah langkah kecil mengurangi penebangan pohon untuk kertas baru. Jadilah pahlawan lingkungan dari rak buku Anda.

🤝 Temukan Sahabat Baca
Terhubung dengan ribuan anggota komunitas yang memiliki selera baca unik. Diskusikan plot, karakter, dan ide-ide menarik bersama teman baru.

🏠 Decluttering yang Bermanfaat
Kosongkan rak buku Anda yang penuh sesak untuk memberikan ruang bagi inspirasi baru, sambil memastikan buku lama Anda bermanfaat bagi orang lain."""
            },
            {
                "title": "Etika & Aturan Bertukar Buku",
                "content": """Untuk menjaga komunitas ini tetap nyaman dan adil, harap patuhi pedoman berikut:

1. Kejujuran adalah Kunci
Deskripsikan kondisi buku apa adanya. Jika ada halaman sobek, noda kuning (bercak), atau coretan, wajib dicantumkan di deskripsi. Foto harus asli dan terbaru.

2. Standar Kelayakan Buku
Kami tidak menerima buku dalam kondisi:
- Halaman hilang atau tidak terbaca.
- Terkena jamur parah atau basah.
- Buku bajakan/fotokopi (Hargai hak cipta penulis!).

3. Pengiriman & Tanggung Jawab
- Kemas buku dengan aman (disarankan menggunakan pelapis tahan air).
- Input nomor resi pengiriman maksimal 2x24 jam setelah kesepakatan tukar terjadi.

4. Saling Menghargai
Berkomunikasilah dengan sopan. Dilarang keras melakukan ujaran kebencian, penipuan, atau pelecehan dalam fitur chat. Pelanggaran akan berakibat pada pemblokiran akun permanen."""
            }
        ]

        for item in about_data:
            existing = db.query(aboutContentModels.AboutContent).filter(
                aboutContentModels.AboutContent.title == item["title"]
            ).first()
            if not existing:
                print(f"   [+] Menambahkan About: {item['title']}")
                new_obj = aboutContentModels.AboutContent(
                    title=item["title"],
                    content=item["content"],
                    created_by=admin_id
                )
                db.add(new_obj)
            else:
                print(f"   [*] Mengupdate About: {item['title']}")
                existing.content = item["content"]
                existing.created_by = admin_id

        # 2. SEED ANNOUNCEMENTS
        print("\n[2/3] Seeding Announcements...")
        announcement_data = [
            {
                "title": "Selamat Datang di TukarBuku!",
                "content": "Platform pertukaran buku nomor 1 di Indonesia. Mulai tukar buku bekasmu sekarang dan temukan bacaan baru tanpa biaya mahal."
            },
            {
                "title": "Maintenance Server",
                "content": "Kami akan melakukan pemeliharaan sistem pada hari Sabtu, 25 November 2023 pukul 23:00 WIB. Mohon maaf atas ketidaknyamanannya."
            },
            {
                "title": "Fitur Baru: Wishlist",
                "content": "Sekarang kamu bisa menyimpan buku impianmu ke dalam Wishlist agar tidak ketinggalan saat buku tersebut tersedia."
            },
            {
                "title": "Promo Ongkir",
                "content": "Dapatkan potongan ongkos kirim untuk setiap pertukaran buku antar pulau selama bulan Desember. Syarat dan ketentuan berlaku."
            }
        ]

        for item in announcement_data:
            existing = db.query(announcementModels.Announcement).filter(
                announcementModels.Announcement.title == item["title"]
            ).first()
            if not existing:
                print(f"   [+] Menambahkan Announcement: {item['title']}")
                new_obj = announcementModels.Announcement(
                    title=item["title"],
                    content=item["content"],
                    created_by=admin_id,
                    is_active=1
                )
                db.add(new_obj)
            else:
                print(f"   [*] Mengupdate Announcement: {item['title']}")
                existing.content = item["content"]
                existing.created_by = admin_id

        # 3. SEED SECURITY TIPS
        print("\n[3/3] Seeding Security Tips...")
        tips_data = [
            {
                "title": "Gunakan Fitur Chat Aplikasi",
                "content": "Selalu gunakan fitur chat di dalam aplikasi untuk berkomunikasi. Hindari membagikan nomor pribadi atau bertransaksi di luar platform untuk menghindari penipuan."
            },
            {
                "title": "Cek Reputasi Penjual",
                "content": "Sebelum bertransaksi, pastikan untuk melihat rating dan ulasan toko. Penjual terpercaya biasanya memiliki riwayat ulasan yang positif."
            },
            {
                "title": "Jangan Transfer Langsung",
                "content": "Waspada terhadap permintaan transfer langsung ke rekening pribadi tanpa kejelasan. Pastikan kesepakatan sudah jelas sebelum melakukan pembayaran ongkir atau biaya lainnya."
            },
            {
                "title": "Verifikasi Kondisi Buku",
                "content": "Mintalah foto detail kondisi buku terkini kepada pemilik buku. Pastikan tidak ada kerusakan fatal yang tidak disebutkan dalam deskripsi."
            },
            {
                "title": "Simpan Bukti Transaksi",
                "content": "Selalu simpan bukti percakapan dan bukti pengiriman (resi) sampai buku benar-benar diterima dengan baik."
            }
        ]

        for item in tips_data:
            existing = db.query(securityTipModels.SecurityTip).filter(
                securityTipModels.SecurityTip.title == item["title"]
            ).first()
            if not existing:
                print(f"   [+] Menambahkan Security Tip: {item['title']}")
                new_obj = securityTipModels.SecurityTip(
                    title=item["title"],
                    content=item["content"],
                    created_by=admin_id
                )
                db.add(new_obj)
            else:
                print(f"   [*] Mengupdate Security Tip: {item['title']}")
                existing.content = item["content"]
                existing.created_by = admin_id

        db.commit()
        print("\n--- Seeding Konten Selesai ---")

    except Exception as e:
        print(f"Error saat seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_content()
