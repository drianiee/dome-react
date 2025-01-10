import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clipboard } from "lucide-react";

const fetchKaryawanDetail = async (perner: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `https://dome-backend-5uxq.onrender.com/karyawan/${perner}`,
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

const postRating = async (perner: string, data: Record<string, any>) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `https://dome-backend-5uxq.onrender.com/rating/${perner}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  return response.json();
};

const PenilaianDetail = () => {
  const { perner } = useParams<{ perner: string }>();
  const navigate = useNavigate();

  const [karyawan, setKaryawan] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratingData, setRatingData] = useState({
    customer_service_orientation: "",
    achievment_orientation: "",
    team_work: "",
    product_knowledge: "",
    organization_commitments: "",
    performance: "",
    initiative: "",
    bulan_pemberian: "",
    tahun_pemberian: "",
  });

  const handleCopyPerner = () => {
    if (karyawan && karyawan.perner) {
      navigator.clipboard.writeText(karyawan.perner);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchKaryawanDetail(perner!);
        setKaryawan(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch karyawan detail:", err);
        setError("Gagal mengambil detail karyawan. Periksa koneksi Anda.");
      }
    };

    fetchData();
  }, [perner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    // Daftar nama kolom yang memerlukan validasi angka tanpa nol di awal
    const fieldsWithNumberValidation = [
      "customer_service_orientation",
      "achievment_orientation",
      "team_work",
      "product_knowledge",
      "organization_commitments",
      "performance",
      "initiative",
    ];
  
    // Validasi angka tanpa nol di awal
    if (fieldsWithNumberValidation.includes(name)) {
      if (/^(?:[1-9]\d*)?$/.test(value)) {
        setRatingData((prev) => ({ ...prev, [name]: parseInt(value, 10) || "" }));
      }
    } else {
      // Untuk kolom tanpa validasi khusus (misalnya, teks)
      setRatingData((prev) => ({
        ...prev,
        [name]: name === "tahun_pemberian" ? parseInt(value, 10) || "" : value,
      }));
    }
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Data yang dikirim:", ratingData); // Debug log untuk payload
    try {
      await postRating(perner!, ratingData);
      navigate("/penilaian");
    } catch (err: any) {
      console.error("Failed to post rating:", err.message);
      if (err.message.includes("500")) {
        alert("Terjadi kesalahan pada server. Mohon coba lagi nanti.");
      } else {
        alert("Gagal mengirim penilaian. Periksa koneksi Anda.");
      }
    }
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!karyawan) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold text-blue-900">Detail Penilaian</span>
        </button>
      </div>
      <div className="flex items-end mb-4 justify-between">
        <div>
          <div className="flex gap-4">
            <h1 className="text-3xl font-bold text-black">{karyawan?.nama}</h1>
            <Badge className="bg-red-100 text-red-500 px-3 text-sm">
              {karyawan?.kategori_posisi}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold text-gray-500">Perner</span>
            <span className="text-lg text-red-600 font-semibold">{karyawan?.perner}</span>
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
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Header Section */}
              <div className="flex w-full px-6 py-4 border-b-2">
                <h2 className="text-xl font-bold">Form Penilaian</h2>
              </div>

              {/* Informasi Section */}
              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Informasi Personal */}
                <div>
                  <h3 className="text-md font-bold text-red-500 mb-4">Informasi Personal</h3>
                  <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#ABABAB]">Jenis Kelamin</p>
                      <p className="text-base font-semibold">{karyawan?.jenis_kelamin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#ABABAB]">Status Pernikahan</p>
                      <p className="text-base font-semibold">{karyawan?.status_pernikahan}</p>
                  </div>

                    <div>
                      <p className="text-sm text-[#ABABAB]">Jumlah Anak</p>
                        <p className="text-base font-semibold">{karyawan?.jumlah_anak}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Pekerjaan */}
                <div>
                  <h3 className="text-md font-bold text-red-500 mb-4">Informasi Pekerjaan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#ABABAB]">Posisi</p>
                        <p className="text-base font-semibold">{karyawan?.posisi_pekerjaan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Kota</p>
                        <p className="text-base font-semibold">{karyawan?.kota}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Kategori Posisi</p>
                        <p className="text-base font-semibold">{karyawan?.kategori_posisi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">NIK Atasan</p>
                        <p className="text-base font-semibold">{karyawan?.nik_atasan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Unit</p>
                        <p className="text-base font-semibold">{karyawan?.unit}</p>
                      </div>
                    <div>
                      <p className="text-sm text-[#ABABAB]">Nama Atasan</p>
                        <p className="text-base font-semibold">{karyawan?.nama_atasan}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-[#ABABAB]">Sub Unit</p>
                        <p className="text-base font-semibold">{karyawan?.sub_unit}</p>
                      </div>
                  </div>
                </div>
              </div>
        </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="text-sm text-gray-500" htmlFor="customer_service_orientation">
                Customer Service Orientation
              </label>
              <Input
                type="text"
                id="customer_service_orientation"
                name="customer_service_orientation"
                value={ratingData.customer_service_orientation}
                onChange={handleInputChange}
                pattern="^[1-9]\d*$"
                placeholder="Masukkan angka"
                required
              />
            </div>            
            <div>
              <label className="text-sm text-gray-500" htmlFor="achievment_orientation">
                Achievement Orientation
              </label>
              <Input
                type="text"
                id="achievment_orientation"
                name="achievment_orientation"
                value={ratingData.achievment_orientation}
                onChange={handleInputChange}
                pattern="^[1-9]\d*$"
                placeholder="Masukkan angka"
                required
              />
            </div>


            <div>
              <label className="text-sm text-gray-500" htmlFor="team_work">
                Team Work
              </label>
              <Input
                type="text"
                id="team_work"
                name="team_work"
                value={ratingData.team_work}
                onChange={handleInputChange}
                pattern="^[1-9]\d*$"
                placeholder="Masukkan angka"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="product_knowledge">
                Product Knowledge
              </label>
              <Input
                type="text"
                id="product_knowledge"
                name="product_knowledge"
                value={ratingData.product_knowledge}
                onChange={handleInputChange}
                pattern="^[1-9]\d*$"
                placeholder="Masukkan angka"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="organization_commitments">
                Organization Commitments
              </label>
              <Input
                type="text"
                id="organization_commitments"
                name="organization_commitments"
                value={ratingData.organization_commitments}
                onChange={handleInputChange}
                pattern="^[1-9]\d*$"
                placeholder="Masukkan angka"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="performance">
                Performance
              </label>
              <Input
                type="text"
                id="performance"
                name="performance"
                value={ratingData.performance}
                onChange={handleInputChange}
                pattern="^[1-9]\d*$"
                placeholder="Masukkan angka"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="initiative">
                Initiative
              </label>
              <Input
                type="text"
                id="initiative"
                name="initiative"
                value={ratingData.initiative}
                onChange={handleInputChange}
                pattern="^[1-9]\d*$"
                placeholder="Masukkan angka"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="bulan_pemberian">
                Bulan Pemberian
              </label>
              <Input
                type="text"
                id="bulan_pemberian"
                name="bulan_pemberian"
                value={ratingData.bulan_pemberian}
                onChange={handleInputChange}
                placeholder="Masukkan bulan"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="tahun_pemberian">
                Tahun Pemberian
              </label>
              <Input
                type="text"
                id="tahun_pemberian"
                name="tahun_pemberian"
                value={ratingData.tahun_pemberian}
                onChange={handleInputChange}
                placeholder="Masukkan tahun"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="mt-4 px-4 py-2 text-base bg-red-100 text-red-500 hover:bg-[#CF3C3C] hover:text-white"
          >
            Kirim Penilaian
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PenilaianDetail;
