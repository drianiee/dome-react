import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"; // Card components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"; // Import SelectContent

// Define types for Karyawan and Mutasi data
type Karyawan = {
  perner: string;
  nama: string;
  unit: string;
  sub_unit: string;
  kota: string;
  nik_atasan: string;
  nama_atasan: string;
  posisi_pekerjaan: string;
};

type DropdownData = {
  unit_baru: string;
  sub_unit_baru: string[];
};

const fetchKaryawanByName = async (nama: string): Promise<Karyawan | null> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi/karyawan/${encodeURIComponent(nama)}`,
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

  const data = await response.json();
  return data[0]; // Mengambil data pertama dari array
};

// Function to fetch dropdown data (unit and sub-unit)
const fetchDropdownData = async (): Promise<DropdownData[]> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/dropdown`,
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

const AddMutasi = () => {
  const { nama } = useParams<{ nama: string }>();
  const [karyawanData, setKaryawanData] = useState<Karyawan | null>(null);
  const [dropdownData, setDropdownData] = useState<DropdownData[]>([]);
  const [unitBaru, setUnitBaru] = useState<string>("");
  const [subUnitBaru, setSubUnitBaru] = useState<string>("");
  const [kotaBaru, setKotaBaru] = useState<string>("");
  const [posisiBaru, setPosisiBaru] = useState<string>("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getKaryawanData = async () => {
      try {
        const data = await fetchKaryawanByName(nama!);
        if (data) {
          setKaryawanData(data);
        } else {
          setError("Data karyawan tidak ditemukan.");
        }
      } catch (err: any) {
        console.error("Gagal mengambil data karyawan:", err.message);
        setError("Gagal mengambil data karyawan. Periksa koneksi Anda.");
      }
    };

    if (nama) {
      getKaryawanData();
    }
  }, [nama]);

  useEffect(() => {
    const getDropdownData = async () => {
      try {
        const data = await fetchDropdownData();
        setDropdownData(data);
      } catch (err: any) {
        console.error("Gagal mengambil data dropdown:", err.message);
        setError("Gagal mengambil data dropdown.");
      }
    };

    getDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan.");
      return;
    }

    const response = await fetch(
      "http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          perner: karyawanData?.perner,
          unit_baru: unitBaru,
          sub_unit_baru: subUnitBaru,
          kota_baru: kotaBaru,
          posisi_baru: posisiBaru,
        }),
      }
    );

    setIsFormSubmitting(false);
    if (response.ok) {
    //   alert("Data mutasi berhasil ditambahkan");
      navigate("/mutasi"); // Redirect ke halaman mutasi setelah berhasil
    } else {
      setError("Gagal mengirim data mutasi.");
    }
  };

  // Filter sub-unit berdasarkan unit yang dipilih
  const handleUnitChange = (unit: string) => {
    setUnitBaru(unit);
    setSubUnitBaru(""); // Reset sub-unit when unit changes
  };

  // Find sub-units based on selected unit
  const selectedUnit = dropdownData.find((item) => item.unit_baru === unitBaru);

  return (
    <div className="p-20">
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          {karyawanData ? (
            <div className="gap-4">
            {/* Karyawan Details Card */}
            <Card className="max-w-lg mx-auto mb-4"> {/* Reduced margin-bottom */}
              <CardHeader>
                <CardTitle>Detail Karyawan</CardTitle>
                <CardDescription>Informasi lengkap mengenai {karyawanData.nama}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <strong>Perner:</strong> {karyawanData.perner}
                </div>
                <div className="mb-4">
                  <strong>Nama:</strong> {karyawanData.nama}
                </div>
                <div className="mb-4">
                  <strong>Unit:</strong> {karyawanData.unit}
                </div>
                <div className="mb-4">
                  <strong>Sub Unit:</strong> {karyawanData.sub_unit}
                </div>
                <div className="mb-4">
                  <strong>Kota:</strong> {karyawanData.kota}
                </div>
                <div className="mb-4">
                  <strong>Posisi Pekerjaan:</strong> {karyawanData.posisi_pekerjaan}
                </div>
                <div className="mb-4">
                  <strong>Atasan:</strong> {karyawanData.nama_atasan} ({karyawanData.nik_atasan})
                </div>
              </CardContent>
            </Card>
          
            {/* Add Mutasi Form */}
            <Card className="max-w-lg mx-auto mb-4"> {/* Reduced margin-bottom */}
              <CardHeader>
                <CardTitle>Form Mutasi</CardTitle>
                <CardDescription>Isi data mutasi untuk {karyawanData.nama}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <Label htmlFor="unit_baru">Unit Baru</Label>
                    <Select
                      value={unitBaru}
                      onValueChange={handleUnitChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Unit Baru" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownData.map((item) => (
                          <SelectItem key={item.unit_baru} value={item.unit_baru}>
                            {item.unit_baru}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {unitBaru && selectedUnit && (
                    <div className="mb-4">
                      <Label htmlFor="sub_unit_baru">Sub Unit Baru</Label>
                      <Select
                        value={subUnitBaru}
                        onValueChange={setSubUnitBaru}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Sub Unit Baru" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedUnit.sub_unit_baru.map((subUnit) => (
                            <SelectItem key={subUnit} value={subUnit}>
                              {subUnit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="mb-4">
                    <Label htmlFor="kota_baru">Kota Baru</Label>
                    <Input
                      id="kota_baru"
                      value={kotaBaru}
                      onChange={(e) => setKotaBaru(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="posisi_baru">Posisi Baru</Label>
                    <Input
                      id="posisi_baru"
                      value={posisiBaru}
                      onChange={(e) => setPosisiBaru(e.target.value)}
                      required
                    />
                  </div>
          
                  <Button type="submit" disabled={isFormSubmitting} className="mt-4">
                    {isFormSubmitting ? "Mengirim..." : "Tambah Mutasi"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>          
          ) : (
            <div className="text-center">Data karyawan tidak ditemukan</div>
          )}
        </>
      )}
    </div>
  );
};

export default AddMutasi;
