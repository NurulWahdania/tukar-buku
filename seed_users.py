import sys
import os
import bcrypt # Import bcrypt langsung

# Tambahkan direktori saat ini ke sys.path agar bisa import module
# Menggunakan insert(0, ...) untuk memprioritaskan path ini
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# --- CATATAN PENTING UNTUK LOGIN ---
# Patch ini diperlukan agar passlib (yang kemungkinan dipakai di utils.py)
# tidak error saat bertemu bcrypt versi baru.
if not hasattr(bcrypt, '__about__'):
    try:
        class MockAbout:
            __version__ = bcrypt.__version__
        bcrypt.__about__ = MockAbout()
    except Exception:
        pass
# -----------------------------------

# Import module dilakukan SETELAH sys.path di-update
from sqlalchemy.orm import Session
from backend.MainUtama.database import SessionLocal
# Import utils dari backend agar hashing password KONSISTEN dengan aplikasi (Register/Login)
from backend.MainUtama import utils 
from backend.Models import userModels, storeModels, roleModels, reviewModels

# [FIX] Import model yang sudah dipecah agar SQLAlchemy mengenali relasi di User
from backend.Models import (
    reportModels, 
    wishlistModels, 
    transactionModels, 
    bookModels, 
    categoryModels, 
    moderationModels, 
    # contentModels,  <-- HAPUS INI karena file tidak ada
    announcementModels, # Tambahkan ini
    aboutContentModels, # Tambahkan ini
    securityTipModels   # Tambahkan ini
)

def get_password_hash(password):
    # Gunakan fungsi hashing dari utils aplikasi agar formatnya sama persis
    # dengan yang digunakan saat login.
    return utils.get_password_hash(password)

def seed_data():
    db = SessionLocal()
    try:
        print("--- Memulai Seeding Data Dummy ---")

        # 1. SEED ROLES (Pastikan Role Admin & User ada)
        # Kita perlu mapping dari nama role (string) ke object Role (database)
        roles_map = {}
        
        # FIX: Definisikan ID spesifik agar Seller = 2 dan User = 3
        target_roles = [
            {"id": 1, "name": "admin"},
            {"id": 2, "name": "seller"},
            {"id": 3, "name": "user"}
        ]
        
        for r_def in target_roles:
            r_name = r_def["name"]
            r_id = r_def["id"]

            role_obj = db.query(roleModels.Role).filter(roleModels.Role.name == r_name).first()
            if not role_obj:
                # Cek apakah ID tersebut sudah terpakai
                existing_id = db.query(roleModels.Role).filter(roleModels.Role.id == r_id).first()
                if existing_id:
                     print(f"[-] ID {r_id} sudah dipakai {existing_id.name}. Membuat {r_name} auto-increment.")
                     role_obj = roleModels.Role(name=r_name)
                else:
                     print(f"[+] Membuat Role baru: {r_name} dengan ID {r_id}")
                     role_obj = roleModels.Role(id=r_id, name=r_name)
                
                db.add(role_obj)
                db.commit()
                db.refresh(role_obj)
            roles_map[r_name] = role_obj

        # 2. SEED CATEGORIES
        # Pastikan categoryModels sudah terimport
        if 'categoryModels' in globals():
            categories_data = [
                "Humaniora", "Saintek", "Fiksi"
            ]
            
            for cat_name in categories_data:
                category = db.query(categoryModels.Category).filter(categoryModels.Category.name == cat_name).first()
                if not category:
                    print(f"[+] Membuat Kategori: {cat_name}")
                    new_category = categoryModels.Category(name=cat_name, description=f"Kategori {cat_name}")
                    db.add(new_category)
                    db.commit()
        else:
            print("[-] Warning: categoryModels tidak ditemukan, melewati seeding kategori.")

        # Daftar User Dummy
        users_data = [
            # 1. ADMIN
            {
                "username": "admin",
                "email": "admin@tukarbuku.com",
                "password": "admin",
                "nama_lengkap": "Administrator Sistem",
                "nomor_hp": "081111111111",
                "jurusan": "Teknik Informatika",
                "role": "admin"
            },
            # 2. SELLER (User dengan Toko)
            {
                "username": "seller_budi",
                "email": "budi@store.com",
                "password": "password",
                "nama_lengkap": "Budi Santoso",
                "nomor_hp": "082222222222",
                "jurusan": "Bisnis Digital",
                "role": "seller", # FIX: Ubah role dari 'user' ke 'seller'
                "store": {
                    "nama_toko": "Budi Books Store",
                    "deskripsi_toko": "Menjual buku bekas berkualitas dan terjangkau.",
                    "alamat_toko": "Jl. Pendidikan No. 10, Kampus A",
                    "nomor_telepon_toko": "082222222222"
                }
            },
            # 3. USER BIASA (Pembeli)
            {
                "username": "user_siti",
                "email": "siti@gmail.com",
                "password": "password",
                "nama_lengkap": "Siti Aminah",
                "nomor_hp": "083333333333",
                "jurusan": "Psikologi",
                "role": "user"
            },
            # 4. SELLER 2 (User dengan Toko)
            {
                "username": "seller",
                "email": "seller@store.com",
                "password": "password",
                "nama_lengkap": "seller",
                "nomor_hp": "084444444444",
                "jurusan": "Sastra Inggris",
                "role": "seller", # FIX: Ubah role dari 'user' ke 'seller'
                "store": {
                    "nama_toko": "Ani Pustaka",
                    "deskripsi_toko": "Koleksi novel dan komik lengkap.",
                    "alamat_toko": "Jl. Mawar No. 5, Kota B",
                    "nomor_telepon_toko": "084444444444"
                }
            },
            # 5. USER BIASA 2 (Pembeli)
            {
                "username": "user_joko",
                "email": "joko@gmail.com",
                "password": "password",
                "nama_lengkap": "Joko Anwar",
                "nomor_hp": "085555555555",
                "jurusan": "Hukum",
                "role": "user"
            },
            # 6. USER SIMPLE (Sesuai Request)
            {
                "username": "user",
                "email": "user@example.com", # Menggunakan format email valid agar tidak error validasi
                "password": "user",
                "nama_lengkap": "user",
                "nomor_hp": "080000000000",
                "jurusan": "Umum",
                "role": "user"
            }
        ]

        for data in users_data:
            # Cek apakah user sudah ada berdasarkan email
            user = db.query(userModels.User).filter(userModels.User.email == data["email"]).first()
            
            # Ambil object role yang sesuai
            role_obj = roles_map.get(data["role"])
            if not role_obj:
                print(f"[-] Error: Role '{data['role']}' tidak ditemukan untuk user {data['username']}")
                continue

            if not user:
                print(f"[+] Membuat User: {data['username']} ({data['role']})")
                new_user = userModels.User(
                    username=data["username"],
                    email=data["email"],
                    hashed_password=get_password_hash(data["password"]),
                    nama_lengkap=data["nama_lengkap"],
                    nomor_hp=data["nomor_hp"],
                    jurusan=data["jurusan"],
                    role_id=role_obj.id,
                    is_active=True
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                user = new_user
            else:
                # UPDATE PASSWORD: Jika user sudah ada, update passwordnya untuk memastikan hash benar
                print(f"[*] Mengupdate password User: {data['username']}")
                user.hashed_password = get_password_hash(data["password"])
                # Pastikan role juga benar
                user.role_id = role_obj.id
                db.commit()
                db.refresh(user)

            # Jika user ini punya data store (Seller), buatkan tokonya jika belum ada
            if "store" in data:
                # Pastikan user.id tersedia
                if user and user.id:
                    store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == user.id).first()
                    if not store:
                        print(f"   [+] Membuat Toko untuk {data['username']}")
                        
                        # FIX: Menyesuaikan field dengan definisi di storeModels.py
                        # Model Store tidak memiliki 'deskripsi_toko' atau 'status_verifikasi'
                        new_store = storeModels.Store(
                            owner_id=user.id,
                            nama_toko=data["store"]["nama_toko"],
                            nama_pemilik_toko=user.nama_lengkap,
                            alamat_toko=data["store"]["alamat_toko"],
                            hp_toko=data["store"]["nomor_telepon_toko"]
                            # deskripsi_toko & status_verifikasi dihapus karena tidak ada di model
                        )
                        db.add(new_store)
                        db.commit()
                    else:
                        print(f"   [-] Toko sudah ada untuk {data['username']}")

        print("--- Seeding Selesai ---")
        print("\n[INFO] Daftar Akun Dummy:")
        for u in users_data:
            print(f"Username: {u['username']} | Password: {u['password']}")

    except Exception as e:
        print(f"Error saat seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
