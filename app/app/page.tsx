// app/app/page.tsx
"use client";

import React, { useRef, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Authenticate from "@/components/authenticate";
import { Button } from "@/components/ui/button";
import { removeBackground } from "@imgly/background-removal";
import {
  PlusIcon,
  ReloadIcon,
  ImageIcon,
  TrashIcon,
  CopyIcon,
} from "@radix-ui/react-icons";
import TextCustomizer from "@/components/editor/text-customizer";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import "@/app/fonts.css";

interface OverlayImageControls {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

const OverlayImageCustomizer: React.FC<{
  controls: OverlayImageControls;
  onChange: (newControls: Partial<OverlayImageControls>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ controls, onChange, onDelete, onDuplicate }) => {
  return (
    <AccordionItem value="overlay-image">
      <AccordionTrigger>Overlay Image Controls</AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label>X Position: {controls.x}%</label>
            <input
              type="range"
              min="-50"
              max="150"
              value={controls.x}
              onChange={(e) => onChange({ x: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Y Position: {controls.y}%</label>
            <input
              type="range"
              min="-50"
              max="150"
              value={controls.y}
              onChange={(e) => onChange({ y: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Opacity: {controls.opacity}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={controls.opacity}
              onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Scale: {controls.scale}</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={controls.scale}
              onChange={(e) => onChange({ scale: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <TrashIcon className="mr-2" /> Delete
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <CopyIcon className="mr-2" /> Duplicate
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const Page = () => {
  // const { user } = useUser();
  // const { session } = useSessionContext();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false);
  const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(
    null
  );
  const [textSets, setTextSets] = useState<Array<any>>([]);
  const [overlayImages, setOverlayImages] = useState<
    Array<{
      id: number;
      imageUrl: string;
      controls: OverlayImageControls;
    }>
  >([]);
  const [isOverlayLoading, setIsOverlayLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      await setupImage(imageUrl);
    }
  };

  const setupImage = async (imageUrl: string) => {
    try {
      const imageBlob = await removeBackground(imageUrl);
      const url = URL.createObjectURL(imageBlob);
      setRemovedBgImageUrl(url);
      setIsImageSetupDone(true);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewTextSet = () => {
    const newId = Math.max(...textSets.map((set) => set.id), 0) + 1;
    setTextSets((prev) => [
      ...prev,
      {
        id: newId,
        text: "edit",
        fontFamily: "Inter",
        top: 0,
        left: 0,
        color: "white",
        fontSize: 200,
        fontWeight: 800,
        opacity: 1,
        shadowColor: "rgba(0, 0, 0, 0.8)",
        shadowSize: 4,
        rotation: 0,
      },
    ]);
  };

  const handleAttributeChange = (id: number, attribute: string, value: any) => {
    setTextSets((prev) =>
      prev.map((set) => (set.id === id ? { ...set, [attribute]: value } : set))
    );
  };

  const duplicateTextSet = (textSet: any) => {
    const newId = Math.max(...textSets.map((set) => set.id), 0) + 1;
    setTextSets((prev) => [...prev, { ...textSet, id: newId }]);
  };

  const removeTextSet = (id: number) => {
    setTextSets((prev) => prev.filter((set) => set.id !== id));
  };

  const handleOverlayImageUpload = () => {
    if (overlayInputRef.current) {
      overlayInputRef.current.click();
    }
  };

  const handleOverlayFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsOverlayLoading(true);
      try {
        const imageUrl = URL.createObjectURL(file);
        const removedBgBlob = await removeBackground(imageUrl, {
          output: {
            quality: 1,
          },
        });
        const removedBgUrl = URL.createObjectURL(removedBgBlob);
        const newId = Math.max(0, ...overlayImages.map((img) => img.id)) + 1;
        setOverlayImages((prev) => [
          ...prev,
          {
            id: newId,
            imageUrl: removedBgUrl,
            controls: {
              x: 50,
              y: 50,
              opacity: 1,
              scale: 1,
            },
          },
        ]);
      } catch (error) {
        console.error("Error removing background from overlay image:", error);
      } finally {
        setIsOverlayLoading(false);
      }
    }
  };

  const handleOverlayControlsChange = (
    id: number,
    newControls: Partial<OverlayImageControls>
  ) => {
    setOverlayImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, controls: { ...img.controls, ...newControls } }
          : img
      )
    );
  };

  const deleteOverlayImage = (id: number) => {
    setOverlayImages((prev) => prev.filter((img) => img.id !== id));
  };

  const duplicateOverlayImage = (id: number) => {
    const imageToDuplicate = overlayImages.find((img) => img.id === id);
    if (imageToDuplicate) {
      const newId = Math.max(0, ...overlayImages.map((img) => img.id)) + 1;
      setOverlayImages((prev) => [...prev, { ...imageToDuplicate, id: newId }]);
    }
  };

  const saveCompositeImage = () => {
    if (!canvasRef.current || !isImageSetupDone) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bgImg = new (window as any).Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.onload = () => {
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      textSets.forEach((textSet) => {
        ctx.save(); // Save the current state
        ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3}px ${
          textSet.fontFamily
        }`;
        ctx.fillStyle = textSet.color;
        ctx.globalAlpha = textSet.opacity;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const x = (canvas.width * (textSet.left + 50)) / 100;
        const y = (canvas.height * (50 - textSet.top)) / 100;

        // Move the context to the text position and rotate
        ctx.translate(x, y);
        ctx.rotate((textSet.rotation * Math.PI) / 180); // Convert degrees to radians
        ctx.fillText(textSet.text, 0, 0); // Draw text at the origin (0, 0)
        ctx.globalAlpha = 1;
        ctx.restore(); // Restore the original state
      });

      // Draw all overlay images
      overlayImages.forEach(({ imageUrl, controls }) => {
        const overlayImg = new (window as any).Image();
        overlayImg.crossOrigin = "anonymous";
        overlayImg.onload = () => {
          const aspectRatio = overlayImg.width / overlayImg.height;
          const baseWidth = canvas.width * 0.5;
          const baseHeight = baseWidth / aspectRatio;
          const width = baseWidth * controls.scale;
          const height = baseHeight * controls.scale;

          const x = (canvas.width * controls.x) / 100 - width / 2;
          const y = (canvas.height * controls.y) / 100 - height / 2;

          ctx.globalAlpha = controls.opacity;
          ctx.drawImage(overlayImg, x, y, width, height);
          ctx.globalAlpha = 1;
        };
        overlayImg.src = imageUrl;
      });

      if (removedBgImageUrl) {
        const removedBgImg = new (window as any).Image();
        removedBgImg.crossOrigin = "anonymous";
        removedBgImg.onload = () => {
          ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
          triggerDownload();
        };
        removedBgImg.src = removedBgImageUrl;
      } else {
        triggerDownload();
      }
    };
    bgImg.src = selectedImage || "";

    function triggerDownload() {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "text-behind-image.png";
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <>
      {/* {user && session && session.user ? ( */}
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-row items-center justify-between p-5 px-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Text
            <span className="text-blue-300 italic"> and now also image </span>
            behind image editor
          </h2>
          <div className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".jpg, .jpeg, .png"
            />
            <Button onClick={handleUploadImage}>Upload background image</Button>
            <input
              type="file"
              ref={overlayInputRef}
              style={{ display: "none" }}
              onChange={handleOverlayFileChange}
              accept=".jpg, .jpeg, .png"
            />
          </div>
        </div>
        <Separator />
        {selectedImage ? (
          <div className="flex flex-row items-start justify-start gap-10 w-full h-screen p-10">
            <div className="min-h-[400px] w-[80%] p-4 border border-border rounded-lg relative overflow-hidden">
              {isImageSetupDone ? (
                <Image
                  src={selectedImage}
                  alt="Uploaded"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                />
              ) : (
                <span className="flex items-center w-full gap-2">
                  <ReloadIcon className="animate-spin" /> Loading, please wait
                </span>
              )}
              {isImageSetupDone &&
                textSets.map((textSet) => (
                  <div
                    key={textSet.id}
                    style={{
                      position: "absolute",
                      top: `${50 - textSet.top}%`,
                      left: `${textSet.left + 50}%`,
                      transform: `translate(-50%, -50%) rotate(${textSet.rotation}deg)`,
                      color: textSet.color,
                      textAlign: "center",
                      fontSize: `${textSet.fontSize}px`,
                      fontWeight: textSet.fontWeight,
                      fontFamily: textSet.fontFamily,
                      opacity: textSet.opacity,
                    }}
                  >
                    {textSet.text}
                  </div>
                ))}
              {overlayImages.map(({ id, imageUrl, controls }) => (
                <Image
                  key={id}
                  src={imageUrl}
                  alt={`Overlay ${id}`}
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                  className="absolute pointer-events-none"
                  style={{
                    top: `${controls.y}%`,
                    left: `${controls.x}%`,
                    transform: `translate(-50%, -50%) scale(${controls.scale})`,
                    opacity: controls.opacity,
                  }}
                />
              ))}
              {removedBgImageUrl && (
                <Image
                  src={removedBgImageUrl}
                  alt="Removed bg"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                  className="absolute top-0 left-0 w-full h-full"
                />
              )}
            </div>
            <div className="flex flex-col w-full">
              <div className="flex justify-between mb-4">
                <Button variant={"secondary"} onClick={addNewTextSet}>
                  <PlusIcon className="mr-2" /> Add New Text Set
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={handleOverlayImageUpload}
                  disabled={isOverlayLoading}
                >
                  {isOverlayLoading ? (
                    <ReloadIcon className="mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="mr-2" />
                  )}
                  {isOverlayLoading ? "Processing..." : "Upload Image Overlay"}
                </Button>
              </div>
              <Accordion type="multiple" className="w-full">
                {textSets.map((textSet) => (
                  <TextCustomizer
                    key={textSet.id}
                    textSet={textSet}
                    handleAttributeChange={handleAttributeChange}
                    removeTextSet={removeTextSet}
                    duplicateTextSet={duplicateTextSet}
                  />
                ))}
                {overlayImages.map(({ id, controls }) => (
                  <OverlayImageCustomizer
                    key={id}
                    controls={controls}
                    onChange={(newControls) =>
                      handleOverlayControlsChange(id, newControls)
                    }
                    onDelete={() => deleteOverlayImage(id)}
                    onDuplicate={() => duplicateOverlayImage(id)}
                  />
                ))}
              </Accordion>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <Button onClick={saveCompositeImage}>Save image</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen w-full">
            <h2 className="text-xl font-semibold">
              Welcome, get started by uploading an image!
            </h2>
          </div>
        )}
      </div>
      {/*   ) : (
         <Authenticate />
      )} */}
    </>
  );
};

export default Page;
