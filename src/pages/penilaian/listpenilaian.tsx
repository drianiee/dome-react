import { useEffect, useState } from "react";
import ListKaryawanHeader from '../../assets/ListKaryawanHeader.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react"; // Import ikon Pencil dari Lucide

// Define type for Karyawan data
type Karyawan = {
  perner: string;
  nama: string;
  unit: string;
  sub_unit: string;
  posisi_pekerjaan: string;
  sumber_anggaran: string;
  nik_atasan: number;
  nama_atasan: string;
  bergabung_sejak: number;
  status_karyawan: string;
  skor_rating: string;
};

type Rating = {
  category: string;
  score: number;
};

const fetchData = async (bulan: string): Promise<Karyawan[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }


  const formattedBulan = bulan.split("-").reverse().join("-");
  const response = await fetch(
    `https://btd3hm1k-5000.asse.devtunnels.ms//rating?bulan=${formattedBulan}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const ListKaryawan = () => {
  const [data, setData] = useState<Karyawan[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ open: boolean; karyawan?: Karyawan }>({
    open: false,
  });
  const [ratings, setRatings] = useState<Rating[]>([
    { category: "Customer Service Orientation", score: 0 },
    { category: "Achievement Orientation", score: 0 },
    { category: "Team Work", score: 0 },
    { category: "Product Knowledge", score: 0 },
    { category: "Organization Commitments", score: 0 },
    { category: "Performance", score: 0 },
    { category: "Initiative", score: 0 },
  ]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchData(filterBulan);
        setData(response || []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch data:", err.message);
        if (err.message.includes("401") || err.message.includes("403")) {
          setError("Otorisasi gagal. Silakan login kembali.");
          localStorage.removeItem("token");
          window.location.href = "/";
        } else {
          setError("Gagal mengambil data. Periksa koneksi Anda.");
        }
        setData([]);
      }
    };
    getData();
  }, [filterBulan]);

  const handleDetailClick = (karyawan: Karyawan) => {
    setPopup({ open: true, karyawan });
  };

  const handleRatingChange = (index: number, score: number) => {
    const updatedRatings = [...ratings];
    updatedRatings[index].score = score;
    setRatings(updatedRatings);
  };

  const handleSubmitRating = async () => {
    if (!popup.karyawan) return;

    const isValid = ratings.every(
      (rating) => rating.score >= 1 && rating.score <= 5
    );
    if (!isValid) {
      alert("Semua nilai harus diisi dengan angka 1-5.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    const payload = {
      customer_service_orientation: ratings.find(
        (r) => r.category === "Customer Service Orientation"
      )?.score,
      achievment_orientation: ratings.find(
        (r) => r.category === "Achievement Orientation"
      )?.score,
      team_work: ratings.find((r) => r.category === "Team Work")?.score,
      product_knowledge: ratings.find(
        (r) => r.category === "Product Knowledge"
      )?.score,
      organization_commitments: ratings.find(
        (r) => r.category === "Organization Commitments"
      )?.score,
      performance: ratings.find((r) => r.category === "Performance")?.score,
      initiative: ratings.find((r) => r.category === "Initiative")?.score,
    };

    try {
      const response = await fetch(
        `https://btd3hm1k-5000.asse.devtunnels.ms//rating/${popup.karyawan.perner}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.total_score && responseData.total_score >= 1 && responseData.total_score <= 100) {
        const updatedData = data.map((karyawan) =>
          karyawan.perner === popup.karyawan?.perner
            ? { ...karyawan, skor_rating: responseData.total_score.toString() }
            : karyawan
        );
        setData(updatedData);
        alert("Rating berhasil dikirim!");
      } else {
        throw new Error("Skor tidak valid dari API.");
      }

      setPopup({ open: false });
    } catch (error) {
      console.error("Rating Berhasil Dikirim:", error);
      alert("Rating Berhasil Dikirim");
    }
  };

  const filteredData = data.filter((karyawan) =>
    karyawan.nama.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-6xl font-bold">Penilaian Karyawan</h1>
        </div>
      </div>

      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          <div className="mb-4 flex gap-4 w-full">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Cari karyawan berdasarkan nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
              />
            </div>

            <div>
              <Select onValueChange={setFilterBulan}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-12">Desember 2024</SelectItem>
                  <SelectItem value="2024-11">November 2024</SelectItem>
                  <SelectItem value="2024-10">Oktober 2024</SelectItem>
                  <SelectItem value="2024-09">September 2024</SelectItem>
                  <SelectItem value="2024-08">Agustus 2024</SelectItem>
                  <SelectItem value="2024-07">Juli 2024</SelectItem>
                  <SelectItem value="2024-06">Juni 2024</SelectItem>
                  <SelectItem value="2024-05">Mei 2024</SelectItem>
                  <SelectItem value="2024-04">April 2024</SelectItem>
                  <SelectItem value="2024-03">Maret 2024</SelectItem>
                  <SelectItem value="2024-02">Februari 2024</SelectItem>
                  <SelectItem value="2024-01">Januari 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold w-4">Perner</TableHead>
                <TableHead className="font-bold w-20">Nama</TableHead>
                <TableHead className="font-bold w-40">Unit</TableHead>
                <TableHead className="font-bold w-40">Sub Unit</TableHead>
                <TableHead className="font-bold w-20">Posisi</TableHead>
                <TableHead className="font-bold w-20">Sumber Anggaran</TableHead>
                <TableHead className="font-bold w-20">NIK Atasan</TableHead>
                <TableHead className="font-bold w-20">Nama Atasan</TableHead>
                <TableHead className="font-bold w-20">Bergabung Sejak</TableHead>
                <TableHead className="font-bold w-20">Status Karyawan</TableHead>
                <TableHead className="font-bold w-12">Skor Rating</TableHead>
                <TableHead className="font-bold w-12">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((karyawan) => (
                  <TableRow key={karyawan.perner}>
                    <TableCell className="w-4">{karyawan.perner}</TableCell>
                    <TableCell className="w-20">{karyawan.nama}</TableCell>
                    <TableCell className="w-40">{karyawan.unit}</TableCell>
                    <TableCell className="w-40">{karyawan.sub_unit}</TableCell>
                    <TableCell className="w-20">{karyawan.posisi_pekerjaan}</TableCell>
                    <TableCell className="w-20">{karyawan.sumber_anggaran}</TableCell>
                    <TableHead className="w-20">{karyawan.nik_atasan}</TableHead>
                    <TableHead className="w-20">{karyawan.nama_atasan}</TableHead>
                    <TableHead className="w-20">{karyawan.bergabung_sejak}</TableHead>
                    <TableHead className="w-20">{karyawan.status_karyawan}</TableHead>
                    <TableCell className="w-12 text-[#1CB993] font-bold">{karyawan.skor_rating}</TableCell>
                    <TableCell className="w-12">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => handleDetailClick(karyawan)}
                            className="p-2 border border-[#ACACAC] rounded-md hover:bg-blue-100 transition"
                          >
                            {/* Tambahkan ikon Pencil */}
                            <Pencil size={20} strokeWidth={1.5} className="text-blue-500" />
                          </button>
                        </DialogTrigger>
                        <DialogContent aria-describedby="dialog-description">
                          <DialogHeader>
                            <DialogTitle>Penilaian untuk {karyawan.nama}</DialogTitle>
                          </DialogHeader>
                          <p id="dialog-description">
                            Isi penilaian untuk setiap kategori dengan skor antara 1-5.
                          </p>
                          <div className="space-y-4">
                            {ratings.map((rating, index) => (
                              <div key={index}>
                                <label className="block font-medium">{rating.category}</label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={5}
                                  value={rating.score}
                                  onChange={(e) =>
                                    handleRatingChange(index, parseInt(e.target.value, 10) || 0)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setPopup({ open: false })}
                            >
                              Batal
                            </Button>
                            <Button onClick={handleSubmitRating}>Kirim</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Tidak ada data tersedia
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default ListKaryawan;