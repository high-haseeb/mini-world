import Experience from "@/components/Experience";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="w-screen h-screen overflow-hidden bg-[#181818] text-white">
            <Overlay />
            <Experience />
        </div >
    );
}

const Overlay = () => (
    <>
        <div className="absolute top-6 left-6 flex flex-col select-none">
            <span className="font-semibold text-5xl">Mini World</span>
            <span className="font-extralight"> version: 0.0.2</span>
        </div>
        <Link href="https://github.com/high-haseeb/mini-world" className="absolute bottom-6 left-6">
            <Image src={'/icons/github-mark.svg'} width={16} height={16} alt="github-lin" />
        </Link>
    </>
)
