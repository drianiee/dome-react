import { useEffect, useState } from "react";
import ListKaryawanHeader from '../../assets/ListKaryawanHeader.png';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

// Define type for Karyawan and Mutasi data
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
  if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/karyawan`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return data.data;
};

const fetchMutasiData = async (): Promise<Mutasi[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi`,
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
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!searchQuery) {
      setFilteredKaryawan([]);
    } else {
      setFilteredKaryawan(
        allKaryawan.filter((karyawan) =>
          karyawan.nama.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, allKaryawan]);

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
      {/* Tombol dan Dialog Pencarian */}
      <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
        Cari Karyawan
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cari Karyawan</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Ketik nama karyawan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {mutasiData.map((mutasi) => (
            <TableRow key={mutasi.id}>
              <TableCell>{mutasi.id}</TableCell>
              <TableCell>{mutasi.perner}</TableCell>
              <TableCell>{mutasi.nama}</TableCell>
              <TableCell>{mutasi.unit_baru}</TableCell>
              <TableCell>{mutasi.sub_unit_baru}</TableCell>
              <TableCell>{mutasi.posisi_baru}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    mutasi.status_mutasi === "Diproses" ? "outline" : "default"
                  }
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Mutasi;
