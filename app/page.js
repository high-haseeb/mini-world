import Experience from "@/components/Experience";

export default function Home() {
    return (
        <div className="w-screen h-screen overflow-hidden bg-[#181818] text-white">
            <div className="absolute top-6 left-6 flex flex-col select-none">
                <span className="font-semibold text-5xl">Mini World</span>
                <span className="font-light italic">Sandbox game with fire and water</span>
                <span className="font-extralight">version: 0.0.1</span>
            </div>
            <Experience />
        </div>
    );
}
