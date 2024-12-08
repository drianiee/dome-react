import { useEffect, useState } from "react";
import ListKaryawanHeader from "../../assets/ListKaryawanHeader.png";
import { Pencil, Trash } from "lucide-react"; // Import ikon Pencil dari Lucide
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

type Karyawan = {
  perner: string;
  nama: string;
  unit: string;
  sub_unit: string;
  take_home_pay: string;
  posisi_pekerjaan: string;
  sumber_anggaran: string;
};

type Mutasi = {
  id: number;
  perner: string;
  nama: string;
  unit_baru: string;
  sub_unit_baru: string;
  posisi_baru: string;
  status_mutasi: string;
  created_at: string;
};

const fetchKaryawanData = async (): Promise<Karyawan[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const baseUrl = `https://dome-backend-5uxq.onrender.com/karyawan`;
  let allData: Karyawan[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await fetch(`${baseUrl}?page=${currentPage}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    allData = [...allData, ...result.data];
    totalPages = result.totalPages;
    currentPage++;
  } while (currentPage <= totalPages);

  return allData;
};

const fetchMutasiData = async (): Promise<Mutasi[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

  const response = await fetch(
    `https://dome-backend-5uxq.onrender.com/mutasi`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const Mutasi = () => {
  const [mutasiData, setMutasiData] = useState<Mutasi[]>([]);
  const [allKaryawan, setAllKaryawan] = useState<Karyawan[]>([]);
  const [filteredKaryawan, setFilteredKaryawan] = useState<Karyawan[]>([]);
  const [searchKaryawan, setSearchKaryawan] = useState(""); 
  const [searchMutasi, setSearchMutasi] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mutasi, karyawan] = await Promise.all([
          fetchMutasiData(),
          fetchKaryawanData(),
        ]);
        setMutasiData(mutasi);
        setAllKaryawan(karyawan);
      } catch (err: any) {
        setError(err.message);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (searchKaryawan) {
      const filtered = allKaryawan.filter((karyawan) =>
        karyawan.nama.toLowerCase().includes(searchKaryawan.toLowerCase())
      );
      setFilteredKaryawan(filtered.slice(0, 5)); // Ambil hanya 5 data teratas
    } else {
      setFilteredKaryawan([]);
    }
  }, [searchKaryawan, allKaryawan]);

  const filteredData = mutasiData.filter((item) =>
    item.nama.toLowerCase().includes(searchMutasi.toLowerCase())
  );

    const deleteMutasi = async (perner: string) => {
      const token = localStorage.getItem("token");
    
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
    
      try {
        const response = await fetch(
          `https://dome-backend-5uxq.onrender.com/mutasi/${perner}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        setMutasiData((prev) => prev.filter((item) => item.perner !== perner));
      } catch (err) {
        console.error("Gagal menghapus mutasi:", err);
        alert("Gagal menghapus mutasi.");
      }
    };

  return (
    <div className="p-8">
      <div
        className="bg-cover bg-center rounded-lg mb-8 h-[180px]"
        style={{ backgroundImage: `url(${ListKaryawanHeader})` }}
      >
        <div className="p-8 text-white">
          <div className="flex gap-2 mb-4">
            <p className="text-xl text-[#FF0000]">#</p>
            <p className="text-xl text-gray-300">Elevating Your Future</p>
          </div>
          <h1 className="text-6xl font-bold">Mutasi</h1>
        </div>
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {/* Pencarian dan Tombol */}
      <div className="flex justify-between items-center mb-6">
        <Input
          type="text"
          placeholder="Cari Mutasi"
          value={searchMutasi}
          onChange={(e) => setSearchMutasi(e.target.value)}
        />
        {parseInt(localStorage.getItem("role") || "0", 10) === 2 && (
          <Button onClick={() => setIsDialogOpen(true)} className="ml-4 bg-[#CF3C3C] text-white hover:bg-red-400" >
            Add Mutasi
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cari Karyawan</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Ketik nama karyawan"
            value={searchKaryawan}
            onChange={(e) => setSearchKaryawan(e.target.value)}
            className="mb-4"
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perner</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Sub Unit</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Sumber Anggaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKaryawan.map((karyawan) => (
                <TableRow
                  key={karyawan.perner}
                  onClick={() =>
                    navigate(
                      `/mutasi/add-mutasi/${encodeURIComponent(karyawan.perner)}`
                    )
                  }
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell>{karyawan.perner}</TableCell>
                  <TableCell>{karyawan.nama}</TableCell>
                  <TableCell>{karyawan.unit}</TableCell>
                  <TableCell>{karyawan.sub_unit}</TableCell>
                  <TableCell>{karyawan.posisi_pekerjaan}</TableCell>
                  <TableCell>{karyawan.sumber_anggaran}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Tabel Mutasi */}
      <Table>
        <TableCaption>Daftar Mutasi Karyawan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Perner</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Unit Baru</TableHead>
            <TableHead>Sub Unit Baru</TableHead>
            <TableHead>Posisi Baru</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal Dibuat</TableHead>
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((mutasi) => (
            <TableRow key={mutasi.id}>
              <TableCell>{mutasi.id}</TableCell>
              <TableCell>{mutasi.perner}</TableCell>
              <TableCell>{mutasi.nama}</TableCell>
              <TableCell>{mutasi.unit_baru}</TableCell>
              <TableCell>{mutasi.sub_unit_baru}</TableCell>
              <TableCell>{mutasi.posisi_baru}</TableCell>
              <TableCell>
                <Badge
                  className={`
                    ${mutasi.status_mutasi === "Disetujui" ? "bg-[#1CB941] text-white hover:bg-[#1CB941]" : ""}
                    ${mutasi.status_mutasi === "Ditolak" ? "bg-[#F01A1A] text-white hover:bg-[#F01A1A]" : ""}
                    ${mutasi.status_mutasi === "Diproses" ? "bg-gray-100 text-gray-700" : ""}
                  `}
                >
                  {mutasi.status_mutasi}
                </Badge>

              </TableCell>
              <TableCell>
                {new Date(mutasi.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>
              <div className="flex gap-2">
                {/* Tombol Edit */}
                <button
                  onClick={() =>
                    navigate(
                      `/mutasi/detail-mutasi/${encodeURIComponent(mutasi.perner)}`
                    )
                  }
                  className="p-2 border border-[#ACACAC] rounded-md hover:bg-blue-100 transition"
                >
                  <Pencil size={20} strokeWidth={1.5} className="text-blue-500" />
                </button>

                {/* Tombol Delete */}
                {parseInt(localStorage.getItem("role") || "0", 10) === 2 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="p-2 border border-[#ACACAC] rounded-md hover:bg-red-100 transition"
                      >
                        <Trash size={20} strokeWidth={1.5} className="text-red-500" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Mutasi</DialogTitle>
                        <DialogDescription>
                          Apakah Anda yakin ingin menghapus mutasi ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Batal</Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteMutasi(mutasi.perner)}
                        >
                          Hapus
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Mutasi;
