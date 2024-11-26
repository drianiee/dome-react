import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Define type for Mutasi data
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

// Define type for Karyawan data
type Karyawan = {
  perner: string;
  nama: string;
  unit: string;
  sub_unit: string;
  posisi_pekerjaan: string;
};

const fetchMutasiData = async (): Promise<Mutasi[]> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const fetchAllKaryawanData = async (): Promise<Karyawan[]> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const baseUrl = `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/karyawan`;
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

const Mutasi = () => {
  const [data, setData] = useState<Mutasi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [karyawanData, setKaryawanData] = useState<Karyawan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredKaryawan, setFilteredKaryawan] = useState<Karyawan[]>([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<number | null>(null); // Track user role

  useEffect(() => {
    const getUserRole = () => {
      const role = localStorage.getItem("role"); // Assuming role is saved in localStorage
      setUserRole(role ? parseInt(role) : null); // Ensure role is parsed as an integer
    };
    const getData = async () => {
      try {
        const response = await fetchMutasiData();
        setData(response);
      } catch (err: any) {
        console.error("Gagal mengambil data mutasi:", err.message);
        setError("Gagal mengambil data. Periksa koneksi Anda.");
      }
    };

    getData();
    getUserRole();
  }, []);

  useEffect(() => {
    const getAllKaryawan = async () => {
      try {
        const allKaryawan = await fetchAllKaryawanData();
        setKaryawanData(allKaryawan);
      } catch (err) {
        console.error("Gagal mengambil seluruh data karyawan:");
        setError("Gagal mengambil data. Periksa koneksi Anda.");
      }
    };

    getAllKaryawan();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = karyawanData.filter((karyawan) =>
        karyawan.nama.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredKaryawan(filtered.slice(0, 5)); // Ambil hanya 5 data teratas
    } else {
      setFilteredKaryawan([]);
    }
  }, [searchQuery, karyawanData]);

  const handleDetailClick = (perner: string) => {
    navigate(`/mutasi/${perner}`);
  };

  const handleAddMutasi = () => {
    setIsDialogOpen(true);
  };

  const handleKaryawanClick = (nama: string) => {
    // Navigasi ke link baru dengan nama sebagai parameter URL
    navigate(`/mutasi/add-mutasi/${encodeURIComponent(nama)}`);
  };

  return (
    <div className="p-20">
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
        {userRole === 2 && (
          <div className="mb-4">
            <Button onClick={handleAddMutasi}>Add Mutasi</Button>
          </div>      
        )}


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
                <TableHead>Status Mutasi</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((mutasi) => (
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
                          mutasi.status_mutasi === "Diproses"
                            ? "outline"
                            : "default"
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
                    <TableCell>
                      <button
                        onClick={() => handleDetailClick(mutasi.perner)}
                        className="text-blue-500 hover:underline"
                      >
                        Detail
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Tidak ada data mutasi tersedia
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

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
              {searchQuery && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Perner</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Sub Unit</TableHead>
                      <TableHead>Posisi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKaryawan.length > 0 ? (
                      filteredKaryawan.map((karyawan) => (
                        <TableRow
                          key={karyawan.perner}
                          onClick={() => handleKaryawanClick(karyawan.nama)} // Klik untuk navigasi
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          <TableCell>{karyawan.perner}</TableCell>
                          <TableCell>{karyawan.nama}</TableCell>
                          <TableCell>{karyawan.unit}</TableCell>
                          <TableCell>{karyawan.sub_unit}</TableCell>
                          <TableCell>{karyawan.posisi_pekerjaan}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Tidak ada data karyawan ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Mutasi;
