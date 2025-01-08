import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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
  const { perner } = useParams();
  const navigate = useNavigate();

  const [karyawan, setKaryawan] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratingData, setRatingData] = useState({
    customer_service_orientation: 0,
    achievment_orientation: 0,
    team_work: 0,
    product_knowledge: 0,
    organization_commitments: 0,
    performance: 0,
    initiative: 0,
    bulan_pemberian: "",
    tahun_pemberian: "",
  });

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
    setRatingData((prev) => ({
      ...prev,
      [name]: name === "tahun_pemberian" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Data yang dikirim:", ratingData); // Debug log untuk payload
    try {
      await postRating(perner!, ratingData);
      alert("Penilaian berhasil dikirim!");
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
    <div className="p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Detail Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Nama:</strong> {karyawan?.nama}</p>
          <p><strong>Perner:</strong> {karyawan?.perner}</p>
          <p><strong>Unit:</strong> {karyawan?.unit}</p>
          <p><strong>Sub Unit:</strong> {karyawan?.sub_unit}</p>
          <p><strong>Posisi Pekerjaan:</strong> {karyawan?.posisi_pekerjaan}</p>
          <p><strong>Status Karyawan:</strong> {karyawan?.status_karyawan}</p>
          <p><strong>Kota:</strong> {karyawan?.kota}</p>
          <p><strong>Gaji Pokok:</strong> Rp {karyawan?.gaji_pokok}</p>
          <p><strong>Take Home Pay:</strong> Rp {karyawan?.take_home_pay}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Form Penilaian</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(ratingData).map((key) =>
              key !== "bulan_pemberian" && key !== "tahun_pemberian" ? (
                <div key={key}>
                  <label className="block font-bold" htmlFor={key}>
                    {key.replace(/_/g, " ")}
                  </label>
                  <Input
                    type="number"
                    id={key}
                    name={key}
                    value={ratingData[key as keyof typeof ratingData]}
                    onChange={handleInputChange}
                    min={1}
                    max={5}
                    required
                  />
                </div>
              ) : null
            )}
            <div>
              <label className="block font-bold" htmlFor="bulan_pemberian">
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
              <label className="block font-bold" htmlFor="tahun_pemberian">
                Tahun Pemberian
              </label>
              <Input
                type="number"
                id="tahun_pemberian"
                name="tahun_pemberian"
                value={ratingData.tahun_pemberian}
                onChange={handleInputChange}
                placeholder="Masukkan tahun"
                required
              />
            </div>

            <Button type="submit" className="mt-4">
              Kirim Penilaian
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PenilaianDetail;
