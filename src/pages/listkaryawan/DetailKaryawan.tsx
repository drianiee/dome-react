import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Clipboard, Pencil } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
// import { Label } from "@/components/ui/label";

type DetailKaryawan = {
  perner: string;
  status_karyawan: string;
  nama: string;
  jenis_kelamin: string;
  status_pernikahan: string;
  jumlah_anak: number;
  posisi_pekerjaan: string;
  kategori_posisi: string;
  unit: string;
  sub_unit: string;
  kota: string;
  nik_atasan: number;
  nama_atasan: string;
  sumber_anggaran: string;
  skema_umk: string;
  gaji_pokok: number;
  tunjangan_operasional: number;
  pph_21: number;
  take_home_pay: number;
  tunjangan_hari_raya: number;
  gaji_kotor: number;
  pajak_penghasilan: number;
  thp_gross_pph_21: number;
  uang_kehadiran: number;
  bpjs_ketenagakerjaan: number;
  bpjs_kesehatan: number;
  perlindungan_asuransi: number;
  tunjangan_ekstra: string;
  invoice_bulanan: number;
  invoice_kontrak: number;
  tunjangan_lainnya: number;
  bergabung_sejak: number;
};

type UnitData = {
  unit_baru: string;
  sub_unit_baru: string[];
};

const fetchUnitData = async (): Promise<UnitData[]> => {
  const response = await fetch("https://dome-backend-5uxq.onrender.com/unit-dropdown");
  if (!response.ok) {
    throw new Error("Gagal mengambil data unit");
  }
  return response.json();
};

const fetchDetail = async (perner: string): Promise<DetailKaryawan> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(`https://dome-backend-5uxq.onrender.com/karyawan/${perner}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const updateKaryawan = async (perner: string, data: Partial<DetailKaryawan>): Promise<any> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(`https://dome-backend-5uxq.onrender.com/karyawan/update/${perner}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const DetailKaryawan = () => {
  const { perner } = useParams<{ perner: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DetailKaryawan | null>(null);
  const [unitData, setUnitData] = useState<UnitData[]>([]);
  const [formData, setFormData] = useState<Partial<DetailKaryawan>>({});
  const [subUnitOptions, setSubUnitOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleCopyPerner = () => {
    if (data) {
      navigator.clipboard.writeText(data.perner);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const detail = await fetchDetail(perner!);
        const units = await fetchUnitData();
        setData(detail);
        setFormData(detail);
        setUnitData(units);

        const selectedUnit = units.find((unit) => unit.unit_baru === detail.unit);
        setSubUnitOptions(selectedUnit?.sub_unit_baru || []);

        setError(null);
      } catch (err: any) {
        setError("Gagal mengambil data detail.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [perner]);

  const handleSave = async () => {
    try {
      await updateKaryawan(perner!, formData);
      // alert("Data berhasil diperbarui!");
      setIsEditing(false);
      setData({ ...data, ...formData } as DetailKaryawan);
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
  };

  const handleUnitChange = (unit: string) => {
    const selectedUnit = unitData.find((u) => u.unit_baru === unit);
    setFormData({
      ...formData,
      unit,
      sub_unit: "",
    });
    setSubUnitOptions(selectedUnit?.sub_unit_baru || []);
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (loading || !data) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold text-blue-900">Detail Karyawan</span>
        </button>
        {/* <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit"}
        </Button> */}
      </div>

      {/* Main Info Section */}
      <div className="flex items-end mb-4 justify-between">
        <div>
          <div className="flex gap-4">
            <h1 className="text-3xl font-bold text-black">{data.nama}</h1>
            <Badge className="bg-red-100 text-red-500 px-3 text-sm">
              {data.kategori_posisi}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold text-gray-500">Perner</span>
            <span className="text-lg text-red-600 font-semibold">{data.perner}</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleCopyPerner}
            >
              <Clipboard className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
        {[1, 2].includes(parseInt(localStorage.getItem("role") || "0", 10)) && (
        <div className="flex">
          <Button
            variant="outline"
            className={`flex items-center gap-2 px-4 py-2 text-base ${
              isEditing
                ? "" // Warna biru untuk "Cancel"
                : "bg-red-100 text-red-500 hover:bg-[#CF3C3C] hover:text-white" // Warna merah untuk "Edit"
            }`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {!isEditing && <Pencil className="w-5 h-5" />} {/* Tambahkan ikon jika tidak sedang mengedit */}
            {isEditing ? "Cancel" : "Edit Data"}
          </Button>
            {isEditing && (
            <Button className="ml-4 px-4 py-2 text-base bg-red-100 text-red-500 hover:bg-[#CF3C3C] hover:text-white" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
        )}
      </div>

      {/* Detail Section */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Header Section */}
              <div className="flex w-full px-6 py-4 border-b-2">
                <h2 className="text-xl font-bold">Detail Pekerjaan</h2>
              </div>

              {/* Informasi Section */}
              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Informasi Personal */}
                <div>
                  <h3 className="text-md font-bold text-red-500 mb-4">Informasi Personal</h3>
                  <div className="space-y-4">
                    {isEditing && (
                      <div>
                        <p className="text-sm text-[#ABABAB]">Nama</p>
                        <Input
                          value={formData.nama || ""}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        />
                      </div>
                    )}
                    {isEditing && (
                      <div>
                        <p className="text-sm text-[#ABABAB]">Posisi</p>
                        <Input
                          value={formData.kategori_posisi || ""}
                          onChange={(e) => setFormData({ ...formData, kategori_posisi: e.target.value })}
                        />
                      </div>
                    )}
                  <div>
                    <p className="text-sm text-[#ABABAB]">Jenis Kelamin</p>
                    {isEditing ? (
                      <select
                        value={formData.jenis_kelamin || ""}
                        onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 text-base"
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-Laki">Laki-Laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    ) : (
                      <p className="text-base font-semibold">{data.jenis_kelamin}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-[#ABABAB]">Status Pernikahan</p>
                    {isEditing ? (
                      <select
                        value={formData.status_pernikahan || ""}
                        onChange={(e) => setFormData({ ...formData, status_pernikahan: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 text-base"
                      >
                        <option value="">Pilih Status Pernikahan</option>
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                      </select>
                    ) : (
                      <p className="text-base font-semibold">{data.status_pernikahan}</p>
                    )}
                  </div>

                    <div>
                      <p className="text-sm text-[#ABABAB]">Jumlah Anak</p>
                      {isEditing ? (
                        <Input
                          value={formData.jumlah_anak !== undefined ? formData.jumlah_anak.toString() : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, jumlah_anak: parseInt(e.target.value, 10) || 0 })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.jumlah_anak}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informasi Pekerjaan */}
                <div>
                  <h3 className="text-md font-bold text-red-500 mb-4">Informasi Pekerjaan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#ABABAB]">Posisi</p>
                      {isEditing ? (
                        <Input
                          value={formData.posisi_pekerjaan || ""}
                          onChange={(e) => setFormData({ ...formData, posisi_pekerjaan: e.target.value })}
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.posisi_pekerjaan}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Kota</p>
                      {isEditing ? (
                        <Input
                          value={formData.kota || ""}
                          onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.kota}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Kategori Posisi</p>
                      {isEditing ? (
                        <Input
                          value={formData.kategori_posisi || ""}
                          onChange={(e) => setFormData({ ...formData, kategori_posisi: e.target.value })}
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.kategori_posisi}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">NIK Atasan</p>
                      {isEditing ? (
                        <Input
                          value={formData.nik_atasan !== undefined ? formData.nik_atasan.toString() : ""}
                          onChange={(e) =>
                            setFormData({ ...formData, nik_atasan: parseInt(e.target.value, 10) || 0 })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.nik_atasan}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Unit</p>
                      {isEditing ? (
                        <select
                          className="w-full border rounded-md p-2"
                          value={formData.unit || ""}
                          onChange={(e) => handleUnitChange(e.target.value)}
                        >
                          <option value="">Pilih Unit</option>
                          {unitData.map((unit) => (
                            <option key={unit.unit_baru} value={unit.unit_baru}>
                              {unit.unit_baru}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-base font-semibold">{data.unit}</p>
                      )}                    
                      </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Nama Atasan</p>
                      {isEditing ? (
                        <Input
                          value={formData.nama_atasan || ""}
                          onChange={(e) => setFormData({ ...formData, nama_atasan: e.target.value })}
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.nama_atasan}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-[#ABABAB]">Sub Unit</p>
                      {isEditing ? (
                        <select
                          className="w-full border rounded-md p-2"
                          value={formData.sub_unit || ""}
                          onChange={(e) => setFormData({ ...formData, sub_unit: e.target.value })}
                        >
                          <option value="">Pilih Sub Unit</option>
                          {subUnitOptions.map((subUnit) => (
                            <option key={subUnit} value={subUnit}>
                              {subUnit}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-base font-semibold">{data.sub_unit}</p>
                      )}                    
                      </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Kompensasi dan Tunjangan */}
            <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              {/* Header Section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Kompensasi dan Tunjangan</h2>
              </div>

              {/* Kompensasi dan Tunjangan */}
              <div className="grid grid-cols-4 gap-6">
                {/* Kolom 1: Kompensasi dan Gaji */}
                <div>
                  <h3 className="text-md font-semibold text-red-500 mb-4">Kompensasi dan Gaji</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Sumber Anggaran</p>
                      {isEditing ? (
                        <Input
                          value={formData.sumber_anggaran || ""}
                          onChange={(e) => setFormData({ ...formData, sumber_anggaran: e.target.value })}
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.sumber_anggaran}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Skema UMK</p>
                      {isEditing ? (
                        <Input
                          value={formData.skema_umk || ""}
                          onChange={(e) => setFormData({ ...formData, skema_umk: e.target.value })}
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.skema_umk}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gaji Pokok</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.gaji_pokok ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gaji_pokok: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.gaji_pokok)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tunjangan Operasional</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.tunjangan_operasional ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tunjangan_operasional: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.tunjangan_operasional)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PPH 21</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.pph_21 ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pph_21: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.pph_21)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom 2: Detail Kompensasi */}
                <div>
                  <h3 className="text-md font-semibold text-red-500 mb-4">Detail Kompensasi</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">THP (Take Home Pay)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.take_home_pay ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              take_home_pay: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.take_home_pay)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">THR (Tunjangan Hari Raya)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.tunjangan_hari_raya ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tunjangan_hari_raya: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.tunjangan_hari_raya)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PENGHASILAN BRUTO (Gaji Kotor)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.gaji_kotor ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gaji_kotor: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.gaji_kotor)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">% PPH (Pajak Penghasilan)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.pajak_penghasilan ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pajak_penghasilan: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.pajak_penghasilan}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">THP GROSS + PPH 21</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.thp_gross_pph_21 ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              thp_gross_pph_21: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.thp_gross_pph_21)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom 3: Tunjangan dan Perlindungan */}
                <div>
                  <h3 className="text-md font-semibold text-red-500 mb-4">Tunjangan dan Perlindungan</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">UAK (Uang Kehadiran)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.uang_kehadiran ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              uang_kehadiran: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.uang_kehadiran)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">BPJS TK (BPJS Ketenagakerjaan)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.bpjs_ketenagakerjaan ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bpjs_ketenagakerjaan: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.bpjs_ketenagakerjaan)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">BPJS KES (BPJS Kesehatan)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.bpjs_kesehatan ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bpjs_kesehatan: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.bpjs_kesehatan)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PAKSER (Perlindungan Asuransi)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.perlindungan_asuransi ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              perlindungan_asuransi: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.perlindungan_asuransi)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">TER (Tunjangan Ekstra)</p>
                      {isEditing ? (
                        <Input
                          value={formData.tunjangan_ekstra || ""}
                          onChange={(e) => setFormData({ ...formData, tunjangan_ekstra: e.target.value })}
                        />
                      ) : (
                        <p className="text-base font-semibold">{data.tunjangan_ekstra}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom 4: Invoice */}
                <div>
                  <h3 className="text-md font-semibold text-red-500 mb-4">Invoice dan Tunjangan Lainnya</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Invoice / Bulan</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.invoice_bulanan ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              invoice_bulanan: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.invoice_bulanan)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Invoice / Kontrak</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.invoice_kontrak ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              invoice_kontrak: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.invoice_kontrak)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">MF (Tunjangan Lainnya)</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.tunjangan_lainnya ?? 0} // Default ke 0 jika undefined
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tunjangan_lainnya: e.target.valueAsNumber || 0, // Gunakan e.target.valueAsNumber untuk tipe number
                            })
                          }
                        />
                      ) : (
                        <p className="text-base font-semibold">
                          Rp {new Intl.NumberFormat("id-ID").format(data.tunjangan_lainnya)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
};

export default DetailKaryawan;
