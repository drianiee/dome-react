import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react"; // Import ikon dari lucide-react
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"; // ShadCN Card components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

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

const fetchKaryawanByPerner = async (perner: string): Promise<Karyawan | null> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi/karyawan/${encodeURIComponent(perner)}`,
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

const fetchDropdownData = async (): Promise<DropdownData[]> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/unit-dropdown`,
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
  const { perner } = useParams<{ perner: string }>();
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
        const data = await fetchKaryawanByPerner(perner!);
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

    if (perner) {
      getKaryawanData();
    }
  }, [perner]);

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
      navigate("/mutasi");
    } else {
      setError("Gagal mengirim data mutasi.");
    }
  };

  const handleUnitChange = (unit: string) => {
    setUnitBaru(unit);
    setSubUnitBaru("");
  };

  const selectedUnit = dropdownData.find((item) => item.unit_baru === unitBaru);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {error && <div className="text-red-500 text-center">{error}</div>}
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold text-blue-900">Detail Karyawan</span>
        </button>
      </div>

      {/* Main Info Section */}
      <div className="flex items-center justify-normal mb-4">
        <div>
          <div className="flex gap-4">
            <h1 className="text-3xl font-bold text-black">{karyawanData?.nama}</h1>
            <Badge className="bg-red-100 text-red-500 px-3 text-sm">
              {karyawanData?.posisi_pekerjaan}
            </Badge>
          </div>
        </div>
      </div>

      {karyawanData && (

        <div className="px-8 py-4 mt-8 bg-white border border-gray-200 rounded-lg shadow-sm grid grid-cols-2 gap-8">
          {/* Informasi Karyawan */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-red-500">
                  Informasi Pekerjaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold">Unit</Label>
                    <p>{karyawanData.unit}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Sub Unit</Label>
                    <p>{karyawanData.sub_unit}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Kota</Label>
                    <p>{karyawanData.kota}</p>
                  </div>
                  <div>
                    <Label className="font-bold">NIK Atasan</Label>
                    <p>{karyawanData.nik_atasan}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Nama Atasan</Label>
                    <p>{karyawanData.nama_atasan}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Posisi</Label>
                    <p>{karyawanData.posisi_pekerjaan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Mutasi */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-red-500">
                  Mutasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Perner</Label>
                    <Input value={karyawanData.perner} disabled />
                  </div>
                  <div>
                    <Label>Unit Baru</Label>
                    <Select value={unitBaru} onValueChange={handleUnitChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Masukkan Unit Baru" />
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
                  <div>
                    <Label>Sub Unit Baru</Label>
                    <Select value={subUnitBaru} onValueChange={setSubUnitBaru}>
                      <SelectTrigger>
                        <SelectValue placeholder="Masukkan Sub Unit Baru" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedUnit?.sub_unit_baru.map((subUnit) => (
                          <SelectItem key={subUnit} value={subUnit}>
                            {subUnit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Kota Baru</Label>
                    <Input
                      value={kotaBaru}
                      onChange={(e) => setKotaBaru(e.target.value)}
                      placeholder="Masukkan Kota"
                      required
                    />
                  </div>
                  <div>
                    <Label>Posisi Baru</Label>
                    <Input
                      value={posisiBaru}
                      onChange={(e) => setPosisiBaru(e.target.value)}
                      placeholder="Masukkan Posisi"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isFormSubmitting}>
                    {isFormSubmitting ? "Mengirim..." : "Submit"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMutasi;
