import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Untuk navigasi
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input"; // Input untuk search

// Define type for Karyawan data
type Karyawan = {
  perner: string;
  nama: string;
  take_home_pay: string;
  unit: string;
  sub_unit: string;
  posisi_pekerjaan: string;
  sumber_anggaran: string;
};

const fetchData = async (page: number): Promise<any> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(`https://dome-backend-5uxq.onrender.com/karyawan?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const fetchAllData = async (): Promise<Karyawan[]> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  let allData: Karyawan[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await fetch(
      `https://dome-backend-5uxq.onrender.com/karyawan?page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

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

const ListKaryawan = () => {
  const [data, setData] = useState<Karyawan[]>([]); // Data asli
  const [search, setSearch] = useState<string>(""); // State untuk pencarian
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [filterSumberAnggaran, setFilterSumberAnggaran] = useState("");
  const [filterUnit, setFilterUnit] = useState("");

  // Filter data di sini (variabel lokal, bukan state)
  const filteredData = data
  .filter((karyawan) =>
    karyawan.nama.toLowerCase().includes(search.toLowerCase())
  )
  .filter((karyawan) =>
    filterSumberAnggaran ? karyawan.sumber_anggaran === filterSumberAnggaran : true
  )
  .filter((karyawan) => (filterUnit ? karyawan.unit === filterUnit : true));

    useEffect(() => {
      const getData = async () => {
        try {
          if (search.trim()) {
            // Pencarian global
            const allData = await fetchAllData();
            const filteredData = allData.filter((karyawan) =>
              karyawan.nama.toLowerCase().includes(search.toLowerCase())
            );
            setData(filteredData);
            setTotalPages(1); // Tidak ada paginasi untuk hasil pencarian
          } else {
            // Ambil data berdasarkan halaman
            const response = await fetchData(currentPage);
            setData(response.data || []);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);
          }
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
    }, [currentPage, search]);
    

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleDetailClick = (perner: string) => {
    navigate(`/list-karyawan/${perner}`); // Navigasi ke halaman detail
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
  };

  return (
    <div className="p-8">
      {/* Banner Section */}
      <div
        className="bg-cover bg-center rounded-lg mb-8 h-[180px]"
        style={{ backgroundImage: `url(${ListKaryawanHeader})` }}
      >
        <div className="p-8 text-white">
          <div className="flex gap-2 mb-4">
            <p className="text-xl text-[#FF0000]">#</p>
            <p className="text-xl text-gray-300">Elevating Your Future</p>
          </div>
          <h1 className="text-6xl font-bold">List Karyawan</h1>
        </div>
      </div>

      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          {/* Search and Filter Section */}
          <div className="mb-4 flex gap-4 w-full">
            {/* Input Search */}
            <div className="flex-grow w-3/5">
              <Input
                type="text"
                placeholder="Cari karyawan berdasarkan nama..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter by Sumber Anggaran */}
            <div className="w-1/5">
             <Select onValueChange={setFilterSumberAnggaran}>
                <SelectTrigger>
                  <SelectValue placeholder="Sumber Anggaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Sumber Anggaran</SelectItem>
                  {Array.from(new Set(data.map((karyawan) => karyawan.sumber_anggaran)))
                    .filter((sumber) => sumber) // Hapus nilai undefined atau kosong
                    .map((sumber, index) => (
                      <SelectItem key={index} value={sumber}>
                        {sumber}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Unit */}
            {[1, 2].includes(parseInt(localStorage.getItem("role") || "0", 10)) && (
              <div className="w-1/5">
                <Select onValueChange={setFilterUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Unit</SelectItem>
                    {Array.from(new Set(data.map((karyawan) => karyawan.unit)))
                      .filter((unit) => unit) // Hapus nilai undefined atau kosong
                      .map((unit, index) => (
                        <SelectItem key={index} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          </div>

          {/* Table Section */}
          <Table>
            <TableCaption>Daftar Karyawan</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold w-4">Perner</TableHead>
                <TableHead className="font-bold w-20">Nama</TableHead>
                <TableHead className="font-bold w-32">Take Home Pay</TableHead>
                <TableHead className="font-bold w-40">Unit</TableHead>
                <TableHead className="font-bold w-40">Sub Unit</TableHead>
                <TableHead className="font-bold w-20">Posisi</TableHead>
                <TableHead className="font-bold w-20">Sumber Anggaran</TableHead>
                <TableHead className="font-bold w-12">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((karyawan) => (
                  <TableRow key={karyawan.perner}>
                    <TableCell className="w-4">{karyawan.perner}</TableCell>
                    <TableCell className="w-20">{karyawan.nama}</TableCell>
                    <TableCell className="w-32">
                      {parseFloat(karyawan.take_home_pay).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </TableCell>
                    <TableCell className="w-40">{karyawan.unit}</TableCell>
                    <TableCell className="w-40">{karyawan.sub_unit}</TableCell>
                    <TableCell className="w-20">{karyawan.posisi_pekerjaan}</TableCell>
                    <TableCell className="w-20">{karyawan.sumber_anggaran}</TableCell>
                    <TableCell className="w-12">
                      <button
                        onClick={() => handleDetailClick(karyawan.perner)}
                        className="text-blue-500 hover:underline"
                      >
                        Detail
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Tidak ada data tersedia
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {!search && (
  <Pagination className="mt-4">
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) handlePageChange(currentPage - 1);
          }}
          aria-disabled={currentPage === 1}
        />
      </PaginationItem>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isActive={page === currentPage}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(page);
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem>
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) handlePageChange(currentPage + 1);
          }}
          aria-disabled={currentPage === totalPages}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
)}

        </>
      )}
    </div>
  );
};


export default ListKaryawan;