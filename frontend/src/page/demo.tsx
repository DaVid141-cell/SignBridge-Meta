
import DemoLayout from "@/components/layout/demo-layout";
import Panel from "@/components/ui/panel";
import { useEffect, useRef, useState } from "react";

type Landmark = {
    x: number;
    y: number;
};

type DetectedHand = {
    hand: string;
    label: string;
    confidence: number;
    landmarks: Landmark[];
};

type GestureResult = {
    detected: boolean;
    hands: DetectedHand[];
};

type MessageResponse = {
    confirmed_labels: string[];
    suggested_message: string;
    detail?: string;
};

const API_URL = "http://127.0.0.1:8000";
const MAX_LABELS = 12;

const HAND_CONNECTIONS: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17],
];

export default function DemoPage() {
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const captureCanvasRef = useRef<HTMLCanvasElement>(null);
    const requestInProgressRef = useRef(false);

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [gesture, setGesture] = useState<GestureResult | null>(null);
    const [recognitionError, setRecognitionError] = useState("");

    // Labels explicitly added by the user.
    const [confirmedLabels, setConfirmedLabels] = useState<string[]>([]);

    // Meta AI message generation states.
    const [suggestedMessage, setSuggestedMessage] = useState("");
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
    const [messageError, setMessageError] = useState("");

    async function startCamera() {
        setCameraError("");
        setRecognitionError("");
        setGesture(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setIsCameraOn(true);
        } catch (error) {
            console.error("Camera error:", error);

            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;

            setCameraError(
                "Unable to access the camera. Please check your browser permissions."
            );
        }
    }

    function stopCamera() {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsCameraOn(false);
        setGesture(null);
        setRecognitionError("");
        requestInProgressRef.current = false;
    }

    // Add the currently recognized gestures to the message sequence.
    function addCurrentGestures() {
        const labels = (gesture?.hands ?? [])
            .map((hand) => hand.label.trim())
            .filter(
                (label) =>
                    label !== "" &&
                    label.toLowerCase() !== "detecting..."
            );

        if (labels.length === 0) {
            return;
        }

        setConfirmedLabels((current) => {
            const remaining = MAX_LABELS - current.length;
            const labelsToAdd = labels.slice(0, remaining);

            return [...current, ...labelsToAdd];
        });

        setSuggestedMessage("");
        setMessageError("");
    }

    function removeConfirmedLabel(indexToRemove: number) {
        setConfirmedLabels((current) =>
            current.filter((_, index) => index !== indexToRemove)
        );

        setSuggestedMessage("");
        setMessageError("");
    }

    function clearConfirmedLabels() {
        setConfirmedLabels([]);
        setSuggestedMessage("");
        setMessageError("");
    }

    // Send confirmed labels to the existing Meta AI backend endpoint.
    async function generateMessage() {
        if (confirmedLabels.length === 0 || isGeneratingMessage) {
            return;
        }

        setIsGeneratingMessage(true);
        setMessageError("");
        setSuggestedMessage("");

        try {
            const response = await fetch(`${API_URL}/api/build-message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    labels: confirmedLabels,
                }),
            });

            const result = (await response.json()) as MessageResponse;

            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to generate a message."
                );
            }

            if (!result.suggested_message?.trim()) {
                throw new Error("Meta AI returned an empty message.");
            }

            setSuggestedMessage(result.suggested_message.trim());
        } catch (error) {
            console.error("Message generation error:", error);

            setMessageError(
                error instanceof Error
                    ? error.message
                    : "Could not connect to Meta AI. Please try again."
            );
        } finally {
            setIsGeneratingMessage(false);
        }
    }

    // Draw the landmarks returned by the gesture-recognition backend.
    useEffect(() => {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        const context = canvas?.getContext("2d");
        const container = canvas?.parentElement;

        if (!canvas || !context || !video || !isCameraOn || !container) {
            if (canvas && context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        function drawLandmarks() {
            if (!canvas || !context || !video || !container) {
                return;
            }

            if (
                video.readyState < 2 ||
                video.videoWidth === 0 ||
                video.videoHeight === 0
            ) {
                return;
            }

            if (
                canvas.width !== video.videoWidth ||
                canvas.height !== video.videoHeight
            ) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            // Align the overlay with the object-contain video preview.
            const scale = Math.min(
                container.clientWidth / video.videoWidth,
                container.clientHeight / video.videoHeight
            );

            const displayWidth = video.videoWidth * scale;
            const displayHeight = video.videoHeight * scale;

            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
            canvas.style.left =
                `${(container.clientWidth - displayWidth) / 2}px`;
            canvas.style.top =
                `${(container.clientHeight - displayHeight) / 2}px`;

            context.clearRect(0, 0, canvas.width, canvas.height);

            if (!gesture?.detected || !gesture.hands?.length) {
                return;
            }

            for (const detectedHand of gesture.hands) {
                if (detectedHand.landmarks.length !== 21) {
                    continue;
                }

                const points = detectedHand.landmarks.map((landmark) => ({
                    x: (1 - landmark.x) * canvas.width,
                    y: landmark.y * canvas.height,
                }));

                context.strokeStyle = "#7B89FF";
                context.lineWidth = Math.max(2, canvas.width / 400);
                context.lineCap = "round";

                for (const [start, end] of HAND_CONNECTIONS) {
                    context.beginPath();
                    context.moveTo(points[start].x, points[start].y);
                    context.lineTo(points[end].x, points[end].y);
                    context.stroke();
                }

                for (const point of points) {
                    context.beginPath();
                    context.arc(
                        point.x,
                        point.y,
                        Math.max(3, canvas.width / 200),
                        0,
                        Math.PI * 2
                    );

                    context.fillStyle = "#0B0D20";
                    context.fill();
                    context.strokeStyle = "#5864d3";
                    context.lineWidth = 2;
                    context.stroke();
                }

                const topY = Math.min(...points.map((point) => point.y));
                const centerX =
                    points.reduce((sum, point) => sum + point.x, 0) /
                    points.length;

                const label =
                    `${detectedHand.hand}: ${detectedHand.label} ` +
                    `${(detectedHand.confidence * 100).toFixed(0)}%`;

                context.font =
                    `bold ${Math.max(16, canvas.width / 35)}px sans-serif`;

                const textWidth = context.measureText(label).width;

                const labelX = Math.max(
                    4,
                    Math.min(
                        centerX - textWidth / 2,
                        canvas.width - textWidth - 16
                    )
                );

                const labelY = Math.max(
                    28,
                    topY - Math.max(12, canvas.height / 30)
                );

                context.fillStyle = "#16a34a";
                context.fillRect(
                    labelX - 8,
                    labelY - Math.max(23, canvas.height / 35),
                    textWidth + 16,
                    Math.max(32, canvas.height / 25)
                );

                context.fillStyle = "#ffffff";
                context.fillText(label, labelX, labelY);
            }
        }

        drawLandmarks();

        return () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [gesture, isCameraOn]);

    // Capture frames and send them to FastAPI for recognition.
    useEffect(() => {
        if (!isCameraOn) {
            return;
        }

        let cancelled = false;

        async function recognizeFrame() {
            const video = videoRef.current;
            const canvas = captureCanvasRef.current;

            if (
                !video ||
                !canvas ||
                video.readyState < 2 ||
                video.videoWidth === 0 ||
                requestInProgressRef.current
            ) {
                return;
            }

            const context = canvas.getContext("2d");
            if (!context) {
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            requestInProgressRef.current = true;

            try {
                const blob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob(resolve, "image/jpeg", 0.8);
                });

                if (!blob || cancelled) {
                    return;
                }

                const response = await fetch(
                    `${API_URL}/api/recognize-gesture`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "image/jpeg",
                        },
                        body: blob,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Recognition request failed: ${response.status}`
                    );
                }

                const result: GestureResult = await response.json();

                if (!cancelled) {
                    setGesture(result);
                    setRecognitionError("");
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Gesture recognition error:", error);
                    setRecognitionError(
                        "Could not connect to gesture recognition. Check that FastAPI is running."
                    );
                }
            } finally {
                requestInProgressRef.current = false;
            }
        }

        const intervalId = window.setInterval(() => {
            void recognizeFrame();
        }, 100);

        void recognizeFrame();

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [isCameraOn]);

    const currentHands = gesture?.hands ?? [];

    const usableCurrentHands = currentHands.filter(
        (hand) =>
            hand.label.trim() !== "" &&
            hand.label.toLowerCase() !== "detecting..."
    );

    const landmarkCount = currentHands.reduce(
        (total, hand) => total + hand.landmarks.length,
        0
    );

    return (
        <DemoLayout>
            <section className="px-4 sm:px-8">
                <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1.3fr)]">

                    {/* Column 1: live recognition and confirmed gestures */}
                    <Panel className="order-2 min-h-48 p-4 lg:order-1">
                        <h2 className="text-lg font-semibold">
                            Live Gesture Recognition
                        </h2>

                        <div className="mt-3 space-y-2 text-sm text-white/70">
                            <p>
                                Camera:{" "}
                                <span className={isCameraOn ? "text-green-400" : "text-red-400"}>
                                    {isCameraOn ? "Connected" : "Off"}
                                </span>
                            </p>

                            <p>
                                Tracking:{" "}
                                <span className={currentHands.length > 0 ? "text-green-400" : "text-white/60"}>
                                    {currentHands.length > 0
                                        ? "Hand detected"
                                        : isCameraOn
                                          ? "Searching..."
                                          : "Inactive"}
                                </span>
                            </p>

                            <p>
                                Hands detected: {currentHands.length}
                            </p>

                            <p>
                                Landmarks detected: {landmarkCount}
                            </p>
                        </div>

                        {recognitionError ? (
                            <p className="mt-3 text-sm text-red-400">
                                {recognitionError}
                            </p>
                        ) : currentHands.length > 0 ? (
                            <div className="mt-3 space-y-3">
                                {currentHands.map((detectedHand, index) => (
                                    <div
                                        key={`${detectedHand.hand}-${index}`}
                                        className="rounded-md border border-[#7B89FF]/20 p-3"
                                    >
                                        <p className="text-sm text-white/60">
                                            {detectedHand.hand} hand
                                        </p>

                                        <p className="break-words text-xl font-bold">
                                            {detectedHand.label}
                                        </p>

                                        <p className="text-sm text-white/60">
                                            Confidence:{" "}
                                            {(detectedHand.confidence * 100).toFixed(1)}%
                                        </p>

                                        <p className="text-sm text-white/60">
                                            Landmarks: {detectedHand.landmarks.length}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-white/60">
                                {isCameraOn
                                    ? "Looking for hands..."
                                    : "Start your camera to recognize gestures."}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={addCurrentGestures}
                            disabled={
                                !isCameraOn ||
                                usableCurrentHands.length === 0 ||
                                confirmedLabels.length >= MAX_LABELS
                            }
                            className="mt-4 w-full rounded-lg bg-[#4F5DFF] px-3 py-2 text-sm text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Add Current Gesture
                        </button>

                        <p className="mt-2 text-xs text-white/50">
                            Confirmed labels: {confirmedLabels.length}/{MAX_LABELS}
                        </p>

                        <div className="mt-3 border-t border-white/10 pt-3">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold">
                                    Message Gestures
                                </h3>

                                <button
                                    type="button"
                                    onClick={clearConfirmedLabels}
                                    disabled={confirmedLabels.length === 0}
                                    className="text-xs text-red-300 hover:text-red-200 disabled:opacity-40"
                                >
                                    Clear
                                </button>
                            </div>

                            {confirmedLabels.length === 0 ? (
                                <p className="mt-2 text-sm text-white/50">
                                    Add recognized gestures to build your message.
                                </p>
                            ) : (
                                <ol className="mt-3 space-y-2">
                                    {confirmedLabels.map((label, index) => (
                                        <li
                                            key={`${index}-${label}`}
                                            className="flex items-center justify-between gap-2 rounded-md bg-white/5 px-3 py-2"
                                        >
                                            <span className="break-words text-sm">
                                                {index + 1}. {label}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => removeConfirmedLabel(index)}
                                                aria-label={`Remove ${label}`}
                                                className="shrink-0 text-white/60 hover:text-red-400"
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </Panel>

                    {/* Column 2: camera */}
                    <Panel className="order-1 flex flex-col lg:order-2">
                        <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-lg bg-slate-950">
                            <video
                                ref={videoRef}
                                className="absolute inset-0 h-full w-full -scale-x-100 object-contain"
                                autoPlay
                                playsInline
                                muted
                            />

                            <canvas
                                ref={overlayCanvasRef}
                                className="pointer-events-none absolute"
                            />

                            <canvas
                                ref={captureCanvasRef}
                                className="hidden"
                            />
                        </div>

                        <div className="p-4">
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={isCameraOn ? stopCamera : startCamera}
                                    className="rounded-lg bg-[#4F5DFF] px-5 py-2.5 text-white hover:brightness-110"
                                >
                                    {isCameraOn ? "Stop Camera" : "Start Camera"}
                                </button>

                                <div className="rounded-md bg-black/60 px-3 py-2 text-sm text-white">
                                    {isCameraOn
                                        ? "Camera connected"
                                        : "Camera is off"}
                                </div>
                            </div>

                            {cameraError && (
                                <p className="mt-2 text-sm text-red-400">
                                    {cameraError}
                                </p>
                            )}
                        </div>
                    </Panel>

                    {/* Column 3: Meta AI and generated message */}
                    <div className="order-3 grid grid-rows-2 gap-4">
                        <Panel className="flex min-h-48 flex-col items-center justify-center gap-3 p-4">
                            <img
                                src="/Meta-Logo.png"
                                alt="Meta logo"
                                className="h-12 w-auto object-contain"
                            />

                            <h2 className="text-lg font-semibold">
                                AI Message Assistant
                            </h2>

                            <p className="text-center text-sm text-white/60">
                                Turn confirmed gestures into a clear message.
                            </p>

                            <button
                                type="button"
                                onClick={generateMessage}
                                disabled={
                                    confirmedLabels.length === 0 ||
                                    isGeneratingMessage
                                }
                                className="w-full rounded-lg bg-[#4F5DFF] px-4 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isGeneratingMessage
                                    ? "Generating Message..."
                                    : "Generate Message with Meta AI"}
                            </button>

                            {messageError && (
                                <p className="text-center text-sm text-red-400">
                                    {messageError}
                                </p>
                            )}
                        </Panel>

                        <Panel className="min-h-48 p-4">
                            <h2 className="mb-3 text-lg font-semibold">
                                Your Message
                            </h2>

                            {isGeneratingMessage ? (
                                <p className="text-sm text-white/60">
                                    Meta AI is preparing your message...
                                </p>
                            ) : suggestedMessage ? (
                                <div className="space-y-3">
                                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                        {suggestedMessage}
                                    </p>

                                    <p className="text-xs text-white/50">
                                        Review the suggested message before using it.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-white/60">
                                    Your generated message will appear here.
                                </p>
                            )}
                        </Panel>
                    </div>
                </div>
            </section>
        </DemoLayout>
    );
}
