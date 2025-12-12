import sys
import os
import random

# Setup path agar bisa import module backend
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from backend.MainUtama.database import SessionLocal
from backend.Models import bookModels, storeModels, categoryModels

def seed_books():
    db = SessionLocal()
    try:
        print("--- Memulai Seeding Data Buku ---")

        # 1. Ambil Data Store dan Category yang sudah ada
        stores = db.query(storeModels.Store).all()
        categories = db.query(categoryModels.Category).all()

        if not stores:
            print("[-] Tidak ada toko ditemukan. Pastikan sudah ada user seller dengan toko (jalankan seed_users.py).")
            return
        
        if not categories:
            print("[-] Tidak ada kategori ditemukan. Jalankan seed_users.py terlebih dahulu.")
            return

        print(f"[+] Ditemukan {len(stores)} toko dan {len(categories)} kategori.")

        # 2. Data Dummy Buku
        # Format: (Judul, Penulis, Deskripsi, Harga, Stok, Kondisi, Nama Kategori, Image URL)
        dummy_books_source = [
            ("Laskar Pelangi", "Andrea Hirata", "Novel inspiratif tentang kehidupan anak-anak di Belitong.", 50000, 10, "Bekas", "Fiksi", "https://upload.wikimedia.org/wikipedia/id/8/8e/Laskar_pelangi_sampul.jpg"),
            ("Bumi Manusia", "Pramoedya Ananta Toer", "Roman sejarah pergerakan nasional di awal abad 20.", 85000, 15, "Baru", "Fiksi", "https://upload.wikimedia.org/wikipedia/id/4/44/Bumi_Manusia.jpg"),
            ("Filosofi Teras", "Henry Manampiring", "Penerapan filsafat Stoa dalam kehidupan sehari-hari.", 75000, 8, "Baru", "Humaniora", "https://cdn.gramedia.com/uploads/items/filosofi_teras_cov.jpg"),
            ("Sapiens", "Yuval Noah Harari", "Riwayat singkat umat manusia dari zaman batu.", 95000, 5, "Bekas", "Humaniora", "https://upload.wikimedia.org/wikipedia/en/0/06/%E1%B8%B2itsur_toldot_ha-enoshut.jpg"),
            ("Fisika Dasar", "Halliday & Resnick", "Buku pegangan wajib mahasiswa teknik dan sains.", 120000, 3, "Bekas", "Saintek", "https://images-na.ssl-images-amazon.com/images/I/91wX-yYqRTL.jpg"),
            ("Algoritma Pemrograman", "Rinaldi Munir", "Dasar-dasar logika pemrograman komputer.", 60000, 20, "Baru", "Saintek", "https://informatika.stei.itb.ac.id/~rinaldi.munir/Buku/Algoritma%20dan%20Pemrograman%20dalam%20Bahasa%20Pascal%20dan%20C.jpg"),
            ("Cantik Itu Luka", "Eka Kurniawan", "Novel realisme magis tentang sejarah kelam.", 90000, 7, "Baru", "Fiksi", "https://upload.wikimedia.org/wikipedia/id/thumb/a/a2/Cantik_Itu_Luka.jpg/220px-Cantik_Itu_Luka.jpg"),
            ("Atomic Habits", "James Clear", "Cara membangun kebiasaan baik.", 95000, 12, "Baru", "Humaniora", "https://m.media-amazon.com/images/I/81wgcld4wxL.jpg"),
            ("Kalkulus Purcell", "Purcell", "Buku ajar kalkulus edisi 9.", 150000, 4, "Bekas", "Saintek", "https://images-na.ssl-images-amazon.com/images/I/51sO52A-VZL._SX382_BO1,204,203,200_.jpg"),
            ("Dunia Sophie", "Jostein Gaarder", "Novel tentang sejarah filsafat.", 65000, 6, "Bekas", "Fiksi", "https://upload.wikimedia.org/wikipedia/en/6/62/Sophies_world.jpg"),
            ("Pulang", "Leila S. Chudori", "Kisah tentang eksil politik Indonesia di Paris.", 88000, 9, "Baru", "Fiksi", "https://upload.wikimedia.org/wikipedia/id/b/b6/Pulang_Leila_Chudori.jpg"),
            ("Psikologi Komunikasi", "Jalaluddin Rakhmat", "Buku dasar ilmu komunikasi.", 55000, 11, "Bekas", "Humaniora", "https://cdn.gramedia.com/uploads/items/9786027973180_Psikologi-Komunikasi-Edisi-Revisi.jpg"),
        ]

        count = 0
        for title, author, desc, price, stock, cond, cat_name, img_url in dummy_books_source:
            # Pilih toko secara acak untuk mendistribusikan buku
            store = random.choice(stores)
            
            # Cari kategori object berdasarkan nama, fallback ke kategori pertama jika tidak ada
            category = next((c for c in categories if c.name == cat_name), categories[0])

            # Cek duplikasi agar tidak double insert jika script dijalankan ulang
            existing = db.query(bookModels.Book).filter(
                bookModels.Book.title == title,
                bookModels.Book.store_id == store.id
            ).first()

            if not existing:
                print(f"[+] Menambahkan '{title}' ke toko '{store.nama_toko}'")
                new_book = bookModels.Book(
                    title=title,
                    author=author,
                    description=desc,
                    price=price,
                    stock=stock,
                    condition=cond,
                    category_id=category.id,
                    store_id=store.id,
                    is_active=True,
                    image_url=img_url # Menggunakan link gambar
                )
                db.add(new_book)
                count += 1
            else:
                print(f"[*] Buku '{title}' sudah ada di toko '{store.nama_toko}'")

        db.commit()
        print(f"\n[INFO] Berhasil menambahkan {count} buku ke database.")

    except Exception as e:
        print(f"Error saat seeding buku: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_books()
