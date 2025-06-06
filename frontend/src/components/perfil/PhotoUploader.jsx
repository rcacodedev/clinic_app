import React from "react";

const PhotoUploader = ({ photo, onPhotoChange }) => {
  return (
    <div
      className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
      onClick={() => document.getElementById("photoInput").click()}
      title="Cambiar foto de perfil"
    >
      {photo ? (
        <img
          src={photo}
          alt="Foto de perfil"
          className="w-full h-full object-cover"
        />
      ) : (
        <svg
          className="w-16 h-16 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <input
        type="file"
        id="photoInput"
        style={{ display: "none" }}
        onChange={onPhotoChange}
      />
    </div>
  );
};

export default PhotoUploader;
