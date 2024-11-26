import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Untuk navigasi
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

  const response = await fetch(`http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/karyawan?page=${page}`, {
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

const ListKaryawan = () => {
  const [data, setData] = useState<Karyawan[]>([]);
  const [filteredData, setFilteredData] = useState<Karyawan[]>([]); // Data setelah filter
  const [search, setSearch] = useState<string>(""); // State untuk pencarian
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchData(currentPage);
        setData(response.data || []);
        setFilteredData(response.data || []); // Set filtered data awal
        setCurrentPage(response.currentPage || 1);
        setTotalPages(response.totalPages || 1);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch data:", err.message);

        if (err.message.includes("401") || err.message.includes("403")) {
          setError("Otorisasi gagal. Silakan login kembali.");
          localStorage.removeItem("token"); // Hapus token yang salah
          window.location.href = "/"; // Redirect ke halaman login
        } else {
          setError("Gagal mengambil data. Periksa koneksi Anda.");
        }

        setData([]);
        setFilteredData([]); // Kosongkan filtered data jika gagal
      }
    };

    getData();
  }, [currentPage]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleDetailClick = (perner: string) => {
    navigate(`/karyawan/${perner}`); // Navigasi ke halaman detail
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    // Filter data berdasarkan nama
    const filtered = data.filter((karyawan) =>
      karyawan.nama.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  return (
    <div className="p-20">
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          {/* Input Search */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Cari karyawan berdasarkan nama..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <Table>
            <TableCaption>Daftar Karyawan</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Perner</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Take Home Pay</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Sub Unit</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Sumber Anggaran</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((karyawan) => (
                  <TableRow key={karyawan.perner}>
                    <TableCell>{karyawan.perner}</TableCell>
                    <TableCell>{karyawan.nama}</TableCell>
                    <TableCell>
                      {parseFloat(karyawan.take_home_pay).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </TableCell>
                    <TableCell>{karyawan.unit}</TableCell>
                    <TableCell>{karyawan.sub_unit}</TableCell>
                    <TableCell>{karyawan.posisi_pekerjaan}</TableCell>
                    <TableCell>{karyawan.sumber_anggaran}</TableCell>
                    <TableCell>
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
        </>
      )}
    </div>
  );
};

export default ListKaryawan;
