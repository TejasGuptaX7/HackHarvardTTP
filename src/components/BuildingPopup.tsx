// components/BuildingPopup.tsx
import React from "react";

export default function BuildingPopup({ props }: { props: any }) {
  const hasImage = props.Image && props.Image.trim() !== "";

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
        maxWidth: "320px",
      }}
    >
      {hasImage ? (
        <img
          src={props.Image}
          alt="Building Image"
          style={{ width: "100%", height: "180px", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f0f0",
            color: "#777",
            fontSize: "14px",
          }}
        >
          No Image on public registry
        </div>
      )}
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#111", marginBottom: "6px" }}>
          {props.Address || "Unknown Address"}
        </div>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
          {props.City || ""}, {props.State || ""}
        </div>
        <div style={{ fontSize: "14px", color: "#333", lineHeight: 1.6 }}>
          <b>Vacant Since:</b> {props["Vacancy Date"] || "Unknown"} <br />
          <b>Owner:</b> {props["Recorded Owner"] || "Unknown"} <br />
          <b>Sq Ft:</b> {props["Square Footage"] || "Unknown"}
        </div>
      </div>
    </div>
  );
}
