"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { t } from "@/lib/i18n";

export interface MapHospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rank: number;
}

// Leaflet's default icon paths break under bundlers; serve local copies from
// public/leaflet so the map works under a strict CSP with no CDN.
const hospitalIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "hue-rotate-180",
});

export default function HospitalMap({
  center,
  hospitals,
  showUser = false,
  height = 320,
}: {
  center: { lat: number; lng: number };
  hospitals: MapHospital[];
  showUser?: boolean;
  height?: number;
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-[var(--cardiac-200)]/80 shadow-xs">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution={`\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showUser ? (
          <Marker position={[center.lat, center.lng]} icon={userIcon}>
            <Popup>{t("fields.youAreHere")}</Popup>
          </Marker>
        ) : null}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            icon={hospitalIcon}
          >
            <Popup>
              {hospital.rank}. {hospital.name}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
